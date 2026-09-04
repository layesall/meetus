"use client";

import { EventType, TimeSlot } from "@/lib/api";
import { User, Mail, Video, Calendar } from "lucide-react";

interface BookingFormStepProps {
  currentStep: 2 | 3;
  eventType: EventType;
  selectedSlot: TimeSlot | null;
  price: string;
  clientName: string;
  setClientName: (val: string) => void;
  clientEmail: string;
  setClientEmail: (val: string) => void;
  chosenChannel: string;
  setChosenChannel: (val: string) => void;
  accentColor: string;
}

export function BookingFormStep({
  currentStep,
  eventType,
  selectedSlot,
  price,
  clientName,
  setClientName,
  clientEmail,
  setClientEmail,
  chosenChannel,
  setChosenChannel,
  accentColor,
}: BookingFormStepProps) {
  if (currentStep === 2) {
    return (
      <div className="w-full max-w-2xl bg-neutral-900/40 border border-neutral-800 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Vos coordonnées</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Veuillez renseigner vos informations pour valider le rendez-vous.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-neutral-500" />
              Nom complet *
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-neutral-600 transition"
              placeholder="Ex: Jean Dupont"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-2 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-neutral-500" />
              Adresse e-mail *
            </label>
            <input
              type="email"
              required
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-neutral-600 transition"
              placeholder="jean@example.com"
            />
          </div>

          {eventType.allowed_channels?.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-2 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-neutral-500" />
                Canal de visioconférence
              </label>
              <select
                value={chosenChannel}
                onChange={(e) => setChosenChannel(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-neutral-600 transition capitalize"
              >
                {eventType.allowed_channels.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 3 && selectedSlot) {
    return (
      <div className="w-full max-w-2xl bg-neutral-900/40 border border-neutral-800 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            Récapitulatif de la réservation
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Vérifiez toutes les informations avant de confirmer.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 text-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
            <span className="text-neutral-400 text-xs sm:text-sm">Prestation</span>
            <span className="font-semibold text-white">{eventType.title}</span>
          </div>

          <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
            <span className="text-neutral-400 text-xs sm:text-sm flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-neutral-500" />
              Date & Heure
            </span>
            <span className="font-semibold text-white capitalize text-xs sm:text-sm text-right">
              {new Date(selectedSlot.start_time).toLocaleString("fr-FR", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </span>
          </div>

          <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
            <span className="text-neutral-400 text-xs sm:text-sm flex items-center gap-1.5">
              <Video className="w-4 h-4 text-neutral-500" />
              Canal choisi
            </span>
            <span className="font-semibold text-white capitalize text-xs sm:text-sm">
              {chosenChannel.replace("_", " ")}
            </span>
          </div>

          <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800">
            <span className="text-neutral-400 text-xs sm:text-sm flex items-center gap-1.5">
              <User className="w-4 h-4 text-neutral-500" />
              Participant
            </span>
            <span className="font-semibold text-white text-xs sm:text-sm text-right">
              {clientName} ({clientEmail})
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-neutral-400 text-xs sm:text-sm">Prix total</span>
            <span className="font-bold text-lg" style={{ color: accentColor }}>
              {price}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}