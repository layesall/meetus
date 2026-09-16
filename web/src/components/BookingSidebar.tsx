// components/BookingSidebar.tsx
// Fixed sidebar content: scrollable middle + pinned badge at bottom.

import Image from "next/image";
import { Check, Clock, Calendar, Video, Zap } from "lucide-react";
import type { EventType } from "@/lib/api";

const HOST = {
  name: "Layesall",
  role: "Fullstack Developer & Product Builder",
  avatarUrl: "https://layesall.com/images/meprofile.png",
};

export function BookingSidebar({ event }: { event: EventType }) {
  const priceLabel =
    event.price === 0 ? "Gratuit" : `${event.price} ${event.currency}`;

  return (
    <div className="flex flex-col lg:h-full">
      {/* Scrollable middle */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {/* Host */}
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 overflow-hidden rounded-full border border-slate-200">
            <Image
              src={HOST.avatarUrl}
              alt={HOST.name}
              fill
              sizes="56px"
              className="object-cover object-top"
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              {HOST.name}
            </h1>
            <p className="text-sm text-slate-500">{HOST.role}</p>
          </div>
        </div>

        {/* Event info */}
        <div className="my-4 border-t border-slate-100" />
        <span
          className="mb-3 inline-block h-1.5 w-12 rounded-full"
          style={{ backgroundColor: event.color || "#0ea5e9" }}
        />
        <h2 className="text-base font-semibold text-slate-900">
          {event.title}
        </h2>
        {event.description && (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {event.description}
          </p>
        )}

        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>{event.duration_minutes} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-900">{priceLabel}</span>
          </div>
          {event.allowed_channels.length > 0 && (
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-slate-400" />
              <span className="capitalize">
                {event.allowed_channels.join(", ").replace(/_/g, " ")}
              </span>
            </div>
          )}
        </div>

        {/* Included features — from API */}
        {event.included_features.length > 0 && (
          <>
            <div className="my-4 border-t border-slate-100" />
            <ul className="space-y-2 text-sm text-slate-600">
              {event.included_features.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Pinned badge — always at bottom of the sidebar */}
      <div className="shrink-0 border-t border-slate-100 p-4">
        <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
          <Zap className="h-3.5 w-3.5 text-sky-500" />
          Confirmation immédiate
        </div>
      </div>
    </div>
  );
}