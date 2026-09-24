"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LinkSimple, Printer, SealCheck } from "@phosphor-icons/react";
import { ErrorNote, Logo } from "@/components/ui";
import { useFetch } from "@/lib/useFetch";
import { formatDate, formatDuration } from "@/lib/format";

export default function CertificatePage() {
    const { code } = useParams();
    const { data: cert, error, loading } = useFetch(`/certificates/${code}/`);
    const [copied, setCopied] = useState(false);

    if (loading) return <div className="mx-auto max-w-4xl px-4 py-14"><div className="skeleton aspect-[1.414] w-full" /></div>;
    if (error)
        return (
            <div className="mx-auto max-w-lg px-4 py-24 text-center">
                <h1 className="font-display text-2xl font-bold">Certificate not found</h1>
                <p className="mt-2 text-ink-2">Double-check the code. Certificate IDs are 12 characters.</p>
                <ErrorNote error={error.status === 404 ? null : error} />
            </div>
        );

    return (
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 print:p-0">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
                <p className="flex items-center gap-2 text-sm font-semibold text-accent">
                    <SealCheck size={20} weight="fill" /> Verified certificate
                </p>
                <div className="flex gap-2">
                    <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                            navigator.clipboard?.writeText(window.location.href);
                            setCopied(true);
                        }}
                    >
                        <LinkSimple size={16} /> {copied ? "Link copied" : "Copy link"}
                    </button>
                    <button className="btn btn-ink btn-sm" onClick={() => window.print()}>
                        <Printer size={16} /> Print / PDF
                    </button>
                </div>
            </div>

            <article className="relative aspect-[1.414] w-full overflow-hidden rounded-2xl border border-line bg-surface p-[6%] shadow-[0_30px_60px_-35px_rgba(0,0,0,0.4)] print:rounded-none print:border-0 print:shadow-none">
                <div className="absolute inset-3 rounded-xl border-2 border-accent/30" aria-hidden />
                <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between">
                        <Logo />
                        <span className="font-mono text-[clamp(9px,1.4vw,12px)] text-ink-3">#{cert.code}</span>
                    </div>
                    <div className="my-auto">
                        <p className="text-[clamp(10px,1.6vw,14px)] font-bold uppercase tracking-[0.2em] text-accent">
                            Certificate of completion
                        </p>
                        <p className="mt-[3%] text-[clamp(11px,1.8vw,16px)] text-ink-2">This certifies that</p>
                        <h1 className="mt-1 font-display text-[clamp(24px,6vw,56px)] font-extrabold leading-tight tracking-tight">
                            {cert.student_name}
                        </h1>
                        <p className="mt-[2%] text-[clamp(11px,1.8vw,16px)] text-ink-2">successfully completed</p>
                        <Link
                            href={`/courses/${cert.course.slug}`}
                            className="mt-1 block font-display text-[clamp(16px,3vw,28px)] font-bold leading-snug hover:underline"
                        >
                            {cert.course.title}
                        </Link>
                        <p className="mt-2 text-[clamp(10px,1.5vw,14px)] text-ink-3">
                            {cert.course.lesson_count} lessons · {formatDuration(cert.course.total_seconds, { long: true })} of instruction
                        </p>
                    </div>
                    <div className="flex items-end justify-between gap-6 text-[clamp(10px,1.5vw,14px)]">
                        <div>
                            <p className="font-display font-bold">{cert.teacher.name}</p>
                            <p className="text-ink-3">Instructor</p>
                        </div>
                        <div className="text-right">
                            <p className="font-display font-bold">{formatDate(cert.issued_at)}</p>
                            <p className="text-ink-3">Date issued</p>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}
