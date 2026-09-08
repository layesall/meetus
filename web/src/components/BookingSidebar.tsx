"use client";

import { ShieldCheck, CalendarDays } from "lucide-react";
import Image from "next/image";

export function BookingSidebar() {
  const host = {
    name: "Layesall",
    role: "Fullstack Developer & Product Builder",
    avatarUrl: "https://layesall.com/images/meprofile.png",
    bio: "Débloquez le potentiel de votre projet web. Réservez un échange de 15 min pour un audit UX, un SaaS sur mesure ou un accompagnement technique.",
  };

  return (
    <aside className="w-full flex flex-col justify-between items-center rounded-2xl p-2 shadow-sm backdrop-blur-sm">
      <div className="w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-neutral-700/50 shadow-md shrink-0">
            <Image
              src={host.avatarUrl}
              alt={host.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="text-center">
            <p className="font-semibold text-lg text-white">{host.name}</p>
            <p className="text-sm text-neutral-400">{host.role}</p>
          </div>
        </div>

        <div className="w-full mt-4 pt-4 border-t border-neutral-800/60" hidden>
          <p className="text-sm text-neutral-300 leading-relaxed">{host.bio}</p>
        </div>
      </div>

      <div className="mt-6 flex sm:text-center gap-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" />
          Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Sécurisé
        </span>
      </div>
    </aside>
  );
}