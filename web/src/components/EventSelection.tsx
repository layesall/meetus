// components/EventSelection.tsx
// Liste des prestations – cartes agrandies.

"use client";

import { EventType } from "@/lib/api";
import { EventCard } from "./EventCard";

interface EventSelectionProps {
  eventTypes: EventType[];
  selectedEvent: EventType | null;
  onSelectEvent: (event: EventType) => void;
  onNext: () => void;
}

export function EventSelection({
  eventTypes,
  selectedEvent,
  onSelectEvent,
  onNext,
}: EventSelectionProps) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Choisissez une prestation</h2>
        <p className="text-base text-neutral-400 mt-1">
          Sélectionnez le format d'échange qui vous convient.
        </p>
      </div>

      {eventTypes.length === 0 ? (
        <div className="py-16 text-center text-base text-neutral-500">
          Aucune prestation disponible.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventTypes.map((event) => (
            <EventCard
              key={event.id || event.slug}
              event={event}
              isSelected={selectedEvent?.slug === event.slug}
              onSelect={onSelectEvent}
            />
          ))}
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-neutral-800/60 flex justify-end">
        <button
          disabled={!selectedEvent}
          onClick={onNext}
          style={{
            backgroundColor: selectedEvent?.color || "#3B82F6",
            opacity: selectedEvent ? 1 : 0.4,
          }}
          className="px-8 py-3 rounded-xl text-base font-medium text-white shadow-md transition hover:shadow-lg"
        >
          Continuer →
        </button>
      </div>
    </div>
  );
}