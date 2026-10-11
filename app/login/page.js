"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { Field, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const DEMO_PASSWORD = "learn-together-2026";
const DEMO_ACCOUNTS = [
    { login: "demo_teacher", label: "Teacher", icon: "🧑‍🏫" },
    { login: "demo_student", label: "Student", icon: "🎓" },
];

export default function LoginPage() {
    return (
        <Suspense>
            <Login />
        </Suspense>
    );
}

function Login() {
    const { signIn } = useAuth();
    const router = useRouter();
    const params = useSearchParams();
    const [form, setForm] = useState({ login: "", password: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const next = params.get("next");

    const signInWith = async (body) => {
        setBusy(true);
        setError("");
        try {
            const res = await api("/auth/login/", { method: "POST", body, auth: false });
            signIn(res);
            router.replace(next && next.startsWith("/") ? next : "/dashboard");
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        signInWith(form);
    };

    const tryDemo = (login) => {
        setForm({ login, password: DEMO_PASSWORD });
        signInWith({ login, password: DEMO_PASSWORD });
    };

    return (
        <AuthShell title="Welcome back" subtitle="Pick up right where you left off.">
            <form onSubmit={submit} className="space-y-4">
                <Field label="Username or email">
                    <input
                        className="field"
                        autoComplete="username"
                        required
                        autoFocus
                        value={form.login}
                        onChange={(e) => setForm({ ...form, login: e.target.value })}
                    />
                </Field>
                <Field label="Password">
                    <input
                        className="field"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                </Field>
                {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
                <button className="btn btn-primary w-full" disabled={busy}>
                    {busy ? <Spinner /> : "Log in"}
                </button>
            </form>
            <div className="mt-6 rounded-2xl border border-dashed border-line p-4">
                <p className="text-sm font-semibold">🧪 Explore the demo</p>
                <p className="mt-1 text-xs text-ink-2">
                    One click signs you in. Password for every demo account: <code className="font-mono">{DEMO_PASSWORD}</code>
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    {DEMO_ACCOUNTS.map((d) => (
                        <button key={d.login} type="button" className="btn btn-outline btn-sm w-full" disabled={busy} onClick={() => tryDemo(d.login)}>
                            <span aria-hidden="true">{d.icon}</span> {d.label}
                        </button>
                    ))}
                </div>
            </div>
            <p className="mt-6 text-center text-sm text-ink-2">
                New here?{" "}
                <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-accent hover:underline">
                    Create an account
                </Link>
            </p>
        </AuthShell>
    );
}
