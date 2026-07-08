"use server";

import { revalidatePath } from "next/cache";
import type { Vertical } from "@/config/verticals";
import type { StatusPagamento } from "@/generated/prisma/client";
import { updateAssistenciaTecnicaLeadPaymentStatus } from "@/server/db/repositories/assistencia-tecnica-lead.repository";
import { updateEsteticaMotorLeadPaymentStatus } from "@/server/db/repositories/estetica-motor-lead.repository";
import { reportError } from "@/server/services/monitoring/report-error";

const VALID_STATUSES: readonly StatusPagamento[] = ["PENDENTE", "PAGO"];
const VALID_VERTICALS: readonly Vertical[] = ["assistencia", "estetica"];

export interface UpdateLeadPaymentStatusResult {
  success: boolean;
  error?: string;
}

/**
 * Quick inline toggle for the leads list — changes only statusPagamento,
 * leaving valorServico untouched. Full edits (setting the value itself)
 * still go through the lead detail page's financials form.
 */
export async function updateLeadPaymentStatus(
  vertical: Vertical,
  leadId: string,
  statusPagamento: StatusPagamento
): Promise<UpdateLeadPaymentStatusResult> {
  if (!VALID_VERTICALS.includes(vertical) || !VALID_STATUSES.includes(statusPagamento) || !leadId) {
    return { success: false, error: "Parâmetros inválidos." };
  }

  try {
    if (vertical === "assistencia") {
      await updateAssistenciaTecnicaLeadPaymentStatus(leadId, statusPagamento);
    } else {
      await updateEsteticaMotorLeadPaymentStatus(leadId, statusPagamento);
    }
  } catch (error) {
    reportError("updateLeadPaymentStatus", error);
    return { success: false, error: "Não foi possível atualizar o status de pagamento." };
  }

  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
  return { success: true };
}
