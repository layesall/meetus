// src/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export interface EventType {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration_minutes: number;
  buffer_time_minutes: number;
  allowed_channels: string[];
  is_active: boolean;
  color?: string;
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
}

// 1. Récupérer la liste des prestations
export async function fetchEventTypes(): Promise<EventType[]> {
  const res = await fetch(`${API_BASE_URL}/bookings/event-types`, { cache: "no-store" });
  if (!res.ok) throw new Error("Impossible de charger les prestations");
  return res.json();
}

// 2. Récupérer les détails d'une prestation par slug
export async function fetchEventTypeBySlug(slug: string): Promise<EventType> {
  const res = await fetch(`${API_BASE_URL}/bookings/event-types/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Prestation introuvable");
  return res.json();
}

// 3. Récupérer les créneaux disponibles pour une date donnée (CORRIGÉ)
export async function fetchAvailableSlots(slug: string, dateStr: string): Promise<SlotsResponse> {
  const res = await fetch(
    `${API_BASE_URL}/bookings/slots?event_type_slug=${slug}&target_date=${dateStr}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Erreur lors du chargement des créneaux");
  return res.json();
}

// 4. Créer un rendez-vous
export async function createBooking(payload: BookingPayload) {
  const res = await fetch(`${API_BASE_URL}/bookings/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Erreur lors de la réservation");
  }
  return res.json();
}