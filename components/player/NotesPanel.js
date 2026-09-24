"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { NotePencil, Trash } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { formatDuration } from "@/lib/format";
import { EmptyState, Spinner } from "@/components/ui";
import { useToast } from "@/components/Toaster";

/** Private notes pinned to a moment in the video. `focus()` is exposed for the N shortcut. */
const NotesPanel = forwardRef(function NotesPanel({ lesson, videoRef, canWrite }, ref) {
    const toast = useToast();
    const { data: notes, setData, loading } = useFetch(canWrite ? `/lessons/${lesson.id}/notes/` : null);
    const [body, setBody] = useState("");
    const [stamp, setStamp] = useState(null);
    const [busy, setBusy] = useState(false);
    const input = useRef(null);
    const isVideo = lesson.kind === "video";

    const capture = () => {
        if (isVideo && videoRef.current && stamp === null) setStamp(videoRef.current.currentTime);
    };

    useImperativeHandle(ref, () => ({
        focus() {
            videoRef.current?.pause();
            setStamp(videoRef.current?.currentTime ?? 0);
            input.current?.focus();
        },
    }));

    const save = async (e) => {
        e.preventDefault();
        if (!body.trim()) return;
        setBusy(true);
        try {
            const note = await api(`/lessons/${lesson.id}/notes/`, {
                method: "POST",
                body: { body: body.trim(), timestamp_seconds: isVideo ? stamp ?? videoRef.current?.currentTime ?? 0 : 0 },
            });
            setData((list) => [...(list || []), note].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds));
            setBody("");
            setStamp(null);
            if (videoRef.current?.paused) videoRef.current.play().catch(() => {});
        } catch (err) {
            toast(err.message, { type: "error" });
        } finally {
            setBusy(false);
        }
    };

    const remove = async (id) => {
        setData((list) => list.filter((n) => n.id !== id));
        await api(`/notes/${id}/`, { method: "DELETE" }).catch(() => toast("Couldn't delete note", { type: "error" }));
    };

    const seek = (t) => {
        const v = videoRef.current;
        if (!v) return;
        v.currentTime = t;
        v.play().catch(() => {});
        v.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    if (!canWrite) {
        return (
            <EmptyState icon={NotePencil} title="Notes are for enrolled learners">
                Enroll to pin notes to any moment of a lesson and revisit them later.
            </EmptyState>
        );
    }

    return (
        <div>
            <form onSubmit={save} className="card p-3">
                <div className="flex items-start gap-3">
                    {isVideo && (
                        <span className="mt-2 rounded-md bg-accent-soft px-2 py-0.5 font-mono text-xs font-bold text-accent">
                            {formatDuration(stamp ?? videoRef.current?.currentTime ?? 0)}
                        </span>
                    )}
                    <textarea
                        ref={input}
                        rows={2}
                        value={body}
                        onFocus={capture}
                        onChange={(e) => setBody(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save(e);
                            if (e.key === "Escape") {
                                setStamp(null);
                                e.currentTarget.blur();
                            }
                        }}
                        placeholder={isVideo ? "Write a note at this moment (press N anytime)" : "Write a note"}
                        className="w-full resize-none bg-transparent py-1.5 text-[15px] outline-none placeholder:text-ink-3"
                    />
                </div>
                <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-ink-3">Ctrl/⌘ + Enter to save</span>
                    <button className="btn btn-ink btn-sm" disabled={busy || !body.trim()}>
                        {busy ? <Spinner /> : "Save note"}
                    </button>
                </div>
            </form>

            <ul className="mt-4 space-y-2">
                {loading && <li className="skeleton h-16" />}
                {notes?.map((note) => (
                    <li key={note.id} className="group card flex gap-3 p-3.5">
                        {isVideo && (
                            <button
                                onClick={() => seek(note.timestamp_seconds)}
                                className="h-fit rounded-md bg-accent px-2 py-0.5 font-mono text-xs font-bold text-accent-ink hover:brightness-110"
                                title="Jump to this moment"
                            >
                                {formatDuration(note.timestamp_seconds)}
                            </button>
                        )}
                        <p className="flex-1 whitespace-pre-wrap text-[15px] text-ink-2">{note.body}</p>
                        <button
                            onClick={() => remove(note.id)}
                            className="h-fit text-ink-3 opacity-0 transition-opacity hover:text-danger group-hover:opacity-100 focus:opacity-100"
                            aria-label="Delete note"
                        >
                            <Trash size={16} />
                        </button>
                    </li>
                ))}
                {notes?.length === 0 && (
                    <li className="py-6 text-center text-sm text-ink-3">No notes yet for this lesson.</li>
                )}
            </ul>
        </div>
    );
});

export default NotesPanel;
