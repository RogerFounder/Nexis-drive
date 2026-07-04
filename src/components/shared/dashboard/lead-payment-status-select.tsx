"use client";

import { useTransition, type ChangeEvent } from "react";
import { updateLeadPaymentStatus } from "@/server/actions/update-lead-payment-status.action";
import type { Vertical } from "@/config/verticals";
import type { StatusPagamento } from "@/generated/prisma/client";
import { PAYMENT_STATUS_LABELS } from "@/components/ui/payment-status-badge";

const PAYMENT_STATUS_OPTIONS: readonly StatusPagamento[] = ["PENDENTE", "PAGO"];

const TONE_CLASSES: Record<StatusPagamento, string> = {
  PENDENTE:
    "border-amber-200 bg-amber-50 text-amber-700 focus:border-amber-500 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  PAGO: "border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-500 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
};

interface LeadPaymentStatusSelectProps {
  vertical: Vertical;
  leadId: string;
  currentStatus: StatusPagamento;
}

export function LeadPaymentStatusSelect({
  vertical,
  leadId,
  currentStatus,
}: LeadPaymentStatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const statusPagamento = event.target.value as StatusPagamento;
    startTransition(async () => {
      await updateLeadPaymentStatus(vertical, leadId, statusPagamento);
    });
  }

  return (
    <select
      defaultValue={currentStatus}
      disabled={isPending}
      onChange={handleChange}
      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold outline-none transition-[opacity,border-color] duration-150 disabled:opacity-50 ${TONE_CLASSES[currentStatus]}`}
    >
      {PAYMENT_STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {PAYMENT_STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
