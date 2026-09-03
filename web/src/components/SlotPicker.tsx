// src/components/SlotPicker.tsx
"use client";

import { TimeSlot } from "@/lib/api";

interface SlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  loading: boolean;
}

export function SlotPicker({ slots, selectedSlot, onSelectSlot, loading }: SlotPickerProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
        Chargement des créneaux...
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
        Aucun créneau disponible pour cette date.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
      {slots.map((slot) => {
        const timeFormatted = new Date(slot.start_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const isSelected = selectedSlot?.start_time === slot.start_time;

        return (
          <button
            key={slot.start_time}
            onClick={() => onSelectSlot(slot)}
            className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium border transition ${
              isSelected
                ? "bg-white text-neutral-950 border-white font-semibold"
                : "bg-neutral-900 border-neutral-800 text-neutral-200 hover:border-neutral-600 hover:text-white"
            }`}
          >
            {timeFormatted}
          </button>
        );
      })}
    </div>
  );
}