// components/SlotPicker.tsx
// Slots in a responsive grid — denser on wide screens.

"use client";

import type { TimeSlot } from "@/lib/api";

interface Props {
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
}: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-sm text-slate-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        <span className="mt-2">Chargement...</span>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-slate-400">
        Aucun créneau disponible pour cette date.
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {slots.map((slot) => {
        const d = new Date(slot.start_time);
        const isPast = d < now;
        const isSelected = selectedSlot?.start_time === slot.start_time;
        const label = d.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <button
            key={slot.start_time}
            type="button"
            disabled={isPast}
            onClick={() => !isPast && onSelectSlot(slot)}
            className={[
              "rounded-lg border px-3 py-3 text-sm font-medium transition",
              isPast
                ? "cursor-not-allowed border-slate-100 text-slate-300 line-through"
                : isSelected
                ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}