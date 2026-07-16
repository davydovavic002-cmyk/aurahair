import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

const STEPS = [
  { id: "calendar", label: "Date" },
  { id: "details", label: "Details" },
  { id: "success", label: "Done" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

interface BookingStepIndicatorProps {
  current: StepId;
}

export default function BookingStepIndicator({ current }: BookingStepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <div className="flex items-center gap-0 border-b border-border px-5 py-3">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium transition-colors duration-300",
                  done && "bg-bordeaux text-white",
                  active && "border-2 border-bordeaux bg-bordeaux-soft text-bordeaux",
                  !done && !active && "border border-border text-dim",
                )}
              >
                {done ? <Check className="h-3 w-3" aria-hidden /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[9px] uppercase tracking-[0.15em]",
                  active ? "text-bordeaux" : "text-dim",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 mb-4 h-px flex-1 transition-colors duration-300",
                  i < currentIndex ? "bg-bordeaux/40" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
