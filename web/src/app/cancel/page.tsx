// src/app/cancel/page.tsx
import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CancelPage() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-950 border border-red-800 text-red-400 mb-6">
        <XCircle className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">
        Rendez-vous annulé
      </h1>
      <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
        Votre réservation a bien été annulée. L'événement a été supprimé de l'agenda et un e-mail de confirmation vous a été adressé.
      </p>

      <Link
        href="/"
        className="inline-block bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition"
      >
        Reprendre un rendez-vous
      </Link>
    </div>
  );
}