// components/BookingSummary.tsx

"use client";

import { EventType, TimeSlot } from "@/lib/api";
import { Calendar, Video, User, Phone, HelpCircle, Clock } from "lucide-react";

interface BookingSummaryProps {
  event: EventType;
  slot: TimeSlot;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  chosenChannel: string;
  customDuration?: number;
  answers: Record<string, any>;
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
  clientPhone,
  chosenChannel,
  customDuration,
  answers,
  onBack,
  onSubmit,
  isSubmitting,
  accentColor,
}: BookingSummaryProps) {
  const duration = customDuration || event.duration_minutes;

  // Calcul dynamique du prix au prorata si durée personnalisée autorisée
  const calculateTotalPrice = () => {
    if (!event.price || event.price === 0) return 0;

    if (event.is_custom_duration_allowed && customDuration && event.duration_minutes > 0) {
      const pricePerMinute = event.price / event.duration_minutes;
      return Number((pricePerMinute * customDuration).toFixed(2));
    }

    return event.price;
  };

  const totalPrice = calculateTotalPrice();
  const formattedPrice =
    totalPrice === 0 ? "Gratuit" : `${totalPrice} ${event.currency || "EUR"}`;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Récapitulatif</h2>
        <p className="text-base text-neutral-400 mt-1">
          Vérifiez vos informations avant de confirmer.
        </p>
      </div>

      <div className="max-w-2xl bg-neutral-900/30 rounded-2xl p-8 border border-neutral-800/60 space-y-5">
        {/* Prestation */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/50">
          <span className="text-base text-neutral-400">Prestation</span>
          <span className="font-semibold text-white text-lg">{event.title}</span>
        </div>

        {/* Date, Heure & Durée */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/50">
          <span className="text-base text-neutral-400 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Date & Heure
          </span>
          <div className="text-right">
            <span className="font-semibold text-white text-base block">
              {new Date(slot.start_time).toLocaleString("fr-FR", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </span>
            <span className="text-xs text-neutral-400 flex items-center justify-end gap-1 mt-0.5">
              <Clock className="w-3 h-3" /> Durée : {duration} min
              {event.is_custom_duration_allowed && customDuration && customDuration !== event.duration_minutes && (
                <span className="text-xs text-amber-400 ml-1">(Personnalisée)</span>
              )}
            </span>
          </div>
        </div>

        {/* Canal */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/50">
          <span className="text-base text-neutral-400 flex items-center gap-2">
            <Video className="w-5 h-5" /> Canal
          </span>
          <span className="font-semibold text-white capitalize text-base">
            {chosenChannel.replace(/_/g, " ")}
          </span>
        </div>

        {/* Participant */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/50">
          <span className="text-base text-neutral-400 flex items-center gap-2">
            <User className="w-5 h-5" /> Participant
          </span>
          <div className="text-right">
            <span className="font-semibold text-white text-base block">{clientName}</span>
            <span className="text-xs text-neutral-400 block">{clientEmail}</span>
            {clientPhone && (
              <span className="text-xs text-neutral-400 flex items-center justify-end gap-1 mt-0.5">
                <Phone className="w-3 h-3" /> {clientPhone}
              </span>
            )}
          </div>
        </div>

        {/* Réponses aux questions personnalisées */}
        {event.booking_questions && event.booking_questions.length > 0 && Object.keys(answers).length > 0 && (
          <div className="pb-4 border-b border-neutral-800/50 space-y-2">
            <span className="text-sm font-semibold text-neutral-300 flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4" /> Questions/Réponses :
            </span>
            {event.booking_questions.map((q) => {
              const ans = answers[q.id];
              if (!ans) return null;
              return (
                <div key={q.id} className="text-xs flex justify-between gap-4">
                  <span className="text-neutral-400">{q.label}:</span>
                  <span className="text-white font-medium text-right">{String(ans)}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Prix Total */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-base text-neutral-400 block">Prix total</span>
            {event.is_custom_duration_allowed && customDuration && customDuration !== event.duration_minutes && (
              <span className="text-xs text-neutral-500 block">
                Calculé au prorata ({duration} min)
              </span>
            )}
          </div>
          <span className="font-bold text-2xl" style={{ color: accentColor }}>
            {formattedPrice}
          </span>
        </div>
      </div>

      {/* Actions */}
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
          className="px-8 py-3 rounded-xl text-base font-medium text-white shadow-md transition hover:shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? "Confirmation..." : "Confirmer la réservation"}
        </button>
      </div>
    </div>
  );
}