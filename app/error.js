"use client";

export default function Error({ error, reset }) {
    return (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
            <h1 className="font-display text-3xl font-bold tracking-tight">Something went wrong</h1>
            <p className="mt-3 text-ink-2">{error?.message || "An unexpected error occurred."}</p>
            <button onClick={reset} className="btn btn-primary mt-8">
                Try again
            </button>
        </div>
    );
}
