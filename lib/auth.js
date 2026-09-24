"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);
    // True after an explicit sign-out, so guarded pages go home instead of to /login.
    const [signedOut, setSignedOut] = useState(false);

    const refresh = useCallback(async () => {
        if (!getToken()) {
            setUser(null);
            setReady(true);
            return null;
        }
        try {
            const me = await api("/auth/me/");
            setUser(me);
            return me;
        } catch {
            setUser(null);
            return null;
        } finally {
            setReady(true);
        }
    }, []);

    useEffect(() => {
        // Restore the session from the token in localStorage (external store) once on mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        refresh();
        const onLogout = () => setUser(null);
        window.addEventListener("intered:logout", onLogout);
        return () => window.removeEventListener("intered:logout", onLogout);
    }, [refresh]);

    const signIn = useCallback(({ token, user: me }) => {
        setToken(token);
        setSignedOut(false);
        setUser(me);
    }, []);

    const signOut = useCallback(async () => {
        try {
            await api("/auth/logout/", { method: "POST" });
        } catch {
            /* token may already be invalid */
        }
        setToken(null);
        setSignedOut(true);
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({
            user,
            ready,
            signedOut,
            isTeacher: user?.role === "teacher",
            isStudent: user?.role === "student",
            signIn,
            signOut,
            refresh,
            setUser,
        }),
        [user, ready, signedOut, signIn, signOut, refresh],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
