import { NextRequest, NextResponse } from "next/server";
import {
  applyAsaasWebhook,
  verifyAsaasToken,
  type AsaasWebhookPayload,
} from "@/server/services/billing/asaas-webhook";
import { reportError } from "@/server/services/monitoring/report-error";

// Webhook receiver — called by Asaas, never by a browser. Authenticated by
// the shared access token Asaas sends in the "asaas-access-token" header.
export async function POST(request: NextRequest) {
  if (!verifyAsaasToken(request.headers.get("asaas-access-token"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: AsaasWebhookPayload;
  try {
    payload = (await request.json()) as AsaasWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const outcome = await applyAsaasWebhook(payload);
    // Always 200 on a well-formed, authenticated request so Asaas stops
    // retrying — the outcome tells us whether state actually changed.
    return NextResponse.json({ outcome });
  } catch (error) {
    reportError("asaas-webhook", error);
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }
}
