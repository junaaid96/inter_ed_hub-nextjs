"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowClockwise, Gauge, Keyboard, SkipForward } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui";

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];
const SPEED_KEY = "intered.speed";
const HEARTBEAT_MS = 15000;

function readSpeed() {
    try {
        return Number(localStorage.getItem(SPEED_KEY)) || 1;
    } catch {
        return 1;
    }
}

/** Resume from the saved position unless the learner had basically finished. */
function initialResume(lesson) {
    const saved = lesson.progress?.position_seconds || 0;
    const nearEnd = lesson.duration_seconds && saved > lesson.duration_seconds - 5;
    return saved > 3 && !nearEnd ? saved : null;
}

/**
 * Native <video> (accessible controls, range-request seeking straight from
 * object storage) plus learning features: resume, watch-time heartbeats,
 * speed memory, keyboard shortcuts and an auto-advance countdown.
 */
export default function VideoPlayer({
    lesson,
    videoRef,
    trackProgress,
    onProgress,
    onEnded,
    nextLesson,
    onNext,
    onAddNote,
}) {
    // Mounted once per lesson (keyed by the parent), so initial state is per-lesson.
    const [source, setSource] = useState(null);
    const [error, setError] = useState(null);
    const [speed, setSpeed] = useState(readSpeed);
    const [countdown, setCountdown] = useState(null);
    const [showKeys, setShowKeys] = useState(false);
    const watched = useRef({ last: null, pending: 0 });
    const restoreAt = useRef(initialResume(lesson));

    const loadSource = useCallback(async () => {
        try {
            setSource(await api(`/lessons/${lesson.id}/stream/`));
            setError(null);
        } catch (err) {
            setError(err);
        }
    }, [lesson.id]);

    useEffect(() => {
        // Data fetch: state is only set after the request resolves.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadSource();
    }, [loadSource]);

    const changeSpeed = useCallback(
        (value) => {
            setSpeed(value);
            if (videoRef.current) videoRef.current.playbackRate = value;
            try {
                localStorage.setItem(SPEED_KEY, String(value));
            } catch {
                /* ignore */
            }
        },
        [videoRef],
    );

    const flush = useCallback(
        (extra = {}) => {
            const video = videoRef.current;
            if (!trackProgress || !video) return;
            const delta = Math.round(watched.current.pending);
            watched.current.pending = 0;
            api(`/lessons/${lesson.id}/progress/`, {
                method: "POST",
                body: { position_seconds: video.currentTime, delta_seconds: delta, ...extra },
            })
                .then((res) => onProgress?.(res))
                .catch(() => {});
        },
        [lesson.id, trackProgress, onProgress, videoRef],
    );

    // Periodic heartbeat + flush when leaving the page.
    useEffect(() => {
        if (!trackProgress) return;
        const id = setInterval(() => {
            if (videoRef.current && !videoRef.current.paused) flush();
        }, HEARTBEAT_MS);
        const onHide = () => document.visibilityState === "hidden" && flush();
        document.addEventListener("visibilitychange", onHide);
        return () => {
            clearInterval(id);
            document.removeEventListener("visibilitychange", onHide);
            flush();
        };
    }, [trackProgress, flush, videoRef]);

    // Auto-advance countdown.
    useEffect(() => {
        if (countdown === null) return;
        if (countdown <= 0) {
            onNext?.();
            return;
        }
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown, onNext]);

    // Keyboard shortcuts (ignored while typing).
    useEffect(() => {
        const onKey = (e) => {
            const tag = e.target.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target.isContentEditable) return;
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            const v = videoRef.current;
            if (!v) return;
            const key = e.key.toLowerCase();
            const actions = {
                " ": () => (v.paused ? v.play() : v.pause()),
                k: () => (v.paused ? v.play() : v.pause()),
                j: () => (v.currentTime = Math.max(0, v.currentTime - 10)),
                l: () => (v.currentTime = Math.min(v.duration || Infinity, v.currentTime + 10)),
                arrowleft: () => (v.currentTime = Math.max(0, v.currentTime - 5)),
                arrowright: () => (v.currentTime = Math.min(v.duration || Infinity, v.currentTime + 5)),
                m: () => (v.muted = !v.muted),
                f: () => (document.fullscreenElement ? document.exitFullscreen() : v.requestFullscreen?.()),
                n: () => onAddNote?.(),
                "]": () => changeSpeed(SPEEDS[Math.min(SPEEDS.length - 1, SPEEDS.indexOf(v.playbackRate) + 1)] || 1),
                "[": () => changeSpeed(SPEEDS[Math.max(0, SPEEDS.indexOf(v.playbackRate) - 1)] || 1),
                "?": () => setShowKeys((s) => !s),
            };
            if (actions[key]) {
                e.preventDefault();
                actions[key]();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onAddNote, videoRef, changeSpeed]);

    const onTimeUpdate = () => {
        const v = videoRef.current;
        const w = watched.current;
        if (w.last !== null && !v.seeking) {
            const step = v.currentTime - w.last;
            // Count real playback only (not seeks), normalised for speed.
            if (step > 0 && step < 2) w.pending += step / (v.playbackRate || 1);
        }
        w.last = v.currentTime;
    };

    const onLoaded = () => {
        const v = videoRef.current;
        v.playbackRate = speed;
        if (restoreAt.current) {
            v.currentTime = restoreAt.current;
            restoreAt.current = null;
        }
    };

    // Presigned URLs expire; re-sign and continue from the same spot.
    const onVideoError = () => {
        const v = videoRef.current;
        if (v && v.currentTime) restoreAt.current = v.currentTime;
        loadSource();
    };

    const handleEnded = () => {
        flush({ completed: true });
        onEnded?.();
        if (nextLesson) setCountdown(6);
    };

    if (error) {
        return (
            <div className="grid aspect-video place-items-center rounded-2xl bg-black p-6 text-center text-white">
                <div>
                    <p className="mb-3 text-white/80">{error.message}</p>
                    <button
                        className="btn btn-sm bg-white text-black"
                        onClick={() => {
                            setError(null);
                            loadSource();
                        }}
                    >
                        <ArrowClockwise size={16} /> Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="relative overflow-hidden rounded-2xl bg-black">
                {!source ? (
                    <div className="grid aspect-video place-items-center text-white/70">
                        <Spinner className="size-6" />
                    </div>
                ) : (
                    <video
                        key={source.url}
                        ref={videoRef}
                        src={source.url}
                        controls
                        autoPlay
                        playsInline
                        preload="metadata"
                        className="aspect-video w-full bg-black"
                        onLoadedMetadata={onLoaded}
                        onTimeUpdate={onTimeUpdate}
                        onPause={() => flush()}
                        onEnded={handleEnded}
                        onError={onVideoError}
                        onPlay={() => setCountdown(null)}
                    />
                )}

                {countdown !== null && nextLesson && (
                    <div className="absolute inset-0 grid place-items-center bg-black/80 p-6 text-center text-white">
                        <div className="fade-up">
                            <p className="text-sm uppercase tracking-wider text-white/60">Up next in {countdown}s</p>
                            <p className="mt-2 font-display text-2xl font-bold">{nextLesson.title}</p>
                            <div className="mt-6 flex justify-center gap-2">
                                <button className="btn bg-white text-black" onClick={onNext}>
                                    <SkipForward size={18} weight="fill" /> Play now
                                </button>
                                <button className="btn text-white hover:bg-white/10" onClick={() => setCountdown(null)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
                    <Gauge size={16} className="ml-2 text-ink-3" aria-hidden />
                    {SPEEDS.map((s) => (
                        <button
                            key={s}
                            onClick={() => changeSpeed(s)}
                            className={`h-7 rounded-full px-2.5 text-xs font-bold tabular-nums transition-colors ${
                                speed === s ? "bg-ink text-paper" : "text-ink-2 hover:bg-surface-2"
                            }`}
                            aria-pressed={speed === s}
                        >
                            {s}x
                        </button>
                    ))}
                </div>
                <button className="btn btn-ghost btn-sm ml-auto" onClick={() => setShowKeys((s) => !s)}>
                    <Keyboard size={16} /> Shortcuts
                </button>
            </div>
            {showKeys && (
                <div className="card fade-up mt-2 grid gap-x-6 gap-y-1.5 p-4 text-sm sm:grid-cols-3">
                    {[
                        ["Space / K", "Play or pause"],
                        ["J / L", "Back / forward 10s"],
                        ["← / →", "Back / forward 5s"],
                        ["[ / ]", "Slower / faster"],
                        ["N", "Add a note here"],
                        ["F / M", "Fullscreen / mute"],
                    ].map(([k, label]) => (
                        <div key={k} className="flex items-center gap-2">
                            <kbd className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs">{k}</kbd>
                            <span className="text-ink-2">{label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
