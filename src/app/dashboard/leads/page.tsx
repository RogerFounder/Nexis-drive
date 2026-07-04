import Link from "next/link";
import { getActiveVertical } from "@/config/verticals";
import { listAssistenciaTecnicaLeads } from "@/server/db/repositories/assistencia-tecnica-lead.repository";
import { listEsteticaMotorLeads } from "@/server/db/repositories/estetica-motor-lead.repository";
import { StatusBadge } from "@/components/ui/status-badge";
import { PaymentStatusBadge } from "@/components/ui/payment-status-badge";
import { LeadStatusSelect } from "@/components/shared/dashboard/lead-status-select";
import { buildWhatsAppLink } from "@/lib/whatsapp-link";
import { formatCurrencyBRL } from "@/lib/currency";
import { StatCard } from "@/components/ui/stat-card";
import { listLatestLaudoIdByLeadId } from "@/server/db/repositories/laudo.repository";
import type { LeadStatus, StatusPagamento } from "@/generated/prisma/client";

// Leads change constantly — never bake the list into a build-time static page.
export const dynamic = "force-dynamic";

const STATUS_FILTERS: { value?: LeadStatus; label: string }[] = [
  { value: undefined, label: "Todos" },
  { value: "NOVO", label: "Novos" },
  { value: "CONTATADO", label: "Contatados" },
  { value: "CONVERTIDO", label: "Convertidos" },
  { value: "DESCARTADO", label: "Descartados" },
];

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

interface LeadCardData {
  id: string;
  nome: string;
  whatsapp: string;
  createdAt: Date;
  status: LeadStatus;
  identifierLabel: string;
  identifierValue: string;
  detailLabel: string;
  detailValue: string;
  whatsappMessage: string;
  valorServico: number | null;
  statusPagamento: StatusPagamento;
}

function isLeadStatus(value: string | undefined): value is LeadStatus {
  return value === "NOVO" || value === "CONTATADO" || value === "CONVERTIDO" || value === "DESCARTADO";
}

export default async function DashboardLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const status = isLeadStatus(statusParam) ? statusParam : undefined;
  const vertical = getActiveVertical();
  const laudoIdByLeadId = await listLatestLaudoIdByLeadId(vertical);

  const leads: LeadCardData[] =
    vertical === "assistencia"
      ? (await listAssistenciaTecnicaLeads(status)).map((lead) => ({
          id: lead.id,
          nome: lead.nome,
          whatsapp: lead.whatsapp,
          createdAt: lead.createdAt,
          status: lead.status,
          identifierLabel: "Dispositivo",
          identifierValue: lead.modeloDispositivo,
          detailLabel: "Problema relatado",
          detailValue: lead.descricaoProblema,
          whatsappMessage: `Olá ${lead.nome}! Vi sua solicitação sobre o ${lead.modeloDispositivo} aqui no Nexis Drive. Podemos conversar sobre o reparo?`,
          valorServico: lead.valorServico ? Number(lead.valorServico) : null,
          statusPagamento: lead.statusPagamento,
        }))
      : (await listEsteticaMotorLeads(status)).map((lead) => ({
          id: lead.id,
          nome: lead.nome,
          whatsapp: lead.whatsapp,
          createdAt: lead.createdAt,
          status: lead.status,
          identifierLabel: "Veículo",
          identifierValue: lead.veiculo,
          detailLabel: "Serviço desejado",
          detailValue: lead.servicoDesejado,
          whatsappMessage: `Olá ${lead.nome}! Vi sua solicitação sobre o ${lead.veiculo} aqui no Nexis Drive. Vamos falar sobre o serviço?`,
          valorServico: lead.valorServico ? Number(lead.valorServico) : null,
          statusPagamento: lead.statusPagamento,
        }));

  // Computed from the leads already fetched above for this view (respects
  // the active status filter) — not a separate aggregate query. Zero/null
  // values never count toward either total.
  const totalRecebido = leads
    .filter((lead) => lead.statusPagamento === "PAGO" && lead.valorServico)
    .reduce((sum, lead) => sum + (lead.valorServico as number), 0);

  const totalEmAberto = leads
    .filter((lead) => lead.statusPagamento === "PENDENTE" && lead.valorServico)
    .reduce((sum, lead) => sum + (lead.valorServico as number), 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Leads
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {leads.length} {leads.length === 1 ? "lead encontrado" : "leads encontrados"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Volume de leads" value={leads.length} tone="emphasis" />
        <StatCard label="Total recebido" value={formatCurrencyBRL(totalRecebido)} tone="success" />
        <StatCard label="Total em aberto" value={formatCurrencyBRL(totalEmAberto)} tone="warning" />
      </div>

      <nav className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const isActive = filter.value === status;
          const href = filter.value ? `/dashboard/leads?status=${filter.value}` : "/dashboard/leads";
          return (
            <Link
              key={filter.label}
              href={href}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Nenhum lead encontrado.
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Assim que alguém enviar o formulário, ele aparece aqui.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 transition-colors duration-150 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">{lead.nome}</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {DATE_FORMATTER.format(lead.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={lead.status} />
                  <PaymentStatusBadge status={lead.statusPagamento} />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                <span>
                  {lead.identifierLabel}: {lead.identifierValue}
                </span>
                <span>WhatsApp: {lead.whatsapp}</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  Valor: {formatCurrencyBRL(lead.valorServico)}
                </span>
              </div>

              <p className="mt-3 rounded-xl bg-zinc-50 px-3.5 py-2.5 text-sm leading-relaxed text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
                {lead.detailValue}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`/dashboard/leads/${lead.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 hover:opacity-90 dark:bg-white dark:text-zinc-900"
                >
                  Detalhes
                </Link>
                <LeadStatusSelect vertical={vertical} leadId={lead.id} currentStatus={lead.status} />
                <a
                  href={buildWhatsAppLink(lead.whatsapp, lead.whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors duration-150 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                >
                  Chamar no WhatsApp
                </a>
                {laudoIdByLeadId.has(lead.id) ? (
                  <Link
                    href={`/dashboard/laudo/${laudoIdByLeadId.get(lead.id)}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors duration-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Ver Laudo
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/laudo/novo/${lead.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors duration-150 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                  >
                    Gerar Laudo
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
