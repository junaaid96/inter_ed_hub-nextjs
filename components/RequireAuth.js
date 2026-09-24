"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Spinner } from "./ui";

/** Gate a page to signed-in users (optionally a role); redirects to /login. */
export default function RequireAuth({ role, children }) {
    const { user, ready, signedOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!ready) return;
        if (!user) router.replace(signedOut ? "/" : `/login?next=${encodeURIComponent(pathname)}`);
        else if (role && user.role !== role) router.replace("/dashboard");
    }, [ready, user, role, router, pathname, signedOut]);

    if (!ready || !user || (role && user.role !== role)) {
        return (
            <div className="grid min-h-[50vh] place-items-center text-ink-3">
                <Spinner className="size-6" />
            </div>
        );
    }
    return children;
}
