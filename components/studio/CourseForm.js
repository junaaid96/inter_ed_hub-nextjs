"use client";

import { useState } from "react";
import { Plus, X } from "@phosphor-icons/react";
import { Field, Spinner } from "@/components/ui";
import { useFetch } from "@/lib/useFetch";
import { LEVELS } from "@/lib/format";

export const EMPTY_COURSE = {
    title: "",
    subtitle: "",
    description: "",
    department: "",
    level: "all",
    language: "English",
    outcomes: [],
    requirements: [],
};

/** Shared course details form for "new course" and the studio Details tab. */
export default function CourseForm({ initial = EMPTY_COURSE, onSubmit, submitLabel, errors = {}, busy, full = true }) {
    const departments = useFetch("/departments/");
    const [form, setForm] = useState({ ...EMPTY_COURSE, ...initial, department: initial.department ?? "" });
    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({
                    ...form,
                    department: form.department || null,
                    outcomes: form.outcomes.filter(Boolean),
                    requirements: form.requirements.filter(Boolean),
                });
            }}
            className="space-y-5"
        >
            <Field label="Title" error={errors.title}>
                <input className="field" required maxLength={140} value={form.title} onChange={set("title")} placeholder="e.g. Watercolor for absolute beginners" />
            </Field>
            <Field label="Subtitle" error={errors.subtitle} hint="One sentence that sells the outcome.">
                <input className="field" maxLength={220} value={form.subtitle} onChange={set("subtitle")} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Subject" error={errors.department}>
                    <select className="field" value={form.department ?? ""} onChange={set("department")}>
                        <option value="">Choose a subject</option>
                        {(departments.data || []).map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.name}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field label="Level">
                    <select className="field" value={form.level} onChange={set("level")}>
                        {Object.entries(LEVELS).map(([v, l]) => (
                            <option key={v} value={v}>
                                {l}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field label="Language">
                    <input className="field" value={form.language} onChange={set("language")} />
                </Field>
            </div>
            <Field label="Description" error={errors.description} hint="Markdown supported.">
                <textarea className="field" required rows={full ? 7 : 4} value={form.description} onChange={set("description")} />
            </Field>
            {full && (
                <div className="grid gap-5 md:grid-cols-2">
                    <ListEditor
                        label="What learners will be able to do"
                        items={form.outcomes}
                        onChange={(outcomes) => setForm((f) => ({ ...f, outcomes }))}
                        placeholder="Mix colors confidently"
                    />
                    <ListEditor
                        label="Requirements"
                        items={form.requirements}
                        onChange={(requirements) => setForm((f) => ({ ...f, requirements }))}
                        placeholder="A set of brushes"
                    />
                </div>
            )}
            <button className="btn btn-primary" disabled={busy}>
                {busy ? <Spinner /> : submitLabel}
            </button>
        </form>
    );
}

function ListEditor({ label, items, onChange, placeholder }) {
    const list = items.length ? items : [""];
    return (
        <div>
            <span className="label">{label}</span>
            <div className="space-y-2">
                {list.map((item, i) => (
                    <div key={i} className="flex gap-2">
                        <input
                            className="field"
                            value={item}
                            placeholder={placeholder}
                            maxLength={200}
                            onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))}
                        />
                        <button
                            type="button"
                            className="btn btn-ghost px-3"
                            onClick={() => onChange(list.filter((_, j) => j !== i))}
                            aria-label="Remove"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <button type="button" className="mt-2 flex items-center gap-1 text-sm font-semibold text-accent" onClick={() => onChange([...list, ""])}>
                <Plus size={14} weight="bold" /> Add
            </button>
        </div>
    );
}
