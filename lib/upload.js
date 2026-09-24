import { api } from "./api";

/**
 * Upload a file straight to Neon Object Storage.
 *
 * 1. The API reserves a key and returns presigned URL(s).
 * 2. The browser PUTs bytes directly to the bucket (large videos go in
 *    parallel multipart chunks, each retried independently).
 * 3. The API verifies the object and marks the asset ready.
 *
 * onProgress receives { loaded, total, percent, speed } where speed is bytes/sec.
 */
export async function uploadFile(file, { kind, onProgress, signal } = {}) {
    const duration = kind === "video" ? await probeVideoDuration(file) : null;
    const init = await api("/uploads/", {
        method: "POST",
        body: { kind, filename: file.name, content_type: file.type || guessType(file.name), size: file.size },
    });
    const asset = init.asset;
    const tracker = progressTracker(file.size, onProgress);

    try {
        let parts;
        if (init.strategy === "multipart") {
            parts = await uploadMultipart(file, asset.id, init, tracker, signal);
        } else {
            await putWithProgress(init.upload_url, file, init.headers, (loaded) => tracker.set(0, loaded), signal);
        }
        return await api(`/uploads/${asset.id}/complete/`, {
            method: "POST",
            body: { parts, duration_seconds: duration },
        });
    } catch (err) {
        api(`/uploads/${asset.id}/abort/`, { method: "POST" }).catch(() => {});
        throw err;
    }
}

async function uploadMultipart(file, assetId, init, tracker, signal) {
    const { part_size: partSize, part_count: count } = init;
    const numbers = Array.from({ length: count }, (_, i) => i + 1);
    const urls = {};
    for (let i = 0; i < numbers.length; i += 100) {
        const batch = numbers.slice(i, i + 100);
        const res = await api(`/uploads/${assetId}/parts/`, { method: "POST", body: { part_numbers: batch } });
        Object.assign(urls, res.urls);
    }

    const results = [];
    let next = 0;
    const worker = async () => {
        while (next < count) {
            const n = numbers[next++];
            const blob = file.slice((n - 1) * partSize, Math.min(n * partSize, file.size));
            const etag = await withRetry(() =>
                putWithProgress(urls[n], blob, {}, (loaded) => tracker.set(n, loaded), signal),
            );
            results.push({ part_number: n, etag });
        }
    };
    await Promise.all(Array.from({ length: Math.min(4, count) }, worker));
    return results;
}

async function withRetry(fn, attempts = 3) {
    let lastError;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (err) {
            if (err.name === "AbortError") throw err;
            lastError = err;
            await new Promise((r) => setTimeout(r, 800 * 2 ** i));
        }
    }
    throw lastError;
}

function putWithProgress(url, body, headers, onLoaded, signal) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        for (const [k, v] of Object.entries(headers || {})) xhr.setRequestHeader(k, v);
        xhr.upload.onprogress = (e) => onLoaded(e.loaded);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                onLoaded(body.size);
                resolve(xhr.getResponseHeader("ETag"));
            } else {
                reject(new Error(`Storage rejected the upload (${xhr.status}).`));
            }
        };
        xhr.onerror = () => reject(new Error("Network error while uploading. Check the bucket CORS settings."));
        xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));
        signal?.addEventListener("abort", () => xhr.abort(), { once: true });
        xhr.send(body);
    });
}

function progressTracker(total, onProgress) {
    const loadedByPart = new Map();
    const started = performance.now();
    return {
        set(part, loaded) {
            loadedByPart.set(part, loaded);
            let sum = 0;
            for (const v of loadedByPart.values()) sum += v;
            const elapsed = (performance.now() - started) / 1000;
            onProgress?.({
                loaded: Math.min(sum, total),
                total,
                percent: Math.min(100, Math.round((sum / total) * 100)),
                speed: elapsed > 0 ? sum / elapsed : 0,
            });
        },
    };
}

function probeVideoDuration(file) {
    return new Promise((resolve) => {
        const video = document.createElement("video");
        const url = URL.createObjectURL(file);
        const done = (value) => {
            URL.revokeObjectURL(url);
            resolve(value);
        };
        video.preload = "metadata";
        video.onloadedmetadata = () => done(Number.isFinite(video.duration) ? Math.round(video.duration) : null);
        video.onerror = () => done(null);
        setTimeout(() => done(null), 8000);
        video.src = url;
    });
}

function guessType(name) {
    const ext = name.split(".").pop().toLowerCase();
    return (
        {
            mp4: "video/mp4",
            m4v: "video/x-m4v",
            mov: "video/quicktime",
            webm: "video/webm",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp",
            gif: "image/gif",
        }[ext] || "application/octet-stream"
    );
}
