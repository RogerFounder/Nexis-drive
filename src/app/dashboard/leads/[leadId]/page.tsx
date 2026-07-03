import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveVertical } from "@/config/verticals";
import { getAssistenciaTecnicaLeadById } from "@/server/db/repositories/assistencia-tecnica-lead.repository";
import { getEsteticaMotorLeadById } from "@/server/db/repositories/estetica-motor-lead.repository";
import { StatusBadge } from "@/components/ui/status-badge";
import { PaymentStatusBadge } from "@/components/ui/payment-status-badge";
import { LeadFinancialsForm } from "@/components/shared/dashboard/lead-financials-form";
import type { LeadStatus, StatusPagamento } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

interface LeadDetail {
  id: string;
  nome: string;
  whatsapp: string;
  createdAt: Date;
  status: LeadStatus;
  identifierLabel: string;
  identifierValue: string;
  detailLabel: string;
  detailValue: string;
  valorServico: number | null;
  statusPagamento: StatusPagamento;
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  const vertical = getActiveVertical();

  let lead: LeadDetail;

  if (vertical === "assistencia") {
    const record = await getAssistenciaTecnicaLeadById(leadId);
    if (!record) notFound();
    lead = {
      id: record.id,
      nome: record.nome,
      whatsapp: record.whatsapp,
      createdAt: record.createdAt,
      status: record.status,
      identifierLabel: "Dispositivo",
      identifierValue: record.modeloDispositivo,
      detailLabel: "Problema relatado",
      detailValue: record.descricaoProblema,
      valorServico: record.valorServico ? Number(record.valorServico) : null,
      statusPagamento: record.statusPagamento,
    };
  } else {
    const record = await getEsteticaMotorLeadById(leadId);
    if (!record) notFound();
    lead = {
      id: record.id,
      nome: record.nome,
      whatsapp: record.whatsapp,
      createdAt: record.createdAt,
      status: record.status,
      identifierLabel: "Veículo",
      identifierValue: record.veiculo,
      detailLabel: "Serviço desejado",
      detailValue: record.servicoDesejado,
      valorServico: record.valorServico ? Number(record.valorServico) : null,
      statusPagamento: record.statusPagamento,
    };
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/dashboard/leads"
          className="text-sm text-zinc-400 transition-colors duration-150 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          ← Voltar para Leads
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {lead.nome}
          </h1>
          <div className="flex items-center gap-2">
            <StatusBadge status={lead.status} />
            <PaymentStatusBadge status={lead.statusPagamento} />
          </div>
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {DATE_FORMATTER.format(lead.createdAt)}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">WhatsApp</p>
            <p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {lead.whatsapp}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
              {lead.identifierLabel}
            </p>
            <p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {lead.identifierValue}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
            {lead.detailLabel}
          </p>
          <p className="mt-1.5 rounded-xl bg-zinc-50 px-3.5 py-2.5 text-sm leading-relaxed text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
            {lead.detailValue}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-5 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Fechamento do serviço
        </h2>
        <LeadFinancialsForm
          leadId={lead.id}
          valorServico={lead.valorServico}
          statusPagamento={lead.statusPagamento}
        />
      </div>
    </div>
  );
}
