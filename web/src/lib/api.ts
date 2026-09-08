// src/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export interface BookingQuestion {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "select";
  required: boolean;
  options?: string[];
}

export interface EventType {
  id: string;
  title: string;
  slug: string;
  description?: string;
  included_features: string[];
  price: number;
  currency: string;
  duration_minutes: number;
  is_custom_duration_allowed: boolean;
  buffer_time_minutes: number;
  allowed_channels: string[];
  booking_questions: BookingQuestion[];
  color: string;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
}

export interface SlotsResponse {
  date: string;
  slots: TimeSlot[];
}

export interface BookingPayload {
  event_type_slug: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  chosen_channel: string;
  start_time: string;
  duration_minutes?: number;
  answers: Record<string, any>;
}

export interface BookingResponse {
  id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  chosen_channel: string;
  start_time: string;
  end_time: string;
  total_price: number;
  answers: Record<string, any>;
  google_meet_link?: string;
  status: string;
  cancel_token: string;
}

export async function fetchEventTypes(): Promise<EventType[]> {
  const res = await fetch(`${API_BASE_URL}/bookings/event-types`, { cache: "no-store" });
  if (!res.ok) throw new Error("Impossible de charger les prestations");
  return res.json();
}

export async function fetchEventTypeBySlug(slug: string): Promise<EventType> {
  const res = await fetch(`${API_BASE_URL}/bookings/event-types/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Prestation introuvable");
  return res.json();
}

export async function fetchAvailableSlots(slug: string, dateStr: string): Promise<SlotsResponse> {
  const res = await fetch(
    `${API_BASE_URL}/bookings/slots?event_type_slug=${slug}&target_date=${dateStr}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Erreur lors du chargement des créneaux");
  return res.json();
}

export async function createBooking(payload: BookingPayload): Promise<BookingResponse> {
  const res = await fetch(`${API_BASE_URL}/bookings/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || errorData.detail || "Erreur lors de la réservation");
  }
  return res.json();
}