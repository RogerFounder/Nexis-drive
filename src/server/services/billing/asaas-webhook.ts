import { timingSafeEqual } from "node:crypto";
import type { SubscriptionStatus } from "@/generated/prisma/client";
import { prisma } from "@/server/db/client";
import {
  getSubscriptionByAsaasCustomerId,
  getSoleSubscription,
  upsertSubscriptionForAdmin,
} from "@/server/db/repositories/subscription.repository";
import {
  checkoutSessionExistsForCustomerId,
  findCheckoutSessionByCustomerId,
  findCheckoutSessionByToken,
  updateCheckoutSessionStatus,
} from "@/server/db/repositories/checkout-session.repository";
import { sendWelcomeCheckoutEmail } from "@/server/services/notifications/email-channel";
import { reportError } from "@/server/services/monitoring/report-error";
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
    // Token de sessão gravado como externalReference na criação do pagamento —
    // permite identificar a CheckoutSession sem depender do customerId.
    externalReference?: string;
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

export type WebhookOutcome = "APPLIED" | "IGNORED" | "NO_SUBSCRIPTION" | "CHECKOUT_MARKED_PAID";

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

  // Self-serve checkout: payment confirmed for a prospect who hasn't been
  // provisioned yet. Look up the session by externalReference (the session
  // token embedded at payment-creation time) — more reliable than customerId
  // since it doesn't depend on Asaas's redirect or on ASAAS_CUSTOMER_ID.
  if (status === "ACTIVE") {
    const externalRef = payload.payment?.externalReference ?? null;
    const session = externalRef
      ? await findCheckoutSessionByToken(externalRef)
      : customerId
        ? await findCheckoutSessionByCustomerId(customerId)
        : null;

    if (session && session.status === "AWAITING_PAYMENT") {
      await updateCheckoutSessionStatus(session.id, "PAID");
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
      const bemVindoUrl = `${appUrl}/bem-vindo?s=${session.token}`;
      // Fire-and-forget — a failed email is not worth failing the webhook,
      // but it must still be reported so a silent misconfiguration doesn't
      // strand a paying customer with no way to finish setup.
      sendWelcomeCheckoutEmail(session.email, session.ownerName, bemVindoUrl).catch((error) =>
        reportError("asaas-webhook:welcome-email", error)
      );
      return "CHECKOUT_MARKED_PAID";
    }
  }

  const existing = customerId
    ? await getSubscriptionByAsaasCustomerId(customerId)
    : expectedCustomerId
      ? null
      : await getSoleSubscription();

  // A self-serve checkout prospect's customerId is never this deployment's
  // own operator, even if their payment was later deleted/refunded/canceled
  // before ever converting into a real Subscription here — never let that
  // fall through to the "attribute to whichever admin exists" fallback below.
  if (!existing && customerId && (await checkoutSessionExistsForCustomerId(customerId))) {
    return "IGNORED";
  }

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
