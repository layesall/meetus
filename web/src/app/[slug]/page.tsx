// src/app/[slug]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import {
  fetchEventTypeBySlug,
  fetchAvailableSlots,
  createBooking,
  EventType,
  TimeSlot,
} from "@/lib/api";
import { CalendarPicker } from "@/components/CalendarPicker";
import { SlotPicker } from "@/components/SlotPicker";
import { Clock, Video, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Formulaire client
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [chosenChannel, setChosenChannel] = useState("google_meet");

  useEffect(() => {
    fetchEventTypeBySlug(slug)
      .then((data) => {
        setEventType(data);
        if (data.allowed_channels.length > 0) {
          setChosenChannel(data.allowed_channels[0]);
        }
      })
      .catch((err) => setErrorMsg(err.message));
  }, [slug]);

  useEffect(() => {
    if (slug && selectedDate) {
      setLoadingSlots(true);
      fetchAvailableSlots(slug, selectedDate)
        .then((data) => {
          setSlots(data.slots);
          setSelectedSlot(null);
        })
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false));
    }
  }, [slug, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await createBooking({
        event_type_slug: slug,
        client_name: clientName,
        client_email: clientEmail,
        chosen_channel: chosenChannel,
        start_time: selectedSlot.start_time,
      });

      router.push("/success");
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de la réservation.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!eventType) {
    return (
      <div className="text-center py-12 text-neutral-500 text-sm">
        Chargement des détails...
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux prestations
      </Link>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        {/* Détails à gauche */}
        <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-neutral-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-500 tracking-wider uppercase">
              Rendez-vous
            </span>
            <h1 className="text-xl font-bold text-white mt-1">
              {eventType.title}
            </h1>
            <p className="text-sm text-neutral-400 mt-2">
              {eventType.description}
            </p>

            <div className="mt-6 space-y-3 text-xs text-neutral-300 font-medium">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-500" />
                <span>{eventType.duration_minutes} min</span>
              </div>
              <div className="flex items-center gap-2 capitalize">
                <Video className="w-4 h-4 text-neutral-500" />
                <span>{chosenChannel.replace("_", " ")}</span>
              </div>
            </div>
          </div>

          {selectedSlot && (
            <div className="mt-8 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700/50 text-xs">
              <span className="text-neutral-400">Créneau sélectionné :</span>
              <div className="text-white font-medium mt-0.5">
                {new Date(selectedSlot.start_time).toLocaleString("fr-FR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </div>
            </div>
          )}
        </div>

        {/* Formulaire ou Calendrier à droite */}
        <div className="lg:col-span-8 p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {!selectedSlot ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-neutral-300 mb-3">
                  1. Choisir une date
                </h3>
                <CalendarPicker
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-300 mb-3">
                  2. Choisir un horaire
                </h3>
                <SlotPicker
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  loading={loadingSlots}
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">
                  Vos informations
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="text-xs text-neutral-400 hover:text-white transition"
                >
                  Changer de créneau
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-neutral-600"
                  placeholder="Ex: Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">
                  Adresse e-mail *
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-neutral-600"
                  placeholder="jean@example.com"
                />
              </div>

              {eventType.allowed_channels.length > 1 && (
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Canal souhaité
                  </label>
                  <select
                    value={chosenChannel}
                    onChange={(e) => setChosenChannel(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-neutral-600"
                  >
                    {eventType.allowed_channels.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 bg-white text-neutral-950 hover:bg-neutral-200 font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50"
              >
                {submitting ? "Confirmation en cours..." : "Confirmer le rendez-vous"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}