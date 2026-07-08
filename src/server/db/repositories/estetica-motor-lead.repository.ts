import { prisma } from "@/server/db/client";
import type { EsteticaMotoresLeadOutput } from "@/server/validators/estetica-motores-lead.schema";
import type { LeadFinancialsInput } from "@/server/validators/lead-financials.schema";
import type { EsteticaMotorLead, LeadStatus, StatusPagamento } from "@/generated/prisma/client";
import { buildStatusCountMap } from "./shared/status-count";
import { buildFinancialSummary, type FinancialSummary } from "./shared/financial-summary";

export function createEsteticaMotorLead(
  data: EsteticaMotoresLeadOutput
): Promise<EsteticaMotorLead> {
  const { consentimentoDados: _consentimentoDados, ...leadFields } = data;
  return prisma.esteticaMotorLead.create({
    data: { ...leadFields, consentimentoDadosEm: new Date() },
  });
}

export function listEsteticaMotorLeads(
  status?: LeadStatus,
  pagination?: { skip: number; take: number }
): Promise<EsteticaMotorLead[]> {
  return prisma.esteticaMotorLead.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    skip: pagination?.skip,
    take: pagination?.take,
  });
}

export function countEsteticaMotorLeads(status?: LeadStatus): Promise<number> {
  return prisma.esteticaMotorLead.count({ where: status ? { status } : undefined });
}

export async function sumEsteticaMotorLeadFinancials(status?: LeadStatus): Promise<FinancialSummary> {
  const groups = await prisma.esteticaMotorLead.groupBy({
    by: ["statusPagamento"],
    where: status ? { status } : undefined,
    _sum: { valorServico: true },
  });
  return buildFinancialSummary(groups);
}

export function getEsteticaMotorLeadById(id: string): Promise<EsteticaMotorLead | null> {
  return prisma.esteticaMotorLead.findUnique({ where: { id } });
}

/** LGPD data-erasure request. Cascades to any laudo issued for this lead. */
export async function deleteEsteticaMotorLead(id: string): Promise<void> {
  await prisma.esteticaMotorLead.delete({ where: { id } });
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
