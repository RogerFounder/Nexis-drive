import type { LeadStatus } from "@/generated/prisma/client";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NOVO: "Novo",
  CONTATADO: "Contatado",
  CONVERTIDO: "Convertido",
  DESCARTADO: "Descartado",
};

const STATUS_STYLES: Record<LeadStatus, string> = {
  NOVO: "bg-blue-500/10 text-blue-300 ring-1 ring-blue-400/20",
  CONTATADO: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/20",
  CONVERTIDO: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/20",
  DESCARTADO: "bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-400/10",
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
