"use client";

import { useState } from "react";

// Sequential scale: one hue (the accent), light -> dark, mixed into the surface
// so every step is tuned for both themes automatically.
const LEVELS = [0, 28, 50, 74, 100];
const levelColor = (level) =>
    level === 0 ? "var(--surface-2)" : `color-mix(in oklab, var(--accent) ${LEVELS[level]}%, var(--surface-2))`;

function levelFor(seconds) {
    const minutes = seconds / 60;
    if (!seconds) return 0;
    if (minutes < 10) return 1;
    if (minutes < 25) return 2;
    if (minutes < 50) return 3;
    return 4;
}

function Tooltip({ tip }) {
    if (!tip) return null;
    return (
        <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs text-paper shadow-lg"
            style={{ left: tip.x, top: tip.y - 8 }}
            role="status"
        >
            <b>{tip.value}</b> <span className="opacity-70">{tip.label}</span>
        </div>
    );
}

/** 12-week activity heatmap, GitHub style: columns are weeks, rows Mon-Sun. */
export function ActivityHeatmap({ days }) {
    const [tip, setTip] = useState(null);
    if (!days?.length) return null;
    // Pad the front so the first column starts on a Monday.
    const first = new Date(days[0].date + "T00:00:00");
    const pad = (first.getDay() + 6) % 7;
    const cells = [...Array(pad).fill(null), ...days];
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    const show = (e, d) => {
        const box = e.currentTarget.closest("[data-chart]").getBoundingClientRect();
        const r = e.currentTarget.getBoundingClientRect();
        setTip({
            x: r.left - box.left + r.width / 2,
            y: r.top - box.top,
            value: d.seconds && d.seconds < 60 ? "<1 min" : `${d.minutes} min`,
            label: new Date(d.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
        });
    };

    return (
        <div data-chart className="relative" onMouseLeave={() => setTip(null)}>
            <div className="flex gap-[3px] overflow-x-auto pb-1" aria-hidden>
                <div className="mr-1 grid grid-rows-7 gap-[3px] text-[10px] text-ink-3">
                    {["Mon", "", "Wed", "", "Fri", "", ""].map((d, i) => (
                        <span key={i} className="h-3.5 leading-[14px]">
                            {d}
                        </span>
                    ))}
                </div>
                {weeks.map((week, wi) => (
                    <div key={wi} className="grid grid-rows-7 gap-[3px]">
                        {week.map((d, di) =>
                            d ? (
                                <span
                                    key={di}
                                    className="size-3.5 rounded-[3px] transition-transform hover:scale-125"
                                    style={{ background: levelColor(levelFor(d.seconds)) }}
                                    onMouseEnter={(e) => show(e, d)}
                                />
                            ) : (
                                <span key={di} className="size-3.5" />
                            ),
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-ink-3" aria-hidden>
                Less
                {[0, 1, 2, 3, 4].map((l) => (
                    <span key={l} className="size-3 rounded-[3px]" style={{ background: levelColor(l) }} />
                ))}
                More
            </div>
            <Tooltip tip={tip} />
            <table className="sr-only">
                <caption>Minutes learned per day, last 12 weeks</caption>
                <tbody>
                    {days.map((d) => (
                        <tr key={d.date}>
                            <td>{d.date}</td>
                            <td>{d.minutes} minutes</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/** Single-series column chart (e.g. enrollments per day). */
export function BarChart({ data, valueKey = "count", labelKey = "date", unit = "", height = 140 }) {
    const [tip, setTip] = useState(null);
    const max = Math.max(1, ...data.map((d) => d[valueKey]));
    const total = data.reduce((a, d) => a + d[valueKey], 0);
    const fmt = (v) => new Date(v + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });

    return (
        <div data-chart className="relative" onMouseLeave={() => setTip(null)}>
            <div className="relative ml-7" style={{ height }} aria-hidden>
                {/* Recessive gridlines; the midline only when it lands on a whole number */}
                {(max % 2 === 0 ? [0, 0.5, 1] : [0, 1]).map((f) => (
                    <div key={f} className="absolute inset-x-0 border-t border-line/70" style={{ bottom: `${f * 100}%` }}>
                        <span className="absolute -top-2 right-full mr-2 text-[10px] tabular-nums text-ink-3">
                            {max * f}
                        </span>
                    </div>
                ))}
                <div className="absolute inset-0 flex items-end gap-[2px]">
                    {data.map((d) => (
                        <div
                            key={d[labelKey]}
                            className="group flex h-full flex-1 items-end"
                            onMouseEnter={(e) => {
                                const box = e.currentTarget.closest("[data-chart]").getBoundingClientRect();
                                const r = e.currentTarget.getBoundingClientRect();
                                const barTop = r.bottom - (d[valueKey] / max) * r.height;
                                setTip({
                                    x: r.left - box.left + r.width / 2,
                                    y: barTop - box.top,
                                    value: `${d[valueKey]}${unit}`,
                                    label: fmt(d[labelKey]),
                                });
                            }}
                        >
                            <div
                                className="w-full rounded-t-[4px] bg-accent transition-opacity group-hover:opacity-80"
                                style={{ height: d[valueKey] ? `${Math.max(3, (d[valueKey] / max) * 100)}%` : 0 }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className="ml-7 mt-2 flex justify-between text-[11px] text-ink-3" aria-hidden>
                <span>{fmt(data[0][labelKey])}</span>
                <span>{fmt(data[data.length - 1][labelKey])}</span>
            </div>
            <Tooltip tip={tip} />
            <table className="sr-only">
                <caption>Total {total}</caption>
                <tbody>
                    {data.map((d) => (
                        <tr key={d[labelKey]}>
                            <td>{d[labelKey]}</td>
                            <td>{d[valueKey]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function StatTile({ icon: Icon, label, value, hint, accent }) {
    return (
        <div className="card p-5">
            <div className="flex items-center gap-2 text-sm text-ink-2">
                {Icon && <Icon size={18} weight={accent ? "fill" : "regular"} className={accent ? "text-warn" : "text-ink-3"} />}
                {label}
            </div>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight">{value}</p>
            {hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
        </div>
    );
}
