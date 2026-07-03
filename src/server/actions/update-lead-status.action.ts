"use server";

import { revalidatePath } from "next/cache";
import type { Vertical } from "@/config/verticals";
import type { LeadStatus } from "@/generated/prisma/client";
import { updateAssistenciaTecnicaLeadStatus } from "@/server/db/repositories/assistencia-tecnica-lead.repository";
import { updateEsteticaMotorLeadStatus } from "@/server/db/repositories/estetica-motor-lead.repository";

const VALID_STATUSES: readonly LeadStatus[] = ["NOVO", "CONTATADO", "CONVERTIDO", "DESCARTADO"];
const VALID_VERTICALS: readonly Vertical[] = ["assistencia", "estetica"];

export interface UpdateLeadStatusResult {
  success: boolean;
  error?: string;
}

export async function updateLeadStatus(
  vertical: Vertical,
  leadId: string,
  status: LeadStatus
): Promise<UpdateLeadStatusResult> {
  if (!VALID_VERTICALS.includes(vertical) || !VALID_STATUSES.includes(status) || !leadId) {
    return { success: false, error: "Parâmetros inválidos." };
  }

  try {
    if (vertical === "assistencia") {
      await updateAssistenciaTecnicaLeadStatus(leadId, status);
    } else {
      await updateEsteticaMotorLeadStatus(leadId, status);
    }
  } catch (error) {
    console.error("[updateLeadStatus] Falha ao atualizar status:", error);
    return { success: false, error: "Não foi possível atualizar o status." };
  }

  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
  return { success: true };
}
