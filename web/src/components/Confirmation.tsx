// components/Confirmation.tsx
// Écran final – agrandi.

"use client";

import { CheckCircle2 } from "lucide-react";

interface ConfirmationProps {
  clientEmail: string;
  onReset: () => void;
}

export function Confirmation({ clientEmail, onReset }: ConfirmationProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto">
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
      </div>
      <h2 className="text-3xl font-bold text-white mt-6">Rendez-vous confirmé !</h2>
      <p className="text-base text-neutral-400 mt-3 leading-relaxed">
        Un e-mail de confirmation a été envoyé à{" "}
        <span className="text-white font-medium">{clientEmail}</span>.
      </p>
      <button
        onClick={onReset}
        className="mt-8 px-8 py-3 text-base text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-500 rounded-xl transition"
      >
        Nouvelle réservation
      </button>
    </div>
  );
}