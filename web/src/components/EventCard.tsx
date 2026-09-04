"use client";

import { EventType } from "@/lib/api";
import { Check, Clock, Video } from "lucide-react";

interface EventCardProps {
  event: EventType;
  isSelected: boolean;
  onSelect: (event: EventType) => void;
}

export function EventCard({ event, isSelected, onSelect }: EventCardProps) {
  // Extraction des lignes de la description
  const lines = event.description ? event.description.split("\n") : [];

  // Lignes qui commencent par '•'
  const bulletPoints = lines.filter((l) => l.trim().startsWith("•"));
  // Texte d'en-tête (tarifs, durée, etc.)
  const headerText = lines
    .filter((l) => !l.trim().startsWith("•") && l.trim() !== "")
    .join(" ");

  // Couleur personnalisée depuis l'API (avec fallback bleu)
  const accentColor = event.color || "#3B82F6";

  return (
    <div
      onClick={() => onSelect(event)}
      style={{
        borderColor: isSelected ? accentColor : undefined,
        boxShadow: isSelected ? `0 0 30px -5px ${accentColor}40` : undefined,
      }}
      className={`relative w-full h-full flex flex-col justify-between p-6 lg:p-8 rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? "bg-neutral-900 scale-[1.005]"
          : "bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/40"
      }`}
    >
      {/* Barre d'accentuation supérieure colorée */}
      <div
        className="absolute top-0 left-0 right-0 h-2 transition-opacity"
        style={{
          backgroundColor: accentColor,
          opacity: isSelected ? 1 : 0.35,
        }}
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1">
        {/* Titre avec pastille de couleur */}
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="w-3.5 h-3.5 rounded-full shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {event.title}
          </h3>
        </div>

        {/* Résumé / Prix */}
        {headerText && (
          <p className="text-sm sm:text-base text-neutral-200 font-medium mt-4 bg-neutral-900/90 p-3.5 rounded-xl border border-neutral-800/80 leading-relaxed shrink-0">
            {headerText}
          </p>
        )}

        {/* Puces "Au programme" */}
        {bulletPoints.length > 0 && (
          <div className="mt-6 space-y-3 flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
              Au programme
            </span>
            <div className="space-y-2.5">
              {bulletPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300 leading-snug"
                >
                  <Check
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: accentColor }}
                  />
                  <span>{pt.replace("•", "").trim()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges Durée & Canal */}
        <div className="flex flex-wrap items-center gap-2.5 mt-auto pt-6 border-t border-neutral-800/60 text-xs sm:text-sm text-neutral-300 shrink-0">
          <span className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-neutral-400 shrink-0" />{" "}
            {event.duration_minutes} min
          </span>
          <span className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg capitalize">
            <Video className="w-4 h-4 text-neutral-400 shrink-0" />{" "}
            {event.allowed_channels.join(", ").replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Bouton d'action ancré en bas */}
      <button
        type="button"
        style={{
          backgroundColor: accentColor,
          color: "#eee"
        }}
        className={`w-full mt-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 ${
          isSelected
            ? "shadow-lg scale-[1.01]"
            : "bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800 hover:text-white"
        }`}
      >
        {isSelected ? "Sélectionné" : "Choisir ce service"}
      </button>
    </div>
  );
}