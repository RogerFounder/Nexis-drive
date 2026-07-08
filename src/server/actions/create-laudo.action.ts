"use server";

import { redirect } from "next/navigation";
import { getActiveVertical } from "@/config/verticals";
import { laudoIntakeSchema } from "@/server/validators/laudo.schema";
import { getAssistenciaTecnicaLeadById } from "@/server/db/repositories/assistencia-tecnica-lead.repository";
import { getEsteticaMotorLeadById } from "@/server/db/repositories/estetica-motor-lead.repository";
import { createLaudo } from "@/server/db/repositories/laudo.repository";
import { getCurrentAdminSession } from "@/server/services/auth/current-admin";
import { getEffectiveChecklistItems } from "@/server/services/settings/effective-checklist";
import { reportError } from "@/server/services/monitoring/report-error";

export interface CreateLaudoActionState {
  success: boolean;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
}

export async function createLaudoAction(
  leadId: string,
  _prevState: CreateLaudoActionState,
  formData: FormData
): Promise<CreateLaudoActionState> {
  const vertical = getActiveVertical();
  const session = await getCurrentAdminSession();
  if (!session) {
    return { success: false, formError: "Sessão expirada. Faça login novamente." };
  }
  const allowedItems = await getEffectiveChecklistItems(session.adminId, vertical);

  const parsed = laudoIntakeSchema(allowedItems).safeParse({
    itensChecklist: formData.getAll("itensChecklist"),
    observacoesEntrada: formData.get("observacoesEntrada"),
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  let clienteNome: string;
  let clienteWhatsapp: string;
  let identificadorLabel: string;
  let identificadorValor: string;

  if (vertical === "assistencia") {
    const lead = await getAssistenciaTecnicaLeadById(leadId);
    if (!lead) {
      return { success: false, formError: "Lead não encontrado." };
    }
    clienteNome = lead.nome;
    clienteWhatsapp = lead.whatsapp;
    identificadorLabel = "Dispositivo";
    identificadorValor = lead.modeloDispositivo;
  } else {
    const lead = await getEsteticaMotorLeadById(leadId);
    if (!lead) {
      return { success: false, formError: "Lead não encontrado." };
    }
    clienteNome = lead.nome;
    clienteWhatsapp = lead.whatsapp;
    identificadorLabel = "Veículo";
    identificadorValor = lead.veiculo;
  }

  let laudoId: string;
  try {
    const laudo = await createLaudo({
      vertical,
      leadId,
      clienteNome,
      clienteWhatsapp,
      identificadorLabel,
      identificadorValor,
      itensChecklist: parsed.data.itensChecklist,
      observacoesEntrada: parsed.data.observacoesEntrada,
    });
    laudoId = laudo.id;
  } catch (error) {
    reportError("createLaudoAction", error);
    return {
      success: false,
      formError: "Não foi possível gerar o laudo agora. Tente novamente.",
    };
  }

  redirect(`/dashboard/laudo/${laudoId}`);
}
