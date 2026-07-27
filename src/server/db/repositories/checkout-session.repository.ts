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

/**
 * True if this Asaas customerId belongs to a self-serve checkout prospect
 * (regardless of status) rather than to this deployment's own operator.
 * Used by the webhook to keep a prospect's payment lifecycle — including an
 * abandoned/canceled test — from ever being misattributed to the admin's
 * own Subscription.
 */
export async function checkoutSessionExistsForCustomerId(
  asaasCustomerId: string
): Promise<boolean> {
  const count = await prisma.checkoutSession.count({ where: { asaasCustomerId } });
  return count > 0;
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
