"use client";

import type { TimeSlot } from "@/lib/api";

interface SlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  loading: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SlotPicker({
  slots,
  selectedSlot,
  onSelectSlot,
  loading,
}: SlotPickerProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        Chargement...
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-slate-500">
        Aucun créneau disponible
      </div>
    );
  }

  const now = Date.now();

  return (
    <div className="grid max-h-[360px] grid-cols-2 gap-2 overflow-y-auto pr-1">
      {slots.map((slot) => {
        const isPast = new Date(slot.start_time).getTime() < now;
        const isSelected = selectedSlot?.start_time === slot.start_time;

        const base =
          "flex h-10 items-center justify-center rounded-md border text-sm font-medium transition";
        const state = isSelected
          ? "border-slate-900 bg-slate-900 text-white"
          : isPast
            ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-900 hover:bg-slate-50";

        return (
          <button
            key={slot.start_time}
            type="button"
            disabled={isPast}
            onClick={() => onSelectSlot(slot)}
            className={`${base} ${state}`}
          >
            {formatTime(slot.start_time)}
          </button>
        );
      })}
    </div>
  );
}