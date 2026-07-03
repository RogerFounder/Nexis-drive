"use client";

import { useTransition, type ChangeEvent } from "react";
import { updateLeadStatus } from "@/server/actions/update-lead-status.action";
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

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const status = event.target.value as LeadStatus;
    startTransition(async () => {
      await updateLeadStatus(vertical, leadId, status);
    });
  }

  return (
    <select
      defaultValue={currentStatus}
      disabled={isPending}
      onChange={handleChange}
      className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 outline-none transition-[opacity,border-color] duration-150 focus:border-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:border-zinc-100"
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
