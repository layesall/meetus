// components/CalendarPicker.tsx
// Minimal calendar — larger cells for readability.

"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  minNoticeHours?: number;
}

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function CalendarPicker({
  selectedDate,
  onSelectDate,
  minNoticeHours = 12,
}: Props) {
  const [current, setCurrent] = useState(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDayIdx = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const minAllowed = new Date();
  minAllowed.setHours(minAllowed.getHours() + minNoticeHours);
  const minStr = minAllowed.toISOString().slice(0, 10);
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrent(new Date(year, month - 1, 1))}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-base font-semibold text-slate-900">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setCurrent(new Date(year, month + 1, 1))}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Mois suivant"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
        {DAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstDayIdx }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;
          const disabled = dateStr < minStr;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(dateStr)}
              className={[
                "h-12 w-full rounded-lg text-sm font-medium transition",
                isSelected
                  ? "bg-slate-900 text-white shadow-sm"
                  : disabled
                  ? "cursor-not-allowed text-slate-300"
                  : isToday
                  ? "text-sky-600 ring-1 ring-inset ring-sky-200 hover:bg-sky-50"
                  : "text-slate-700 hover:bg-slate-100",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}