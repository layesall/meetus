"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EventType, TimeSlot, fetchAvailableSlots, createBooking } from "@/lib/api";
import { EventCard } from "@/components/EventCard";
import { CalendarPicker } from "@/components/CalendarPicker";
import { SlotPicker } from "@/components/SlotPicker";
import { BookingSidebar } from "@/components/BookingSidebar";
import { BookingFormStep } from "@/components/BookingFormStep";
import {
  ArrowLeft, 
  ExternalLink, 
  CheckCircle2, 
  ChevronRight,
} from "lucide-react";

interface HostInfo {
  name: string;
  role: string;
  avatarUrl: string;
  bio: string;
  websiteUrl: string;
}

interface BookingDashboardProps {
  eventTypes: EventType[];
}

export default function BookingDashboard({ eventTypes }: BookingDashboardProps) {
  // Navigation dans le mini dashboard
  // Step 1: Prestations, Step 2: Date & Créneau, Step 3: Informations, Step 4: Récapitulatif
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  // État de sélection des créneaux
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // État du formulaire
  const [clientName, setClientName] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [chosenChannel, setChosenChannel] = useState<string>("");

  // État de confirmation
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  // Chargement des créneaux
  useEffect(() => {
    if (selectedEvent && selectedDate) {
      setLoadingSlots(true);
      setSelectedSlot(null);
      fetchAvailableSlots(selectedEvent.slug, selectedDate)
        .then((res: any) => {
          // Résolution adaptative sans toucher à l'interface de l'API :
          // si res est déjà un tableau ou contient un sous-champ slots
          const fetchedSlots = Array.isArray(res) ? res : res?.slots || [];
          setSlots(fetchedSlots);
        })
        .catch((err) => console.error("Erreur chargement créneaux:", err))
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedEvent, selectedDate]);

  // Sélection d'une prestation
  const handleSelectEvent = (event: EventType) => {
    setSelectedEvent(event);
    if (event.allowed_channels && event.allowed_channels.length > 0) {
      setChosenChannel(event.allowed_channels[0]);
    }
    setStep(2);
  };

  // Parsing de la description (reprise stricte de votre logique)
  const parseDescription = (desc?: string) => {
    const lines = desc ? desc.split("\n") : [];
    const bulletPoints = lines.filter((l) => l.trim().startsWith("•"));
    const headerText = lines
      .filter((l) => !l.trim().startsWith("•") && l.trim() !== "")
      .join(" ");
    return { bulletPoints, headerText };
  };

  const { bulletPoints, headerText } = parseDescription(selectedEvent?.description);
  const price = headerText.includes("Gratuit") ? "Gratuit" : headerText || "Sur devis";
  const accentColor = selectedEvent?.color || "#3B82F6";

  // Soumission finale de la réservation
  const handleFinalSubmit = async () => {
    if (!selectedEvent || !selectedSlot) return;
    setIsSubmitting(true);
    try {
      await createBooking({
        event_type_slug: selectedEvent.slug,
        start_time: selectedSlot.start_time,
        client_name: clientName,
        client_email: clientEmail,
        ...(chosenChannel ? { location: chosenChannel } : {}),
      } as any);
      setIsConfirmed(true);
    } catch (error) {
      console.error("Erreur confirmation réservation:", error);
      alert("Une erreur est survenue lors de la réservation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between selection:bg-neutral-800">
      {/* DASHBOARD CONTAINER */}
      <main className="flex-1 flex flex-col lg:flex-row w-full mx-auto border-x border-neutral-800/60 my-0 lg:my-6 rounded-none lg:rounded-3xl overflow-hidden bg-neutral-950 shadow-2xl">
        {/* SIDEBAR*/}
          <div className="w-full lg:w-80 shrink-0 flex flex-col bg-neutral-900/60 border-b lg:border-b-0 lg:border-r border-neutral-800">
            <BookingSidebar />
          </div>

        {/* CONTENU PRINCIPAL */}
        <section className="flex-1 flex flex-col p-6 lg:p-10 min-w-0 bg-neutral-950">
          {/* STEPPER HEADER */}
          <div className="w-full mb-8 overflow-x-auto pb-2 border-b border-neutral-800">
            <div className="flex items-center justify-between min-w-[550px] pb-4">
              {[
                { num: 1, label: "Prestations" },
                { num: 2, label: "Date & Créneau" },
                { num: 3, label: "Informations" },
                { num: 4, label: "Validation" },
              ].map((s) => {
                const isActive = step >= s.num;
                const isCurrent = step === s.num;
                return (
                  <div key={s.num} className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 text-xs sm:text-sm font-semibold transition ${isActive ? "text-white" : "text-neutral-600"}`}>
                      <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${isCurrent ? "bg-white text-black" : isActive ? "bg-emerald-500 text-black" : "bg-neutral-800 text-neutral-500"}`}>
                        {s.num}
                      </span>
                      <span>{s.label}</span>
                    </div>
                    {s.num < 4 && <ChevronRight className="w-4 h-4 text-neutral-800 shrink-0 ml-1" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ECRAN DE CONFIRMATION */}
          {isConfirmed ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Rendez-vous confirmé !</h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Un e-mail de confirmation contenant les détails du rendez-vous et le lien de visioconférence vous a été envoyé à <span className="text-white font-medium">{clientEmail}</span>.
              </p>
              <button
                onClick={() => {
                  setStep(1);
                  setIsConfirmed(false);
                  setSelectedEvent(null);
                }}
                className="mt-6 px-6 py-2.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs text-white rounded-xl font-semibold transition"
              >
                Réserver une autre prestation
              </button>
            </div>
          ) : (
            <>
              {/* ÉTAPE 1: LISTE DES PRESTATIONS */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Choisissez une prestation</h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      Sélectionnez le format d&apos;échange que vous souhaitez réserver.
                    </p>
                  </div>
                  {eventTypes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {eventTypes.map((evt) => (
                        <EventCard
                          key={evt.id || evt.slug}
                          event={evt}
                          isSelected={selectedEvent?.slug === evt.slug}
                          onSelect={handleSelectEvent}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-sm text-neutral-500 border border-dashed border-neutral-800 rounded-2xl">
                      Aucune prestation disponible pour le moment.
                    </div>
                  )}
                </div>
              )}

              {/* ÉTAPE 2: DATE & CRÉNEAU */}
              {step === 2 && selectedEvent && (
                <div className="space-y-6 flex-1 flex flex-col">
                  <div>
                    <h2 className="text-xl font-bold text-white">Sélectionnez une date & heure</h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      Choisissez un créneau disponible dans le calendrier.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border border-neutral-800 bg-neutral-900/30 p-6 rounded-2xl">
                    <div className="space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                        1. Choisissez une date
                      </span>
                      <CalendarPicker
                        selectedDate={selectedDate}
                        onSelectDate={(d) => setSelectedDate(d)}
                        minNoticeHours={12}
                      />
                    </div>

                    <div className="space-y-3 border-t md:border-t-0 md:border-l border-neutral-800 pt-6 md:pt-0 md:pl-8">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                        2. Choisissez un horaire
                      </span>
                      <SlotPicker
                        slots={slots}
                        selectedSlot={selectedSlot}
                        onSelectSlot={(s) => setSelectedSlot(s)}
                        loading={loadingSlots}
                      />
                    </div>
                  </div>

                  <div className="mt-auto pt-6 flex justify-between items-center border-t border-neutral-800">
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition"
                    >
                      Retour
                    </button>
                    <button
                      disabled={!selectedSlot}
                      onClick={() => setStep(3)}
                      style={{ backgroundColor: selectedSlot ? accentColor : undefined }}
                      className={`px-6 py-2.5 rounded-xl text-xs font-bold transition ${selectedSlot ? "text-white shadow-lg" : "bg-neutral-800 text-neutral-500 cursor-not-allowed"}`}
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPES 3 & 4: FORMULAIRE ET RÉCAPITULATIF */}
              {(step === 3 || step === 4) && selectedEvent && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <BookingFormStep
                    currentStep={step === 3 ? 2 : 3}
                    eventType={selectedEvent}
                    selectedSlot={selectedSlot}
                    price={price}
                    clientName={clientName}
                    setClientName={setClientName}
                    clientEmail={clientEmail}
                    setClientEmail={setClientEmail}
                    chosenChannel={chosenChannel}
                    setChosenChannel={setChosenChannel}
                    accentColor={accentColor}
                  />

                  <div className="pt-6 flex justify-between items-center border-t border-neutral-800 mt-6">
                    <button
                      onClick={() => setStep((step - 1) as 2 | 3)}
                      className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition"
                    >
                      Retour
                    </button>

                    {step === 3 ? (
                      <button
                        disabled={!clientName.trim() || !clientEmail.trim()}
                        onClick={() => setStep(4)}
                        style={{ backgroundColor: clientName && clientEmail ? accentColor : undefined }}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold transition ${clientName && clientEmail ? "text-white shadow-lg" : "bg-neutral-800 text-neutral-500 cursor-not-allowed"}`}
                      >
                        Vérifier la réservation
                      </button>
                    ) : (
                      <button
                        disabled={isSubmitting}
                        onClick={handleFinalSubmit}
                        style={{ backgroundColor: accentColor }}
                        className="px-8 py-3 rounded-xl text-xs font-bold text-white shadow-lg hover:opacity-90 transition flex items-center gap-2"
                      >
                        {isSubmitting ? "Confirmation..." : "Confirmer la réservation"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}