"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChalkboardTeacher, EnvelopeSimple, Student } from "@phosphor-icons/react";
import AuthShell from "@/components/AuthShell";
import { Field, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/lib/useFetch";

export default function RegisterPage() {
    return (
        <Suspense>
            <Register />
        </Suspense>
    );
}

function Register() {
    const { signIn } = useAuth();
    const router = useRouter();
    const params = useSearchParams();
    const departments = useFetch("/departments/");
    const [form, setForm] = useState({
        role: params.get("role") === "teacher" ? "teacher" : "student",
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        department: "",
        designation: "",
    });
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);
    const [sentTo, setSentTo] = useState(null);
    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setErrors({});
        try {
            const res = await api("/auth/register/", {
                method: "POST",
                auth: false,
                body: { ...form, department: form.department || null },
            });
            if (res.activation_required) {
                setSentTo(form.email);
                return;
            }
            signIn(res);
            const next = params.get("next");
            router.replace(next?.startsWith("/") ? next : form.role === "teacher" ? "/studio/new" : "/courses");
        } catch (err) {
            setErrors({ ...err.fields, _: err.fields.detail || (Object.keys(err.fields).length ? "" : err.message) });
        } finally {
            setBusy(false);
        }
    };

    if (sentTo) {
        return (
            <AuthShell title="Check your inbox" image="mail">
                <div className="card flex gap-4 p-5">
                    <EnvelopeSimple size={28} className="shrink-0 text-accent" weight="duotone" />
                    <p className="text-ink-2">
                        We sent a confirmation link to <b className="text-ink">{sentTo}</b>. Click it to activate your account.
                    </p>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell title="Create your account" subtitle="Free to join. Learn or teach, your call.">
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="I want to">
                    {[
                        ["student", "Learn", Student],
                        ["teacher", "Teach", ChalkboardTeacher],
                    ].map(([value, label, Icon]) => (
                        <button
                            type="button"
                            key={value}
                            role="radio"
                            aria-checked={form.role === value}
                            onClick={() => setForm({ ...form, role: value })}
                            className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${
                                form.role === value ? "border-accent bg-accent-soft" : "border-line hover:border-ink-3"
                            }`}
                        >
                            <Icon size={24} weight="duotone" className="text-accent" />
                            <span>
                                <span className="block font-bold">{label}</span>
                                <span className="block text-xs text-ink-3">{value === "student" ? "Take courses" : "Publish courses"}</span>
                            </span>
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="First name" error={errors.first_name}>
                        <input className="field" required autoComplete="given-name" value={form.first_name} onChange={set("first_name")} />
                    </Field>
                    <Field label="Last name" error={errors.last_name}>
                        <input className="field" autoComplete="family-name" value={form.last_name} onChange={set("last_name")} />
                    </Field>
                </div>
                <Field label="Email" error={errors.email}>
                    <input className="field" type="email" required autoComplete="email" value={form.email} onChange={set("email")} />
                </Field>
                <Field label="Username" error={errors.username}>
                    <input className="field" required autoComplete="username" value={form.username} onChange={set("username")} />
                </Field>
                <Field label="Password" error={errors.password || errors.non_field_errors} hint="At least 8 characters, not too common.">
                    <input className="field" type="password" required autoComplete="new-password" value={form.password} onChange={set("password")} />
                </Field>
                <div className={`grid gap-3 ${form.role === "teacher" ? "grid-cols-2" : ""}`}>
                    <Field label="Main subject" error={errors.department}>
                        <select className="field" value={form.department} onChange={set("department")}>
                            <option value="">Optional</option>
                            {(departments.data || []).map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    {form.role === "teacher" && (
                        <Field label="Title" error={errors.designation}>
                            <input className="field" placeholder="e.g. Math teacher" value={form.designation} onChange={set("designation")} />
                        </Field>
                    )}
                </div>
                {errors._ && <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{errors._}</p>}
                <button className="btn btn-primary w-full" disabled={busy}>
                    {busy ? <Spinner /> : form.role === "teacher" ? "Create teacher account" : "Start learning"}
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-ink-2">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-accent hover:underline">
                    Log in
                </Link>
            </p>
        </AuthShell>
    );
}
