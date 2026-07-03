import { prisma } from "@/server/db/client";
import type { Laudo } from "@/generated/prisma/client";
import type { Vertical } from "@/config/verticals";

interface CreateLaudoInput {
  vertical: Vertical;
  leadId: string;
  clienteNome: string;
  clienteWhatsapp: string;
  identificadorLabel: string;
  identificadorValor: string;
  itensChecklist: string[];
  observacoesEntrada: string;
}

export function createLaudo(input: CreateLaudoInput): Promise<Laudo> {
  const { vertical, leadId, ...rest } = input;
  return prisma.laudo.create({
    data: {
      ...rest,
      assistenciaLeadId: vertical === "assistencia" ? leadId : undefined,
      esteticaLeadId: vertical === "estetica" ? leadId : undefined,
    },
  });
}

export function getLaudoById(id: string): Promise<Laudo | null> {
  return prisma.laudo.findUnique({ where: { id } });
}

export function listRecentLaudos(limit = 20): Promise<Laudo[]> {
  return prisma.laudo.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}

/**
 * Maps leadId -> most recent laudoId for the given vertical, in one query —
 * lets the leads list render "Gerar Laudo" vs "Ver Laudo" (with a working
 * link) per card without an N+1 lookup.
 */
export async function listLatestLaudoIdByLeadId(vertical: Vertical): Promise<Map<string, string>> {
  const laudos = await prisma.laudo.findMany({
    where:
      vertical === "assistencia"
        ? { assistenciaLeadId: { not: null } }
        : { esteticaLeadId: { not: null } },
    select: { id: true, assistenciaLeadId: true, esteticaLeadId: true },
    orderBy: { createdAt: "asc" },
  });

  const map = new Map<string, string>();
  for (const laudo of laudos) {
    const leadId = vertical === "assistencia" ? laudo.assistenciaLeadId : laudo.esteticaLeadId;
    if (leadId) map.set(leadId, laudo.id);
  }
  return map;
}
