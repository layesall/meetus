// src/components/EventCard.tsx
import Link from "next/link";
import { Clock, Video, ArrowRight } from "lucide-react";
import { EventType } from "@/lib/api";

interface EventCardProps {
  event: EventType;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/${event.slug}`}
      className="group block p-6 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 hover:bg-neutral-800/50 transition-all"
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-white group-hover:text-neutral-200">
            {event.title}
          </h2>
          <p className="text-sm text-neutral-400 mt-1 line-clamp-2">
            {event.description || "Aucune description."}
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-neutral-600 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 ml-4" />
      </div>

      <div className="flex items-center gap-4 mt-6 text-xs text-neutral-400 font-medium">
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-neutral-500" />
          {event.duration_minutes} min
        </span>
        <span className="flex items-center gap-1.5 capitalize">
          <Video className="w-4 h-4 text-neutral-500" />
          {event.allowed_channels.join(", ").replace("_", " ")}
        </span>
      </div>
    </Link>
  );
}