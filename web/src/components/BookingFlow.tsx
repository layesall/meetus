// components/BookingFlow.tsx

"use client";

import { useState, useEffect } from "react";
import { EventType, TimeSlot, fetchAvailableSlots, createBooking } from "@/lib/api";
import { BookingSidebar } from "./BookingSidebar";
import { EventSelection } from "./EventSelection";
import { DateTimeSelection } from "./DateTimeSelection";
import { ClientForm } from "./ClientForm";
import { BookingSummary } from "./BookingSummary";
import { Confirmation } from "./Confirmation";

interface BookingFlowProps {
  eventTypes: EventType[];
}

export function BookingFlow({ eventTypes }: BookingFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Form State
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [chosenChannel, setChosenChannel] = useState("");
  const [customDuration, setCustomDuration] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (selectedEvent && selectedDate) {
      setLoadingSlots(true);
      setSelectedSlot(null);
      fetchAvailableSlots(selectedEvent.slug, selectedDate)
        .then((res) => {
          const fetchedSlots = Array.isArray(res) ? res : res?.slots || [];
          setSlots(fetchedSlots);
        })
        .catch((err) => console.error("Erreur lors du chargement des créneaux :", err))
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedEvent, selectedDate]);

  const handleSelectEvent = (event: EventType) => {
    setSelectedEvent(event);
    setAnswers({});
    setCustomDuration(event.duration_minutes);
    if (event.allowed_channels?.length) {
      setChosenChannel(event.allowed_channels[0]);
    }
  };

  const handleFinalSubmit = async () => {
    if (!selectedEvent || !selectedSlot) return;
    setIsSubmitting(true);
    try {
      await createBooking({
        event_type_slug: selectedEvent.slug,
        start_time: selectedSlot.start_time,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone.trim() || undefined,
        chosen_channel: chosenChannel,
        duration_minutes: selectedEvent.is_custom_duration_allowed
          ? customDuration
          : undefined,
        answers: answers,
      });
      setIsConfirmed(true);
    } catch (error: any) {
      console.error("Booking error:", error);
      alert(error.message || "Une erreur est survenue lors de la réservation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setIsConfirmed(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setAnswers({});
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100dvh-120px)] w-full gap-6 lg:gap-10 px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
      <div className="w-full lg:w-40 shrink-0 lg:self-stretch">
        <BookingSidebar />
      </div>

      <div className="flex-1 min-w-0">
        <div className="w-full max-w-7xl mx-auto min-h-full">
          {isConfirmed ? (
            <Confirmation clientEmail={clientEmail} onReset={handleReset} />
          ) : (
            <>
              {step === 1 && (
                <EventSelection
                  eventTypes={eventTypes}
                  selectedEvent={selectedEvent}
                  onSelectEvent={handleSelectEvent}
                  onNext={() => setStep(2)}
                />
              )}
              {step === 2 && selectedEvent && (
                <DateTimeSelection
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  slots={slots}
                  loadingSlots={loadingSlots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                  accentColor={selectedEvent.color || "#3B82F6"}
                />
              )}
              {step === 3 && selectedEvent && selectedSlot && (
                <ClientForm
                  event={selectedEvent}
                  clientName={clientName}
                  setClientName={setClientName}
                  clientEmail={clientEmail}
                  setClientEmail={setClientEmail}
                  clientPhone={clientPhone}
                  setClientPhone={setClientPhone}
                  chosenChannel={chosenChannel}
                  setChosenChannel={setChosenChannel}
                  customDuration={customDuration}
                  setCustomDuration={setCustomDuration}
                  answers={answers}
                  setAnswers={setAnswers}
                  onBack={() => setStep(2)}
                  onNext={() => setStep(4)}
                  accentColor={selectedEvent.color || "#3B82F6"}
                />
              )}
              {step === 4 && selectedEvent && selectedSlot && (
                <BookingSummary
                  event={selectedEvent}
                  slot={selectedSlot}
                  clientName={clientName}
                  clientEmail={clientEmail}
                  clientPhone={clientPhone}
                  chosenChannel={chosenChannel}
                  customDuration={customDuration}
                  answers={answers}
                  onBack={() => setStep(3)}
                  onSubmit={handleFinalSubmit}
                  isSubmitting={isSubmitting}
                  accentColor={selectedEvent.color || "#3B82F6"}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}