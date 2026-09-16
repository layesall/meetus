"use client";

export type BookingStep = 1 | 2 | 3;

const LABELS: Record<BookingStep, string> = {
  1: "Créneau",
  2: "Informations",
  3: "Confirmation",
};

export function BookingStepper({ current }: { current: BookingStep }) {
  return (
    <ol className="flex items-center gap-2 text-xs">
      {([1, 2, 3] as BookingStep[]).map((n, i) => {
        const isActive = n === current;
        const isDone = n < current;
        return (
          <li key={n} className="flex items-center gap-2">
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white"
                  : isDone
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              {n}
            </span>
            <span
              className={`font-medium ${
                isActive ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {LABELS[n]}
            </span>
            {i < 2 && <span className="mx-1 h-px w-6 bg-slate-200" />}
          </li>
        );
      })}
    </ol>
  );
}