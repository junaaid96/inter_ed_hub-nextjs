"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { Field, Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

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

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
            const res = await api("/auth/login/", { method: "POST", body: form, auth: false });
            signIn(res);
            router.replace(next && next.startsWith("/") ? next : "/dashboard");
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
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
            <p className="mt-6 text-center text-sm text-ink-2">
                New here?{" "}
                <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-accent hover:underline">
                    Create an account
                </Link>
            </p>
        </AuthShell>
    );
}
