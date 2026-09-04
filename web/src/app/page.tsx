import { fetchEventTypes, EventType } from "@/lib/api";
import BookingDashboard from "@/components/BookingDashboard";

export default async function HomePage() {
  let eventTypes: EventType[] = [];
  try {
    eventTypes = await fetchEventTypes();
  } catch (error) {
    console.error("Erreur chargement prestations:", error);
  }


  return <BookingDashboard eventTypes={eventTypes} />;
}