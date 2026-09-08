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
        <h1 className="my-3 lg:text-3xl text-white">Débloquez le potentiel de votre projet web. </h1>
        <p className="text-base text-neutral-400 mt-1">
          Choisissez une prestation et sélectionnez le format d'échange qui vous convient.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {eventTypes.map((event) => (
          <EventCard
            key={event.id || event.slug}
            event={event}
            isSelected={selectedEvent?.slug === event.slug}
            onSelect={onSelectEvent}
          />
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-neutral-800/60 flex justify-end">
        <button
          disabled={!selectedEvent}
          onClick={onNext}
          style={{
            opacity: selectedEvent ? 1 : 0.4,
            color: `${selectedEvent?.color}` || "gray",
          }}
          className="px-8 py-3 rounded bg-neutral-800 border border-neutral-700 text-base font-medium text-white shadow-md transition hover:shadow-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuer →
        </button>
      </div>
    </div>
  );
}