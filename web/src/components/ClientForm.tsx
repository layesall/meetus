// components/ClientForm.tsx

"use client";

import { EventType } from "@/lib/api";
import { Clock } from "lucide-react";

interface ClientFormProps {
  event: EventType;
  clientName: string;
  setClientName: (val: string) => void;
  clientEmail: string;
  setClientEmail: (val: string) => void;
  clientPhone: string;
  setClientPhone: (val: string) => void;
  chosenChannel: string;
  setChosenChannel: (val: string) => void;
  customDuration: number;
  setCustomDuration: (val: number) => void;
  answers: Record<string, any>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  onBack: () => void;
  onNext: () => void;
  accentColor: string;
}

export function ClientForm({
  event,
  clientName,
  setClientName,
  clientEmail,
  setClientEmail,
  clientPhone,
  setClientPhone,
  chosenChannel,
  setChosenChannel,
  customDuration,
  setCustomDuration,
  answers,
  setAnswers,
  onBack,
  onNext,
  accentColor,
}: ClientFormProps) {
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Validation : champs de base + questions obligatoires
  const isBaseValid = clientName.trim().length >= 2 && Boolean(clientEmail.trim());
  const areQuestionsValid = event.booking_questions.every((q) => {
    if (!q.required) return true;
    const val = answers[q.id];
    return val !== undefined && val !== null && String(val).trim() !== "";
  });

  const isValid = isBaseValid && areQuestionsValid;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Vos coordonnées</h2>
        <p className="text-base text-neutral-400 mt-1">
          Complétez les informations requises pour réserver votre session.
        </p>
      </div>

      <div className="max-w-2xl bg-neutral-900/30 rounded-2xl p-8 border border-neutral-800/60 space-y-6">
        {/* Gestion de la durée personnalisée */}
        {event.is_custom_duration_allowed && (
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <label className="block text-sm font-medium text-neutral-300 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Durée personnalisée (minutes)
            </label>
            <input
              type="number"
              min={15}
              step={15}
              value={customDuration}
              onChange={(e) => setCustomDuration(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-white focus:border-neutral-500 outline-none transition"
            />
          </div>
        )}

        {/* Nom & Email */}
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Nom complet <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-white placeholder-neutral-600 focus:border-neutral-500 outline-none transition"
            placeholder="Jean Dupont"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Adresse e-mail <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-white placeholder-neutral-600 focus:border-neutral-500 outline-none transition"
            placeholder="jean@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Numéro de téléphone <span className="text-xs text-neutral-500">(Optionnel)</span>
          </label>
          <input
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-white placeholder-neutral-600 focus:border-neutral-500 outline-none transition"
            placeholder="+33 6 12 34 56 78"
          />
        </div>

        {/* Sélection du canal */}
        {event.allowed_channels?.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Canal de communication
            </label>
            <select
              value={chosenChannel}
              onChange={(e) => setChosenChannel(e.target.value)}
              className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-white capitalize focus:border-neutral-500 outline-none transition"
            >
              {event.allowed_channels.map((ch) => (
                <option key={ch} value={ch} className="bg-neutral-950">
                  {ch.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dynamic Booking Questions */}
        {event.booking_questions.length > 0 && (
          <div className="pt-4 border-t border-neutral-800/80 space-y-5">
            <h3 className="text-lg font-semibold text-white">Informations complémentaires</h3>
            {event.booking_questions.map((q) => (
              <div key={q.id}>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  {q.label} {q.required && <span className="text-red-400">*</span>}
                </label>

                {q.type === "textarea" ? (
                  <textarea
                    rows={3}
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-white placeholder-neutral-600 focus:border-neutral-500 outline-none transition"
                  />
                ) : q.type === "select" ? (
                  <select
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-white focus:border-neutral-500 outline-none transition"
                  >
                    <option value="" className="bg-neutral-950">
                      Sélectionner une option...
                    </option>
                    {q.options?.map((opt) => (
                      <option key={opt} value={opt} className="bg-neutral-950">
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={q.type === "number" ? "number" : "text"}
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-white placeholder-neutral-600 focus:border-neutral-500 outline-none transition"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 pt-6 border-t border-neutral-800/60 flex justify-between">
        <button
          onClick={onBack}
          className="text-base text-neutral-400 hover:text-white transition"
        >
          ← Retour
        </button>
        <button
          disabled={!isValid}
          onClick={onNext}
          style={{
            backgroundColor: isValid ? accentColor : undefined,
            opacity: isValid ? 1 : 0.4,
          }}
          className="px-8 py-3 rounded-xl text-base font-medium text-white shadow-md transition hover:shadow-lg"
        >
          Continuer →
        </button>
      </div>
    </div>
  );
}