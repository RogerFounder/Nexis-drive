import { timingSafeEqual } from "node:crypto";
import type { SubscriptionStatus } from "@/generated/prisma/client";
import { prisma } from "@/server/db/client";
import {
  getSubscriptionByAsaasCustomerId,
  getSoleSubscription,
  upsertSubscriptionForAdmin,
} from "@/server/db/repositories/subscription.repository";
import { isEventForThisDeployment } from "./asaas-webhook-guard";

export { isEventForThisDeployment } from "./asaas-webhook-guard";

/**
 * Maps Asaas event names to our subscription status. Events not listed are
 * acknowledged but cause no state change (Asaas fires many event types).
 * https://docs.asaas.com/docs/webhook-para-cobrancas
 */
const EVENT_STATUS_MAP: Record<string, SubscriptionStatus> = {
  PAYMENT_CONFIRMED: "ACTIVE",
  PAYMENT_RECEIVED: "ACTIVE",
  PAYMENT_OVERDUE: "PAST_DUE",
  PAYMENT_DELETED: "CANCELED",
  PAYMENT_REFUNDED: "CANCELED",
  SUBSCRIPTION_DELETED: "CANCELED",
};

export interface AsaasWebhookPayload {
  event?: string;
  payment?: {
    customer?: string;
    subscription?: string;
    dueDate?: string;
    nextDueDate?: string;
  };
  subscription?: {
    id?: string;
    customer?: string;
    nextDueDate?: string;
  };
}

/**
 * Constant-time comparison of the Asaas access token. Returns false on any
 * length mismatch (timingSafeEqual throws otherwise).
 */
export function verifyAsaasToken(received: string | null): boolean {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expected || !received) return false;

  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export type WebhookOutcome = "APPLIED" | "IGNORED" | "NO_SUBSCRIPTION";

/** Applies a verified Asaas event to our single-tenant subscription. */
export async function applyAsaasWebhook(payload: AsaasWebhookPayload): Promise<WebhookOutcome> {
  const event = payload.event;
  if (!event || !(event in EVENT_STATUS_MAP)) return "IGNORED";

  const status = EVENT_STATUS_MAP[event];
  const customerId = payload.payment?.customer ?? payload.subscription?.customer ?? null;
  const asaasSubscriptionId = payload.payment?.subscription ?? payload.subscription?.id ?? null;
  const nextDueDate = payload.payment?.nextDueDate ?? payload.subscription?.nextDueDate ?? null;
  const currentPeriodEnd = nextDueDate ? new Date(nextDueDate) : null;

  const expectedCustomerId = process.env.ASAAS_CUSTOMER_ID;
  if (!isEventForThisDeployment(customerId, expectedCustomerId)) return "IGNORED";

  const existing = customerId
    ? await getSubscriptionByAsaasCustomerId(customerId)
    : expectedCustomerId
      ? null
      : await getSoleSubscription();

  const adminId =
    existing?.adminId ?? (expectedCustomerId ? null : (await prisma.admin.findFirst())?.id) ?? null;
  if (!adminId) return "NO_SUBSCRIPTION";

  await upsertSubscriptionForAdmin({
    adminId,
    status,
    asaasCustomerId: customerId ?? existing?.asaasCustomerId ?? null,
    asaasSubscriptionId: asaasSubscriptionId ?? existing?.asaasSubscriptionId ?? null,
    currentPeriodEnd: currentPeriodEnd ?? (status === "ACTIVE" ? existing?.currentPeriodEnd : null),
  });

  return "APPLIED";
}
