// components/BookingStepper.tsx
// Barre de progression discrète mais visible.

"use client";

interface BookingStepperProps {
  currentStep: 1 | 2 | 3 | 4;
}

export function BookingStepper({ currentStep }: BookingStepperProps) {
  const steps = ["Prestation", "Date", "Coordonnées", "Récap"];
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm text-neutral-500 mb-1">
        {steps.map((label, idx) => (
          <span
            key={idx}
            className={`transition ${
              currentStep >= idx + 1 ? "text-white font-medium" : ""
            }`}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="relative w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}