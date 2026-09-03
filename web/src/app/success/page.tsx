// src/app/success/page.tsx
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 mb-6">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">
        Rendez-vous confirmé !
      </h1>
      <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
        Un e-mail de confirmation contenant les détails du rendez-vous et l'invitation Google Calendar / Google Meet vient de vous être envoyé.
      </p>

      <Link
        href="/"
        className="inline-block bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}