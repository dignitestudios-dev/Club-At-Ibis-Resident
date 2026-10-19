"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  loading = false,
  icon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  loading?: boolean;
  icon?: ReactNode;
}) {
  const isMobile = useIsMobile();

  const renderedMedia = icon !== undefined ? (
    icon ? <AlertDialogMedia>{icon}</AlertDialogMedia> : null
  ) : destructive ? (
    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
      <AlertTriangle className="size-5" />
    </AlertDialogMedia>
  ) : (
    <AlertDialogMedia className="bg-primary/10 text-primary dark:bg-primary/20">
      <Info className="size-5" />
    </AlertDialogMedia>
  );

  // Phones get a native-style action sheet: stacked full-width buttons within thumb reach.
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
        <SheetContent side="bottom" showCloseButton={false} className="px-5 pb-5">
          <div className="flex flex-col items-center gap-1.5 pt-1 text-center">
            {renderedMedia}
            <SheetTitle className="text-lg">{title}</SheetTitle>
            <SheetDescription className="max-w-sm text-balance">{description}</SheetDescription>
          </div>
          <div className="mt-6 flex flex-col gap-2.5">
            <Button
              size="lg"
              variant={destructive ? "destructive" : "default"}
              className="h-12 rounded-xl text-base"
              disabled={loading}
              onClick={onConfirm}
            >
              {loading && <Spinner className="mr-1.5 size-4" />}
              {confirmLabel}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-xl text-base"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
      <AlertDialogContent>
        <AlertDialogHeader className="items-center text-center">
          {renderedMedia}
          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? "destructive" : "default"}
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {loading && <Spinner className="size-4 mr-1.5" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
