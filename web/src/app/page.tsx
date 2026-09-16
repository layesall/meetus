// app/page.tsx
// Homepage — conversion-focused. Host-first, no filler copy.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
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
      {/* Hero */}
      <header className="mx-auto mb-14 max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Parlons de votre projet
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600 lg:text-lg">
          Choisissez le format d&apos;échange qui correspond à votre besoin —
          que vous partiez de zéro, ayez déjà un cahier des charges, ou un
          projet à débloquer.
        </p>
      </header>

      {loading && <StateMessage text="Chargement des prestations..." />}
      {error && <StateMessage text={error} variant="error" />}
      {!loading && !error && events.length === 0 && (
        <StateMessage text="Aucune prestation disponible pour le moment." />
      )}

      {!loading && !error && events.length > 0 && (
        <ul className="grid gap-6 md:grid-cols-2 lg:gap-8 xl:grid-cols-3">
          {events.map((ev) => {
            const isFree = ev.price === 0;
            return (
              <li
                key={ev.id}
                className="group flex min-h-[280px] flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <span
                  className="mb-5 inline-block h-1.5 w-12 rounded-full"
                  style={{ backgroundColor: ev.color || "#0ea5e9" }}
                />
                <h2 className="text-2xl font-semibold text-slate-900">
                  {ev.title}
                </h2>
                {ev.description && (
                  <p className="mt-3 text-base leading-relaxed text-slate-600">
                    {ev.description}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-6 text-sm">
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-4 w-4" />
                    {ev.duration_minutes} min
                  </span>
                  <span className="text-2xl font-bold text-slate-500">
                    {isFree ? "Gratuit" : `${ev.price} ${ev.currency}`}
                  </span>
                </div>

                <Link
                  href={`/book/${ev.slug}`}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Choisir ce créneau
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
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