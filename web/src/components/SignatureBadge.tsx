"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface Props {
  href?: string;
  hidden?: boolean;
}

export function SignatureBadge({
  href = "https://layesall.com",
  hidden = false,
}: Props) {
  if (hidden) return null;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs shadow-sm backdrop-blur transition hover:border-slate-300 hover:bg-white hover:shadow-md opacity-70 hover:opacity-100"
      aria-label="Propulsé par Meetus — Layesall"
    >
      <span className="flex items-center gap-0.5 font-bold tracking-tight">
        <span className="text-slate-900">Meet</span>
        <span className="text-sky-500">us</span>
      </span>
      <span className="text-slate-300">·</span>
      <span className="text-slate-500 group-hover:text-slate-700">
        by Layesall
      </span>
      <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-slate-600" />
    </Link>
  );
}