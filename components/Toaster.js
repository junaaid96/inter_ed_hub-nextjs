"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react";

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const toast = useCallback((message, { type = "success", duration = 3500 } = {}) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((t) => [...t, { id, message, type }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
    }, []);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div
                aria-live="polite"
                className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4"
            >
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className="fade-up pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-paper shadow-xl"
                    >
                        {t.type === "error" ? (
                            <WarningCircle size={20} weight="fill" className="shrink-0 text-danger" />
                        ) : (
                            <CheckCircle size={20} weight="fill" className="shrink-0 text-accent" />
                        )}
                        <span>{t.message}</span>
                        <button
                            aria-label="Dismiss"
                            className="ml-1 opacity-60 hover:opacity-100"
                            onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
