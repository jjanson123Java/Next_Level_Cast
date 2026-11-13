import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SocialLinks } from "@/components/social-links";
import { socialLinks } from "@/config/social-links";
import { getSession } from "@/features/auth/session";
import "@/styles/globals.css";
import "@/styles/editorial.css";
export const metadata: Metadata = { title: "Next Level Cast · Level Completed", description: "A relaxed gaming podcast for every genre, platform, and player archetype." };
export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) { const session = await getSession(); return <html lang="en" data-theme="dark" data-scroll-behavior="smooth"><body><a className="skipLink" href="#content">Skip to content</a><SiteHeader role={session?.role ?? null} /><div id="content">{children}</div><footer><div className="footerBrand"><strong>Next Level Cast</strong><SocialLinks links={socialLinks} /></div><span>Welcome to the lobby. Level completed.</span><span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></span></footer></body></html>; }
