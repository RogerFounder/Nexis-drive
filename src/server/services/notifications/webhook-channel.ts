import { createHmac } from "node:crypto";
import type { LeadNotificationPayload } from "./types";

const WEBHOOK_TIMEOUT_MS = 5000;

/**
 * Generic outbound webhook — plugs into Zapier, Make, n8n, a WhatsApp
 * Business API gateway, or a custom email/notification service without
 * this codebase needing to know which one. No-ops when unconfigured.
 */
export async function sendWebhookNotification(payload: LeadNotificationPayload): Promise<void> {
  const webhookUrl = process.env.LEAD_NOTIFICATION_WEBHOOK_URL;
  if (!webhookUrl) return;

  const body = JSON.stringify(payload);
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  const secret = process.env.LEAD_NOTIFICATION_WEBHOOK_SECRET;
  if (secret) {
    headers["X-Nexis-Signature"] = createHmac("sha256", secret).update(body).digest("hex");
  }

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Webhook respondeu com status ${response.status}`);
    }
  } finally {
    clearTimeout(timeoutHandle);
  }
}
