import Image from "next/image";
import { ShieldCheck, CalendarDays, Clock, CreditCard } from "lucide-react";
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
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-slate-200">
            <Image
              src={HOST.avatarUrl}
              alt={HOST.name}
              fill
              sizes="78px"
              className="object-cover object-top"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-2xl font-semibold text-slate-900">
              {HOST.name}
            </p>
            <p className="truncate text-xs text-slate-500">{HOST.role}</p>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <span
            className="mb-2 inline-block h-1 w-10 rounded-full"
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
        </div>

        <ul className="mt-5 space-y-3 text-sm">
          <li className="flex items-center gap-2 text-slate-600">
            <Clock className="h-4 w-4 text-sky-500" />
            {event.duration_minutes} min
          </li>
          <li className="flex items-center gap-2 text-slate-600">
            <CreditCard className="h-4 w-4 text-sky-500" />
            <span className="font-medium text-slate-900">{priceLabel}</span>
          </li>
          {event.allowed_channels.length > 0 && (
            <li className="flex items-center gap-2 text-slate-600">
              <CalendarDays className="h-4 w-4 text-sky-500" />
              <span className="capitalize">
                {event.allowed_channels.join(", ").replace(/_/g, " ")}
              </span>
            </li>
          )}
        </ul>

        {event.included_features.length > 0 && (
          <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
            {event.included_features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 text-sky-500">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5" hidden>
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Paiement sécurisé
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-sky-500" />
          Confirmation immédiate
        </span>
      </div>
    </aside>
  );
}