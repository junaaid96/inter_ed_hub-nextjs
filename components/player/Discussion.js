"use client";

import { useState } from "react";
import { ChatCircleText, SealCheck, Trash } from "@phosphor-icons/react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/lib/useFetch";
import { formatDuration, timeAgo } from "@/lib/format";
import { Avatar, EmptyState, Spinner } from "@/components/ui";
import { useToast } from "@/components/Toaster";

export default function Discussion({ lesson, videoRef, isOwner }) {
    const { user } = useAuth();
    const { data: threads, setData, loading } = useFetch(`/lessons/${lesson.id}/comments/`);
    const [attachTime, setAttachTime] = useState(true);

    const post = async (body, parent) => {
        const t = videoRef.current?.currentTime;
        const comment = await api(`/lessons/${lesson.id}/comments/`, {
            method: "POST",
            body: {
                body,
                parent: parent || null,
                timestamp_seconds: !parent && attachTime && lesson.kind === "video" && t ? t : null,
            },
        });
        setData((list) =>
            parent
                ? list.map((c) => (c.id === parent ? { ...c, replies: [...c.replies, comment] } : c))
                : [comment, ...(list || [])],
        );
    };

    const remove = async (id, parent) => {
        await api(`/comments/${id}/`, { method: "DELETE" });
        setData((list) =>
            parent
                ? list.map((c) => (c.id === parent ? { ...c, replies: c.replies.filter((r) => r.id !== id) } : c))
                : list.filter((c) => c.id !== id),
        );
    };

    const seek = (t) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = t;
        videoRef.current.play().catch(() => {});
    };

    return (
        <div>
            {user ? (
                <Composer
                    placeholder="Ask a question or share an insight"
                    onSubmit={(body) => post(body)}
                    extra={
                        lesson.kind === "video" && (
                            <label className="flex items-center gap-2 text-xs text-ink-3">
                                <input
                                    type="checkbox"
                                    checked={attachTime}
                                    onChange={(e) => setAttachTime(e.target.checked)}
                                    className="accent-[var(--accent)]"
                                />
                                Attach current timestamp
                            </label>
                        )
                    }
                />
            ) : (
                <p className="text-sm text-ink-3">Log in to join the discussion.</p>
            )}

            <div className="mt-6 space-y-5">
                {loading && <div className="skeleton h-20" />}
                {threads?.length === 0 && (
                    <EmptyState icon={ChatCircleText} title="No questions yet">
                        Stuck on something? Ask here and the instructor will answer.
                    </EmptyState>
                )}
                {threads?.map((c) => (
                    <div key={c.id}>
                        <Comment
                            comment={c}
                            onSeek={seek}
                            canDelete={isOwner || (c.author.id === user?.profile_id && c.author.role === user?.role)}
                            onDelete={() => remove(c.id)}
                        />
                        <div className="ml-12 mt-3 space-y-3 border-l-2 border-line pl-4">
                            {c.replies.map((r) => (
                                <Comment
                                    key={r.id}
                                    comment={r}
                                    small
                                    canDelete={isOwner || (r.author.id === user?.profile_id && r.author.role === user?.role)}
                                    onDelete={() => remove(r.id, c.id)}
                                />
                            ))}
                            {user && <ReplyBox onSubmit={(body) => post(body, c.id)} />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Comment({ comment, small, onSeek, canDelete, onDelete }) {
    return (
        <div className="group flex gap-3">
            <Avatar src={comment.author.avatar} name={comment.author.name} size={small ? 28 : 36} />
            <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 text-sm">
                    <b>{comment.author.name}</b>
                    {comment.is_instructor && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent">
                            <SealCheck size={12} weight="fill" /> Instructor
                        </span>
                    )}
                    <span className="text-xs text-ink-3">{timeAgo(comment.created_at)}</span>
                </p>
                <p className="mt-1 whitespace-pre-wrap text-[15px] text-ink-2">
                    {comment.timestamp_seconds != null && onSeek && (
                        <button
                            onClick={() => onSeek(comment.timestamp_seconds)}
                            className="mr-2 rounded-md bg-accent-soft px-1.5 py-0.5 font-mono text-xs font-bold text-accent"
                        >
                            {formatDuration(comment.timestamp_seconds)}
                        </button>
                    )}
                    {comment.body}
                </p>
            </div>
            {canDelete && (
                <button
                    onClick={onDelete}
                    className="h-fit text-ink-3 opacity-0 hover:text-danger group-hover:opacity-100 focus:opacity-100"
                    aria-label="Delete comment"
                >
                    <Trash size={15} />
                </button>
            )}
        </div>
    );
}

function Composer({ placeholder, onSubmit, extra }) {
    const toast = useToast();
    const [body, setBody] = useState("");
    const [busy, setBusy] = useState(false);
    const submit = async (e) => {
        e.preventDefault();
        if (!body.trim()) return;
        setBusy(true);
        try {
            await onSubmit(body.trim());
            setBody("");
        } catch (err) {
            toast(err.message, { type: "error" });
        } finally {
            setBusy(false);
        }
    };
    return (
        <form onSubmit={submit} className="card p-3">
            <textarea
                rows={2}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={placeholder}
                className="w-full resize-none bg-transparent py-1.5 text-[15px] outline-none placeholder:text-ink-3"
            />
            <div className="mt-1 flex items-center justify-between gap-2">
                <span>{extra}</span>
                <button className="btn btn-ink btn-sm" disabled={busy || !body.trim()}>
                    {busy ? <Spinner /> : "Post"}
                </button>
            </div>
        </form>
    );
}

function ReplyBox({ onSubmit }) {
    const [open, setOpen] = useState(false);
    if (!open)
        return (
            <button onClick={() => setOpen(true)} className="text-xs font-semibold text-accent hover:underline">
                Reply
            </button>
        );
    return (
        <Composer
            placeholder="Write a reply"
            onSubmit={async (body) => {
                await onSubmit(body);
                setOpen(false);
            }}
        />
    );
}
