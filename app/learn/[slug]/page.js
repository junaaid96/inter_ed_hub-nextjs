"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
    Article,
    ArrowLeft,
    CaretLeft,
    CaretRight,
    Certificate,
    CheckCircle,
    Circle,
    Confetti,
    ListBullets,
    Lock,
    Moon,
    PlayCircle,
    Sun,
    X,
} from "@phosphor-icons/react";
import VideoPlayer from "@/components/player/VideoPlayer";
import NotesPanel from "@/components/player/NotesPanel";
import Discussion from "@/components/player/Discussion";
import { ErrorNote, ProgressRing, Spinner } from "@/components/ui";
import { useToast } from "@/components/Toaster";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useFetch } from "@/lib/useFetch";
import { formatDuration } from "@/lib/format";

export default function LearnPage() {
    return (
        <Suspense>
            <Learn />
        </Suspense>
    );
}

function Learn() {
    const { slug } = useParams();
    const params = useSearchParams();
    const router = useRouter();
    const { user, ready } = useAuth();
    const { theme, toggle } = useTheme();
    const toast = useToast();
    const course = useFetch(ready ? `/courses/${slug}/` : null, { deps: [user?.id] });
    const [completed, setCompleted] = useState(new Set());
    const [percent, setPercent] = useState(0);
    const [certificate, setCertificate] = useState(null);
    const [sidebar, setSidebar] = useState(false);
    const [tab, setTab] = useState("overview");
    const videoRef = useRef(null);
    const notesRef = useRef(null);

    const lessons = useMemo(() => course.data?.sections.flatMap((s) => s.lessons) || [], [course.data]);
    const viewer = course.data?.viewer;
    const lessonId = Number(params.get("lesson")) || viewer?.last_lesson_id || lessons[0]?.id;
    const lesson = useFetch(lessonId && course.data ? `/lessons/${lessonId}/` : null);
    const tracking = Boolean(viewer?.is_enrolled);

    // Seed local progress state whenever fresh course data arrives.
    const [seededFrom, setSeededFrom] = useState(null);
    if (viewer && seededFrom !== viewer) {
        setSeededFrom(viewer);
        setCompleted(new Set(viewer.completed_lessons));
        setPercent(viewer.progress);
        setCertificate(viewer.certificate_code);
    }

    const [sidebarFor, setSidebarFor] = useState(lessonId);
    if (sidebarFor !== lessonId) {
        setSidebarFor(lessonId);
        setSidebar(false);
    }

    // Opening an article counts as "last visited" so Continue learning lands here.
    useEffect(() => {
        if (tracking && lesson.data?.kind === "article") {
            api(`/lessons/${lesson.data.id}/progress/`, { method: "POST", body: { position_seconds: 0 } }).catch(() => {});
        }
    }, [tracking, lesson.data]);

    const goTo = useCallback(
        (id) => id && router.push(`/learn/${slug}?lesson=${id}`, { scroll: false }),
        [router, slug],
    );

    const onProgress = useCallback(
        (res) => {
            if (!res) return;
            setPercent(res.course_progress);
            if (res.completed) setCompleted((s) => (s.has(lessonId) ? s : new Set(s).add(lessonId)));
            if (res.certificate_code) {
                setCertificate((prev) => {
                    if (!prev) toast("Course complete! Your certificate is ready.");
                    return res.certificate_code;
                });
            }
        },
        [lessonId, toast],
    );

    const toggleComplete = async () => {
        const done = !completed.has(lessonId);
        setCompleted((s) => {
            const n = new Set(s);
            done ? n.add(lessonId) : n.delete(lessonId);
            return n;
        });
        try {
            const res = await api(`/lessons/${lessonId}/progress/`, {
                method: "POST",
                body: { completed: done, position_seconds: videoRef.current?.currentTime || 0 },
            });
            onProgress(res);
            if (!done) setPercent(res.course_progress);
        } catch (err) {
            toast(err.message, { type: "error" });
        }
    };

    const addNote = useCallback(() => {
        setTab("notes");
        requestAnimationFrame(() => notesRef.current?.focus());
    }, []);

    if (!ready || course.loading)
        return (
            <div className="grid min-h-[100dvh] place-items-center text-ink-3">
                <Spinner className="size-6" />
            </div>
        );
    if (course.error)
        return (
            <div className="mx-auto max-w-lg px-4 py-24">
                <ErrorNote error={course.error} onRetry={course.reload} />
            </div>
        );
    if (!course.data) return null;

    const c = course.data;
    const current = lesson.data;
    const index = lessons.findIndex((l) => l.id === lessonId);
    const next = lessons[index + 1];
    const prev = lessons[index - 1];
    const canAccess = (l) => viewer.is_enrolled || viewer.is_owner || l.is_preview;

    return (
        <div className="min-h-[100dvh]">
            <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-line bg-paper/90 px-3 backdrop-blur sm:px-4">
                <Link href={`/courses/${slug}`} className="btn btn-ghost btn-sm px-2.5" aria-label="Back to course">
                    <ArrowLeft size={18} />
                </Link>
                <p className="min-w-0 flex-1 truncate font-display font-bold">{c.title}</p>
                {tracking && (
                    <div className="hidden items-center gap-2 text-sm sm:flex">
                        <ProgressRing value={percent} size={34} stroke={3.5} />
                        <span className="text-ink-2">{percent === 100 ? "Complete" : "Progress"}</span>
                    </div>
                )}
                {certificate && (
                    <Link href={`/certificates/${certificate}`} className="btn btn-primary btn-sm">
                        <Certificate size={16} /> <span className="hidden sm:inline">Certificate</span>
                    </Link>
                )}
                <button onClick={toggle} className="btn btn-ghost btn-sm px-2.5" aria-label="Toggle dark mode">
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button className="btn btn-outline btn-sm lg:hidden" onClick={() => setSidebar(true)}>
                    <ListBullets size={16} /> Lessons
                </button>
            </header>

            <div className="lg:grid lg:grid-cols-[1fr_360px]">
                <div className="min-w-0 px-3 py-5 sm:px-6 lg:py-6">
                    {!viewer.is_enrolled && !viewer.is_owner && (
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-accent-soft px-4 py-3 text-sm">
                            <span>You&apos;re watching a free preview. Enroll to unlock every lesson and track progress.</span>
                            <Link href={`/courses/${slug}`} className="btn btn-primary btn-sm">
                                Enroll free
                            </Link>
                        </div>
                    )}

                    {lesson.error ? (
                        <div className="grid aspect-video place-items-center rounded-2xl bg-surface-2 p-6 text-center">
                            <div>
                                <Lock size={32} className="mx-auto text-ink-3" />
                                <p className="mt-3 font-semibold">{lesson.error.message}</p>
                                <Link href={`/courses/${slug}`} className="btn btn-primary btn-sm mt-4">
                                    View course
                                </Link>
                            </div>
                        </div>
                    ) : !current || lesson.loading ? (
                        <div className="skeleton aspect-video rounded-2xl" />
                    ) : current.kind === "video" && current.has_video ? (
                        <VideoPlayer
                            key={current.id}
                            lesson={current}
                            videoRef={videoRef}
                            trackProgress={tracking}
                            onProgress={onProgress}
                            nextLesson={next && canAccess(next) ? next : null}
                            onNext={() => goTo(next?.id)}
                            onAddNote={tracking ? addNote : undefined}
                        />
                    ) : (
                        <article className="card prose-lesson p-6 sm:p-10">
                            <ReactMarkdown>{current.body || "_This lesson has no content yet._"}</ReactMarkdown>
                        </article>
                    )}

                    {current && (
                        <div className="mt-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm text-ink-3">
                                        {current.section_title} · Lesson {current.index} of {current.total}
                                    </p>
                                    <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                                        {current.title}
                                    </h1>
                                </div>
                                <div className="flex items-center gap-2">
                                    {tracking && (
                                        <button
                                            onClick={toggleComplete}
                                            className={`btn btn-sm ${completed.has(lessonId) ? "btn-outline" : "btn-primary"}`}
                                        >
                                            {completed.has(lessonId) ? (
                                                <>
                                                    <CheckCircle size={16} weight="fill" className="text-accent" /> Completed
                                                </>
                                            ) : (
                                                "Mark complete"
                                            )}
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-outline btn-sm px-2.5"
                                        disabled={!prev}
                                        onClick={() => goTo(prev?.id)}
                                        aria-label="Previous lesson"
                                    >
                                        <CaretLeft size={16} />
                                    </button>
                                    <button
                                        className="btn btn-outline btn-sm px-2.5"
                                        disabled={!next}
                                        onClick={() => goTo(next?.id)}
                                        aria-label="Next lesson"
                                    >
                                        <CaretRight size={16} />
                                    </button>
                                </div>
                            </div>

                            {percent === 100 && certificate && (
                                <div className="fade-up mt-5 flex flex-wrap items-center gap-4 rounded-2xl bg-ink p-5 text-paper">
                                    <Confetti size={32} weight="duotone" className="text-accent" />
                                    <div className="flex-1">
                                        <p className="font-display text-lg font-bold">You finished the course!</p>
                                        <p className="text-sm text-paper/70">Share your certificate or leave a review.</p>
                                    </div>
                                    <Link href={`/certificates/${certificate}`} className="btn btn-primary btn-sm">
                                        View certificate
                                    </Link>
                                </div>
                            )}

                            <div className="mt-6 flex gap-1 border-b border-line" role="tablist">
                                {[
                                    ["overview", "Overview"],
                                    ["notes", "Notes"],
                                    ["discussion", "Discussion"],
                                ].map(([key, label]) => (
                                    <button
                                        key={key}
                                        role="tab"
                                        aria-selected={tab === key}
                                        onClick={() => setTab(key)}
                                        className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                                            tab === key ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink"
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <div className="py-6">
                                {tab === "overview" && (
                                    <div className="prose-lesson max-w-3xl">
                                        {current.summary && <p className="text-base text-ink">{current.summary}</p>}
                                        {current.kind === "video" && current.body && <ReactMarkdown>{current.body}</ReactMarkdown>}
                                        {!current.summary && !(current.kind === "video" && current.body) && (
                                            <p className="text-ink-3">No additional notes from the instructor for this lesson.</p>
                                        )}
                                    </div>
                                )}
                                {tab === "notes" && (
                                    <NotesPanel ref={notesRef} lesson={current} videoRef={videoRef} canWrite={tracking} />
                                )}
                                {tab === "discussion" && (
                                    <Discussion lesson={current} videoRef={videoRef} isOwner={viewer.is_owner} />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Curriculum sidebar / mobile drawer */}
                <aside
                    className={`${
                        sidebar ? "fixed inset-0 z-50 bg-paper" : "hidden"
                    } lg:sticky lg:top-14 lg:block lg:h-[calc(100dvh-3.5rem)] lg:border-l lg:border-line`}
                >
                    <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between border-b border-line px-4 py-3">
                            <div>
                                <p className="font-display font-bold">Course content</p>
                                <p className="text-xs text-ink-3">
                                    {completed.size} / {lessons.length} complete
                                </p>
                            </div>
                            <button className="btn btn-ghost btn-sm px-2 lg:hidden" onClick={() => setSidebar(false)} aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto pb-6">
                            {c.sections.map((section, si) => (
                                <div key={section.id}>
                                    <p className="sticky top-0 z-10 bg-paper px-4 pb-1.5 pt-4 text-xs font-bold uppercase tracking-wider text-ink-3">
                                        {si + 1}. {section.title}
                                    </p>
                                    {section.lessons.map((l) => {
                                        const active = l.id === lessonId;
                                        const allowed = canAccess(l);
                                        const Icon = l.kind === "article" ? Article : PlayCircle;
                                        return (
                                            <button
                                                key={l.id}
                                                disabled={!allowed}
                                                onClick={() => goTo(l.id)}
                                                className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors disabled:opacity-50 ${
                                                    active ? "bg-accent-soft" : "hover:bg-surface-2"
                                                }`}
                                                aria-current={active ? "true" : undefined}
                                            >
                                                <span className="mt-0.5">
                                                    {completed.has(l.id) ? (
                                                        <CheckCircle size={18} weight="fill" className="text-accent" />
                                                    ) : allowed ? (
                                                        <Circle size={18} className="text-ink-3" />
                                                    ) : (
                                                        <Lock size={18} className="text-ink-3" />
                                                    )}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className={`block text-sm ${active ? "font-bold" : ""}`}>{l.title}</span>
                                                    <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-3">
                                                        <Icon size={12} /> {formatDuration(l.duration_seconds)}
                                                    </span>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </nav>
                    </div>
                </aside>
            </div>
        </div>
    );
}
