import { Logo } from "./ui";

/** Split layout for sign-in / sign-up: form on the left, photo on the right. */
export default function AuthShell({ title, subtitle, children, image = "study" }) {
    return (
        <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl lg:grid-cols-2">
            <div className="flex flex-col justify-center px-4 py-12 sm:px-10 lg:px-16">
                <div className="mx-auto w-full max-w-md">
                    <Logo className="mb-10 lg:hidden" />
                    <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
                    {subtitle && <p className="mt-2 text-ink-2">{subtitle}</p>}
                    <div className="mt-8">{children}</div>
                </div>
            </div>
            <div className="relative hidden overflow-hidden p-6 lg:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={`https://picsum.photos/seed/intered-${image}/900/1200`}
                    alt=""
                    className="size-full rounded-3xl object-cover"
                />
                <div className="absolute inset-x-12 bottom-12 rounded-2xl bg-ink/80 p-6 text-paper backdrop-blur">
                    <p className="font-display text-xl font-bold leading-snug">
                        &ldquo;Ten focused minutes a day beat a four-hour binge once a month.&rdquo;
                    </p>
                    <p className="mt-2 text-sm text-paper/70">Why InterEd tracks streaks, not hours</p>
                </div>
            </div>
        </div>
    );
}
