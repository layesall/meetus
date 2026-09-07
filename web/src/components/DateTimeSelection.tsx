// components/DateTimeSelection.tsx
// Calendrier + créneaux – agrandis.

"use client";

import { TimeSlot } from "@/lib/api";
import { CalendarPicker } from "./CalendarPicker";
import { SlotPicker } from "./SlotPicker";

interface DateTimeSelectionProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  slots: TimeSlot[];
  loadingSlots: boolean;
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  onBack: () => void;
  onNext: () => void;
  accentColor: string;
}

export function DateTimeSelection({
  selectedDate,
  onSelectDate,
  slots,
  loadingSlots,
  selectedSlot,
  onSelectSlot,
  onBack,
  onNext,
  accentColor,
}: DateTimeSelectionProps) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Choisissez votre créneau</h2>
        <p className="text-base text-neutral-400 mt-1">
          Sélectionnez une date puis une heure disponible.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-neutral-900/30 rounded-2xl p-6 sm:p-8 border border-neutral-800/60">
          <CalendarPicker selectedDate={selectedDate} onSelectDate={onSelectDate} />
        </div>

        <div className="lg:col-span-2 bg-neutral-900/30 rounded-2xl p-6 sm:p-8 border border-neutral-800/60">
          <h4 className="text-base font-medium text-neutral-400 mb-4">
            Créneaux disponibles
          </h4>
          <SlotPicker
            slots={slots}
            selectedSlot={selectedSlot}
            onSelectSlot={onSelectSlot}
            loading={loadingSlots}
          />
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
          disabled={!selectedSlot}
          onClick={onNext}
          style={{
            backgroundColor: selectedSlot ? accentColor : undefined,
            opacity: selectedSlot ? 1 : 0.4,
          }}
          className="px-8 py-3 rounded-xl text-base font-medium text-white shadow-md transition hover:shadow-lg"
        >
          Continuer →
        </button>
      </div>
    </div>
  );
}