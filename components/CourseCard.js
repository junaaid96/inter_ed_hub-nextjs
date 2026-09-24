import Link from "next/link";
import { Clock, PlayCircle, Users } from "@phosphor-icons/react/dist/ssr";
import { Avatar, ProgressBar, Stars } from "./ui";
import { compact, formatDuration, LEVELS } from "@/lib/format";

export function CourseCover({ course, className = "" }) {
    return (
        <div className={`relative aspect-video overflow-hidden bg-surface-2 ${className}`}>
            {course.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={course.cover}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
            ) : (
                <div className="absolute inset-0 grid place-items-center bg-accent-soft font-display text-4xl font-bold text-accent/60">
                    {course.title?.slice(0, 1)}
                </div>
            )}
        </div>
    );
}

export default function CourseCard({ course, progress, href }) {
    const link = href || `/courses/${course.slug}`;
    return (
        <Link
            href={link}
            className="group card flex flex-col overflow-hidden transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-ink-3 hover:shadow-[0_12px_32px_-18px_rgba(0,0,0,0.35)]"
        >
            <div className="relative">
                <CourseCover course={course} />
                <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink backdrop-blur">
                    {LEVELS[course.level] || "All levels"}
                </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
                {course.department && (
                    <span className="mb-1 text-xs font-semibold text-accent">{course.department.name}</span>
                )}
                <h3 className="font-display text-[17px] font-bold leading-snug tracking-tight line-clamp-2">
                    {course.title}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-[13px] text-ink-2">
                    <Avatar src={course.teacher?.avatar} name={course.teacher?.name} size={20} />
                    <span className="truncate">{course.teacher?.name}</span>
                </div>
                <div className="mt-auto pt-4">
                    {progress !== undefined ? (
                        <div>
                            <div className="mb-1.5 flex justify-between text-xs font-semibold text-ink-2">
                                <span>{progress === 100 ? "Completed" : "In progress"}</span>
                                <span>{progress}%</span>
                            </div>
                            <ProgressBar value={progress} />
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-2">
                            {course.review_count > 0 ? (
                                <span className="flex items-center gap-1">
                                    <b className="text-ink">{course.rating.toFixed(1)}</b>
                                    <Stars value={course.rating} size={12} />
                                    <span className="text-ink-3">({course.review_count})</span>
                                </span>
                            ) : (
                                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">
                                    New
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <PlayCircle size={14} /> {course.lesson_count}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={14} /> {formatDuration(course.total_seconds, { long: true })}
                            </span>
                            {course.student_count > 0 && (
                                <span className="flex items-center gap-1">
                                    <Users size={14} /> {compact(course.student_count)}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

export function CourseCardSkeleton() {
    return (
        <div className="card overflow-hidden">
            <div className="skeleton aspect-video rounded-none" />
            <div className="space-y-3 p-4">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-5 w-5/6" />
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton mt-6 h-3 w-2/3" />
            </div>
        </div>
    );
}
