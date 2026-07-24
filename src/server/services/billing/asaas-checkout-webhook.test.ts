/**
 * Tests for the checkout-session branch of applyAsaasWebhook.
 * The DB is mocked so this runs without a real database.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the repositories so we don't need a DB connection.
vi.mock("@/server/db/repositories/checkout-session.repository", () => ({
  findCheckoutSessionByToken: vi.fn(),
  findCheckoutSessionByCustomerId: vi.fn(),
  updateCheckoutSessionStatus: vi.fn(),
}));
vi.mock("@/server/db/repositories/subscription.repository", () => ({
  getSubscriptionByAsaasCustomerId: vi.fn().mockResolvedValue(null),
  getSoleSubscription: vi.fn().mockResolvedValue(null),
  upsertSubscriptionForAdmin: vi.fn(),
}));
vi.mock("@/server/db/client", () => ({ prisma: { admin: { findFirst: vi.fn().mockResolvedValue(null) } } }));
vi.mock("@/server/services/notifications/email-channel", () => ({
  sendWelcomeCheckoutEmail: vi.fn().mockResolvedValue(undefined),
}));

import {
  findCheckoutSessionByToken,
  findCheckoutSessionByCustomerId,
  updateCheckoutSessionStatus,
} from "@/server/db/repositories/checkout-session.repository";
import { sendWelcomeCheckoutEmail } from "@/server/services/notifications/email-channel";
import { applyAsaasWebhook } from "./asaas-webhook";

const SESSION_AWAITING = {
  id: "sess_1",
  token: "tok_abc123",
  ownerName: "João Silva",
  email: "joao@empresa.com",
  cpfCnpj: "12345678900",
  planType: "MENSAL" as const,
  asaasCustomerId: "cus_123",
  asaasSubscriptionId: "sub_456",
  invoiceUrl: "https://asaas.com/pay/xxx",
  status: "AWAITING_PAYMENT" as const,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  updatedAt: new Date(),
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmContent: null,
  utmTerm: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(findCheckoutSessionByToken).mockResolvedValue(null);
  vi.mocked(findCheckoutSessionByCustomerId).mockResolvedValue(null);
  vi.mocked(updateCheckoutSessionStatus).mockResolvedValue(undefined);
  vi.mocked(sendWelcomeCheckoutEmail).mockResolvedValue(undefined);
  delete process.env.ASAAS_CUSTOMER_ID;
  delete process.env.NEXT_PUBLIC_APP_URL;
});

describe("applyAsaasWebhook — checkout session detection", () => {
  it("marks session PAID via externalReference and sends welcome email", async () => {
    vi.mocked(findCheckoutSessionByToken).mockResolvedValue(SESSION_AWAITING);

    const outcome = await applyAsaasWebhook({
      event: "PAYMENT_CONFIRMED",
      payment: { customer: "cus_123", externalReference: "tok_abc123" },
    });

    expect(outcome).toBe("CHECKOUT_MARKED_PAID");
    expect(findCheckoutSessionByToken).toHaveBeenCalledWith("tok_abc123");
    expect(updateCheckoutSessionStatus).toHaveBeenCalledWith("sess_1", "PAID");
    expect(sendWelcomeCheckoutEmail).toHaveBeenCalledWith(
      "joao@empresa.com",
      "João Silva",
      expect.stringContaining("/bem-vindo?s=tok_abc123")
    );
  });

  it("falls back to customerId lookup when no externalReference in payload", async () => {
    vi.mocked(findCheckoutSessionByCustomerId).mockResolvedValue(SESSION_AWAITING);

    const outcome = await applyAsaasWebhook({
      event: "PAYMENT_CONFIRMED",
      payment: { customer: "cus_123" },
    });

    expect(outcome).toBe("CHECKOUT_MARKED_PAID");
    expect(findCheckoutSessionByToken).not.toHaveBeenCalled();
    expect(findCheckoutSessionByCustomerId).toHaveBeenCalledWith("cus_123");
    expect(updateCheckoutSessionStatus).toHaveBeenCalledWith("sess_1", "PAID");
  });

  it("ignores PAYMENT_CONFIRMED when session is already PAID (idempotency)", async () => {
    vi.mocked(findCheckoutSessionByToken).mockResolvedValue({
      ...SESSION_AWAITING,
      status: "PAID",
    });

    const outcome = await applyAsaasWebhook({
      event: "PAYMENT_CONFIRMED",
      payment: { customer: "cus_123", externalReference: "tok_abc123" },
    });

    // Falls through to the regular subscription path which returns NO_SUBSCRIPTION.
    expect(outcome).toBe("NO_SUBSCRIPTION");
    expect(updateCheckoutSessionStatus).not.toHaveBeenCalled();
  });

  it("ignores non-payment events (no checkout session lookup)", async () => {
    const outcome = await applyAsaasWebhook({ event: "PAYMENT_CREATED" });

    expect(outcome).toBe("IGNORED");
    expect(findCheckoutSessionByToken).not.toHaveBeenCalled();
    expect(findCheckoutSessionByCustomerId).not.toHaveBeenCalled();
  });

  it("PAYMENT_OVERDUE does not trigger checkout session lookup", async () => {
    const outcome = await applyAsaasWebhook({
      event: "PAYMENT_OVERDUE",
      payment: { customer: "cus_123", externalReference: "tok_abc123" },
    });

    // PAST_DUE is not ACTIVE, so checkout branch is not entered.
    expect(findCheckoutSessionByToken).not.toHaveBeenCalled();
    expect(outcome).toBe("NO_SUBSCRIPTION");
  });
});

describe("applyAsaasWebhook — token verification", () => {
  it("verifyAsaasToken returns false when env var is missing", async () => {
    const { verifyAsaasToken } = await import("./asaas-webhook");
    delete process.env.ASAAS_WEBHOOK_TOKEN;
    expect(verifyAsaasToken("anything")).toBe(false);
    expect(verifyAsaasToken(null)).toBe(false);
  });

  it("verifyAsaasToken returns false for length-mismatched tokens (no timing leak)", async () => {
    const { verifyAsaasToken } = await import("./asaas-webhook");
    process.env.ASAAS_WEBHOOK_TOKEN = "expected-token";
    expect(verifyAsaasToken("short")).toBe(false);
  });
});
