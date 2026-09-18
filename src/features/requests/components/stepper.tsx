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
    <ol className={cn("flex w-full items-start gap-1.5", className)}>
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step.id} className="flex flex-1 flex-col gap-2">
            <div
              className={cn(
                "h-1.5 w-full rounded-full transition-colors",
                isComplete || isCurrent ? "bg-primary" : "bg-border"
              )}
            />
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                  isComplete
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border border-primary text-primary"
                      : "border border-border text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="size-2.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  "hidden truncate text-xs font-medium sm:block",
                  isCurrent
                    ? "text-foreground"
                    : isComplete
                      ? "text-foreground/80"
                      : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
