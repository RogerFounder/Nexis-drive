import { prisma } from "@/server/db/client";
import type { AssistenciaTecnicaLeadOutput } from "@/server/validators/assistencia-tecnica-lead.schema";
import type { LeadFinancialsInput } from "@/server/validators/lead-financials.schema";
import type { AssistenciaTecnicaLead, LeadStatus, StatusPagamento } from "@/generated/prisma/client";
import { buildStatusCountMap } from "./shared/status-count";

export function createAssistenciaTecnicaLead(
  data: AssistenciaTecnicaLeadOutput
): Promise<AssistenciaTecnicaLead> {
  const { consentimentoDados: _consentimentoDados, ...leadFields } = data;
  return prisma.assistenciaTecnicaLead.create({
    data: { ...leadFields, consentimentoDadosEm: new Date() },
  });
}

export function listAssistenciaTecnicaLeads(status?: LeadStatus): Promise<AssistenciaTecnicaLead[]> {
  return prisma.assistenciaTecnicaLead.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export function getAssistenciaTecnicaLeadById(id: string): Promise<AssistenciaTecnicaLead | null> {
  return prisma.assistenciaTecnicaLead.findUnique({ where: { id } });
}

/** LGPD data-erasure request. Cascades to any laudo issued for this lead. */
export async function deleteAssistenciaTecnicaLead(id: string): Promise<void> {
  await prisma.assistenciaTecnicaLead.delete({ where: { id } });
}

export function updateAssistenciaTecnicaLeadStatus(
  id: string,
  status: LeadStatus
): Promise<AssistenciaTecnicaLead> {
  return prisma.assistenciaTecnicaLead.update({ where: { id }, data: { status } });
}

export function updateAssistenciaTecnicaLeadPaymentStatus(
  id: string,
  statusPagamento: StatusPagamento
): Promise<AssistenciaTecnicaLead> {
  return prisma.assistenciaTecnicaLead.update({ where: { id }, data: { statusPagamento } });
}

export function updateAssistenciaTecnicaLeadFinancials(
  id: string,
  data: LeadFinancialsInput
): Promise<AssistenciaTecnicaLead> {
  return prisma.assistenciaTecnicaLead.update({ where: { id }, data });
}

export async function countAssistenciaTecnicaLeadsByStatus(): Promise<Record<LeadStatus, number>> {
  const groups = await prisma.assistenciaTecnicaLead.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  return buildStatusCountMap(groups);
}
