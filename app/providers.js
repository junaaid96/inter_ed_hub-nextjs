"use client";

import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { ToastProvider } from "@/components/Toaster";

export default function Providers({ children }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ToastProvider>{children}</ToastProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
