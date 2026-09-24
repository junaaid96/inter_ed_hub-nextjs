"use client";

import Link from "next/link";
import {
    ArrowRight,
    BookOpen,
    Certificate,
    ChatCircleText,
    Clock,
    Flame,
    NotePencil,
    Plus,
    Star,
    Trophy,
    Users,
    VideoCamera,
} from "@phosphor-icons/react";
import RequireAuth from "@/components/RequireAuth";
import CourseCard, { CourseCover } from "@/components/CourseCard";
import { ActivityHeatmap, BarChart, StatTile } from "@/components/Charts";
import { Avatar, EmptyState, ErrorNote, ProgressBar } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/lib/useFetch";
import { compact, formatDuration, plural, timeAgo } from "@/lib/format";

export default function DashboardPage() {
    return (
        <RequireAuth>
            <Dashboard />
        </RequireAuth>
    );
}

function Dashboard() {
    const { user, isTeacher } = useAuth();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {greeting}, {user.first_name}.
            </h1>
            {isTeacher ? <TeacherDashboard /> : <StudentDashboard />}
        </div>
    );
}

function StudentDashboard() {
    const { data, error, loading, reload } = useFetch("/me/learning/");
    if (loading) return <DashboardSkeleton />;
    if (error) return <ErrorNote error={error} onRetry={reload} />;
    const { stats, activity, courses } = data;
    const inProgress = courses.filter((c) => !c.completed_at);
    const resume = [...inProgress].sort((a, b) => new Date(b.last_accessed_at || 0) - new Date(a.last_accessed_at || 0))[0];
    const certificates = courses.filter((c) => c.certificate_code);

    return (
        <>
            <p className="mt-2 text-ink-2">
                {stats.current_streak > 0
                    ? `You're on a ${stats.current_streak}-day streak. Keep it going today.`
                    : "Watch a lesson today to start a new streak."}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatTile icon={Flame} accent label="Current streak" value={`${stats.current_streak}d`} hint={`Best: ${plural(stats.longest_streak, "day")}`} />
                <StatTile icon={Clock} label="This week" value={`${stats.minutes_this_week}m`} hint={`${compact(stats.total_minutes)} minutes all-time`} />
                <StatTile icon={Trophy} label="Completed" value={stats.completed} hint={`of ${stats.enrolled} enrolled`} />
                <StatTile icon={NotePencil} label="Notes taken" value={stats.notes} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                {resume ? (
                    <Link
                        href={`/learn/${resume.course.slug}${resume.next_lesson ? `?lesson=${resume.next_lesson.id}` : ""}`}
                        className="group card grid overflow-hidden transition-colors hover:border-ink-3 sm:grid-cols-[240px_1fr]"
                    >
                        <CourseCover course={resume.course} className="h-full" />
                        <div className="flex flex-col p-5">
                            <p className="text-xs font-bold uppercase tracking-wider text-accent">Continue learning</p>
                            <p className="mt-1 font-display text-xl font-bold leading-snug">{resume.course.title}</p>
                            {resume.next_lesson && (
                                <p className="mt-1 text-sm text-ink-2">
                                    Next: {resume.next_lesson.title} · {formatDuration(resume.next_lesson.duration_seconds)}
                                </p>
                            )}
                            <div className="mt-auto pt-4">
                                <div className="mb-1.5 flex justify-between text-xs text-ink-3">
                                    <span>
                                        {resume.completed_lessons}/{resume.total_lessons} lessons
                                    </span>
                                    <span>{resume.progress}%</span>
                                </div>
                                <ProgressBar value={resume.progress} />
                            </div>
                        </div>
                    </Link>
                ) : (
                    <EmptyState
                        icon={BookOpen}
                        title={courses.length ? "All caught up" : "Nothing in progress"}
                        action={
                            <Link href="/courses" className="btn btn-primary">
                                Find a course
                            </Link>
                        }
                    >
                        {courses.length
                            ? "You've finished everything you enrolled in. Time for something new?"
                            : "Pick a course and your next lesson will show up here."}
                    </EmptyState>
                )}
                <div className="card p-5">
                    <div className="mb-4 flex items-baseline justify-between">
                        <h2 className="font-display text-lg font-bold">Learning activity</h2>
                        <span className="text-xs text-ink-3">Last 12 weeks</span>
                    </div>
                    <ActivityHeatmap days={activity} />
                </div>
            </div>

            <section className="mt-12">
                <h2 className="mb-5 font-display text-2xl font-bold">My courses</h2>
                {courses.length ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {courses.map((c) => (
                            <CourseCard
                                key={c.course.id}
                                course={c.course}
                                progress={c.progress}
                                href={`/learn/${c.course.slug}${c.next_lesson ? `?lesson=${c.next_lesson.id}` : ""}`}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-ink-3">You haven&apos;t enrolled in anything yet.</p>
                )}
            </section>

            {certificates.length > 0 && (
                <section className="mt-12">
                    <h2 className="mb-5 font-display text-2xl font-bold">Certificates</h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {certificates.map((c) => (
                            <Link
                                key={c.certificate_code}
                                href={`/certificates/${c.certificate_code}`}
                                className="card flex items-center gap-4 p-4 hover:border-ink-3"
                            >
                                <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
                                    <Certificate size={22} weight="duotone" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block truncate font-semibold">{c.course.title}</span>
                                    <span className="font-mono text-xs text-ink-3">#{c.certificate_code}</span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}

function TeacherDashboard() {
    const { data, error, loading, reload } = useFetch("/me/teaching/");
    if (loading) return <DashboardSkeleton />;
    if (error) return <ErrorNote error={error} onRetry={reload} />;
    const { stats, courses, questions, enrollments_30d: daily } = data;
    const newThisMonth = daily.reduce((a, d) => a + d.count, 0);

    return (
        <>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <p className="text-ink-2">Here&apos;s how your courses are doing.</p>
                <Link href="/studio/new" className="btn btn-primary">
                    <Plus size={16} weight="bold" /> New course
                </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatTile icon={Users} label="Learners" value={compact(stats.students)} hint={plural(stats.enrollments, "enrollment")} />
                <StatTile icon={Star} label="Average rating" value={stats.rating ? stats.rating.toFixed(2) : "-"} hint={plural(stats.reviews, "review")} />
                <StatTile icon={Clock} label="Minutes watched" value={compact(stats.watch_minutes)} />
                <StatTile icon={VideoCamera} label="Published" value={`${stats.published}/${stats.courses}`} hint="courses" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <div className="card p-5">
                    <div className="mb-5 flex items-baseline justify-between">
                        <h2 className="font-display text-lg font-bold">New enrollments</h2>
                        <span className="text-sm text-ink-2">
                            <b className="text-ink">{newThisMonth}</b> in 30 days
                        </span>
                    </div>
                    <BarChart data={daily} />
                </div>
                <div className="card p-5">
                    <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
                        <ChatCircleText size={20} /> Student questions
                    </h2>
                    {questions.length === 0 ? (
                        <p className="text-sm text-ink-3">No questions yet. They&apos;ll appear here as students ask.</p>
                    ) : (
                        <ul className="-mx-2 space-y-1">
                            {questions.map((q) => (
                                <li key={q.id}>
                                    <Link
                                        href={`/learn/${q.course.slug}?lesson=${q.lesson.id}`}
                                        className="flex gap-3 rounded-xl p-2 hover:bg-surface-2"
                                    >
                                        <Avatar src={q.author.avatar} name={q.author.name} size={32} />
                                        <span className="min-w-0 flex-1">
                                            <span className="line-clamp-1 text-sm">{q.body}</span>
                                            <span className="block truncate text-xs text-ink-3">
                                                {q.lesson.title} · {timeAgo(q.created_at)}
                                            </span>
                                        </span>
                                        {!q.answered && (
                                            <span className="h-fit rounded-full bg-warn/15 px-2 py-0.5 text-[11px] font-bold text-warn">
                                                New
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <section className="mt-12">
                <h2 className="mb-5 font-display text-2xl font-bold">Your courses</h2>
                {courses.length === 0 ? (
                    <EmptyState
                        icon={VideoCamera}
                        title="Create your first course"
                        action={
                            <Link href="/studio/new" className="btn btn-primary">
                                Start building <ArrowRight size={16} />
                            </Link>
                        }
                    >
                        Add sections, upload videos, and publish when you&apos;re ready.
                    </EmptyState>
                ) : (
                    <div className="card overflow-x-auto">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead>
                                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-3">
                                    <th className="px-5 py-3 font-semibold">Course</th>
                                    <th className="px-3 py-3 font-semibold">Status</th>
                                    <th className="px-3 py-3 text-right font-semibold">Learners</th>
                                    <th className="px-3 py-3 text-right font-semibold">Rating</th>
                                    <th className="px-3 py-3 font-semibold">Completion</th>
                                    <th className="px-5 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {courses.map((c) => (
                                    <tr key={c.id} className="hover:bg-surface-2/50">
                                        <td className="px-5 py-3">
                                            <Link href={`/studio/${c.slug}`} className="font-semibold hover:underline">
                                                {c.title}
                                            </Link>
                                            <p className="text-xs text-ink-3">
                                                {c.lesson_count} lessons · {formatDuration(c.total_seconds, { long: true })}
                                            </p>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                                    c.is_published ? "bg-accent-soft text-accent" : "bg-surface-2 text-ink-2"
                                                }`}
                                            >
                                                {c.is_published ? "Published" : "Draft"}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-right tabular-nums">{c.student_count}</td>
                                        <td className="px-3 py-3 text-right tabular-nums">
                                            {c.review_count ? c.rating.toFixed(1) : "-"}
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex items-center gap-2">
                                                <ProgressBar value={c.completion_rate} className="w-24" />
                                                <span className="text-xs tabular-nums text-ink-3">{c.completion_rate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <Link href={`/studio/${c.slug}`} className="btn btn-outline btn-sm">
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </>
    );
}

function DashboardSkeleton() {
    return (
        <div className="mt-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="skeleton h-28 rounded-[var(--radius-card)]" />
                ))}
            </div>
            <div className="skeleton h-56 rounded-[var(--radius-card)]" />
        </div>
    );
}
