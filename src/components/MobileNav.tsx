"use client";

import { useState } from "react";
import Link from "next/link";

export type NavLink = { href: string; label: string; cta?: boolean };

/**
 * Mobile-only nav: a hamburger button that toggles a full-width dropdown of all
 * the header links. Shown below `md`; the desktop nav takes over at `md+`.
 */
export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open ? (
        <>
          {/* click-away backdrop */}
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-slate-900/20"
          />
          <div className="absolute left-0 right-0 top-full z-50 border-b border-slate-200 bg-white shadow-lg">
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 text-sm">
              {links.map((n) => (
                <Link
                  key={n.href + n.label}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={
                    n.cta
                      ? "rounded-md bg-emerald-600 px-3 py-2.5 text-center font-medium text-white hover:bg-emerald-700"
                      : "rounded-md px-3 py-2.5 text-slate-700 hover:bg-slate-100"
                  }
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
