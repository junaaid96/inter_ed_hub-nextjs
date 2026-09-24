"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowDown,
    ArrowUp,
    Article,
    CaretDown,
    CheckCircle,
    DotsSixVertical,
    Eye,
    FilmStrip,
    Plus,
    Trash,
    UploadSimple,
    VideoCamera,
    Warning,
} from "@phosphor-icons/react";
import RequireAuth from "@/components/RequireAuth";
import CourseForm from "@/components/studio/CourseForm";
import Uploader from "@/components/studio/Uploader";
import { CourseCover } from "@/components/CourseCard";
import { ErrorNote, Field, Spinner } from "@/components/ui";
import { useToast } from "@/components/Toaster";
import { api } from "@/lib/api";
import { uploadFile } from "@/lib/upload";
import { useFetch } from "@/lib/useFetch";
import { formatBytes, formatDuration, plural } from "@/lib/format";

export default function StudioPage() {
    return (
        <RequireAuth role="teacher">
            <Studio />
        </RequireAuth>
    );
}

function Studio() {
    const { slug } = useParams();
    const router = useRouter();
    const toast = useToast();
    const { data: course, setData: setCourse, error, loading, reload } = useFetch(`/studio/courses/${slug}/`);
    const [tab, setTab] = useState("curriculum");
    const [publishing, setPublishing] = useState(false);

    if (loading || error) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-10">
                {error ? <ErrorNote error={error} onRetry={reload} /> : <div className="skeleton h-96" />}
            </div>
        );
    }

    const allLessons = course.sections.flatMap((s) => s.lessons);
    const lessonCount = allLessons.length;
    const totalSeconds = allLessons.reduce((a, l) => a + (l.duration_seconds || 0), 0);
    const missingVideo = allLessons.filter((l) => l.kind === "video" && !l.has_video).length;

    const togglePublish = async () => {
        setPublishing(true);
        try {
            const updated = await api(`/courses/${slug}/`, { method: "PATCH", body: { is_published: !course.is_published } });
            setCourse(updated);
            toast(updated.is_published ? "Published! Learners can find it now." : "Moved back to draft.");
        } catch (err) {
            toast(err.message, { type: "error" });
        } finally {
            setPublishing(false);
        }
    };

    const remove = async () => {
        if (!confirm(`Delete "${course.title}" permanently? Enrollments, notes and reviews go with it.`)) return;
        await api(`/courses/${slug}/`, { method: "DELETE" });
        toast("Course deleted");
        router.push("/dashboard");
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <Link href="/dashboard" className="text-sm font-semibold text-ink-3 hover:text-ink">
                        Studio
                    </Link>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{course.title}</h1>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${course.is_published ? "bg-accent-soft text-accent" : "bg-surface-2 text-ink-2"}`}>
                            {course.is_published ? "Published" : "Draft"}
                        </span>
                        {plural(course.sections.length, "section")} · {plural(lessonCount, "lesson")} · {formatDuration(totalSeconds, { long: true })}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/courses/${slug}`} className="btn btn-outline btn-sm">
                        <Eye size={16} /> Preview
                    </Link>
                    <button onClick={togglePublish} disabled={publishing} className={`btn btn-sm ${course.is_published ? "btn-outline" : "btn-primary"}`}>
                        {publishing ? <Spinner /> : course.is_published ? "Unpublish" : "Publish"}
                    </button>
                </div>
            </div>

            {missingVideo > 0 && (
                <p className="mt-5 flex items-center gap-2 rounded-xl bg-warn/10 px-4 py-2.5 text-sm text-warn">
                    <Warning size={18} weight="fill" /> {missingVideo} video lesson{missingVideo > 1 ? "s are" : " is"} still missing a video.
                </p>
            )}

            <div className="mt-8 flex gap-1 border-b border-line" role="tablist">
                {[
                    ["curriculum", "Curriculum"],
                    ["details", "Details & cover"],
                ].map(([key, label]) => (
                    <button
                        key={key}
                        role="tab"
                        aria-selected={tab === key}
                        onClick={() => setTab(key)}
                        className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === key ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink"}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="py-8">
                {tab === "curriculum" ? (
                    <Curriculum course={course} setCourse={setCourse} reload={reload} />
                ) : (
                    <Details course={course} setCourse={setCourse} onDelete={remove} />
                )}
            </div>
        </div>
    );
}

function Details({ course, setCourse, onDelete }) {
    const toast = useToast();
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    const save = async (data) => {
        setBusy(true);
        setErrors({});
        try {
            const updated = await api(`/courses/${course.slug}/`, { method: "PATCH", body: data });
            setCourse(updated);
            toast("Details saved");
        } catch (err) {
            setErrors(err.fields || {});
            toast(err.message, { type: "error" });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="card p-6">
                <CourseForm initial={course} onSubmit={save} submitLabel="Save details" errors={errors} busy={busy} />
            </div>
            <div className="space-y-6">
                <div className="card overflow-hidden">
                    <CourseCover course={course} />
                    <div className="p-4">
                        <p className="label">Cover image</p>
                        <Uploader
                            kind="image"
                            compact
                            current={course.cover_id}
                            onUploaded={async (asset) => {
                                const updated = await api(`/courses/${course.slug}/`, { method: "PATCH", body: { cover_id: asset.id } });
                                setCourse(updated);
                            }}
                        />
                    </div>
                </div>
                <div className="card border-danger/30 p-4">
                    <p className="font-semibold">Delete course</p>
                    <p className="mt-1 text-sm text-ink-3">Removes the course, its lessons and all learner progress.</p>
                    <button onClick={onDelete} className="btn btn-danger btn-sm mt-3 -ml-3">
                        <Trash size={16} /> Delete permanently
                    </button>
                </div>
            </div>
        </div>
    );
}

function Curriculum({ course, setCourse, reload }) {
    const toast = useToast();
    const [newSection, setNewSection] = useState("");
    const [openLesson, setOpenLesson] = useState(null);
    const dragged = useRef(null);

    const updateSections = (fn) => setCourse((c) => ({ ...c, sections: fn(c.sections) }));

    const persistOrder = useCallback(
        async (sections) => {
            try {
                await api(`/courses/${course.slug}/reorder/`, {
                    method: "POST",
                    body: { sections: sections.map((s) => ({ id: s.id, lessons: s.lessons.map((l) => l.id) })) },
                });
            } catch (err) {
                toast(err.message, { type: "error" });
                reload();
            }
        },
        [course.slug, toast, reload],
    );

    const addSection = async (e) => {
        e.preventDefault();
        if (!newSection.trim()) return;
        try {
            const section = await api(`/courses/${course.slug}/sections/`, { method: "POST", body: { title: newSection.trim() } });
            updateSections((s) => [...s, { ...section, lessons: [] }]);
            setNewSection("");
        } catch (err) {
            toast(err.message, { type: "error" });
        }
    };

    const moveSection = (index, dir) => {
        const sections = [...course.sections];
        const [s] = sections.splice(index, 1);
        sections.splice(index + dir, 0, s);
        updateSections(() => sections);
        persistOrder(sections);
    };

    const dropLesson = (targetSectionId, beforeLessonId) => {
        const { lessonId } = dragged.current || {};
        dragged.current = null;
        if (!lessonId || lessonId === beforeLessonId) return;
        let moving;
        const sections = course.sections.map((s) => {
            const found = s.lessons.find((l) => l.id === lessonId);
            if (found) moving = found;
            return { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) };
        });
        const target = sections.find((s) => s.id === targetSectionId);
        const at = beforeLessonId ? target.lessons.findIndex((l) => l.id === beforeLessonId) : target.lessons.length;
        target.lessons.splice(at < 0 ? target.lessons.length : at, 0, moving);
        updateSections(() => sections);
        persistOrder(sections);
    };

    return (
        <div className="space-y-5">
            {course.sections.length === 0 && (
                <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-ink-2">
                    Courses are organised into sections. Add your first section below, then drop videos into it.
                </p>
            )}
            {course.sections.map((section, index) => (
                <SectionCard
                    key={section.id}
                    section={section}
                    index={index}
                    total={course.sections.length}
                    onMove={(dir) => moveSection(index, dir)}
                    onChange={(patch) => updateSections((all) => all.map((s) => (s.id === section.id ? { ...s, ...patch } : s)))}
                    onDelete={() => updateSections((all) => all.filter((s) => s.id !== section.id))}
                    openLesson={openLesson}
                    setOpenLesson={setOpenLesson}
                    onDragStart={(lessonId) => (dragged.current = { lessonId })}
                    onDrop={dropLesson}
                />
            ))}
            <form onSubmit={addSection} className="flex gap-2">
                <input
                    className="field"
                    placeholder={`Section ${course.sections.length + 1} title, e.g. "Getting started"`}
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                />
                <button className="btn btn-ink shrink-0">
                    <Plus size={16} weight="bold" /> Add section
                </button>
            </form>
        </div>
    );
}

function SectionCard({ section, index, total, onMove, onChange, onDelete, openLesson, setOpenLesson, onDragStart, onDrop }) {
    const toast = useToast();
    const [title, setTitle] = useState(section.title);
    const [adding, setAdding] = useState(false);
    const [queue, setQueue] = useState([]);
    const [dropActive, setDropActive] = useState(false);
    const bulkInput = useRef(null);

    const saveTitle = async () => {
        if (title.trim() === section.title || !title.trim()) return setTitle(section.title);
        await api(`/sections/${section.id}/`, { method: "PATCH", body: { title: title.trim() } });
        onChange({ title: title.trim() });
    };

    const removeSection = async () => {
        if (section.lessons.length && !confirm(`Delete "${section.title}" and its ${section.lessons.length} lessons?`)) return;
        await api(`/sections/${section.id}/`, { method: "DELETE" });
        onDelete();
    };

    const addLesson = async (kind) => {
        setAdding(false);
        const lesson = await api(`/sections/${section.id}/lessons/`, {
            method: "POST",
            body: { title: kind === "video" ? "Untitled video" : "Untitled reading", kind },
        });
        onChange({ lessons: [...section.lessons, lesson] });
        setOpenLesson(lesson.id);
    };

    // Bulk: every dropped video becomes a lesson, uploaded one after another.
    const bulkUpload = async (files) => {
        const videos = [...files].filter((f) => f.type.startsWith("video/"));
        if (!videos.length) return;
        setQueue(videos.map((f) => ({ name: f.name, percent: 0, status: "waiting" })));
        let lessons = [...section.lessons];
        for (const [i, file] of videos.entries()) {
            const setItem = (patch) => setQueue((q) => q.map((x, j) => (j === i ? { ...x, ...patch } : x)));
            try {
                setItem({ status: "uploading" });
                const asset = await uploadFile(file, { kind: "video", onProgress: (p) => setItem({ percent: p.percent }) });
                const lesson = await api(`/sections/${section.id}/lessons/`, {
                    method: "POST",
                    body: { title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), kind: "video", video_id: asset.id },
                });
                lessons = [...lessons, lesson];
                onChange({ lessons });
                setItem({ status: "done", percent: 100 });
            } catch (err) {
                setItem({ status: "error" });
                toast(`${file.name}: ${err.message}`, { type: "error" });
            }
        }
        setTimeout(() => setQueue([]), 2500);
    };

    return (
        <div
            className={`card overflow-hidden transition-colors ${dropActive ? "border-accent" : ""}`}
            onDragOver={(e) => {
                if (e.dataTransfer.types.includes("Files")) {
                    e.preventDefault();
                    setDropActive(true);
                }
            }}
            onDragLeave={() => setDropActive(false)}
            onDrop={(e) => {
                setDropActive(false);
                if (e.dataTransfer.files.length) {
                    e.preventDefault();
                    bulkUpload(e.dataTransfer.files);
                }
            }}
        >
            <div className="flex items-center gap-2 border-b border-line bg-surface-2/50 px-4 py-2.5">
                <span className="text-sm font-bold text-ink-3">{index + 1}</span>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={saveTitle}
                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                    className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1 font-display font-bold outline-none focus:bg-surface"
                    aria-label="Section title"
                />
                <button className="btn btn-ghost btn-sm px-2" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move section up">
                    <ArrowUp size={15} />
                </button>
                <button className="btn btn-ghost btn-sm px-2" disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Move section down">
                    <ArrowDown size={15} />
                </button>
                <button className="btn btn-danger btn-sm px-2" onClick={removeSection} aria-label="Delete section">
                    <Trash size={15} />
                </button>
            </div>

            <ul
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    if (!e.dataTransfer.files.length) {
                        e.preventDefault();
                        e.stopPropagation();
                        onDrop(section.id, null);
                    }
                }}
                className="min-h-4"
            >
                {section.lessons.map((lesson) => (
                    <LessonRow
                        key={lesson.id}
                        lesson={lesson}
                        open={openLesson === lesson.id}
                        onToggle={() => setOpenLesson(openLesson === lesson.id ? null : lesson.id)}
                        onChange={(updated) => onChange({ lessons: section.lessons.map((l) => (l.id === lesson.id ? updated : l)) })}
                        onDelete={() => onChange({ lessons: section.lessons.filter((l) => l.id !== lesson.id) })}
                        onDragStart={() => onDragStart(lesson.id)}
                        onDropBefore={() => onDrop(section.id, lesson.id)}
                    />
                ))}
            </ul>

            {queue.length > 0 && (
                <ul className="space-y-2 border-t border-line px-4 py-3">
                    {queue.map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm">
                            {item.status === "done" ? (
                                <CheckCircle size={16} weight="fill" className="text-accent" />
                            ) : item.status === "error" ? (
                                <Warning size={16} weight="fill" className="text-danger" />
                            ) : (
                                <FilmStrip size={16} className="text-ink-3" />
                            )}
                            <span className="w-48 truncate">{item.name}</span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                                <div className="h-full bg-accent transition-[width]" style={{ width: `${item.percent}%` }} />
                            </div>
                            <span className="w-10 text-right text-xs tabular-nums text-ink-3">{item.percent}%</span>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
                {adding ? (
                    <>
                        <button className="btn btn-outline btn-sm" onClick={() => addLesson("video")}>
                            <VideoCamera size={16} /> Video lesson
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => addLesson("article")}>
                            <Article size={16} /> Reading
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setAdding(false)}>
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button className="btn btn-ghost btn-sm" onClick={() => setAdding(true)}>
                            <Plus size={16} weight="bold" /> Add lesson
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => bulkInput.current?.click()}>
                            <UploadSimple size={16} /> Bulk upload videos
                        </button>
                        <span className="ml-auto hidden text-xs text-ink-3 sm:inline">Tip: drop several videos here to create a lesson for each</span>
                        <input
                            ref={bulkInput}
                            type="file"
                            multiple
                            accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                            className="hidden"
                            onChange={(e) => {
                                bulkUpload(e.target.files);
                                e.target.value = "";
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

function LessonRow({ lesson, open, onToggle, onChange, onDelete, onDragStart, onDropBefore }) {
    const [over, setOver] = useState(false);
    const Icon = lesson.kind === "article" ? Article : VideoCamera;
    return (
        <li
            className={`border-b border-line last:border-b-0 ${over ? "shadow-[inset_0_2px_0_var(--accent)]" : ""}`}
            onDragOver={(e) => {
                if (!e.dataTransfer.types.includes("Files")) {
                    e.preventDefault();
                    setOver(true);
                }
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
                setOver(false);
                if (!e.dataTransfer.files.length) {
                    e.preventDefault();
                    e.stopPropagation();
                    onDropBefore();
                }
            }}
        >
            <div className="flex items-center gap-2 px-2 py-2">
                <span
                    draggable
                    onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", String(lesson.id));
                        onDragStart();
                    }}
                    className="cursor-grab p-1.5 text-ink-3 active:cursor-grabbing"
                    aria-label="Drag to reorder"
                >
                    <DotsSixVertical size={18} weight="bold" />
                </span>
                <button onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 text-left hover:bg-surface-2/60">
                    <Icon size={18} className="shrink-0 text-ink-3" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{lesson.title}</span>
                    {lesson.is_preview && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent">Preview</span>}
                    {lesson.kind === "video" && !lesson.has_video && (
                        <span className="rounded-full bg-warn/15 px-2 py-0.5 text-[11px] font-bold text-warn">No video</span>
                    )}
                    <span className="w-12 text-right text-xs tabular-nums text-ink-3">{formatDuration(lesson.duration_seconds)}</span>
                    <CaretDown size={14} className={`text-ink-3 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
            </div>
            {open && <LessonEditor lesson={lesson} onChange={onChange} onDelete={onDelete} />}
        </li>
    );
}

function LessonEditor({ lesson, onChange, onDelete }) {
    const toast = useToast();
    const [form, setForm] = useState({
        title: lesson.title,
        summary: lesson.summary,
        body: lesson.body,
        is_preview: lesson.is_preview,
        external_video_url: lesson.external_video_url,
        minutes: Math.round(lesson.duration_seconds / 60),
    });
    const [busy, setBusy] = useState(false);

    const [syncedDuration, setSyncedDuration] = useState(lesson.duration_seconds);
    if (syncedDuration !== lesson.duration_seconds) {
        setSyncedDuration(lesson.duration_seconds);
        setForm((f) => ({ ...f, minutes: Math.round(lesson.duration_seconds / 60) }));
    }

    const patch = async (body) => {
        const updated = await api(`/lessons/${lesson.id}/`, { method: "PATCH", body });
        onChange(updated);
        return updated;
    };

    const save = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const { minutes, ...rest } = form;
            await patch({ ...rest, duration_seconds: lesson.video ? lesson.duration_seconds : Math.max(0, Number(minutes) * 60) });
            toast("Lesson saved");
        } catch (err) {
            toast(err.message, { type: "error" });
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        if (!confirm(`Delete "${lesson.title}"?`)) return;
        await api(`/lessons/${lesson.id}/`, { method: "DELETE" });
        onDelete();
    };

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

    return (
        <form onSubmit={save} className="space-y-4 bg-surface-2/40 px-4 pb-5 pt-2 sm:px-12">
            <Field label="Title">
                <input className="field" required value={form.title} onChange={set("title")} />
            </Field>

            {lesson.kind === "video" && (
                <div>
                    <span className="label">Video</span>
                    {lesson.video && (
                        <div className="mb-2 flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
                            <FilmStrip size={18} className="text-accent" />
                            <span className="min-w-0 flex-1 truncate font-medium">{lesson.video.name}</span>
                            <span className="text-xs text-ink-3">
                                {formatBytes(lesson.video.size)}
                                {lesson.video.duration_seconds ? ` · ${formatDuration(lesson.video.duration_seconds)}` : ""}
                            </span>
                        </div>
                    )}
                    <Uploader
                        kind="video"
                        compact={Boolean(lesson.video)}
                        current={lesson.video}
                        onUploaded={(asset) =>
                            patch({ video_id: asset.id, duration_seconds: asset.duration_seconds || lesson.duration_seconds })
                        }
                    />
                    {!lesson.video && (
                        <Field className="mt-3" label="Or stream from a public URL" hint="Direct link to an MP4 file.">
                            <input className="field" type="url" value={form.external_video_url} onChange={set("external_video_url")} placeholder="https://..." />
                        </Field>
                    )}
                </div>
            )}

            <Field label="Summary" hint="Shown under the player.">
                <textarea className="field" rows={2} value={form.summary} onChange={set("summary")} />
            </Field>
            <Field label={lesson.kind === "article" ? "Content" : "Show notes"} hint="Markdown supported.">
                <textarea className="field font-mono text-sm" rows={lesson.kind === "article" ? 10 : 4} value={form.body} onChange={set("body")} />
            </Field>

            <div className="flex flex-wrap items-center gap-6">
                {!lesson.video && (
                    <Field label="Duration (minutes)" className="w-40">
                        <input className="field" type="number" min={0} value={form.minutes} onChange={set("minutes")} />
                    </Field>
                )}
                <label className="flex items-center gap-2 text-sm font-medium">
                    <input type="checkbox" checked={form.is_preview} onChange={set("is_preview")} className="size-4 accent-[var(--accent)]" />
                    Free preview for visitors
                </label>
            </div>

            <div className="flex items-center gap-2">
                <button className="btn btn-ink btn-sm" disabled={busy}>
                    {busy ? <Spinner /> : "Save lesson"}
                </button>
                <button type="button" onClick={remove} className="btn btn-danger btn-sm">
                    <Trash size={15} /> Delete
                </button>
            </div>
        </form>
    );
}
