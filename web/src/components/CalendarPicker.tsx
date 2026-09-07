// components/CalendarPicker.tsx
// Calendrier responsive, grand et aéré.

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface CalendarPickerProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  minNoticeHours?: number;
}

export function CalendarPicker({
  selectedDate,
  onSelectDate,
  minNoticeHours = 12,
}: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];
  const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const minAllowed = new Date();
  minAllowed.setHours(minAllowed.getHours() + minNoticeHours);
  const minDateStr = minAllowed.toISOString().split("T")[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-2xl font-semibold text-white capitalize">
          {monthNames[month]} {year}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-neutral-500 mb-3">
        {daysOfWeek.map((day, idx) => (
          <div key={idx}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            dayNum
          ).padStart(2, "0")}`;
          const isSelected = selectedDate === dateStr;
          const isDisabled = dateStr < minDateStr;

          return (
            <button
              key={dayNum}
              disabled={isDisabled}
              onClick={() => onSelectDate(dateStr)}
              className={`h-12 w-full rounded-xl text-base font-medium transition ${
                isSelected
                  ? "bg-white text-neutral-950 shadow-md"
                  : isDisabled
                  ? "text-neutral-700 cursor-not-allowed line-through"
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