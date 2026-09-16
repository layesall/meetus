// app/page.tsx
// Homepage — large cards for conversion.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import { fetchEventTypes, type EventType } from "@/lib/api";

export default function HomePage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchEventTypes();
        if (active) setEvents(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erreur inconnue";
        if (active) setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-6 py-12 lg:px-12 lg:py-16 xl:px-20">
      <header className="mb-12 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-sky-500" />
          <span>Réservation en ligne</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Choisissez votre prestation
        </h1>
        <p className="mt-3 text-base text-slate-600 lg:text-lg">
          Sélectionnez un service et réservez votre créneau en quelques clics.
        </p>
      </header>

      {loading && <StateMessage text="Chargement des prestations..." />}
      {error && <StateMessage text={error} variant="error" />}
      {!loading && !error && events.length === 0 && (
        <StateMessage text="Aucune prestation disponible pour le moment." />
      )}

      {!loading && !error && events.length > 0 && (
        <ul className="grid gap-6 md:grid-cols-2 lg:gap-8 xl:grid-cols-3">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="group flex min-h-[280px] flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <span
                className="mb-5 inline-block h-1.5 w-12 rounded-full"
                style={{ backgroundColor: ev.color || "#0ea5e9" }}
              />
              <h2 className="text-2xl font-semibold text-slate-900">
                {ev.title}
              </h2>
              {ev.description && (
                <p className="mt-3 line-clamp-3 text-base text-slate-600">
                  {ev.description}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between pt-6 text-sm">
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Clock className="h-4 w-4" />
                  {ev.duration_minutes} min
                </span>
                <span className="text-2xl font-bold text-sky-600">
                  {ev.price} {ev.currency}
                </span>
              </div>

              <Link
                href={`/book/${ev.slug}`}
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Réserver
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StateMessage({
  text,
  variant = "info",
}: {
  text: string;
  variant?: "info" | "error";
}) {
  const styles =
    variant === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-slate-200 bg-white text-slate-500";
  return (
    <div
      className={`rounded-2xl border px-6 py-10 text-center text-sm ${styles}`}
    >
      {text}
    </div>
  );
}