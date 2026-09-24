export function formatDuration(seconds, { long = false } = {}) {
    const s = Math.max(0, Math.round(seconds || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (long) {
        if (h) return `${h}h ${m}m`;
        if (m) return `${m} min`;
        return `${s}s`;
    }
    const sec = String(s % 60).padStart(2, "0");
    return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

export function formatBytes(bytes) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}

export function formatDate(value) {
    if (!value) return "";
    return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function timeAgo(value) {
    const diff = (Date.now() - new Date(value).getTime()) / 1000;
    const steps = [
        [60, "second"],
        [3600, "minute"],
        [86400, "hour"],
        [604800, "day"],
        [2629800, "week"],
        [31557600, "month"],
        [Infinity, "year"],
    ];
    const divisors = { second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2629800, year: 31557600 };
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    for (const [limit, unit] of steps) {
        if (diff < limit) return rtf.format(-Math.floor(diff / divisors[unit]), unit);
    }
    return "";
}

export const LEVELS = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    all: "All levels",
};

export function initials(name = "") {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join("");
}

export function plural(n, word, pluralWord = `${word}s`) {
    return `${n} ${n === 1 ? word : pluralWord}`;
}

export function compact(n) {
    return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n || 0);
}
