"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-[2px] dark:bg-black/60",
        className
      )}
      {...props}
    />
  )
}

/**
 * Grab handle for bottom sheets. Dragging it down follows the finger and
 * dismisses the sheet past a distance / flick-velocity threshold, otherwise
 * it springs back — the same gesture native bottom sheets use.
 */
function SheetHandle({
  popupRef,
  onDismiss,
}: {
  popupRef: React.RefObject<HTMLDivElement | null>
  onDismiss: () => void
}) {
  const drag = React.useRef<{ startY: number; startT: number; dy: number } | null>(null)

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const popup = popupRef.current
    if (!popup) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { startY: e.clientY, startT: performance.now(), dy: 0 }
    popup.style.transition = "none"
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current
    const popup = popupRef.current
    if (!d || !popup) return
    d.dy = Math.max(0, e.clientY - d.startY)
    popup.style.transform = `translateY(${d.dy}px)`
  }

  function endDrag() {
    const d = drag.current
    const popup = popupRef.current
    drag.current = null
    if (!d || !popup) return
    const velocity = d.dy / Math.max(1, performance.now() - d.startT)
    popup.style.transition = "transform 200ms ease-out"
    if (d.dy > 110 || (d.dy > 24 && velocity > 0.6)) {
      popup.style.transform = "translateY(100%)"
      window.setTimeout(onDismiss, 170)
    } else {
      popup.style.transform = ""
      window.setTimeout(() => {
        popup.style.transition = ""
      }, 220)
    }
  }

  return (
    <div
      data-slot="sheet-handle"
      aria-hidden="true"
      className="flex shrink-0 cursor-grab touch-none justify-center pt-2.5 pb-2 active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <span className="h-1.5 w-11 rounded-full bg-muted-foreground/30" />
    </div>
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  showHandle,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
  /** Bottom sheets show a swipe-to-dismiss grab handle by default. */
  showHandle?: boolean
}) {
  const popupRef = React.useRef<HTMLDivElement>(null)
  const dismissRef = React.useRef<HTMLButtonElement>(null)
  const withHandle = side === "bottom" && (showHandle ?? true)

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        ref={popupRef}
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0",
          // Bottom: full slide-up from the screen edge, native-style rounded top, capped height, home-indicator padding.
          "data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:mx-auto data-[side=bottom]:h-auto data-[side=bottom]:max-h-[92svh] data-[side=bottom]:gap-0 data-[side=bottom]:overflow-y-auto data-[side=bottom]:overscroll-contain data-[side=bottom]:rounded-t-[1.75rem] data-[side=bottom]:border-t data-[side=bottom]:pb-safe data-[side=bottom]:ease-out data-[side=bottom]:data-ending-style:translate-y-full data-[side=bottom]:data-ending-style:opacity-100 data-[side=bottom]:data-starting-style:translate-y-full data-[side=bottom]:data-starting-style:opacity-100 data-[side=bottom]:sm:max-w-xl",
          "data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=left]:sm:max-w-sm",
          "data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=right]:sm:max-w-sm",
          "data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem]",
          className
        )}
        {...props}
      >
        {withHandle && (
          <SheetHandle popupRef={popupRef} onDismiss={() => dismissRef.current?.click()} />
        )}
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3"
                size="icon-sm"
              />
            }
          >
            <XIcon
            />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
        {/* Programmatic dismiss target for the swipe-down gesture. */}
        <SheetPrimitive.Close
          ref={dismissRef}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
        />
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "font-heading text-base font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
