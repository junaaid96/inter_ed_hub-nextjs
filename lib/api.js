export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

const TOKEN_KEY = "intered.token";

export function getToken() {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setToken(token) {
    try {
        if (token) window.localStorage.setItem(TOKEN_KEY, token);
        else window.localStorage.removeItem(TOKEN_KEY);
    } catch {
        /* storage unavailable (private mode); stay logged in for this tab only */
    }
}

export class ApiError extends Error {
    constructor(status, data) {
        super(firstMessage(data) || `Request failed (${status})`);
        this.status = status;
        this.data = data;
    }

    /** Field-level errors from DRF, e.g. { email: ["taken"] } -> { email: "taken" } */
    get fields() {
        const out = {};
        if (this.data && typeof this.data === "object") {
            for (const [key, value] of Object.entries(this.data)) {
                out[key] = Array.isArray(value) ? value.join(" ") : String(value);
            }
        }
        return out;
    }
}

function firstMessage(data) {
    if (!data) return "";
    if (typeof data === "string") return data;
    if (data.detail) return String(data.detail);
    if (Array.isArray(data)) return firstMessage(data[0]);
    if (data.non_field_errors) return firstMessage(data.non_field_errors);
    const first = Object.values(data)[0];
    return Array.isArray(first) ? String(first[0]) : typeof first === "string" ? first : "";
}

export async function api(path, { method = "GET", body, signal, auth = true } = {}) {
    const headers = { Accept: "application/json" };
    const token = auth ? getToken() : null;
    if (token) headers.Authorization = `Token ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    let res;
    try {
        res = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
            signal,
        });
    } catch (err) {
        if (err.name === "AbortError") throw err;
        throw new ApiError(0, { detail: "Can't reach the server. Check your connection and try again." });
    }

    if (res.status === 204) return null;
    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }
    if (res.status === 401 && token) {
        // Stale token: drop it so the UI falls back to signed-out state.
        setToken(null);
        window.dispatchEvent(new Event("intered:logout"));
    }
    if (!res.ok) throw new ApiError(res.status, data);
    return data;
}

export function qs(params) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") search.set(key, value);
    }
    const str = search.toString();
    return str ? `?${str}` : "";
}
