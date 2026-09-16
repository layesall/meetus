// components/BookingWizard.tsx
// Booking flow — wider layout, less empty space, signature clearance.

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import {
  createBooking,
  fetchAvailableSlots,
  type EventType,
  type TimeSlot,
} from "@/lib/api";
import { BookingStepper, type BookingStep } from "./BookingStepper";
import { CalendarPicker } from "./CalendarPicker";
import { SlotPicker } from "./SlotPicker";
import { BookingForm } from "./BookingForm";
import { BookingSummary } from "./BookingSummary";

export interface ClientState {
  name: string;
  email: string;
  phone: string;
  channel: string;
  answers: Record<string, string>;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function BookingWizard({ event }: { event: EventType }) {
  const router = useRouter();
  const [step, setStep] = useState<BookingStep>(1);

  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [client, setClient] = useState<ClientState>({
    name: "",
    email: "",
    phone: "",
    channel: event.allowed_channels[0] ?? "",
    answers: {},
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadSlots = useCallback(
    async (targetDate: string) => {
      setLoadingSlots(true);
      setSlotsError(null);
      setSelectedSlot(null);
      try {
        const res = await fetchAvailableSlots(event.slug, targetDate);
        setSlots(res.slots);
      } catch (err: unknown) {
        setSlotsError(err instanceof Error ? err.message : "Erreur inconnue");
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    [event.slug]
  );

  useEffect(() => {
    void loadSlots(date);
  }, [date, loadSlots]);

  const confirm = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const booking = await createBooking({
        event_type_slug: event.slug,
        client_name: client.name,
        client_email: client.email,
        client_phone: client.phone || undefined,
        chosen_channel: client.channel,
        start_time: selectedSlot.start_time,
        duration_minutes: event.duration_minutes,
        answers: client.answers,
      });
      router.push(`/success?id=${booking.id}&token=${booking.cancel_token}`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Erreur inconnue");
      setSubmitting(false);
    }
  };

  return (
    // pb-24 : réserve l'espace nécessaire pour SignatureBadge en bas à droite
    <section className="space-y-6 pb-24">
      <BookingStepper current={step} />

      <div key={step} className="step-in">
        {step === 1 && (
          <div className="space-y-6">
            {/* Calendar — full width of the main column, no artificial max-w */}
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <CalendarPicker selectedDate={date} onSelectDate={setDate} />
            </div>

            {/* Slots — full width, more columns on wide screens */}
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <h3 className="mb-4 text-sm font-medium text-slate-700">
                Créneaux disponibles
              </h3>
              {slotsError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {slotsError}
                </p>
              ) : (
                <SlotPicker
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  loading={loadingSlots}
                />
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!selectedSlot}
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continuer
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          // Form — wider max-w (2xl → 3xl) to reduce empty side space on 22"
          <div className="mx-auto w-full max-w-3xl">
            <BookingForm
              event={event}
              value={client}
              onChange={setClient}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          </div>
        )}

        {step === 3 && selectedSlot && (
          <div className="mx-auto w-full max-w-3xl space-y-4">
            <BookingSummary event={event} slot={selectedSlot} client={client} />

            {submitError && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={confirm}
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Confirmation..." : "Confirmer la réservation"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}