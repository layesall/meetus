// components/SiteHeader.tsx
// Header displayed only on the homepage ("/").

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <span className="flex items-center gap-0.5 text-lg font-bold tracking-tight">
            <span className="text-slate-900">Meet</span>
            <span className="text-sky-500">us</span>
          </span>
        </Link>

        <Link
          href="https://layesall.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
        >
          <span>Retour au site host</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}