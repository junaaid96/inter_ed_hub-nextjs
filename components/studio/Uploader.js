"use client";

import { useRef, useState } from "react";
import { CloudArrowUp, FilmStrip, ImageSquare, X } from "@phosphor-icons/react";
import { uploadFile } from "@/lib/upload";
import { formatBytes, formatDuration } from "@/lib/format";
import { useToast } from "@/components/Toaster";

const ACCEPT = {
    video: "video/mp4,video/webm,video/quicktime,video/x-m4v",
    image: "image/jpeg,image/png,image/webp,image/avif,image/gif",
};

/**
 * Drop zone that streams a file straight to object storage and reports the
 * finished asset via onUploaded(asset).
 */
export default function Uploader({ kind, onUploaded, current, compact }) {
    const toast = useToast();
    const input = useRef(null);
    const controller = useRef(null);
    const [drag, setDrag] = useState(false);
    const [progress, setProgress] = useState(null);
    const [fileName, setFileName] = useState("");

    const start = async (file) => {
        if (!file) return;
        if (!ACCEPT[kind].split(",").includes(file.type)) {
            toast(`That file type isn't supported for ${kind}s.`, { type: "error" });
            return;
        }
        controller.current = new AbortController();
        setFileName(file.name);
        setProgress({ percent: 0, loaded: 0, total: file.size, speed: 0 });
        try {
            const asset = await uploadFile(file, { kind, onProgress: setProgress, signal: controller.current.signal });
            await onUploaded(asset);
            toast(kind === "video" ? "Video uploaded" : "Image uploaded");
        } catch (err) {
            if (err.name !== "AbortError") toast(err.message, { type: "error" });
        } finally {
            setProgress(null);
        }
    };

    if (progress) {
        const eta = progress.speed ? (progress.total - progress.loaded) / progress.speed : null;
        return (
            <div className="rounded-xl border border-line bg-surface-2/60 p-4">
                <div className="flex items-center gap-3">
                    <FilmStrip size={20} className="shrink-0 text-accent" />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{fileName}</span>
                    <button
                        onClick={() => controller.current?.abort()}
                        className="text-ink-3 hover:text-danger"
                        aria-label="Cancel upload"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${progress.percent}%` }} />
                </div>
                <p className="mt-2 flex justify-between text-xs tabular-nums text-ink-3">
                    <span>
                        {formatBytes(progress.loaded)} of {formatBytes(progress.total)} · {progress.percent}%
                    </span>
                    <span>
                        {progress.speed ? `${formatBytes(progress.speed)}/s` : ""}
                        {eta ? ` · ${formatDuration(eta)} left` : ""}
                    </span>
                </p>
            </div>
        );
    }

    const Icon = kind === "video" ? CloudArrowUp : ImageSquare;
    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                start(e.dataTransfer.files[0]);
            }}
            onClick={() => input.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 transition-colors ${
                compact ? "py-3" : "flex-col justify-center py-8 text-center"
            } ${drag ? "border-accent bg-accent-soft" : "border-line hover:border-ink-3"}`}
        >
            <Icon size={compact ? 20 : 28} className="shrink-0 text-accent" weight="duotone" />
            <div className={compact ? "text-left" : ""}>
                <p className="text-sm font-semibold">
                    {current ? `Replace ${kind}` : `Drop a ${kind} here or click to browse`}
                </p>
                <p className="text-xs text-ink-3">
                    {kind === "video" ? "MP4, WebM or MOV up to 5 GB. Large files upload in parallel chunks." : "JPG, PNG or WebP up to 10 MB, 16:9 looks best."}
                </p>
            </div>
            <input
                ref={input}
                type="file"
                accept={ACCEPT[kind]}
                className="hidden"
                onChange={(e) => {
                    start(e.target.files[0]);
                    e.target.value = "";
                }}
            />
        </div>
    );
}
