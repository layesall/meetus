// components/ClientForm.tsx
// Formulaire agrandi.

"use client";

import { useState } from "react";

interface ClientFormProps {
  clientName: string;
  setClientName: (val: string) => void;
  clientEmail: string;
  setClientEmail: (val: string) => void;
  chosenChannel: string;
  setChosenChannel: (val: string) => void;
  allowedChannels: string[];
  onBack: () => void;
  onNext: () => void;
  accentColor: string;
}

export function ClientForm({
  clientName: externalName,
  setClientName,
  clientEmail: externalEmail,
  setClientEmail,
  chosenChannel,
  setChosenChannel,
  allowedChannels,
  onBack,
  onNext,
  accentColor,
}: ClientFormProps) {
  const [localName, setLocalName] = useState(externalName);
  const [localEmail, setLocalEmail] = useState(externalEmail);

  const handleBlurName = () => {
    if (localName !== externalName) setClientName(localName);
  };
  const handleBlurEmail = () => {
    if (localEmail !== externalEmail) setClientEmail(localEmail);
  };

  const handleNext = () => {
    setClientName(localName);
    setClientEmail(localEmail);
    if (localName.trim() && localEmail.trim()) onNext();
  };

  const isValid = localName.trim() && localEmail.trim();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Vos coordonnées</h2>
        <p className="text-base text-neutral-400 mt-1">
          Remplissez ces champs pour finaliser.
        </p>
      </div>

      <div className="max-w-2xl bg-neutral-900/30 rounded-2xl p-8 border border-neutral-800/60 space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Nom complet
          </label>
          <input
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={handleBlurName}
            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-white text-base placeholder-neutral-600 focus:border-neutral-500 outline-none transition"
            placeholder="Jean Dupont"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Adresse e-mail
          </label>
          <input
            type="email"
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
            onBlur={handleBlurEmail}
            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-white text-base placeholder-neutral-600 focus:border-neutral-500 outline-none transition"
            placeholder="jean@example.com"
          />
        </div>

        {allowedChannels?.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Canal de visio
            </label>
            <select
              value={chosenChannel}
              onChange={(e) => setChosenChannel(e.target.value)}
              className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 text-white text-base focus:border-neutral-500 outline-none transition"
            >
              {allowedChannels.map((ch) => (
                <option key={ch} value={ch} className="bg-neutral-950">
                  {ch.replace("_", " ")}
                </option>
              ))}
            </select>
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
          onClick={handleNext}
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