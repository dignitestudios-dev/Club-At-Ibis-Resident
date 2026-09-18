import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

export interface StepperStep {
  id: string;
  title: string;
}

export function Stepper({
  steps,
  currentIndex,
  className,
}: {
  steps: StepperStep[];
  currentIndex: number;
  className?: string;
}) {
  return (
    <nav aria-label="Request progress" className={cn("w-full py-2", className)}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-center",
                isLast ? "w-auto shrink-0" : "flex-1"
              )}
            >
              {/* Step Icon & Label */}
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 shadow-2xs",
                    isComplete
                      ? "bg-primary text-white"
                      : isCurrent
                        ? "bg-primary text-white ring-4 ring-primary/15"
                        : "bg-slate-100 text-slate-500 border border-border/80"
                  )}
                >
                  {isComplete ? (
                    <Check className="size-3.5 stroke-[2.5]" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </span>
                <span className="sr-only">
                  Step {index + 1} of {steps.length}: {step.title}{" "}
                  {isComplete ? "(Completed)" : isCurrent ? "(Current Step)" : ""}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "hidden sm:inline-block text-xs font-medium whitespace-nowrap transition-colors",
                    isCurrent
                      ? "font-semibold text-primary"
                      : isComplete
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div
                  aria-hidden="true"
                  className="mx-3 sm:mx-4 flex-1 h-0.5 bg-slate-200 rounded-full overflow-hidden"
                >
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      isComplete ? "w-full bg-primary" : "w-0 bg-transparent"
                    )}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
