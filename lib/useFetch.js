"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";

/** Minimal data hook: { data, error, loading, reload, setData }. Pass null to skip. */
export function useFetch(path, { deps = [] } = {}) {
    // Re-fetch when the path or any extra dependency changes.
    const key = JSON.stringify([path, ...deps]);
    const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) });
    const controller = useRef(null);

    const load = useCallback(async () => {
        if (!path) {
            setState({ data: null, error: null, loading: false });
            return;
        }
        controller.current?.abort();
        const ctrl = new AbortController();
        controller.current = ctrl;
        setState((s) => ({ ...s, loading: true, error: null }));
        try {
            const data = await api(path, { signal: ctrl.signal });
            if (!ctrl.signal.aborted) setState({ data, error: null, loading: false });
        } catch (error) {
            if (error.name !== "AbortError") setState({ data: null, error, loading: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    useEffect(() => {
        // Data fetch subscription; aborted on change/unmount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load();
        return () => controller.current?.abort();
    }, [load]);

    const setData = useCallback((updater) => {
        setState((s) => ({ ...s, data: typeof updater === "function" ? updater(s.data) : updater }));
    }, []);

    return { ...state, reload: load, setData };
}
