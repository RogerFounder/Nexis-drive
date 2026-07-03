import type { LeadStatus } from "@/generated/prisma/client";

const ALL_STATUSES: readonly LeadStatus[] = ["NOVO", "CONTATADO", "CONVERTIDO", "DESCARTADO"];

interface StatusGroup {
  status: LeadStatus;
  _count: { _all: number };
}

export function buildStatusCountMap(groups: StatusGroup[]): Record<LeadStatus, number> {
  const map = Object.fromEntries(ALL_STATUSES.map((status) => [status, 0])) as Record<
    LeadStatus,
    number
  >;

  for (const group of groups) {
    map[group.status] = group._count._all;
  }

  return map;
}
