"use client";

import { cloneElement, isValidElement, useEffect, useId, useRef } from "react";
import clsx from "clsx";
import Link from "next/link";
import { Star, StarHalf, X } from "@phosphor-icons/react";
import { initials } from "@/lib/format";

export function Logo({ className }) {
    return (
        <Link href="/" className={clsx("group flex items-center gap-2 font-display text-lg font-bold tracking-tight", className)}>
            <span className="grid size-7 place-items-center rounded-lg bg-accent text-[13px] font-extrabold text-accent-ink transition-transform group-hover:-rotate-6">
                ie
            </span>
            <span>
                InterEd<span className="text-accent">Hub</span>
            </span>
        </Link>
    );
}

export function Avatar({ src, name, size = 36, className }) {
    return (
        <span
            className={clsx(
                "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-accent-soft font-semibold text-accent",
                className,
            )}
            style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}
        >
            {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
                initials(name) || "?"
            )}
        </span>
    );
}

export function Stars({ value = 0, size = 14, className }) {
    return (
        <span className={clsx("inline-flex items-center text-star", className)} aria-label={`${value.toFixed(1)} out of 5`}>
            {[1, 2, 3, 4, 5].map((i) =>
                value >= i ? (
                    <Star key={i} size={size} weight="fill" />
                ) : value >= i - 0.5 ? (
                    <StarHalf key={i} size={size} weight="fill" />
                ) : (
                    <Star key={i} size={size} className="opacity-40" />
                ),
            )}
        </span>
    );
}

export function ProgressBar({ value = 0, className }) {
    return (
        <div
            className={clsx("h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${value}%` }} />
        </div>
    );
}

export function ProgressRing({ value = 0, size = 44, stroke = 4, children }) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    return (
        <span className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={c - (c * value) / 100}
                    className="transition-[stroke-dashoffset] duration-700"
                />
            </svg>
            <span className="absolute text-[11px] font-bold">{children ?? `${value}%`}</span>
        </span>
    );
}

export function EmptyState({ icon: Icon, title, children, action }) {
    return (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
            {Icon && (
                <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
                    <Icon size={24} weight="duotone" />
                </span>
            )}
            <h3 className="font-display text-lg font-bold">{title}</h3>
            {children && <p className="mt-1 max-w-sm text-sm text-ink-2">{children}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

export function Modal({ open, onClose, title, children, wide }) {
    const ref = useRef(null);
    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            onClose={onClose}
            onClick={(e) => e.target === ref.current && onClose()}
            className={clsx(
                "m-auto w-[calc(100%-2rem)] rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm",
                wide ? "max-w-4xl" : "max-w-lg",
            )}
        >
            {open && (
                <div className="p-5 sm:p-6">
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <h2 className="font-display text-xl font-bold">{title}</h2>
                        <button onClick={onClose} className="btn btn-ghost btn-sm -mr-2 -mt-1 px-2" aria-label="Close">
                            <X size={18} />
                        </button>
                    </div>
                    {children}
                </div>
            )}
        </dialog>
    );
}

export function Field({ label, error, hint, children, className }) {
    const id = useId();
    const noteId = `${id}-note`;
    const note = error || hint;
    // Label via htmlFor and hint/error via aria-describedby, so the accessible
    // name stays just the label text.
    const control = isValidElement(children)
        ? cloneElement(children, {
              id: children.props.id || id,
              "aria-describedby": note ? noteId : undefined,
              "aria-invalid": error ? true : undefined,
          })
        : children;
    return (
        <div className={clsx("block", className)}>
            {label && (
                <label htmlFor={children?.props?.id || id} className="label">
                    {label}
                </label>
            )}
            {control}
            {note && (
                <span id={noteId} className={clsx("mt-1.5 block text-[13px]", error ? "text-danger" : "text-ink-3")}>
                    {note}
                </span>
            )}
        </div>
    );
}

export function Spinner({ className }) {
    return (
        <span
            className={clsx("inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent", className)}
            aria-hidden
        />
    );
}

export function PageHeader({ title, children, action }) {
    return (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
                <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
                {children && <p className="mt-2 max-w-2xl text-ink-2">{children}</p>}
            </div>
            {action}
        </div>
    );
}

export function ErrorNote({ error, onRetry }) {
    if (!error) return null;
    return (
        <div className="card flex flex-wrap items-center justify-between gap-3 border-danger/30 bg-danger/5 px-4 py-3 text-sm">
            <span className="text-danger">{error.message}</span>
            {onRetry && (
                <button className="btn btn-outline btn-sm" onClick={onRetry}>
                    Try again
                </button>
            )}
        </div>
    );
}
