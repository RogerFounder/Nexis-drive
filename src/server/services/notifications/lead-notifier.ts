import { sendEmailNotification } from "./email-channel";
import { sendWebhookNotification } from "./webhook-channel";
import type { LeadNotificationPayload } from "./types";

export type { LeadNotificationPayload, LeadVertical } from "./types";

const CHANNEL_NAMES = ["webhook", "e-mail"] as const;

/**
 * Fires all configured channels in parallel. The lead is already persisted
 * by the time this runs, so a channel failure is logged, never thrown —
 * a broken notification must not surface to the user as a failed submission.
 */
export async function notifyNewLead(payload: LeadNotificationPayload): Promise<void> {
  const results = await Promise.allSettled([
    sendWebhookNotification(payload),
    sendEmailNotification(payload),
  ]);

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `[lead-notifier] Falha ao notificar via ${CHANNEL_NAMES[index]} (lead ${payload.leadId}):`,
        result.reason
      );
    }
  });
}
