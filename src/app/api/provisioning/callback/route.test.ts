import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/server/db/repositories/provisioning-request.repository", () => ({
  findProvisioningRequestById: vi.fn(),
  updateProvisioningRequest: vi.fn(),
}));
vi.mock("@/server/services/notifications/email-channel", () => ({
  sendActivationEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/server/services/monitoring/report-error", () => ({
  reportError: vi.fn(),
}));

import {
  findProvisioningRequestById,
  updateProvisioningRequest,
} from "@/server/db/repositories/provisioning-request.repository";
import { sendActivationEmail } from "@/server/services/notifications/email-channel";
import { POST } from "./route";

const VALID_TOKEN = "valid-callback-token-32chars-long-x";
const REQ_RECORD = {
  id: "req_1",
  adminEmail: "joao@empresa.com",
  clientName: "Oficina do João",
  clientSlug: "oficina-do-joao",
  vertical: "estetica",
  asaasCustomerId: "cus_123",
  asaasSubscriptionId: "sub_456",
  status: "DISPATCHED" as const,
  errorMessage: null,
  githubRunId: null,
  checkoutSessionId: "sess_1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeRequest(body: unknown, token: string | null = VALID_TOKEN) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["x-provisioning-token"] = token;
  return new NextRequest("http://localhost/api/provisioning/callback", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.PROVISIONING_CALLBACK_TOKEN = VALID_TOKEN;
  vi.mocked(findProvisioningRequestById).mockResolvedValue(REQ_RECORD);
  vi.mocked(updateProvisioningRequest).mockResolvedValue(undefined);
});

describe("POST /api/provisioning/callback", () => {
  it("rejects requests with wrong token", async () => {
    const res = await POST(makeRequest({ provisioningRequestId: "req_1", status: "COMPLETED" }, "wrong-token"));
    expect(res.status).toBe(401);
  });

  it("rejects requests with no token", async () => {
    const res = await POST(makeRequest({ provisioningRequestId: "req_1", status: "COMPLETED" }, null));
    expect(res.status).toBe(401);
  });

  it("rejects malformed payload", async () => {
    const res = await POST(makeRequest({ status: "COMPLETED" })); // missing provisioningRequestId
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown provisioning request", async () => {
    vi.mocked(findProvisioningRequestById).mockResolvedValue(null);
    const res = await POST(makeRequest({ provisioningRequestId: "unknown", status: "COMPLETED" }));
    expect(res.status).toBe(404);
  });

  it("updates status to COMPLETED and sends activation email", async () => {
    const res = await POST(
      makeRequest({
        provisioningRequestId: "req_1",
        status: "COMPLETED",
        dashboardUrl: "https://oficina-do-joao.vercel.app",
        activationUrl: "https://oficina-do-joao.vercel.app/redefinir-senha?token=xxx",
        ownerName: "João Silva",
      })
    );

    expect(res.status).toBe(200);
    expect(updateProvisioningRequest).toHaveBeenCalledWith("req_1", {
      status: "COMPLETED",
      errorMessage: undefined,
    });
    expect(sendActivationEmail).toHaveBeenCalledWith(
      "joao@empresa.com",
      "João Silva",
      "https://oficina-do-joao.vercel.app",
      "https://oficina-do-joao.vercel.app/redefinir-senha?token=xxx"
    );
  });

  it("updates status to FAILED without sending email", async () => {
    const res = await POST(
      makeRequest({
        provisioningRequestId: "req_1",
        status: "FAILED",
        errorMessage: "Neon API timeout",
      })
    );

    expect(res.status).toBe(200);
    expect(updateProvisioningRequest).toHaveBeenCalledWith("req_1", {
      status: "FAILED",
      errorMessage: "Neon API timeout",
    });
    expect(sendActivationEmail).not.toHaveBeenCalled();
  });

  it("does not send activation email when COMPLETED but missing dashboardUrl/activationUrl", async () => {
    const res = await POST(
      makeRequest({ provisioningRequestId: "req_1", status: "COMPLETED" })
    );

    expect(res.status).toBe(200);
    expect(sendActivationEmail).not.toHaveBeenCalled();
  });
});
