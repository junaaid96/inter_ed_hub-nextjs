"use client";

import Link from "next/link";
import { Avatar, ErrorNote, PageHeader } from "@/components/ui";
import { useFetch } from "@/lib/useFetch";
import { compact } from "@/lib/format";

export default function TeachersPage() {
    const { data, error, loading, reload } = useFetch("/teachers/");
    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <PageHeader title="Teachers">The people behind every course. Follow a teacher you like into everything they teach.</PageHeader>
            <ErrorNote error={error} onRetry={reload} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {loading && Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton h-52 rounded-[var(--radius-card)]" />)}
                {data?.map((t) => (
                    <Link key={t.id} href={`/teachers/${t.id}`} className="card flex flex-col p-6 transition-colors hover:border-ink-3">
                        <Avatar src={t.avatar} name={t.name} size={64} />
                        <p className="mt-4 font-display text-lg font-bold">{t.name}</p>
                        <p className="text-sm text-ink-2">{t.headline || "Instructor"}</p>
                        {t.department && <p className="mt-1 text-xs font-semibold text-accent">{t.department}</p>}
                        <p className="mt-auto pt-4 text-xs text-ink-3">
                            {t.course_count} courses · {compact(t.student_count)} learners
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
