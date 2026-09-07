// components/SlotPicker.tsx
// Créneaux en grille, avec plus d'espace.

"use client";

import { TimeSlot } from "@/lib/api";

interface SlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  loading: boolean;
}

export function SlotPicker({
  slots,
  selectedSlot,
  onSelectSlot,
  loading,
}: SlotPickerProps) {
  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-neutral-500">
        <div className="w-6 h-6 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin inline-block" />
        <span className="ml-3">Chargement...</span>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-neutral-500">
        Aucun créneau disponible
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-2">
      {slots.map((slot) => {
        const date = new Date(slot.start_time);
        const time = date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const isPast = date < now;
        const isSelected = selectedSlot?.start_time === slot.start_time;

        return (
          <button
            key={slot.start_time}
            disabled={isPast}
            onClick={() => !isPast && onSelectSlot(slot)}
            className={`py-3 px-4 rounded-xl text-base font-medium border transition ${
              isPast
                ? "border-transparent text-neutral-600 cursor-not-allowed line-through"
                : isSelected
                ? "border-white bg-white text-neutral-950 shadow-md"
                : "border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800/50"
            }`}
          >
            {time}
          </button>
        );
      })}
    </div>
  );
}