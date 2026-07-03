import type { LeadStatus } from "@/generated/prisma/client";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NOVO: "Novo",
  CONTATADO: "Contatado",
  CONVERTIDO: "Convertido",
  DESCARTADO: "Descartado",
};

const STATUS_STYLES: Record<LeadStatus, string> = {
  NOVO: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/10 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20",
  CONTATADO:
    "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  CONVERTIDO:
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  DESCARTADO:
    "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-500/10 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-400/10",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
