"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ActivatePage() {
    return (
        <Suspense>
            <Activate />
        </Suspense>
    );
}

function Activate() {
    const params = useSearchParams();
    const router = useRouter();
    const { signIn } = useAuth();
    const [error, setError] = useState(null);
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;
        api("/auth/activate/", {
            method: "POST",
            auth: false,
            body: { uid: params.get("uid"), token: params.get("token") },
        })
            .then((res) => {
                signIn(res);
                router.replace("/dashboard");
            })
            .catch((err) => setError(err.message));
    }, [params, router, signIn]);

    return (
        <div className="mx-auto max-w-md px-4 py-24 text-center">
            {error ? (
                <>
                    <h1 className="font-display text-2xl font-bold">Couldn&apos;t activate</h1>
                    <p className="mt-2 text-ink-2">{error}</p>
                    <Link href="/login" className="btn btn-primary mt-6">
                        Go to login
                    </Link>
                </>
            ) : (
                <p className="flex items-center justify-center gap-3 text-ink-2">
                    <Spinner /> Activating your account
                </p>
            )}
        </div>
    );
}
