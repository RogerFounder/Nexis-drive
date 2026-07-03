"use server";

import { assistenciaTecnicaLeadSchema } from "@/server/validators/assistencia-tecnica-lead.schema";
import { createAssistenciaTecnicaLead } from "@/server/db/repositories/assistencia-tecnica-lead.repository";
import { notifyNewLead } from "@/server/services/notifications/lead-notifier";

export interface AssistenciaTecnicaLeadActionState {
  success: boolean;
  leadId?: string;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
}

export async function submitAssistenciaTecnicaLead(
  _prevState: AssistenciaTecnicaLeadActionState,
  formData: FormData
): Promise<AssistenciaTecnicaLeadActionState> {
  const parsed = assistenciaTecnicaLeadSchema.safeParse({
    nome: formData.get("nome"),
    whatsapp: formData.get("whatsapp"),
    modeloDispositivo: formData.get("modeloDispositivo"),
    descricaoProblema: formData.get("descricaoProblema"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let lead;
  try {
    lead = await createAssistenciaTecnicaLead(parsed.data);
  } catch (error) {
    console.error("[submitAssistenciaTecnicaLead] Falha ao persistir lead:", error);
    return {
      success: false,
      formError: "Não foi possível registrar sua solicitação agora. Tente novamente em instantes.",
    };
  }

  await notifyNewLead({
    vertical: "assistencia-tecnica",
    leadId: lead.id,
    nome: lead.nome,
    whatsapp: lead.whatsapp,
    createdAt: lead.createdAt.toISOString(),
    details: {
      "Modelo do dispositivo": lead.modeloDispositivo,
      "Descrição do problema": lead.descricaoProblema,
    },
  });

  return { success: true, leadId: lead.id };
}
