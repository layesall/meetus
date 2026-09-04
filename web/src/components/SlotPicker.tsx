"use client";

import { TimeSlot } from "@/lib/api";

interface ExtendedTimeSlot extends TimeSlot {
  available?: boolean;
  is_available?: boolean;
}

interface SlotPickerProps {
  slots: ExtendedTimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  loading: boolean;
}

export function SlotPicker({ slots, selectedSlot, onSelectSlot, loading }: SlotPickerProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-neutral-500 text-sm gap-2">
        <svg
          className="animate-spin h-5 w-5 text-neutral-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>Chargement des créneaux...</span>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-neutral-400 text-sm gap-3 p-6 text-center bg-neutral-900/40 rounded-xl border border-neutral-800/60">
        <div className="p-3 bg-neutral-800/80 rounded-full text-neutral-400 border border-neutral-700/50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
            <line x1="3" x2="21" y1="3" y2="21" />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-neutral-200">
            Aucun créneau disponible pour cette date.
          </p>
          <p className="text-xs text-neutral-500">
            Veuillez sélectionner une autre date dans le calendrier.
          </p>
        </div>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
      {slots.map((slot) => {
        const slotDate = new Date(slot.start_time);
        const timeFormatted = slotDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        // Détection des créneaux passés ou explicitement indisponibles
        const isPast = slotDate < now;
        const isExplicitlyUnavailable =
          slot.available === false || slot.is_available === false;
        const isDisabled = isPast || isExplicitlyUnavailable;

        const isSelected = selectedSlot?.start_time === slot.start_time;

        return (
          <button
            key={slot.start_time}
            disabled={isDisabled}
            onClick={() => !isDisabled && onSelectSlot(slot)}
            className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium border transition flex items-center justify-between ${
              isDisabled
                ? "bg-neutral-900/30 border-neutral-800/40 text-neutral-500 opacity-60 cursor-not-allowed line-through select-none"
                : isSelected
                ? "bg-white text-neutral-950 border-white font-semibold shadow-sm"
                : "bg-neutral-900 border-neutral-800 text-neutral-200 hover:border-neutral-600 hover:text-white"
            }`}
          >
            <span>{timeFormatted}</span>
            {isDisabled && (
              <span className="text-xs no-underline font-normal text-neutral-500">
                {isPast ? "Passé" : "Indisponible"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}