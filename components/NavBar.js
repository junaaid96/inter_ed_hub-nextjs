"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import {
    ChalkboardTeacher,
    GearSix,
    List,
    MagnifyingGlass,
    Moon,
    SignOut,
    SquaresFour,
    Sun,
    VideoCamera,
    X,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Avatar, Logo } from "./ui";

const LINKS = [
    { href: "/courses", label: "Courses" },
    { href: "/teachers", label: "Teachers" },
];

export default function NavBar() {
    const { user, ready, isTeacher, signOut } = useAuth();
    const { theme, toggle } = useTheme();
    const pathname = usePathname();
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const menuRef = useRef(null);

    const [lastPath, setLastPath] = useState(pathname);
    if (lastPath !== pathname) {
        setLastPath(pathname);
        setMenuOpen(false);
        setMobileOpen(false);
    }

    useEffect(() => {
        const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    // The player page gets the full viewport.
    if (pathname.startsWith("/learn/")) return null;

    const search = (e) => {
        e.preventDefault();
        router.push(`/courses${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ""}`);
    };

    return (
        <header className="sticky top-0 z-50 print:hidden border-b border-line/70 bg-paper/85 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
                <Logo />
                <nav className="ml-4 hidden items-center gap-1 md:flex">
                    {LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(
                                "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                                pathname.startsWith(link.href) ? "bg-surface-2 text-ink" : "text-ink-2 hover:text-ink",
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <form onSubmit={search} className="relative ml-auto hidden max-w-xs flex-1 sm:block">
                    <MagnifyingGlass size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search courses"
                        aria-label="Search courses"
                        className="field h-10 rounded-full pl-9 text-sm"
                    />
                </form>

                <div className="ml-auto flex items-center gap-1 sm:ml-0">
                    <button onClick={toggle} className="btn btn-ghost btn-sm px-2.5" aria-label="Toggle dark mode">
                        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {!ready ? (
                        <div className="skeleton size-9 rounded-full" />
                    ) : user ? (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen((o) => !o)}
                                className="rounded-full ring-offset-2 ring-offset-paper transition hover:ring-2 hover:ring-line"
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                                aria-label="Account menu"
                            >
                                <Avatar src={user.avatar} name={`${user.first_name} ${user.last_name}`} />
                            </button>
                            {menuOpen && (
                                <div
                                    role="menu"
                                    className="fade-up absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-xl"
                                >
                                    <div className="px-3 py-2.5">
                                        <p className="truncate text-sm font-bold">
                                            {user.first_name} {user.last_name}
                                        </p>
                                        <p className="truncate text-xs text-ink-3">
                                            {isTeacher ? "Teacher" : "Student"} · @{user.username}
                                        </p>
                                    </div>
                                    <MenuLink href="/dashboard" icon={SquaresFour}>
                                        Dashboard
                                    </MenuLink>
                                    {isTeacher && (
                                        <>
                                            <MenuLink href="/studio/new" icon={VideoCamera}>
                                                New course
                                            </MenuLink>
                                            <MenuLink href={`/teachers/${user.profile_id}`} icon={ChalkboardTeacher}>
                                                Public profile
                                            </MenuLink>
                                        </>
                                    )}
                                    <MenuLink href="/profile" icon={GearSix}>
                                        Settings
                                    </MenuLink>
                                    <button
                                        role="menuitem"
                                        onClick={async () => {
                                            await signOut();
                                            router.push("/");
                                        }}
                                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink"
                                    >
                                        <SignOut size={17} /> Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="hidden items-center gap-1 sm:flex">
                            <Link href="/login" className="btn btn-ghost btn-sm">
                                Log in
                            </Link>
                            <Link href="/register" className="btn btn-ink btn-sm">
                                Start learning
                            </Link>
                        </div>
                    )}

                    <button
                        className="btn btn-ghost btn-sm px-2.5 md:hidden"
                        onClick={() => setMobileOpen((o) => !o)}
                        aria-label="Open menu"
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X size={20} /> : <List size={20} />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="border-t border-line bg-paper px-4 pb-4 pt-3 md:hidden">
                    <form onSubmit={search} className="relative mb-3">
                        <MagnifyingGlass size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search courses"
                            className="field rounded-full pl-9"
                        />
                    </form>
                    {LINKS.map((link) => (
                        <Link key={link.href} href={link.href} className="block rounded-xl px-3 py-2.5 font-semibold hover:bg-surface-2">
                            {link.label}
                        </Link>
                    ))}
                    {ready && !user && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <Link href="/login" className="btn btn-outline">
                                Log in
                            </Link>
                            <Link href="/register" className="btn btn-ink">
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}

function MenuLink({ href, icon: Icon, children }) {
    return (
        <Link
            role="menuitem"
            href={href}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink"
        >
            <Icon size={17} /> {children}
        </Link>
    );
}
