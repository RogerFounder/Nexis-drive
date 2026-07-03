"use server";

import { esteticaMotoresLeadSchema } from "@/server/validators/estetica-motores-lead.schema";
import { createEsteticaMotorLead } from "@/server/db/repositories/estetica-motor-lead.repository";
import { notifyNewLead } from "@/server/services/notifications/lead-notifier";

export interface EsteticaMotoresLeadActionState {
  success: boolean;
  leadId?: string;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
}

export async function submitEsteticaMotoresLead(
  _prevState: EsteticaMotoresLeadActionState,
  formData: FormData
): Promise<EsteticaMotoresLeadActionState> {
  const parsed = esteticaMotoresLeadSchema.safeParse({
    nome: formData.get("nome"),
    whatsapp: formData.get("whatsapp"),
    veiculo: formData.get("veiculo"),
    servicoDesejado: formData.get("servicoDesejado"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let lead;
  try {
    lead = await createEsteticaMotorLead(parsed.data);
  } catch (error) {
    console.error("[submitEsteticaMotoresLead] Falha ao persistir lead:", error);
    return {
      success: false,
      formError: "Não foi possível registrar sua solicitação agora. Tente novamente em instantes.",
    };
  }

  await notifyNewLead({
    vertical: "estetica-motores",
    leadId: lead.id,
    nome: lead.nome,
    whatsapp: lead.whatsapp,
    createdAt: lead.createdAt.toISOString(),
    details: {
      "Veículo": lead.veiculo,
      "Serviço desejado": lead.servicoDesejado,
    },
  });

  return { success: true, leadId: lead.id };
}
