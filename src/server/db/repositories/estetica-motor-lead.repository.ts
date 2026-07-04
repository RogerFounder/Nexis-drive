import { prisma } from "@/server/db/client";
import type { EsteticaMotoresLeadOutput } from "@/server/validators/estetica-motores-lead.schema";
import type { LeadFinancialsInput } from "@/server/validators/lead-financials.schema";
import type { EsteticaMotorLead, LeadStatus, StatusPagamento } from "@/generated/prisma/client";
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

export function updateEsteticaMotorLeadPaymentStatus(
  id: string,
  statusPagamento: StatusPagamento
): Promise<EsteticaMotorLead> {
  return prisma.esteticaMotorLead.update({ where: { id }, data: { statusPagamento } });
}

export function updateEsteticaMotorLeadFinancials(
  id: string,
  data: LeadFinancialsInput
): Promise<EsteticaMotorLead> {
  return prisma.esteticaMotorLead.update({ where: { id }, data });
}

export async function countEsteticaMotorLeadsByStatus(): Promise<Record<LeadStatus, number>> {
  const groups = await prisma.esteticaMotorLead.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  return buildStatusCountMap(groups);
}
