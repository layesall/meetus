// components/UserHeader.tsx
// En-tête utilisateur – compact mais visible.

"use client";

import Image from "next/image";

export function UserHeader() {
  const host = {
    name: "Layesall",
    role: "Web products · SaaS · Shopify",
    avatarUrl: "https://layesall.com/images/meprofile.png",
  };

  return (
    <div className="flex items-center gap-4 pb-4 border-b border-neutral-800/60">
      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-neutral-700/50 shadow-md">
        <Image
          src={host.avatarUrl}
          alt={host.name}
          fill
          className="object-cover"
        />
      </div>
      <div>
        <p className="font-semibold text-lg text-white">{host.name}</p>
        <p className="text-sm text-neutral-400">{host.role}</p>
      </div>
    </div>
  );
}