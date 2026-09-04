"use client";

import { useState } from "react";
import { EventType } from "@/lib/api";
import { EventCard } from "@/components/EventCard";
import { useRouter } from "next/navigation";

interface EventSelectorProps {
  eventTypes: EventType[];
}

export function EventSelector({ eventTypes }: EventSelectorProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const router = useRouter();

  const handleSelect = (event: EventType) => {
    setSelectedEvent(event);
    router.push(`/${event.slug}`);
  };

  return (
    <div className="w-full flex-1 h-full min-h-0">
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 md:grid-rows-1 gap-0 divide-y md:divide-y-0 md:divide-x divide-neutral-800">
        {eventTypes.map((event) => (
          <EventCard
            key={event.id || event.slug}
            event={event}
            isSelected={selectedEvent?.slug === event.slug}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}