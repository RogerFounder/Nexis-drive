import { prisma } from "@/server/db/client";
import type { CheckoutSession, CheckoutSessionStatus } from "@/generated/prisma/client";

export function createCheckoutSession(data: {
  token: string;
  ownerName: string;
  email: string;
  cpfCnpj: string;
  planType: "MENSAL" | "VITALICIO";
  asaasCustomerId: string;
  asaasSubscriptionId: string | null;
  invoiceUrl: string;
  expiresAt: Date;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}): Promise<CheckoutSession> {
  return prisma.checkoutSession.create({ data });
}

export function findCheckoutSessionByToken(token: string): Promise<CheckoutSession | null> {
  return prisma.checkoutSession.findUnique({ where: { token } });
}

export function findCheckoutSessionByCustomerId(
  asaasCustomerId: string
): Promise<CheckoutSession | null> {
  return prisma.checkoutSession.findFirst({
    where: { asaasCustomerId, status: "AWAITING_PAYMENT" },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateCheckoutSessionStatus(
  id: string,
  status: CheckoutSessionStatus
): Promise<void> {
  await prisma.checkoutSession.update({ where: { id }, data: { status } });
}

/**
 * Atomically transitions a session from PAID to DISPATCHED.
 * Returns true if the transition happened (this call owns it),
 * false if it was already DISPATCHED by a concurrent request.
 */
export async function claimCheckoutSessionForDispatch(id: string): Promise<boolean> {
  const result = await prisma.checkoutSession.updateMany({
    where: { id, status: "PAID" },
    data: { status: "DISPATCHED" },
  });
  return result.count > 0;
}

export interface CampaignStat {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  total: number;
  paid: number;
}

/**
 * One row per distinct UTM combination, with total checkouts started and how
 * many reached PAID/DISPATCHED (i.e. actually paid) — the simplest useful
 * view of which ad/campaign converts.
 */
export async function getCampaignStats(): Promise<CampaignStat[]> {
  const grouped = await prisma.checkoutSession.groupBy({
    by: ["utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm"],
    _count: { _all: true },
    orderBy: { _count: { id: "desc" } },
  });

  const paidGrouped = await prisma.checkoutSession.groupBy({
    by: ["utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm"],
    where: { status: { in: ["PAID", "DISPATCHED"] } },
    _count: { _all: true },
  });

  const paidByKey = new Map<string, number>();
  for (const row of paidGrouped) {
    const key = [row.utmSource, row.utmMedium, row.utmCampaign, row.utmContent, row.utmTerm].join(
      "|"
    );
    paidByKey.set(key, row._count._all);
  }

  return grouped.map((row) => {
    const key = [row.utmSource, row.utmMedium, row.utmCampaign, row.utmContent, row.utmTerm].join(
      "|"
    );
    return {
      utmSource: row.utmSource,
      utmMedium: row.utmMedium,
      utmCampaign: row.utmCampaign,
      utmContent: row.utmContent,
      utmTerm: row.utmTerm,
      total: row._count._all,
      paid: paidByKey.get(key) ?? 0,
    };
  });
}
