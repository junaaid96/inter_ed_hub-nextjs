import { Bricolage_Grotesque, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { themeScript } from "@/lib/theme";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display-face", display: "swap" });
const body = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-face", display: "swap" });

export const metadata = {
    title: { default: "InterEd Hub - Learn from real teachers", template: "%s | InterEd Hub" },
    description:
        "Video courses from real teachers. Stream lessons, take timestamped notes, keep a learning streak and earn certificates.",
    icons: { icon: "/icon.png" },
};

export const viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#f5f4ef" },
        { media: "(prefers-color-scheme: dark)", color: "#0f1211" },
    ],
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable}`}>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </head>
            <body className="flex min-h-[100dvh] flex-col bg-paper font-sans text-ink">
                <Providers>
                    <a
                        href="#main"
                        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
                    >
                        Skip to content
                    </a>
                    <NavBar />
                    <main id="main" className="flex-1">
                        {children}
                    </main>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
