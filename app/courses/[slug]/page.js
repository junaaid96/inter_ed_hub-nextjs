"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
    Article,
    CaretDown,
    Certificate,
    CheckCircle,
    Clock,
    Globe,
    InfinityIcon,
    Lock,
    NotePencil,
    PencilSimple,
    Play,
    PlayCircle,
    Star,
    Users,
} from "@phosphor-icons/react";
import { Avatar, ErrorNote, Modal, ProgressRing, Spinner, Stars } from "@/components/ui";
import { CourseCover } from "@/components/CourseCard";
import { useToast } from "@/components/Toaster";
import { useFetch } from "@/lib/useFetch";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { compact, formatDate, formatDuration, LEVELS, plural, timeAgo } from "@/lib/format";

export default function CoursePage() {
    const { slug } = useParams();
    const { user, ready } = useAuth();
    const { data: course, error, loading, reload } = useFetch(ready ? `/courses/${slug}/` : null, {
        deps: [user?.id],
    });
    const [preview, setPreview] = useState(null);

    if (loading || !ready) return <DetailSkeleton />;
    if (error)
        return (
            <div className="mx-auto max-w-3xl px-4 py-20">
                {error.status === 404 ? (
                    <div className="text-center">
                        <h1 className="font-display text-3xl font-bold">Course not found</h1>
                        <Link href="/courses" className="btn btn-primary mt-6">
                            Browse courses
                        </Link>
                    </div>
                ) : (
                    <ErrorNote error={error} onRetry={reload} />
                )}
            </div>
        );
    if (!course) return null;

    const firstPreview = course.sections.flatMap((s) => s.lessons).find((l) => l.is_preview && l.has_video);

    return (
        <>
            <section className="border-b border-line bg-surface">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:py-14">
                    <div className="fade-up">
                        {course.department && (
                            <Link
                                href={`/courses?department=${course.department.slug}`}
                                className="text-sm font-semibold text-accent hover:underline"
                            >
                                {course.department.name}
                            </Link>
                        )}
                        <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-tight">
                            {course.title}
                        </h1>
                        {course.subtitle && <p className="mt-4 max-w-2xl text-lg text-ink-2">{course.subtitle}</p>}
                        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-2">
                            {course.review_count > 0 ? (
                                <span className="flex items-center gap-1.5">
                                    <b className="text-ink">{course.rating.toFixed(1)}</b>
                                    <Stars value={course.rating} />
                                    <a href="#reviews" className="underline underline-offset-2">
                                        {plural(course.review_count, "review")}
                                    </a>
                                </span>
                            ) : (
                                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-accent">
                                    New course
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Users size={16} /> {compact(course.student_count)} {course.student_count === 1 ? "learner" : "learners"}
                            </span>
                            <span>{LEVELS[course.level]}</span>
                            <span className="flex items-center gap-1.5">
                                <Globe size={16} /> {course.language}
                            </span>
                        </div>
                        <Link
                            href={`/teachers/${course.teacher.id}`}
                            className="mt-6 inline-flex items-center gap-3 rounded-full py-1 pr-4 hover:bg-surface-2"
                        >
                            <Avatar src={course.teacher.avatar} name={course.teacher.name} size={40} />
                            <span>
                                <span className="block text-sm font-bold">{course.teacher.name}</span>
                                <span className="block text-xs text-ink-3">{course.teacher.headline || "Instructor"}</span>
                            </span>
                        </Link>
                        <p className="mt-4 text-xs text-ink-3">Updated {formatDate(course.updated_at)}</p>
                    </div>

                    <EnrollCard course={course} firstPreview={firstPreview} onPreview={setPreview} onChange={reload} />
                </div>
            </section>

            <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px]">
                <div className="min-w-0 space-y-12">
                    {course.outcomes?.length > 0 && (
                        <section className="card p-6">
                            <h2 className="font-display text-2xl font-bold">What you&apos;ll learn</h2>
                            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                                {course.outcomes.map((o) => (
                                    <li key={o} className="flex gap-2.5 text-[15px] text-ink-2">
                                        <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-accent" /> {o}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <Curriculum course={course} onPreview={setPreview} />

                    {course.requirements?.length > 0 && (
                        <section>
                            <h2 className="font-display text-2xl font-bold">Before you start</h2>
                            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-2">
                                {course.requirements.map((r) => (
                                    <li key={r}>{r}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section>
                        <h2 className="font-display text-2xl font-bold">About this course</h2>
                        <div className="prose-lesson mt-3">
                            <ReactMarkdown>{course.description}</ReactMarkdown>
                        </div>
                    </section>

                    <section className="card p-6">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-3">Your instructor</h2>
                        <div className="mt-4 flex items-center gap-4">
                            <Avatar src={course.teacher.avatar} name={course.teacher.name} size={64} />
                            <div>
                                <Link href={`/teachers/${course.teacher.id}`} className="font-display text-xl font-bold hover:underline">
                                    {course.teacher.name}
                                </Link>
                                <p className="text-sm text-ink-2">{course.teacher_profile.designation}</p>
                                <p className="text-xs text-ink-3">{plural(course.teacher_profile.course_count, "published course")}</p>
                            </div>
                        </div>
                        {course.teacher_profile.bio && <p className="mt-4 text-ink-2">{course.teacher_profile.bio}</p>}
                    </section>

                    <Reviews course={course} onChange={reload} />
                </div>
            </div>

            <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.title} wide>
                {preview && <PreviewPlayer lessonId={preview.id} />}
            </Modal>
        </>
    );
}

function EnrollCard({ course, firstPreview, onPreview, onChange }) {
    const { user } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [busy, setBusy] = useState(false);
    const v = course.viewer;
    const learnHref = `/learn/${course.slug}${v.last_lesson_id ? `?lesson=${v.last_lesson_id}` : ""}`;

    const enroll = async () => {
        if (!user) return router.push(`/login?next=/courses/${course.slug}`);
        setBusy(true);
        try {
            const res = await api(`/courses/${course.slug}/enroll/`, { method: "POST" });
            toast("You're in. Happy learning!");
            router.push(`/learn/${course.slug}${res.first_lesson_id ? `?lesson=${res.first_lesson_id}` : ""}`);
        } catch (err) {
            toast(err.message, { type: "error" });
            setBusy(false);
        }
    };

    return (
        <aside className="lg:row-span-2">
            <div className="card overflow-hidden shadow-[0_24px_48px_-28px_rgba(0,0,0,0.35)] lg:sticky lg:top-24">
                <button
                    className="group relative block w-full"
                    onClick={() => firstPreview && onPreview(firstPreview)}
                    disabled={!firstPreview}
                    aria-label="Watch preview"
                >
                    <CourseCover course={course} />
                    {firstPreview && (
                        <span className="absolute inset-0 grid place-items-center bg-black/25 transition-colors group-hover:bg-black/35">
                            <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-black shadow-lg">
                                <Play size={16} weight="fill" /> Preview
                            </span>
                        </span>
                    )}
                </button>
                <div className="p-5">
                    {v.is_owner ? (
                        <>
                            <p className="mb-3 text-sm text-ink-2">
                                You teach this course{course.is_published ? "." : ". It's still a draft."}
                            </p>
                            <Link href={`/studio/${course.slug}`} className="btn btn-primary w-full">
                                <PencilSimple size={16} /> Edit in studio
                            </Link>
                            <Link href={`/learn/${course.slug}`} className="btn btn-outline mt-2 w-full">
                                View as learner
                            </Link>
                        </>
                    ) : v.is_enrolled ? (
                        <>
                            <div className="mb-4 flex items-center gap-3">
                                <ProgressRing value={v.progress} size={52} />
                                <div>
                                    <p className="font-bold">{v.progress === 100 ? "Course complete" : "Your progress"}</p>
                                    <p className="text-sm text-ink-3">
                                        {v.completed_lessons.length} of {course.lesson_count} lessons
                                    </p>
                                </div>
                            </div>
                            <Link href={learnHref} className="btn btn-primary w-full">
                                <PlayCircle size={18} weight="fill" /> {v.progress ? "Continue learning" : "Start learning"}
                            </Link>
                            {v.certificate_code && (
                                <Link href={`/certificates/${v.certificate_code}`} className="btn btn-outline mt-2 w-full">
                                    <Certificate size={18} /> View certificate
                                </Link>
                            )}
                        </>
                    ) : user?.role === "teacher" ? (
                        <p className="text-sm text-ink-2">Switch to a student account to enroll in courses.</p>
                    ) : (
                        <>
                            <p className="font-display text-3xl font-bold">Free</p>
                            <button onClick={enroll} disabled={busy} className="btn btn-primary mt-3 w-full">
                                {busy ? <Spinner /> : "Enroll now"}
                            </button>
                            {firstPreview && (
                                <button onClick={() => onPreview(firstPreview)} className="btn btn-outline mt-2 w-full">
                                    Watch a free preview
                                </button>
                            )}
                        </>
                    )}
                    <ul className="mt-5 space-y-2.5 text-sm text-ink-2">
                        <li className="flex items-center gap-2.5">
                            <PlayCircle size={18} /> {plural(course.lesson_count, "lesson")}
                        </li>
                        <li className="flex items-center gap-2.5">
                            <Clock size={18} /> {formatDuration(course.total_seconds, { long: true })} total
                        </li>
                        <li className="flex items-center gap-2.5">
                            <NotePencil size={18} /> Timestamped notes and Q&amp;A
                        </li>
                        <li className="flex items-center gap-2.5">
                            <Certificate size={18} /> Certificate of completion
                        </li>
                        <li className="flex items-center gap-2.5">
                            <InfinityIcon size={18} /> Lifetime access
                        </li>
                    </ul>
                </div>
            </div>
        </aside>
    );
}

function Curriculum({ course, onPreview }) {
    const [open, setOpen] = useState(() => new Set(course.sections.slice(0, 2).map((s) => s.id)));
    const v = course.viewer;
    const canWatch = v.is_enrolled || v.is_owner;
    const done = new Set(v.completed_lessons);
    const allOpen = open.size === course.sections.length;

    return (
        <section>
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <h2 className="font-display text-2xl font-bold">Course content</h2>
                    <p className="mt-1 text-sm text-ink-3">
                        {plural(course.sections.length, "section")} · {plural(course.lesson_count, "lesson")} ·{" "}
                        {formatDuration(course.total_seconds, { long: true })}
                    </p>
                </div>
                <button
                    className="text-sm font-semibold text-accent hover:underline"
                    onClick={() => setOpen(allOpen ? new Set() : new Set(course.sections.map((s) => s.id)))}
                >
                    {allOpen ? "Collapse all" : "Expand all"}
                </button>
            </div>
            <div className="card mt-4 divide-y divide-line overflow-hidden">
                {course.sections.map((section, si) => {
                    const isOpen = open.has(section.id);
                    const seconds = section.lessons.reduce((a, l) => a + l.duration_seconds, 0);
                    return (
                        <div key={section.id}>
                            <button
                                className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-surface-2/60"
                                aria-expanded={isOpen}
                                onClick={() =>
                                    setOpen((o) => {
                                        const n = new Set(o);
                                        n.has(section.id) ? n.delete(section.id) : n.add(section.id);
                                        return n;
                                    })
                                }
                            >
                                <CaretDown size={16} className={`shrink-0 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                                <span className="flex-1 font-semibold">
                                    <span className="mr-2 text-ink-3">{si + 1}.</span>
                                    {section.title}
                                </span>
                                <span className="text-xs text-ink-3">
                                    {plural(section.lessons.length, "lesson")} · {formatDuration(seconds, { long: true })}
                                </span>
                            </button>
                            {isOpen && (
                                <ul className="pb-2">
                                    {section.lessons.map((lesson) => {
                                        const Icon = lesson.kind === "article" ? Article : PlayCircle;
                                        const content = (
                                            <>
                                                {done.has(lesson.id) ? (
                                                    <CheckCircle size={18} weight="fill" className="shrink-0 text-accent" />
                                                ) : (
                                                    <Icon size={18} className="shrink-0 text-ink-3" />
                                                )}
                                                <span className="flex-1 text-sm">{lesson.title}</span>
                                                {lesson.is_preview && !canWatch && (
                                                    <span className="text-xs font-semibold text-accent">Preview</span>
                                                )}
                                                {!lesson.is_preview && !canWatch && <Lock size={14} className="text-ink-3" />}
                                                <span className="w-12 text-right text-xs tabular-nums text-ink-3">
                                                    {formatDuration(lesson.duration_seconds)}
                                                </span>
                                            </>
                                        );
                                        const cls = "flex w-full items-center gap-3 px-5 py-2.5 pl-12 text-left";
                                        return (
                                            <li key={lesson.id}>
                                                {canWatch ? (
                                                    <Link href={`/learn/${course.slug}?lesson=${lesson.id}`} className={`${cls} hover:bg-surface-2/60`}>
                                                        {content}
                                                    </Link>
                                                ) : lesson.is_preview && lesson.has_video ? (
                                                    <button onClick={() => onPreview(lesson)} className={`${cls} hover:bg-surface-2/60`}>
                                                        {content}
                                                    </button>
                                                ) : (
                                                    <div className={cls}>{content}</div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function PreviewPlayer({ lessonId }) {
    const { data, error, loading } = useFetch(`/lessons/${lessonId}/stream/`);
    if (loading)
        return (
            <div className="grid aspect-video place-items-center rounded-xl bg-black text-white">
                <Spinner className="size-6" />
            </div>
        );
    if (error) return <ErrorNote error={error} />;
    return <video src={data.url} controls autoPlay playsInline className="aspect-video w-full rounded-xl bg-black" />;
}

function Reviews({ course, onChange }) {
    const { data, reload } = useFetch(`/courses/${course.slug}/reviews/`);
    const v = course.viewer;
    const total = course.review_count;

    return (
        <section id="reviews" className="scroll-mt-24">
            <h2 className="font-display text-2xl font-bold">Learner reviews</h2>
            {total > 0 && (
                <div className="mt-5 grid items-center gap-6 sm:grid-cols-[160px_1fr]">
                    <div className="text-center sm:text-left">
                        <p className="font-display text-6xl font-extrabold">{course.rating.toFixed(1)}</p>
                        <Stars value={course.rating} size={18} />
                        <p className="mt-1 text-sm text-ink-3">{plural(total, "review")}</p>
                    </div>
                    <div className="space-y-1.5">
                        {Object.entries(course.rating_breakdown)
                            .sort(([a], [b]) => b - a)
                            .map(([star, count]) => (
                            <div key={star} className="flex items-center gap-3 text-sm">
                                <span className="flex w-8 items-center gap-1 text-ink-2">
                                    {star} <Star size={12} weight="fill" className="text-star" />
                                </span>
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                                    <div className="h-full rounded-full bg-star" style={{ width: `${(count / total) * 100}%` }} />
                                </div>
                                <span className="w-8 text-right text-ink-3">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {v.is_enrolled && (
                <ReviewForm
                    slug={course.slug}
                    existing={v.review}
                    onSaved={() => {
                        reload();
                        onChange();
                    }}
                />
            )}

            <div className="mt-6 space-y-4">
                {data?.results?.map((r) => (
                    <article key={r.id} className="border-b border-line pb-4">
                        <div className="flex items-center gap-3">
                            <Avatar src={r.student.avatar} name={r.student.name} size={36} />
                            <div>
                                <p className="text-sm font-bold">{r.student.name}</p>
                                <p className="flex items-center gap-2 text-xs text-ink-3">
                                    <Stars value={r.rating} size={12} /> {timeAgo(r.updated_at)}
                                </p>
                            </div>
                        </div>
                        {r.comment && <p className="mt-2 text-[15px] text-ink-2">{r.comment}</p>}
                    </article>
                ))}
                {total === 0 && !v.is_enrolled && (
                    <p className="text-ink-3">No reviews yet. Enroll and be the first to share how it went.</p>
                )}
            </div>
        </section>
    );
}

function ReviewForm({ slug, existing, onSaved }) {
    const toast = useToast();
    const [rating, setRating] = useState(existing?.rating || 0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState(existing?.comment || "");
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!rating) return toast("Pick a star rating first.", { type: "error" });
        setBusy(true);
        try {
            await api(`/courses/${slug}/reviews/`, { method: "POST", body: { rating, comment } });
            toast(existing ? "Review updated" : "Thanks for your review!");
            onSaved();
        } catch (err) {
            toast(err.message, { type: "error" });
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} className="card mt-6 p-5">
            <p className="font-semibold">{existing ? "Your review" : "How is this course going?"}</p>
            <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <button
                        type="button"
                        key={i}
                        onMouseEnter={() => setHover(i)}
                        onClick={() => setRating(i)}
                        aria-label={`${i} star${i > 1 ? "s" : ""}`}
                        className="text-star transition-transform hover:scale-110"
                    >
                        <Star size={28} weight={(hover || rating) >= i ? "fill" : "regular"} />
                    </button>
                ))}
            </div>
            <textarea
                className="field mt-3"
                rows={3}
                placeholder="What did you like? What could be better?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <button className="btn btn-ink btn-sm mt-3" disabled={busy}>
                {busy ? <Spinner /> : existing ? "Update review" : "Post review"}
            </button>
        </form>
    );
}

function DetailSkeleton() {
    return (
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-12 w-4/5" />
                <div className="skeleton h-6 w-3/5" />
                <div className="skeleton mt-8 h-40 w-full" />
            </div>
            <div className="skeleton h-96 rounded-[var(--radius-card)]" />
        </div>
    );
}
