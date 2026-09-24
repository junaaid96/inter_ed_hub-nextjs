"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";

const ThemeContext = createContext({ theme: "light", toggle: () => {} });
const KEY = "intered.theme";
const EVENT = "intered:theme";

const readTheme = () => (document.documentElement.classList.contains("dark") ? "dark" : "light");
const subscribe = (callback) => {
    window.addEventListener(EVENT, callback);
    return () => window.removeEventListener(EVENT, callback);
};

/** Runs before paint (inlined in <head>) to avoid a light/dark flash. */
export const themeScript = `(function(){try{var t=localStorage.getItem('${KEY}');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`;

export function ThemeProvider({ children }) {
    // The <html> class (set before paint by themeScript) is the source of truth.
    const theme = useSyncExternalStore(subscribe, readTheme, () => "light");

    const toggle = useCallback(() => {
        const next = readTheme() === "dark" ? "light" : "dark";
        document.documentElement.classList.toggle("dark", next === "dark");
        try {
            localStorage.setItem(KEY, next);
        } catch {
            /* ignore */
        }
        window.dispatchEvent(new Event(EVENT));
    }, []);

    return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    return useContext(ThemeContext);
}
