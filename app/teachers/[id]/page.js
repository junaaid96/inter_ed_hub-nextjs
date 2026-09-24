"use client";

import { useParams } from "next/navigation";
import { Globe } from "@phosphor-icons/react";
import CourseCard from "@/components/CourseCard";
import { Avatar, ErrorNote, Stars } from "@/components/ui";
import { useFetch } from "@/lib/useFetch";
import { compact, formatDate } from "@/lib/format";

export default function TeacherPage() {
    const { id } = useParams();
    const { data: t, error, loading, reload } = useFetch(`/teachers/${id}/`);

    if (loading) return <div className="mx-auto max-w-7xl px-4 py-14"><div className="skeleton h-48" /></div>;
    if (error) return <div className="mx-auto max-w-3xl px-4 py-14"><ErrorNote error={error} onRetry={reload} /></div>;

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <div className="grid gap-8 md:grid-cols-[auto_1fr]">
                <Avatar src={t.avatar} name={t.name} size={128} />
                <div>
                    <p className="text-sm font-semibold text-accent">{t.department || "Instructor"}</p>
                    <h1 className="font-display text-4xl font-bold tracking-tight">{t.name}</h1>
                    <p className="mt-1 text-lg text-ink-2">{t.headline}</p>
                    <dl className="mt-6 flex flex-wrap gap-8">
                        <Stat label="Learners" value={compact(t.stats.students)} />
                        <Stat label="Courses" value={t.stats.courses} />
                        <Stat
                            label={`${t.stats.reviews} reviews`}
                            value={
                                t.stats.reviews ? (
                                    <span className="flex items-center gap-2">
                                        {t.stats.rating.toFixed(1)} <Stars value={t.stats.rating} size={14} />
                                    </span>
                                ) : (
                                    "-"
                                )
                            }
                        />
                    </dl>
                    {t.bio && <p className="mt-6 max-w-2xl whitespace-pre-line text-ink-2">{t.bio}</p>}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-3">
                        {t.website && (
                            <a href={t.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-semibold text-accent hover:underline">
                                <Globe size={16} /> Website
                            </a>
                        )}
                        <span>Teaching since {formatDate(t.joined)}</span>
                    </div>
                </div>
            </div>
            <h2 className="mb-5 mt-14 font-display text-2xl font-bold">Courses by {t.name.split(" ")[0]}</h2>
            {t.courses.length ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {t.courses.map((c) => (
                        <CourseCard key={c.id} course={c} />
                    ))}
                </div>
            ) : (
                <p className="text-ink-3">No published courses yet.</p>
            )}
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div>
            <dd className="font-display text-2xl font-bold">{value}</dd>
            <dt className="text-sm text-ink-3">{label}</dt>
        </div>
    );
}
