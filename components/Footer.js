"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
            <div className="border-t border-line py-5 text-center text-xs text-ink-3">
                © {new Date().getFullYear()} InterEd Hub. Built with Django, Next.js and Neon.
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
