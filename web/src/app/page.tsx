// src/app/page.tsx
import { fetchEventTypes, EventType } from "@/lib/api";
import { EventCard } from "@/components/EventCard";

export default async function HomePage() {
  let eventTypes: EventType[] = [];
  try {
    eventTypes = await fetchEventTypes();
  } catch (error) {
    console.error("Erreur chargement prestations:", error);
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Prestations & Rendez-vous
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Sélectionnez le type d'échange que vous souhaitez réserver.
        </p>
      </div>

      <div className="grid gap-4">
        {eventTypes.length > 0 ? (
          eventTypes.map((event) => <EventCard key={event.id} event={event} />)
        ) : (
          <div className="p-8 text-center text-sm text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
            Aucune prestation disponible pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}