"use client";

import { ChevronRight } from "lucide-react";

interface BookingStepperProps {
  currentStep: 1 | 2 | 3;
}

export function BookingStepper({ currentStep }: BookingStepperProps) {
  const steps = [
    { number: 1, label: "Date & Créneau" },
    { number: 2, label: "Vos Informations" },
    { number: 3, label: "Récapitulatif" },
  ];

  return (
    <div className="w-full mb-8 overflow-x-auto pb-2">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4 min-w-[500px] md:min-w-0">
        {steps.map((step, idx) => {
          const isActive = currentStep >= step.number;
          const isCurrent = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <div key={step.number} className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 text-sm font-semibold transition ${
                  isActive ? "text-white" : "text-neutral-600"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isCurrent
                      ? "bg-white text-black"
                      : isCompleted
                      ? "bg-emerald-500 text-black"
                      : "bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {step.number}
                </span>
                <span className="whitespace-nowrap">{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-neutral-700 ml-2 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}