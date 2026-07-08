"use server";

import { revalidatePath } from "next/cache";
import { getActiveVertical } from "@/config/verticals";
import { leadFinancialsSchema } from "@/server/validators/lead-financials.schema";
import { updateAssistenciaTecnicaLeadFinancials } from "@/server/db/repositories/assistencia-tecnica-lead.repository";
import { updateEsteticaMotorLeadFinancials } from "@/server/db/repositories/estetica-motor-lead.repository";
import { reportError } from "@/server/services/monitoring/report-error";

export interface UpdateLeadFinancialsState {
  success: boolean;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
}

export async function updateLeadFinancialsAction(
  leadId: string,
  _prevState: UpdateLeadFinancialsState,
  formData: FormData
): Promise<UpdateLeadFinancialsState> {
  const parsed = leadFinancialsSchema.safeParse({
    valorServico: formData.get("valorServico"),
    statusPagamento: formData.get("statusPagamento"),
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const vertical = getActiveVertical();

  try {
    if (vertical === "assistencia") {
      await updateAssistenciaTecnicaLeadFinancials(leadId, parsed.data);
    } else {
      await updateEsteticaMotorLeadFinancials(leadId, parsed.data);
    }
  } catch (error) {
    reportError("updateLeadFinancialsAction", error);
    return {
      success: false,
      formError: "Não foi possível salvar os dados financeiros agora. Tente novamente.",
    };
  }

  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${leadId}`);
  return { success: true };
}
