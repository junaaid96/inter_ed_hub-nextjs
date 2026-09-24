"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CaretLeft, CaretRight, FunnelSimple, MagnifyingGlass, SmileySad, X } from "@phosphor-icons/react";
import CourseCard, { CourseCardSkeleton } from "@/components/CourseCard";
import DepartmentIcon from "@/components/DepartmentIcon";
import { EmptyState, ErrorNote } from "@/components/ui";
import { useFetch } from "@/lib/useFetch";
import { qs } from "@/lib/api";
import { LEVELS } from "@/lib/format";

const PAGE_SIZE = 12;
const DURATIONS = { short: "Under 2 hours", medium: "2 to 6 hours", long: "6+ hours" };
const SORTS = { popular: "Most popular", rating: "Highest rated", newest: "Newest", title: "A to Z" };

export default function CoursesPage() {
    return (
        <Suspense>
            <Catalog />
        </Suspense>
    );
}

function Catalog() {
    const params = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [search, setSearch] = useState(params.get("search") || "");
    const [filtersOpen, setFiltersOpen] = useState(false);

    const current = {
        search: params.get("search") || "",
        department: params.get("department") || "",
        level: params.get("level") || "",
        duration: params.get("duration") || "",
        min_rating: params.get("min_rating") || "",
        ordering: params.get("ordering") || "popular",
        page: Number(params.get("page") || 1),
    };

    const update = (changes) => {
        const next = { ...current, page: 1, ...changes };
        if (next.ordering === "popular") next.ordering = "";
        if (next.page === 1) next.page = "";
        router.replace(`${pathname}${qs(next)}`, { scroll: false });
    };

    // Debounce the search box into the URL.
    useEffect(() => {
        if (search === current.search) return;
        const t = setTimeout(() => update({ search }), 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const departments = useFetch("/departments/");
    const courses = useFetch(`/courses/${qs({ ...current, page_size: PAGE_SIZE })}`);
    const totalPages = Math.max(1, Math.ceil((courses.data?.count || 0) / PAGE_SIZE));
    const activeFilters = ["department", "level", "duration", "min_rating"].filter((k) => current[k]);

    const filters = (
        <div className="space-y-7">
            <FilterGroup title="Subject">
                <Option active={!current.department} onClick={() => update({ department: "" })}>
                    All subjects
                </Option>
                {(departments.data || []).map((d) => (
                    <Option key={d.id} active={current.department === d.slug} onClick={() => update({ department: d.slug })}>
                        <DepartmentIcon slug={d.slug} size={16} className="text-accent" />
                        <span className="flex-1">{d.name}</span>
                        <span className="text-xs text-ink-3">{d.course_count}</span>
                    </Option>
                ))}
            </FilterGroup>
            <FilterGroup title="Level">
                <div className="flex flex-wrap gap-2">
                    {Object.entries(LEVELS).map(([value, label]) => (
                        <button
                            key={value}
                            className="chip"
                            data-active={current.level === value}
                            onClick={() => update({ level: current.level === value ? "" : value })}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </FilterGroup>
            <FilterGroup title="Length">
                <div className="flex flex-wrap gap-2">
                    {Object.entries(DURATIONS).map(([value, label]) => (
                        <button
                            key={value}
                            className="chip"
                            data-active={current.duration === value}
                            onClick={() => update({ duration: current.duration === value ? "" : value })}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </FilterGroup>
            <FilterGroup title="Rating">
                <div className="flex flex-wrap gap-2">
                    {["4.5", "4", "3.5"].map((value) => (
                        <button
                            key={value}
                            className="chip"
                            data-active={current.min_rating === value}
                            onClick={() => update({ min_rating: current.min_rating === value ? "" : value })}
                        >
                            {value}+ stars
                        </button>
                    ))}
                </div>
            </FilterGroup>
        </div>
    );

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-display text-4xl font-bold tracking-tight">Explore courses</h1>
                    <p className="mt-2 text-ink-2">
                        {courses.data ? `${courses.data.count} course${courses.data.count === 1 ? "" : "s"}` : "Loading"}
                        {current.search && ` matching "${current.search}"`}
                    </p>
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                    <div className="relative flex-1 sm:w-72 sm:flex-none">
                        <MagnifyingGlass size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Title, teacher, topic"
                            aria-label="Search courses"
                            className="field rounded-full pl-9"
                        />
                    </div>
                    <select
                        value={current.ordering}
                        onChange={(e) => update({ ordering: e.target.value })}
                        className="field w-auto rounded-full pr-8"
                        aria-label="Sort by"
                    >
                        {Object.entries(SORTS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <button className="btn btn-outline lg:hidden" onClick={() => setFiltersOpen((o) => !o)}>
                        <FunnelSimple size={16} /> Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
                    </button>
                </div>
            </div>

            <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
                <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
                    <div className="lg:sticky lg:top-24">{filters}</div>
                </aside>

                <div>
                    {activeFilters.length > 0 && (
                        <div className="mb-5 flex flex-wrap items-center gap-2">
                            {activeFilters.map((key) => (
                                <button key={key} className="chip" onClick={() => update({ [key]: "" })}>
                                    {labelFor(key, current[key], departments.data)} <X size={12} />
                                </button>
                            ))}
                            <button
                                className="text-sm font-semibold text-accent hover:underline"
                                onClick={() => update({ department: "", level: "", duration: "", min_rating: "" })}
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    <ErrorNote error={courses.error} onRetry={courses.reload} />

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {courses.loading &&
                            Array.from({ length: 6 }, (_, i) => <CourseCardSkeleton key={i} />)}
                        {!courses.loading && courses.data?.results.map((c) => <CourseCard key={c.id} course={c} />)}
                    </div>

                    {!courses.loading && courses.data?.count === 0 && (
                        <EmptyState icon={SmileySad} title="No courses match that">
                            Try a broader search or remove a filter.
                        </EmptyState>
                    )}

                    {totalPages > 1 && (
                        <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
                            <button
                                className="btn btn-ghost btn-sm px-2.5"
                                disabled={current.page <= 1}
                                onClick={() => update({ page: current.page - 1 })}
                                aria-label="Previous page"
                            >
                                <CaretLeft size={16} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => update({ page: p })}
                                    className={`btn btn-sm w-9 px-0 ${p === current.page ? "btn-ink" : "btn-ghost"}`}
                                    aria-current={p === current.page ? "page" : undefined}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                className="btn btn-ghost btn-sm px-2.5"
                                disabled={current.page >= totalPages}
                                onClick={() => update({ page: current.page + 1 })}
                                aria-label="Next page"
                            >
                                <CaretRight size={16} />
                            </button>
                        </nav>
                    )}
                </div>
            </div>
        </div>
    );
}

function labelFor(key, value, departments) {
    if (key === "department") return departments?.find((d) => d.slug === value)?.name || value;
    if (key === "level") return LEVELS[value];
    if (key === "duration") return DURATIONS[value];
    return `${value}+ stars`;
}

function FilterGroup({ title, children }) {
    return (
        <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-3">{title}</h3>
            <div className="space-y-0.5">{children}</div>
        </div>
    );
}

function Option({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                active ? "bg-surface font-semibold text-ink shadow-[inset_0_0_0_1px_var(--line)]" : "text-ink-2 hover:bg-surface-2"
            }`}
        >
            {children}
        </button>
    );
}
