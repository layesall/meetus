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

  return <BookingFlow eventTypes={eventTypes} />;
}