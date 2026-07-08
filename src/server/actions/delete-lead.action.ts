"use server";

import { redirect } from "next/navigation";
import { getActiveVertical } from "@/config/verticals";
import { deleteAssistenciaTecnicaLead } from "@/server/db/repositories/assistencia-tecnica-lead.repository";
import { deleteEsteticaMotorLead } from "@/server/db/repositories/estetica-motor-lead.repository";
import { reportError } from "@/server/services/monitoring/report-error";

export interface DeleteLeadState {
  formError?: string;
}

/**
 * Fulfils an LGPD data-erasure request: permanently deletes the lead and
 * (via ON DELETE CASCADE) any laudo issued for it. Irreversible by design.
 */
export async function deleteLeadAction(
  leadId: string,
  _prevState: DeleteLeadState,
  _formData: FormData
): Promise<DeleteLeadState> {
  const vertical = getActiveVertical();

  try {
    if (vertical === "assistencia") {
      await deleteAssistenciaTecnicaLead(leadId);
    } else {
      await deleteEsteticaMotorLead(leadId);
    }
  } catch (error) {
    reportError("deleteLeadAction", error);
    return { formError: "Não foi possível excluir os dados agora. Tente novamente." };
  }

  redirect("/dashboard/leads");
}
