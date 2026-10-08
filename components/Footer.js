"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Code } from "@phosphor-icons/react";
import { Logo } from "./ui";

export default function Footer() {
    const pathname = usePathname();
    if (pathname.startsWith("/learn/")) return null;
    return (
        <footer className="mt-24 border-t border-line print:hidden">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
                <div>
                    <Logo />
                    <p className="mt-3 max-w-xs text-sm text-ink-2">
                        Video courses from real teachers. Learn at your pace, keep your streak, earn your certificate.
                    </p>
                </div>
                <FooterCol title="Learn" links={[["/courses", "Browse courses"], ["/teachers", "Teachers"], ["/dashboard", "My learning"]]} />
                <FooterCol title="Teach" links={[["/register?role=teacher", "Become a teacher"], ["/studio/new", "Create a course"]]} />
                <FooterCol
                    title="Project"
                    links={[
                        ["https://github.com/junaaid96/inter_ed_hub-nextjs", "Frontend source"],
                        ["https://github.com/junaaid96/inter_ed_hub-drf", "API source"],
                    ]}
                />
            </div>
            <div className="border-t border-line">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-ink-3 sm:px-6 md:flex-row">
                    <p className="text-center md:text-left">
                        © {new Date().getFullYear()} InterEd Hub. Built with Django, Next.js and Neon.
                    </p>
                    <a
                        href="https://junaidul.pro.bd/codejborg"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Developed by CodeJBorg — visit developer website"
                        className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-ink/5 py-1.5 pl-1.5 pr-3 font-mono text-[11px] tracking-wide text-ink-3 transition-colors duration-300 hover:border-ink-3 hover:bg-ink/10 hover:text-ink"
                    >
                        <span className="flex size-6 items-center justify-center rounded-full bg-accent text-accent-ink">
                            <Code size={14} weight="bold" />
                        </span>
                        <span>Developed by</span>
                        <span className="font-semibold text-ink">
                            <span className="text-accent">&lt;</span>CodeJBorg<span className="text-accent"> /&gt;</span>
                        </span>
                        <span aria-hidden="true" className="inline-block h-3.5 w-[2px] bg-accent motion-safe:animate-pulse" />
                        <ArrowUpRight
                            size={14}
                            className="opacity-40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                    </a>
                </div>
            </div>
        </footer>
    );
}

function FooterCol({ title, links }) {
    return (
        <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-3">{title}</h4>
            <ul className="space-y-2 text-sm">
                {links.map(([href, label]) => (
                    <li key={href}>
                        <Link href={href} className="text-ink-2 hover:text-ink">
                            {label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
