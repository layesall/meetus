// app/page.tsx
// Home page – fetches event types and renders the booking flow.

import { fetchEventTypes, EventType } from "@/lib/api";
import { BookingFlow } from "@/components/BookingFlow";

export default async function HomePage() {
  let eventTypes: EventType[] = [];
  try {
    eventTypes = await fetchEventTypes();
  } catch (error) {
    console.error("Erreur chargement prestations:", error);
  }

  return (
    <div>
      {eventTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-screen text-neutral-500">
          <h1 className="text-2xl font-bold mb-4">Aucune prestation disponible</h1>
          <p className="text-base">
            Il n'y a actuellement aucune prestation disponible pour la réservation. Veuillez revenir plus tard.
          </p>
        </div>
      ) : (
        <BookingFlow eventTypes={eventTypes} />
      )}
    </div>
  );
}