import * as React from "react"
import { cn } from "@/utils/cn"

export type InputProps = React.ComponentProps<"input">;

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  function Input({ className, type, onWheel, ...props }, ref) {
    const isNumber = type === "number";
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "h-10 w-full min-w-0 rounded-lg border border-input bg-white px-3 py-2 text-sm transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 shadow-xs hover:border-foreground/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/60 disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:bg-card dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          // Hide the native up/down spinner (Chrome/Safari + Firefox) on
          // number fields — it's not part of the design and its scroll
          // affordance is exactly what onWheel below is turning off.
          isNumber &&
            "[appearance:textfield] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none",
          className
        )}
        onWheel={
          isNumber
            ? (e) => {
                // Browsers change a focused number input's value on mouse-wheel
                // scroll. Blurring on wheel lets the page scroll normally
                // instead of silently editing the value underneath the cursor.
                e.currentTarget.blur();
                onWheel?.(e);
              }
            : onWheel
        }
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
