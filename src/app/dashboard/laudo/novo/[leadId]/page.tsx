import { notFound } from "next/navigation";
import Link from "next/link";
import { getActiveVertical } from "@/config/verticals";
import { getAssistenciaTecnicaLeadById } from "@/server/db/repositories/assistencia-tecnica-lead.repository";
import { getEsteticaMotorLeadById } from "@/server/db/repositories/estetica-motor-lead.repository";
import { LaudoIntakeForm } from "@/components/shared/dashboard/laudo/laudo-intake-form";
import { getCurrentAdminSession } from "@/server/services/auth/current-admin";
import { getEffectiveChecklistItems } from "@/server/services/settings/effective-checklist";

export const dynamic = "force-dynamic";

export default async function NovoLaudoPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  const vertical = getActiveVertical();
  const session = await getCurrentAdminSession();
  const checklistItems = session
    ? await getEffectiveChecklistItems(session.adminId, vertical)
    : [];

  let nome: string;
  let identificadorLabel: string;
  let identificadorValor: string;

  if (vertical === "assistencia") {
    const lead = await getAssistenciaTecnicaLeadById(leadId);
    if (!lead) notFound();
    nome = lead.nome;
    identificadorLabel = "Dispositivo";
    identificadorValor = lead.modeloDispositivo;
  } else {
    const lead = await getEsteticaMotorLeadById(leadId);
    if (!lead) notFound();
    nome = lead.nome;
    identificadorLabel = "Veículo";
    identificadorValor = lead.veiculo;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/dashboard/leads"
          className="text-sm text-zinc-500 transition-colors duration-150 hover:text-zinc-300"
        >
          ← Voltar para Leads
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
          Novo Laudo Técnico
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          {nome} · {identificadorLabel}: {identificadorValor}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <LaudoIntakeForm leadId={leadId} checklistItems={checklistItems} />
      </div>
    </div>
  );
}
