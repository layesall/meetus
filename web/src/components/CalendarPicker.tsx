// src/components/CalendarPicker.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface CalendarPickerProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  minNoticeHours?: number; // ex: 12h ou 24h
}

export function CalendarPicker({ selectedDate, onSelectDate, minNoticeHours = 12 }: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ];
  const daysOfWeek = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];

  // Date minimale autorisée basée sur le délai de préavis
  const minAllowedDate = new Date();
  minAllowedDate.setHours(minAllowedDate.getHours() + minNoticeHours);
  const minDateStr = minAllowedDate.toISOString().split("T")[0];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <span className="font-medium capitalize text-white">
          {monthNames[month]} {year}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-neutral-500 uppercase mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="py-1">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const isSelected = selectedDate === dateStr;
          const isDisabled = dateStr < minDateStr;

          return (
            <button
              key={dayNum}
              disabled={isDisabled}
              onClick={() => onSelectDate(dateStr)}
              className={`h-10 rounded-lg text-sm font-medium transition flex items-center justify-center ${
                isSelected
                  ? "bg-white text-neutral-950 font-bold"
                  : isDisabled
                  ? "text-neutral-700 bg-neutral-900/30 cursor-not-allowed line-through"
                  : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              {dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}