// components/EventCard.tsx
// Carte agrandie, avec plus d'espace.

"use client";

import { EventType } from "@/lib/api";
import { Clock, Video, CheckCircle2 } from "lucide-react";

interface EventCardProps {
  event: EventType;
  isSelected: boolean;
  onSelect: (event: EventType) => void;
}

export function EventCard({ event, isSelected, onSelect }: EventCardProps) {
  const accentColor = event.color || "#3B82F6";
  const lines = event.description ? event.description.split("\n") : [];
  const bulletPoints = lines.filter((l) => l.trim().startsWith("•"));
  const headerText = lines
    .filter((l) => !l.trim().startsWith("•") && l.trim() !== "")
    .join(" ");

  return (
    <div
      onClick={() => onSelect(event)}
      className={`p-6 rounded-2xl border transition cursor-pointer ${
        isSelected
          ? "bg-neutral-900/60 border-neutral-500 shadow-xl shadow-black/40"
          : "bg-neutral-900/30 border-neutral-800/60 hover:border-neutral-600 hover:bg-neutral-900/50"
      }`}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-xl font-semibold text-white">{event.title}</h3>
        {isSelected && (
          <CheckCircle2 className="w-6 h-6 shrink-0" style={{ color: accentColor }} />
        )}
      </div>

      {headerText && (
        <p className="text-base text-neutral-300 mt-3">{headerText}</p>
      )}

      {bulletPoints.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-neutral-400">
          {bulletPoints.map((pt, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-neutral-500">•</span>
              <span>{pt.replace("•", "").trim()}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-800/50 text-sm text-neutral-500">
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4" /> {event.duration_minutes} min
        </span>
        <span className="flex items-center gap-2">
          <Video className="w-4 h-4" />{" "}
          {event.allowed_channels.join(", ").replace(/_/g, " ")}
        </span>
      </div>
    </div>
  );
}