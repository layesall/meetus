// components/SignatureBadge.tsx
// Floating avatar signature — tooltip on hover, links to Layesall.

"use client";

import Link from "next/link";
import Image from "next/image";

interface Props {
  href?: string;
  hidden?: boolean;
  avatarUrl?: string;
}

export function SignatureBadge({
  href = "https://layesall.com",
  hidden = false,
  avatarUrl = "/favicon-ls.png",
}: Props) {
  if (hidden) return null;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Meetus, by Layesall"
      className="group fixed bottom-4 right-4 z-40 flex items-center"
    >
      {/* Tooltip on hover */}
      <span className="pointer-events-none absolute bottom-full right-0 mb-2 flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white/95 px-3.5 py-2 text-xs shadow-md backdrop-blur opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
        <span className="flex items-center gap-0.5 font-bold tracking-tight">
          <span className="text-slate-900">Meet</span>
          <span className="text-sky-500">us</span>
        </span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-500">by Layesall</span>
      </span>

      {/* Avatar */}
      <span className="relative flex h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm opacity-80 transition-all duration-200 group-hover:scale-105 group-hover:border-slate-300 group-hover:opacity-100 group-hover:shadow-md">
        <Image
          src={avatarUrl}
          alt="Layesall"
          fill
          sizes="40px"
          className="object-cover"
        />
      </span>
    </Link>
  );
}