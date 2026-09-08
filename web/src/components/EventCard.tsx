// components/EventCard.tsx

"use client";

import { EventType } from "@/lib/api";
import { Clock, Video, CheckCircle2, Sparkles } from "lucide-react";

interface EventCardProps {
  event: EventType;
  isSelected: boolean;
  onSelect: (event: EventType) => void;
}

export function EventCard({ event, isSelected, onSelect }: EventCardProps) {
  const accentColor = event.color || "#3B82F6";
  const formattedPrice = event.price === 0 ? "Gratuit" : `${event.price} ${event.currency}`;

  return (
    <div
      onClick={() => onSelect(event)}
      className={`p-6 rounded-2xl border transition cursor-pointer flex flex-col justify-between w-full ${
        isSelected
          ? "bg-neutral-900/60 border-neutral-500 shadow-xl shadow-black/40"
          : "bg-neutral-900/30 border-neutral-800/60 hover:border-neutral-600 hover:bg-neutral-900/50"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-2xl font-semibold text-white">{event.title}</h3>
        </div>

        {event.description && (
          <p className="text-base text-neutral-300 mt-3 whitespace-pre-line">
            {event.description}
          </p>
        )}

        {event.included_features && event.included_features.length > 0 && (
          <div className="mt-4 space-y-2">
            <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Inclus :
            </span>
            <ul className="space-y-1.5 text-xs text-neutral-400">
              {event.included_features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span style={{ color: accentColor }}>✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-between gap-4 mt-6 pt-4 border-t border-neutral-800/50 text-sm text-neutral-500">
        <div>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" /> {event.duration_minutes} min
          </span>
          <span className="flex items-center gap-2 capitalize">
            <Video className="w-4 h-4" />{" "}
            {event.allowed_channels.join(", ").replace(/_/g, " ")}
          </span>
        </div>
        <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold px-3 py-1 rounded bg-neutral-800 border border-neutral-700"
              style={{ color: accentColor }}
            >
              {formattedPrice}
            </span>
            {isSelected && (
              <CheckCircle2 className="w-6 h-6 shrink-0" style={{ color: accentColor }} />
            )}
          </div>
      </div>
    </div>
  );
}