"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import CourseForm from "@/components/studio/CourseForm";
import { PageHeader } from "@/components/ui";
import { useToast } from "@/components/Toaster";
import { api } from "@/lib/api";

export default function NewCoursePage() {
    const router = useRouter();
    const toast = useToast();
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    const create = async (data) => {
        setBusy(true);
        setErrors({});
        try {
            const course = await api("/courses/", { method: "POST", body: data });
            toast("Draft created. Now add your lessons.");
            router.push(`/studio/${course.slug}`);
        } catch (err) {
            setErrors(err.fields || {});
            toast(err.message, { type: "error" });
            setBusy(false);
        }
    };

    return (
        <RequireAuth role="teacher">
            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
                <PageHeader title="New course">
                    Start with the basics. You can add a cover, sections and videos next, and publish when it&apos;s ready.
                </PageHeader>
                <div className="card p-6">
                    <CourseForm onSubmit={create} submitLabel="Create draft" errors={errors} busy={busy} full={false} />
                </div>
            </div>
        </RequireAuth>
    );
}
