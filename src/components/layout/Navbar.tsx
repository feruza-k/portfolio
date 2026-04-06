"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Hide the standard navbar on the /ask page (it has its own back link)
  if (pathname === "/ask") return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-faint">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-mono text-[15px] tracking-[0.12em] text-ink hover:text-muted transition-colors"
        >
          FK_
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/#work"
            className="font-body text-[14px] text-muted hover:text-ink transition-colors"
          >
            work
          </Link>
          <Link
            href="/notes"
            className="font-body text-[14px] text-muted hover:text-ink transition-colors"
          >
            notes
          </Link>

          <Link
            href="/ask"
            className="font-mono text-[13px] text-ink border border-ink px-3 py-1 hover:bg-ink hover:text-white transition-colors"
          >
            /ask →
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-px bg-ink transition-transform ${open ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`block w-5 h-px bg-ink transition-opacity ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-5 h-px bg-ink transition-transform ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-faint bg-white">
          <nav className="max-w-3xl mx-auto px-6 py-4 flex flex-col gap-4">
            <Link
              href="/#work"
              className="font-body text-[15px] text-muted hover:text-ink"
              onClick={() => setOpen(false)}
            >
              work
            </Link>
            <Link
              href="/notes"
              className="font-body text-[15px] text-muted hover:text-ink"
              onClick={() => setOpen(false)}
            >
              notes
            </Link>

            <Link
              href="/ask"
              className="font-mono text-[14px] text-ink self-start border border-ink px-3 py-1"
              onClick={() => setOpen(false)}
            >
              /ask →
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
