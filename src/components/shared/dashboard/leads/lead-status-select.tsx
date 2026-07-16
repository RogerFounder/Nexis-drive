"use client";

import { useRef, useTransition, type ChangeEvent } from "react";
import { updateLeadStatus } from "@/server/actions/update-lead-status.action";
import { useActionErrorFeedback } from "@/hooks/use-action-error-feedback";
import type { Vertical } from "@/config/verticals";
import type { LeadStatus } from "@/generated/prisma/client";
import { STATUS_LABELS } from "@/components/ui/status-badge";

const STATUS_OPTIONS: readonly LeadStatus[] = ["NOVO", "CONTATADO", "CONVERTIDO", "DESCARTADO"];

interface LeadStatusSelectProps {
  vertical: Vertical;
  leadId: string;
  currentStatus: LeadStatus;
}

export function LeadStatusSelect({ vertical, leadId, currentStatus }: LeadStatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const { error, reportError } = useActionErrorFeedback();
  const selectRef = useRef<HTMLSelectElement>(null);

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const previousValue = currentStatus;
    const status = event.target.value as LeadStatus;

    startTransition(async () => {
      const result = await updateLeadStatus(vertical, leadId, status);
      if (!result.success) {
        reportError(result.error ?? "Não foi possível salvar o status.");
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
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-200 outline-none transition-[opacity,border-color] duration-150 focus:border-zinc-100 disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status} className="bg-zinc-900 text-zinc-100">
            {STATUS_LABELS[status]}
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
