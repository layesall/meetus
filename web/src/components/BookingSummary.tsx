// components/BookingSummary.tsx
// Récapitulatif agrandi.

"use client";

import { EventType, TimeSlot } from "@/lib/api";
import { Calendar, Video, User } from "lucide-react";

interface BookingSummaryProps {
  event: EventType;
  slot: TimeSlot;
  clientName: string;
  clientEmail: string;
  chosenChannel: string;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  accentColor: string;
}

export function BookingSummary({
  event,
  slot,
  clientName,
  clientEmail,
  chosenChannel,
  onBack,
  onSubmit,
  isSubmitting,
  accentColor,
}: BookingSummaryProps) {
  const lines = event.description ? event.description.split("\n") : [];
  const headerText = lines
    .filter((l) => !l.trim().startsWith("•") && l.trim() !== "")
    .join(" ");
  const price = headerText.includes("Gratuit") ? "Gratuit" : headerText || "Sur devis";

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Récapitulatif</h2>
        <p className="text-base text-neutral-400 mt-1">
          Vérifiez vos informations avant de confirmer.
        </p>
      </div>

      <div className="max-w-2xl bg-neutral-900/30 rounded-2xl p-8 border border-neutral-800/60 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/50">
          <span className="text-base text-neutral-400">Prestation</span>
          <span className="font-semibold text-white text-lg">{event.title}</span>
        </div>
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/50">
          <span className="text-base text-neutral-400 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Date & Heure
          </span>
          <span className="font-semibold text-white text-base">
            {new Date(slot.start_time).toLocaleString("fr-FR", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </span>
        </div>
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/50">
          <span className="text-base text-neutral-400 flex items-center gap-2">
            <Video className="w-5 h-5" /> Canal
          </span>
          <span className="font-semibold text-white capitalize text-base">
            {chosenChannel.replace("_", " ")}
          </span>
        </div>
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/50">
          <span className="text-base text-neutral-400 flex items-center gap-2">
            <User className="w-5 h-5" /> Participant
          </span>
          <span className="font-semibold text-white text-base">
            {clientName} ({clientEmail})
          </span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-base text-neutral-400">Prix</span>
          <span className="font-bold text-2xl" style={{ color: accentColor }}>
            {price}
          </span>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-neutral-800/60 flex justify-between">
        <button
          onClick={onBack}
          className="text-base text-neutral-400 hover:text-white transition"
        >
          ← Retour
        </button>
        <button
          disabled={isSubmitting}
          onClick={onSubmit}
          style={{ backgroundColor: accentColor }}
          className="px-8 py-3 rounded-xl text-base font-medium text-white shadow-md transition hover:shadow-lg"
        >
          {isSubmitting ? "Confirmation..." : "Confirmer"}
        </button>
      </div>
    </div>
  );
}