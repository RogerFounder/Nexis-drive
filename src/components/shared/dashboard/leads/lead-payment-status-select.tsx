"use client";

import { useRef, useTransition, type ChangeEvent } from "react";
import { updateLeadPaymentStatus } from "@/server/actions/update-lead-payment-status.action";
import { useActionErrorFeedback } from "@/hooks/use-action-error-feedback";
import type { Vertical } from "@/config/verticals";
import type { StatusPagamento } from "@/generated/prisma/client";
import { PAYMENT_STATUS_LABELS } from "@/components/ui/payment-status-badge";

const PAYMENT_STATUS_OPTIONS: readonly StatusPagamento[] = ["PENDENTE", "PAGO"];

const TONE_CLASSES: Record<StatusPagamento, string> = {
  PENDENTE: "border-amber-500/30 bg-amber-500/10 text-amber-300 focus:border-amber-500",
  PAGO: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 focus:border-emerald-500",
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
  const { error, reportError } = useActionErrorFeedback();
  const selectRef = useRef<HTMLSelectElement>(null);

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const previousValue = currentStatus;
    const statusPagamento = event.target.value as StatusPagamento;

    startTransition(async () => {
      const result = await updateLeadPaymentStatus(vertical, leadId, statusPagamento);
      if (!result.success) {
        reportError(result.error ?? "Não foi possível salvar o status de pagamento.");
        if (selectRef.current) selectRef.current.value = previousValue;
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        ref={selectRef}
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
      {error && (
        <p role="alert" className="animate-field-message text-xs font-medium text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
