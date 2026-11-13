"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
export function SiteHeader({ role }: { role: "subscriber" | "admin" | null }) {
  const [open, setOpen] = useState(false);
  return <header className="siteHeader"><Link className="brand" href="/" aria-label="Next Level Cast home"><Image src="/brand/nextlevelcast-logo.png" alt="" width={44} height={40} priority /><span><b>Next Level</b> Cast</span></Link><button aria-controls="primary-navigation" aria-expanded={open} className="mobileMenu" onClick={() => setOpen((value) => !value)} type="button">Menu</button><nav className={open ? "open" : ""} id="primary-navigation" aria-label="Primary navigation"><Link href="/shows">Browse Episodes</Link><Link href="/who-its-for">Who It’s For</Link><Link href="/help">Help</Link>{role === "admin" ? <Link href="/admin">Admin Dashboard</Link> : null}<ThemeToggle />{role ? <form action="/api/auth/logout" method="post"><button className="button outline" type="submit">Sign Out</button></form> : <><Link className="button outline" href="/sign-in">Sign In</Link><Link className="button primary" href="/signup">Sign Up Free</Link></>}</nav></header>;
}
