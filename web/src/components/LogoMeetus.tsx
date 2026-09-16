// components/LogoMeetus.tsx
// Contextual logo — acts as smart backlink based on referrer.
// Internal referrer → router.back(). External → return to referrer.
// No referrer → fallback (layesall.com).

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  fallback?: string;
  className?: string;
}

export function LogoMeetus({
  fallback = "https://layesall.com",
  className = "",
}: Props) {
  const router = useRouter();
  const [href, setHref] = useState(fallback);
  const [isInternal, setIsInternal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ref = document.referrer;
    if (!ref) return;

    try {
      const refUrl = new URL(ref);
      if (refUrl.origin === window.location.origin) {
        setIsInternal(true);
      } else {
        setHref(ref);
      }
    } catch {
      /* keep fallback */
    }
  }, [fallback]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isInternal) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      target={isInternal ? undefined : "_blank"}
      rel={isInternal ? undefined : "noopener noreferrer"}
      aria-label="Meetus"
      className={`group inline-flex items-center gap-0.5 font-bold tracking-tight transition ${className}`}
    >
      <span className="text-slate-900">Meet</span>
      <span className="text-sky-500">us</span>
    </Link>
  );
}