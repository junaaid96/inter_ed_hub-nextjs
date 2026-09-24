"use client";

import Link from "next/link";
import {
    ArrowRight,
    Certificate,
    ChatCircleText,
    ClockCounterClockwise,
    Flame,
    NotePencil,
    UploadSimple,
} from "@phosphor-icons/react";
import CourseCard, { CourseCardSkeleton } from "@/components/CourseCard";
import { Avatar } from "@/components/ui";
import DepartmentIcon from "@/components/DepartmentIcon";
import { useFetch } from "@/lib/useFetch";
import { useAuth } from "@/lib/auth";
import { compact } from "@/lib/format";

export default function Home() {
    const { user } = useAuth();
    const courses = useFetch("/courses/?ordering=popular&page_size=8");
    const departments = useFetch("/departments/");
    const teachers = useFetch("/teachers/");
    const featured = courses.data?.results?.slice(0, 3) || [];

    return (
        <>
            {/* Hero */}
            <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:pt-20 lg:grid-cols-[1.1fr_1fr]">
                <div className="fade-up">
                    <h1 className="font-display text-[clamp(2.5rem,6vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.03em]">
                        Learn from teachers,
                        <br />
                        <span className="text-accent">not algorithms.</span>
                    </h1>
                    <p className="mt-6 max-w-md text-lg text-ink-2">
                        Stream video lessons, pin notes to the exact second, and keep a streak that makes learning stick.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href="/courses" className="btn btn-primary h-12 px-6 text-[15px]">
                            Browse courses <ArrowRight size={18} weight="bold" />
                        </Link>
                        {!user && (
                            <Link href="/register?role=teacher" className="btn btn-outline h-12 px-6 text-[15px]">
                                Teach on InterEd
                            </Link>
                        )}
                    </div>
                    <dl className="mt-10 flex gap-8 text-sm">
                        <Stat label="Courses" value={courses.data?.count} />
                        <Stat label="Teachers" value={teachers.data?.length} />
                        <Stat label="Subjects" value={departments.data?.length} />
                    </dl>
                </div>

                <div className="relative mx-auto aspect-[5/4] w-full max-w-xl">
                    {featured.length === 0 ? (
                        <div className="skeleton absolute inset-0 rounded-3xl" />
                    ) : (
                        featured.map((course, i) => (
                            <Link
                                key={course.id}
                                href={`/courses/${course.slug}`}
                                className="group absolute overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:z-10 hover:-translate-y-1"
                                style={{
                                    width: ["78%", "56%", "50%"][i],
                                    left: ["0%", "44%", "8%"][i],
                                    top: ["0%", "38%", "62%"][i],
                                    zIndex: 3 - i,
                                    transform: `rotate(${[-2, 3, -1][i]}deg)`,
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={course.cover} alt="" className="aspect-video w-full object-cover" />
                                <div className="flex items-center gap-2 p-3">
                                    <Avatar src={course.teacher.avatar} name={course.teacher.name} size={22} />
                                    <span className="truncate text-[13px] font-semibold">{course.title}</span>
                                </div>
                            </Link>
                        ))
                    )}
                    <div className="absolute -bottom-2 right-2 z-20 flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper shadow-lg">
                        <Flame size={18} weight="fill" className="text-warn" /> Keep your streak alive
                    </div>
                </div>
            </section>

            {/* Subjects */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex flex-wrap gap-2">
                    {(departments.data || []).map((d) => (
                        <Link
                            key={d.id}
                            href={`/courses?department=${d.slug}`}
                            className="group flex items-center gap-2.5 rounded-2xl border border-line bg-surface py-2 pl-2 pr-4 transition-colors hover:border-ink-3"
                        >
                            <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
                                <DepartmentIcon slug={d.slug} size={18} />
                            </span>
                            <span className="text-sm font-semibold">{d.name}</span>
                            <span className="text-xs text-ink-3">{d.course_count}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Popular */}
            <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
                <div className="mb-6 flex items-end justify-between gap-4">
                    <h2 className="font-display text-3xl font-bold tracking-tight">Popular right now</h2>
                    <Link href="/courses" className="flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
                        All courses <ArrowRight size={14} weight="bold" />
                    </Link>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {courses.loading
                        ? Array.from({ length: 4 }, (_, i) => <CourseCardSkeleton key={i} />)
                        : courses.data?.results?.slice(0, 8).map((c) => <CourseCard key={c.id} course={c} />)}
                </div>
                {courses.error && (
                    <p className="mt-4 text-sm text-ink-3">Courses are warming up. Refresh in a few seconds.</p>
                )}
            </section>

            {/* Features: bento */}
            <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
                <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Built around how people actually finish courses.
                </h2>
                <div className="mt-10 grid gap-4 md:grid-cols-6">
                    <Feature
                        className="md:col-span-4"
                        icon={ClockCounterClockwise}
                        title="Pick up exactly where you left off"
                        big
                    >
                        Every lesson remembers your position across devices. Speed controls, keyboard shortcuts and
                        auto-advance keep you moving without hunting for the next video.
                    </Feature>
                    <Feature className="md:col-span-2" icon={NotePencil} title="Notes pinned to the second">
                        Press N while watching. Click a note later to jump straight back to that moment.
                    </Feature>
                    <Feature className="md:col-span-2" icon={Flame} title="Streaks and a 12-week heatmap">
                        Small daily sessions add up. See them.
                    </Feature>
                    <Feature className="md:col-span-2" icon={ChatCircleText} title="Ask the instructor">
                        Per-lesson discussions with instructor answers highlighted.
                    </Feature>
                    <Feature className="md:col-span-2" icon={Certificate} title="Verifiable certificates">
                        Finish every lesson and get a certificate with a public verification link.
                    </Feature>
                </div>
            </section>

            {/* Teachers */}
            {teachers.data?.length > 0 && (
                <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
                    <div className="mb-6 flex items-end justify-between">
                        <h2 className="font-display text-3xl font-bold tracking-tight">Meet the teachers</h2>
                        <Link href="/teachers" className="flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
                            Everyone <ArrowRight size={14} weight="bold" />
                        </Link>
                    </div>
                    <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
                        {teachers.data.slice(0, 8).map((t) => (
                            <Link
                                key={t.id}
                                href={`/teachers/${t.id}`}
                                className="card w-60 shrink-0 snap-start p-5 transition-colors hover:border-ink-3"
                            >
                                <Avatar src={t.avatar} name={t.name} size={56} />
                                <p className="mt-4 font-display font-bold">{t.name}</p>
                                <p className="line-clamp-1 text-sm text-ink-2">{t.headline || t.department}</p>
                                <p className="mt-3 text-xs text-ink-3">
                                    {t.course_count} courses · {compact(t.student_count)} learners
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Teach CTA */}
            <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
                <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-ink p-8 text-paper sm:p-12 md:grid-cols-[1.4fr_1fr]">
                    <div>
                        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                            Teach what you know. We handle the video.
                        </h2>
                        <p className="mt-3 max-w-lg text-paper/70">
                            Drag in lessons up to 5 GB. Uploads resume chunk by chunk, stream instantly with seeking, and
                            stay private to enrolled students.
                        </p>
                    </div>
                    <div className="flex flex-col items-start gap-3 md:items-end">
                        <Link
                            href={user?.role === "teacher" ? "/studio/new" : "/register?role=teacher"}
                            className="btn btn-primary h-12 px-6"
                        >
                            <UploadSimple size={18} weight="bold" /> Start a course
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}

function Stat({ label, value }) {
    return (
        <div>
            <dt className="text-ink-3">{label}</dt>
            <dd className="font-display text-2xl font-bold">{value ?? "-"}</dd>
        </div>
    );
}

function Feature({ icon: Icon, title, children, className = "", big }) {
    return (
        <div className={`card flex flex-col p-6 ${big ? "md:p-8" : ""} ${className}`}>
            <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
                <Icon size={22} weight="duotone" />
            </span>
            <h3 className={`mt-5 font-display font-bold ${big ? "text-2xl" : "text-lg"}`}>{title}</h3>
            <p className={`mt-2 text-ink-2 ${big ? "max-w-lg" : "text-sm"}`}>{children}</p>
        </div>
    );
}
