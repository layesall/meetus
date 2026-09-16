"use client";

import {
  Calendar,
  Clock,
  CreditCard,
  Video,
  User,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import type { EventType, TimeSlot } from "@/lib/api";
import type { ClientState } from "./BookingWizard";

interface Props {
  event: EventType;
  slot: TimeSlot;
  client: ClientState;
}

export function BookingSummary({ event, slot, client }: Props) {
  const priceLabel =
    event.price === 0 ? "Gratuit" : `${event.price} ${event.currency || "EUR"}`;

  const dateLabel = new Date(slot.start_time).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const answeredQuestions = event.booking_questions.filter(
    (q) => client.answers[q.id] && String(client.answers[q.id]).trim() !== ""
  );

  return (
    <div className="space-y-4">
      <Section title="Prestation">
        <Row icon={<Calendar className="h-4 w-4" />} label="Date & heure">
          <span className="capitalize">{dateLabel}</span>
        </Row>
        <Row icon={<Clock className="h-4 w-4" />} label="Durée">
          {event.duration_minutes} min
        </Row>
        <Row icon={<Video className="h-4 w-4" />} label="Canal">
          <span className="capitalize">
            {client.channel.replace(/_/g, " ")}
          </span>
        </Row>
        <Row icon={<CreditCard className="h-4 w-4" />} label="Tarif">
          <span className="font-semibold text-slate-900">{priceLabel}</span>
        </Row>
      </Section>

      <Section title="Vos coordonnées">
        <Row icon={<User className="h-4 w-4" />} label="Nom">
          {client.name}
        </Row>
        <Row icon={<Mail className="h-4 w-4" />} label="Email">
          {client.email}
        </Row>
        {client.phone.trim() !== "" && (
          <Row icon={<Phone className="h-4 w-4" />} label="Téléphone">
            {client.phone}
          </Row>
        )}
      </Section>

      {answeredQuestions.length > 0 && (
        <Section title="Vos réponses">
          {answeredQuestions.map((q) => (
            <Row
              key={q.id}
              icon={<MessageSquare className="h-4 w-4" />}
              label={q.label}
            >
              <span className="whitespace-pre-line">
                {String(client.answers[q.id])}
              </span>
            </Row>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <span className="mb-3 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {title}
      </span>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <span className="text-slate-500">{label}</span>
        <span className="text-right text-slate-800">{children}</span>
      </div>
    </li>
  );
}