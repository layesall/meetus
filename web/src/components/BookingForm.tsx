"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { BookingQuestion, EventType } from "@/lib/api";
import { isValidEmail, isValidPhone, cn } from "@/lib/utils";
import type { ClientState } from "./BookingWizard";

interface Props {
  event: EventType;
  value: ClientState;
  onChange: (next: ClientState) => void;
  onBack: () => void;
  onNext: () => void;
}

const baseInput =
  "w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:ring-2";
const okInput =
  "border-slate-200 focus:border-slate-900 focus:ring-slate-100";
const badInput =
  "border-red-300 focus:border-red-500 focus:ring-red-100";

type Touched = { name: boolean; email: boolean; phone: boolean };

export function BookingForm({ event, value, onChange, onBack, onNext }: Props) {
  const [touched, setTouched] = useState<Touched>({
    name: false,
    email: false,
    phone: false,
  });

  const patch = (p: Partial<ClientState>) => onChange({ ...value, ...p });

  const setAnswer = (id: string, v: string) =>
    onChange({ ...value, answers: { ...value.answers, [id]: v } });

  const emailError =
    touched.email && !isValidEmail(value.email)
      ? "Adresse e-mail invalide"
      : null;
  const phoneError =
    touched.phone && value.phone.length > 0 && !isValidPhone(value.phone)
      ? "Numéro de téléphone invalide (6 à 15 chiffres)"
      : null;
  const nameError =
    touched.name && value.name.trim().length < 2
      ? "Nom requis (2 caractères min.)"
      : null;

  const canContinue =
    value.name.trim().length >= 2 &&
    isValidEmail(value.email) &&
    (value.phone.length === 0 || isValidPhone(value.phone));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true });
    if (canContinue) onNext();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">
          Vos informations
        </h3>

        <Field label="Nom complet" required error={nameError}>
          <input
            type="text"
            autoComplete="name"
            value={value.name}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            onChange={(e) => patch({ name: e.target.value })}
            className={cn(baseInput, nameError ? badInput : okInput)}
          />
        </Field>

        <Field label="Email" required error={emailError}>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={value.email}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            onChange={(e) => patch({ email: e.target.value })}
            className={cn(baseInput, emailError ? badInput : okInput)}
          />
        </Field>

        <Field label="Téléphone" error={phoneError}>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={value.phone}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            onChange={(e) => patch({ phone: e.target.value })}
            className={cn(baseInput, phoneError ? badInput : okInput)}
          />
        </Field>

        {event.allowed_channels.length > 1 && (
          <Field label="Canal de communication" required>
            <select
              required
              value={value.channel}
              onChange={(e) => patch({ channel: e.target.value })}
              className={cn(baseInput, okInput)}
            >
              {event.allowed_channels.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </Field>
        )}

        {event.booking_questions.length > 0 && (
          <div className="space-y-4 border-t border-slate-100 pt-4">
            {event.booking_questions.map((q) => (
              <QuestionField
                key={q.id}
                question={q}
                value={value.answers[q.id] ?? ""}
                onChange={(v) => setAnswer(q.id, v)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <button
          type="submit"
          disabled={!canContinue}
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continuer
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      )}
    </label>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: BookingQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  const className = cn(baseInput, okInput);

  if (question.type === "textarea") {
    return (
      <Field label={question.label} required={question.required}>
        <textarea
          required={question.required}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      </Field>
    );
  }

  if (question.type === "select") {
    return (
      <Field label={question.label} required={question.required}>
        <select
          required={question.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        >
          <option value="">— Sélectionner —</option>
          {(question.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </Field>
    );
  }

  return (
    <Field label={question.label} required={question.required}>
      <input
        type={question.type === "number" ? "number" : "text"}
        required={question.required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
      />
    </Field>
  );
}