import { getActiveVertical } from "@/config/verticals";
import { countAssistenciaTecnicaLeadsByStatus } from "@/server/db/repositories/assistencia-tecnica-lead.repository";
import { countEsteticaMotorLeadsByStatus } from "@/server/db/repositories/estetica-motor-lead.repository";
import { StatCard } from "@/components/ui/stat-card";
import type { LeadStatus } from "@/generated/prisma/client";

// Leads change constantly — never bake counts into a build-time static page.
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<LeadStatus, string> = {
  NOVO: "Novos",
  CONTATADO: "Contatados",
  CONVERTIDO: "Convertidos",
  DESCARTADO: "Descartados",
};

const VERTICAL_LABELS = {
  assistencia: "Assistência Técnica",
  estetica: "Estética de Motores",
} as const;

export default async function DashboardOverviewPage() {
  const vertical = getActiveVertical();
  const counts =
    vertical === "assistencia"
      ? await countAssistenciaTecnicaLeadsByStatus()
      : await countEsteticaMotorLeadsByStatus();

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Visão geral
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Vertente ativa: {VERTICAL_LABELS[vertical]}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total de leads" value={total} tone="emphasis" />
        {(Object.entries(counts) as [LeadStatus, number][]).map(([status, count]) => (
          <StatCard key={status} label={STATUS_LABELS[status]} value={count} />
        ))}
      </div>
    </div>
  );
}
