"use client";

import { useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import Uploader from "@/components/studio/Uploader";
import { Avatar, Field, PageHeader, Spinner } from "@/components/ui";
import { useToast } from "@/components/Toaster";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useFetch } from "@/lib/useFetch";

export default function ProfilePage() {
    return (
        <RequireAuth>
            <Profile />
        </RequireAuth>
    );
}

function Profile() {
    const { user, setUser, signIn } = useAuth();
    const toast = useToast();
    const departments = useFetch("/departments/");
    const [form, setForm] = useState({
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        phone: user.phone,
        department: user.department ?? "",
        designation: user.designation,
        website: user.website,
    });
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);
    const [pw, setPw] = useState({ current_password: "", new_password: "" });
    const [pwErrors, setPwErrors] = useState({});
    const isTeacher = user.role === "teacher";
    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

    const save = async (e) => {
        e.preventDefault();
        setBusy(true);
        setErrors({});
        try {
            const body = { ...form, department: form.department || null };
            if (!isTeacher) {
                delete body.designation;
                delete body.website;
            }
            setUser(await api("/auth/me/", { method: "PATCH", body }));
            toast("Profile saved");
        } catch (err) {
            setErrors(err.fields);
            toast(err.message, { type: "error" });
        } finally {
            setBusy(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        setPwErrors({});
        try {
            signIn(await api("/auth/password/", { method: "POST", body: pw }));
            setPw({ current_password: "", new_password: "" });
            toast("Password updated. Other devices were signed out.");
        } catch (err) {
            setPwErrors(err.fields);
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
            <PageHeader title="Settings">Your public profile and account details.</PageHeader>
            <div className="grid gap-8 md:grid-cols-[220px_1fr]">
                <div>
                    <Avatar src={user.avatar} name={`${user.first_name} ${user.last_name}`} size={120} />
                    <div className="mt-4">
                        <Uploader
                            kind="image"
                            compact
                            current={user.avatar}
                            onUploaded={async (asset) => setUser(await api("/auth/me/", { method: "PATCH", body: { avatar_id: asset.id } }))}
                        />
                    </div>
                </div>
                <div className="space-y-8">
                    <form onSubmit={save} className="card space-y-4 p-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="First name" error={errors.first_name}>
                                <input className="field" required value={form.first_name} onChange={set("first_name")} />
                            </Field>
                            <Field label="Last name" error={errors.last_name}>
                                <input className="field" value={form.last_name} onChange={set("last_name")} />
                            </Field>
                            <Field label="Username" error={errors.username}>
                                <input className="field" required value={form.username} onChange={set("username")} />
                            </Field>
                            <Field label="Email" error={errors.email}>
                                <input className="field" type="email" required value={form.email} onChange={set("email")} />
                            </Field>
                            {isTeacher && (
                                <>
                                    <Field label="Title" error={errors.designation}>
                                        <input className="field" value={form.designation} onChange={set("designation")} />
                                    </Field>
                                    <Field label="Website" error={errors.website}>
                                        <input className="field" type="url" value={form.website} onChange={set("website")} placeholder="https://" />
                                    </Field>
                                </>
                            )}
                            <Field label="Subject" error={errors.department}>
                                <select className="field" value={form.department} onChange={set("department")}>
                                    <option value="">None</option>
                                    {(departments.data || []).map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Phone" error={errors.phone}>
                                <input className="field" type="tel" value={form.phone} onChange={set("phone")} />
                            </Field>
                        </div>
                        <Field label="Bio" error={errors.bio} hint={isTeacher ? "Shown on your courses and public profile." : undefined}>
                            <textarea className="field" rows={4} value={form.bio} onChange={set("bio")} />
                        </Field>
                        <button className="btn btn-primary" disabled={busy}>
                            {busy ? <Spinner /> : "Save profile"}
                        </button>
                    </form>

                    <form onSubmit={changePassword} className="card space-y-4 p-6">
                        <h2 className="font-display text-lg font-bold">Change password</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Current password" error={pwErrors.current_password}>
                                <input
                                    className="field"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={pw.current_password}
                                    onChange={(e) => setPw({ ...pw, current_password: e.target.value })}
                                />
                            </Field>
                            <Field label="New password" error={pwErrors.new_password}>
                                <input
                                    className="field"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={pw.new_password}
                                    onChange={(e) => setPw({ ...pw, new_password: e.target.value })}
                                />
                            </Field>
                        </div>
                        <button className="btn btn-outline">Update password</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
