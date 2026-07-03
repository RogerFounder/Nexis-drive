import { prisma } from "@/server/db/client";
import type { AssistenciaTecnicaLeadOutput } from "@/server/validators/assistencia-tecnica-lead.schema";
import type { AssistenciaTecnicaLead, LeadStatus } from "@/generated/prisma/client";
import { buildStatusCountMap } from "./shared/status-count";

export function createAssistenciaTecnicaLead(
  data: AssistenciaTecnicaLeadOutput
): Promise<AssistenciaTecnicaLead> {
  return prisma.assistenciaTecnicaLead.create({ data });
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

export function updateAssistenciaTecnicaLeadStatus(
  id: string,
  status: LeadStatus
): Promise<AssistenciaTecnicaLead> {
  return prisma.assistenciaTecnicaLead.update({ where: { id }, data: { status } });
}

export async function countAssistenciaTecnicaLeadsByStatus(): Promise<Record<LeadStatus, number>> {
  const groups = await prisma.assistenciaTecnicaLead.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  return buildStatusCountMap(groups);
}
