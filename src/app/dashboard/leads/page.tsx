import Link from "next/link";
import { getActiveVertical } from "@/config/verticals";
import {
  listAssistenciaTecnicaLeads,
  countAssistenciaTecnicaLeads,
  sumAssistenciaTecnicaLeadFinancials,
} from "@/server/db/repositories/assistencia-tecnica-lead.repository";
import {
  listEsteticaMotorLeads,
  countEsteticaMotorLeads,
  sumEsteticaMotorLeadFinancials,
} from "@/server/db/repositories/estetica-motor-lead.repository";
import { StatusBadge } from "@/components/ui/status-badge";
import { LeadStatusSelect } from "@/components/shared/dashboard/leads/lead-status-select";
import { LeadPaymentStatusSelect } from "@/components/shared/dashboard/leads/lead-payment-status-select";
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

const PAGE_SIZE = 20;

interface LeadCardData {
  id: string;
  nome: string;
  whatsapp: string;
  createdAt: Date;
  status: LeadStatus;
  identifierLabel: string;
  identifierValue: string;
  whatsappMessage: string;
  valorServico: number | null;
  statusPagamento: StatusPagamento;
}

function isLeadStatus(value: string | undefined): value is LeadStatus {
  return value === "NOVO" || value === "CONTATADO" || value === "CONVERTIDO" || value === "DESCARTADO";
}

function parsePage(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export default async function DashboardLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status: statusParam, page: pageParam } = await searchParams;
  const status = isLeadStatus(statusParam) ? statusParam : undefined;
  const page = parsePage(pageParam);
  const vertical = getActiveVertical();
  const pagination = { skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE };

  const [laudoIdByLeadId, totalCount, financialSummary] =
    vertical === "assistencia"
      ? await Promise.all([
          listLatestLaudoIdByLeadId(vertical),
          countAssistenciaTecnicaLeads(status),
          sumAssistenciaTecnicaLeadFinancials(status),
        ])
      : await Promise.all([
          listLatestLaudoIdByLeadId(vertical),
          countEsteticaMotorLeads(status),
          sumEsteticaMotorLeadFinancials(status),
        ]);

  const leads: LeadCardData[] =
    vertical === "assistencia"
      ? (await listAssistenciaTecnicaLeads(status, pagination)).map((lead) => ({
          id: lead.id,
          nome: lead.nome,
          whatsapp: lead.whatsapp,
          createdAt: lead.createdAt,
          status: lead.status,
          identifierLabel: "Dispositivo",
          identifierValue: lead.modeloDispositivo,
          whatsappMessage: `Olá ${lead.nome}! Vi sua solicitação sobre o ${lead.modeloDispositivo} aqui no Nexus Drive. Podemos conversar sobre o reparo?`,
          valorServico: lead.valorServico ? Number(lead.valorServico) : null,
          statusPagamento: lead.statusPagamento,
        }))
      : (await listEsteticaMotorLeads(status, pagination)).map((lead) => ({
          id: lead.id,
          nome: lead.nome,
          whatsapp: lead.whatsapp,
          createdAt: lead.createdAt,
          status: lead.status,
          identifierLabel: "Veículo",
          identifierValue: lead.veiculo,
          whatsappMessage: `Olá ${lead.nome}! Vi sua solicitação sobre o ${lead.veiculo} aqui no Nexus Drive. Vamos falar sobre o serviço?`,
          valorServico: lead.valorServico ? Number(lead.valorServico) : null,
          statusPagamento: lead.statusPagamento,
        }));

  const { totalRecebido, totalEmAberto } = financialSummary;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Leads</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {totalCount} {totalCount === 1 ? "lead encontrado" : "leads encontrados"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Volume de leads" value={totalCount} tone="emphasis" />
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
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-zinc-900 text-zinc-400 ring-1 ring-zinc-700 hover:bg-zinc-800"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
          <p className="text-sm font-medium text-zinc-300">Nenhum lead encontrado.</p>
          <p className="text-sm text-zinc-500">Assim que alguém enviar o formulário, ele aparece aqui.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition-colors duration-150 hover:border-zinc-700"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-50">{lead.nome}</p>
                  <p className="text-xs text-zinc-500">{DATE_FORMATTER.format(lead.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={lead.status} />
                  <LeadPaymentStatusSelect
                    vertical={vertical}
                    leadId={lead.id}
                    currentStatus={lead.statusPagamento}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-400">
                <span>
                  {lead.identifierLabel}: {lead.identifierValue}
                </span>
                <span>WhatsApp: {lead.whatsapp}</span>
                <span className="font-medium text-zinc-300">
                  Valor: {formatCurrencyBRL(lead.valorServico)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`/dashboard/leads/${lead.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 transition-colors duration-150 hover:opacity-90"
                >
                  Detalhes
                </Link>
                <LeadStatusSelect vertical={vertical} leadId={lead.id} currentStatus={lead.status} />
                <a
                  href={buildWhatsAppLink(lead.whatsapp, lead.whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors duration-150 hover:bg-emerald-500/20"
                >
                  Chamar no WhatsApp
                </a>
                {laudoIdByLeadId.has(lead.id) ? (
                  <Link
                    href={`/dashboard/laudo/${laudoIdByLeadId.get(lead.id)}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors duration-150 hover:bg-zinc-700"
                  >
                    Ver Laudo
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/laudo/novo/${lead.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300 transition-colors duration-150 hover:bg-blue-500/20"
                  >
                    Gerar Laudo
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-between gap-3 pt-2">
          <PageLink
            page={page - 1}
            status={status}
            disabled={page <= 1}
            label="← Anterior"
          />
          <span className="text-sm text-zinc-500">
            Página {page} de {totalPages}
          </span>
          <PageLink
            page={page + 1}
            status={status}
            disabled={page >= totalPages}
            label="Próxima →"
          />
        </nav>
      )}
    </div>
  );
}

function PageLink({
  page,
  status,
  disabled,
  label,
}: {
  page: number;
  status?: LeadStatus;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-full px-3.5 py-1.5 text-sm font-medium text-zinc-700">
        {label}
      </span>
    );
  }

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("page", String(page));

  return (
    <Link
      href={`/dashboard/leads?${params.toString()}`}
      className="rounded-full px-3.5 py-1.5 text-sm font-medium text-zinc-400 ring-1 ring-zinc-700 transition-colors duration-150 hover:bg-zinc-800"
    >
      {label}
    </Link>
  );
}
