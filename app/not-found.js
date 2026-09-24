import Link from "next/link";

export default function NotFound() {
    return (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
            <p className="font-mono text-sm font-bold text-accent">404</p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">This page skipped class.</h1>
            <p className="mt-3 text-ink-2">The link may be old, or the course was unpublished.</p>
            <div className="mt-8 flex justify-center gap-3">
                <Link href="/courses" className="btn btn-primary">
                    Browse courses
                </Link>
                <Link href="/" className="btn btn-outline">
                    Home
                </Link>
            </div>
        </div>
    );
}
