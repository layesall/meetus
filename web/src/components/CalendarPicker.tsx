"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarPickerProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  minNoticeHours?: number;
}

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

export function CalendarPicker({
  selectedDate,
  onSelectDate,
  minNoticeHours = 0,
}: CalendarPickerProps) {
  const initial = selectedDate ? new Date(selectedDate) : new Date();
  const [view, setView] = useState({ y: initial.getFullYear(), m: initial.getMonth() });

  const minDate = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + minNoticeHours);
    d.setHours(0, 0, 0, 0);
    return toISO(d.getFullYear(), d.getMonth(), d.getDate());
  }, [minNoticeHours]);

  const todayISO = useMemo(() => {
    const d = new Date();
    return toISO(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const offset = (first.getDay() + 6) % 7; // lundi = 0
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const arr: (number | null)[] = [];
    for (let i = 0; i < offset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [view]);

  const goPrev = () =>
    setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const goNext = () =>
    setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));

  return (
    <div className="select-none">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">
          {MONTHS[view.m]} {view.y}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Mois précédent"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Mois suivant"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {DAYS.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;

          const iso = toISO(view.y, view.m, day);
          const isSelected = iso === selectedDate;
          const isToday = iso === todayISO;
          const isDisabled = iso < minDate;

          const base =
            "relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition";
          const state = isSelected
            ? "bg-slate-900 text-white shadow-sm"
            : isDisabled
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-700 hover:bg-slate-100";

          return (
            <button
              key={iso}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(iso)}
              className={`${base} ${state}`}
            >
              {day}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-sky-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}