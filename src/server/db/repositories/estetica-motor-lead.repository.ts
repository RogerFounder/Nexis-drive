import { prisma } from "@/server/db/client";
import type { EsteticaMotoresLeadOutput } from "@/server/validators/estetica-motores-lead.schema";
import type { EsteticaMotorLead, LeadStatus } from "@/generated/prisma/client";
import { buildStatusCountMap } from "./shared/status-count";

export function createEsteticaMotorLead(
  data: EsteticaMotoresLeadOutput
): Promise<EsteticaMotorLead> {
  return prisma.esteticaMotorLead.create({ data });
}

export function listEsteticaMotorLeads(status?: LeadStatus): Promise<EsteticaMotorLead[]> {
  return prisma.esteticaMotorLead.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export function getEsteticaMotorLeadById(id: string): Promise<EsteticaMotorLead | null> {
  return prisma.esteticaMotorLead.findUnique({ where: { id } });
}

export function updateEsteticaMotorLeadStatus(
  id: string,
  status: LeadStatus
): Promise<EsteticaMotorLead> {
  return prisma.esteticaMotorLead.update({ where: { id }, data: { status } });
}

export async function countEsteticaMotorLeadsByStatus(): Promise<Record<LeadStatus, number>> {
  const groups = await prisma.esteticaMotorLead.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  return buildStatusCountMap(groups);
}
