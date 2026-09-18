"use client";

import {
  Banknote,
  CalendarCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  ReceiptText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timeline } from "@/features/requests/components/timeline";
import { formatDate, formatRelative } from "@/utils/format";

interface RequestDetailSidebarProps {
  request: RequestRecord;
}

export function RequestDetailSidebar({ request }: RequestDetailSidebarProps) {
  return (
    <aside className="space-y-6" aria-label="Request sidebar and summary">
      {/* Activity Timeline Card */}
      <Card className="border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden bg-white dark:bg-card">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span
              className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <Clock className="size-3.5" />
            </span>
            <div>
              <CardTitle className="text-base font-semibold">Activity Timeline</CardTitle>
              <p className="text-xs text-muted-foreground">Audit log of all actions &amp; reviews</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <Timeline entries={request.activity} />
        </CardContent>
      </Card>

      {/* Financial & Decision Summary Card */}
      {(request.depositRequired || request.decidedAt) && (
        <Card className="border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden bg-white dark:bg-card">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span
                className="flex size-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700"
                aria-hidden="true"
              >
                <ReceiptText className="size-3.5" />
              </span>
              <div>
                <CardTitle className="text-base font-semibold">Summary</CardTitle>
                <p className="text-xs text-muted-foreground">Financial &amp; board decisions</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {request.depositRequired && (
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex size-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400"
                      aria-hidden="true"
                    >
                      <DollarSign className="size-3.5" />
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Deposit Required
                    </span>
                  </div>
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">
                    ${request.depositAmount?.toLocaleString() ?? "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 dark:border-slate-800 text-xs">
                  <span className="text-muted-foreground font-medium">Deposit Status</span>
                  {request.depositReceived ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-800/60 px-2.5 py-0.5 font-semibold text-emerald-800 dark:text-emerald-400 shadow-2xs">
                      <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      Received
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/60 px-2.5 py-0.5 font-semibold text-amber-900 dark:text-amber-400">
                      <Clock className="size-3 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                      Outstanding
                    </span>
                  )}
                </div>
              </div>
            )}

            {request.decidedAt && (
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex size-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    aria-hidden="true"
                  >
                    <CalendarCheck className="size-3.5 text-primary" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Decision Date</p>
                    <p className="text-[11px] text-muted-foreground">{formatRelative(request.decidedAt)}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/70 dark:border-slate-700">
                  {formatDate(request.decidedAt)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Deposit Refund Card */}
      {request.depositReceived && (
        <Card className="border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden bg-white dark:bg-card">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span
                className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60"
                aria-hidden="true"
              >
                <Banknote className="size-3.5" />
              </span>
              <div>
                <CardTitle className="text-base font-semibold">Refund</CardTitle>
                <p className="text-xs text-muted-foreground">Post-review return of deposit funds</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {request.refundStatus === "refunded" ? (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 dark:from-emerald-950/40 dark:via-slate-900/80 dark:to-emerald-950/20 p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex size-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
                      aria-hidden="true"
                    >
                      <CheckCircle2 className="size-4" />
                    </span>
                    <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                      Refund Processed
                    </span>
                  </div>
                  {request.depositAmount && (
                    <span className="font-mono text-base font-bold text-emerald-900 dark:text-emerald-300">
                      ${request.depositAmount.toLocaleString()}
                    </span>
                  )}
                </div>
                {request.refundDate && (
                  <div className="flex items-center justify-between text-xs text-emerald-900/80 dark:text-emerald-300/80 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/50">
                    <span className="flex items-center gap-1">
                      <CalendarCheck className="size-3 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                      Disbursement Date
                    </span>
                    <span className="font-semibold text-emerald-950 dark:text-emerald-200">{formatDate(request.refundDate)}</span>
                  </div>
                )}
                <p className="text-xs text-emerald-900/85 dark:text-emerald-300/85 leading-relaxed pt-1">
                  Your security deposit has been refunded to your original payment method.
                </p>
              </div>
            ) : request.refundStatus === "awaiting" ? (
              <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 dark:from-amber-950/40 dark:via-slate-900/80 dark:to-amber-950/20 p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex size-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300"
                      aria-hidden="true"
                    >
                      <Clock className="size-4" />
                    </span>
                    <span className="text-xs font-semibold text-amber-950 dark:text-amber-300 uppercase tracking-wider">
                      Pending Closeout
                    </span>
                  </div>
                  {request.depositAmount && (
                    <span className="font-mono text-base font-bold text-amber-900 dark:text-amber-300">
                      ${request.depositAmount.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
                  Your deposit refund is queued and will be disbursed following final project inspection and completion sign-off.
                </p>
              </div>
            ) : request.refundStatus === "no_refund" ? (
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Refund Status</span>
                  <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 font-medium text-slate-700 dark:text-slate-300">
                    No Refund Issued
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No refundable portion was returned according to ARB policy terms.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Refund Status</span>
                  <span className="text-muted-foreground italic font-medium">Eligible upon closeout</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A refund record will appear here if this request is withdrawn or completed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </aside>
  );
}
