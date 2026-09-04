"use client";

import { ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";

export function BookingSidebar() {
    // Informations de démonstration pour le Host (Sidebar par défaut)
    const hostInfo = {
      name: "Layesall",
      role: "Web products. SaaS. Shopify",
      avatarUrl: "https://layesall.com/images/meprofile.png",
      bio: "Réservez un créneau directement dans mon agenda pour échanger sur vos projets web, audit UX ou accompagnement technique.",
      websiteUrl: "https://layesall.com",
      hostNameLabel: "Waabily",
    };
  return (
    <aside className="w-full lg:w-80 shrink-0 bg-neutral-900/40 border-b lg:border-b-0 lg:border-r border-neutral-800 p-6 lg:p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-neutral-700/80 bg-neutral-800">
                  <Image
                    src={hostInfo.avatarUrl}
                    alt={hostInfo.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">{hostInfo.name}</h2>
                  <p className="text-xs text-neutral-400 font-medium">{hostInfo.role}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-neutral-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  À propos
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {hostInfo.bio}
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-neutral-800/80 text-[11px] text-neutral-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>Réservation sécurisée & instantanée</span>
            </div>
          </aside>
  );
}