"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, Loader2, CheckCircle2 } from "lucide-react";
import { cancelBooking } from "@/lib/api";

type Status = "idle" | "pending" | "done" | "error";

export default function CancelPage() {
  const params = useSearchParams();
  const token = params.get("token");

  const [status, setStatus] = useState<Status>(token ? "pending" : "idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let active = true;
    (async () => {
      try {
        await cancelBooking(token);
        if (active) setStatus("done");
      } catch (err: unknown) {
        if (!active) return;
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Erreur inconnue");
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-slate-500">Chargement…</div>}>
      <div className="mx-auto w-full max-w-md px-6 py-16 text-center">
        <Icon status={status} />

        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          {status === "pending" && "Annulation en cours…"}
          {status === "done" && "Rendez-vous annulé"}
          {status === "error" && "Annulation impossible"}
          {status === "idle" && "Aucun rendez-vous à annuler"}
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {status === "pending" &&
            "Nous traitons votre demande, un instant."}
          {status === "done" &&
            "L'événement a été supprimé de l'agenda. Un e-mail de confirmation vous a été envoyé."}
          {status === "error" &&
            (message ?? "Une erreur est survenue. Réessayez ou contactez-nous.")}
          {status === "idle" &&
            "Le lien semble incomplet. Vous pouvez reprendre un rendez-vous depuis la page d'accueil."}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
            Reprendre un rendez-vous
          </Link>
        </div>
      </div>
    </Suspense>
  );
}

function Icon({ status }: { status: Status }) {
  if (status === "pending") {
    return (
      <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (status === "done") {
    return (
      <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-8 w-8" />
      </div>
    );
  }
  return (
    <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600">
      <XCircle className="h-8 w-8" />
    </div>
  );
}