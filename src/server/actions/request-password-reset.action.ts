"use server";

import { headers } from "next/headers";
import { requestPasswordResetSchema } from "@/server/validators/password-reset.schema";
import { getAdminByEmail } from "@/server/db/repositories/admin.repository";
import { createPasswordResetToken } from "@/server/db/repositories/password-reset-token.repository";
import { generateResetToken, hashResetToken, RESET_TOKEN_TTL_MS } from "@/server/services/auth/password-reset-token";
import { sendPasswordResetEmail } from "@/server/services/notifications/email-channel";
import { reportError } from "@/server/services/monitoring/report-error";

export interface RequestPasswordResetState {
  submitted: boolean;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
}

export async function requestPasswordResetAction(
  _prevState: RequestPasswordResetState,
  formData: FormData
): Promise<RequestPasswordResetState> {
  const parsed = requestPasswordResetSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { submitted: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Derived from trusted request headers (never client-submitted form data)
  // so an attacker can't redirect the emailed reset link to their own domain.
  const headersList = await headers();
  const host = headersList.get("host");
  if (!host) {
    return { submitted: false, formError: "Não foi possível processar a solicitação. Tente novamente." };
  }
  const protocol = headersList.get("x-forwarded-proto") ?? "https";
  const origin = `${protocol}://${host}`;

  try {
    const admin = await getAdminByEmail(parsed.data.email);
    if (admin) {
      const rawToken = generateResetToken();
      const tokenHash = hashResetToken(rawToken);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await createPasswordResetToken(admin.id, tokenHash, expiresAt);

      const resetUrl = `${origin}/redefinir-senha?token=${rawToken}`;
      const sent = await sendPasswordResetEmail(admin.email, resetUrl);
      if (!sent) {
        reportError(
          "requestPasswordResetAction",
          new Error("Canal de e-mail não configurado (RESEND_API_KEY/LEAD_NOTIFICATION_EMAIL_FROM) — link não enviado.")
        );
      }
    }
  } catch (error) {
    reportError("requestPasswordResetAction", error);
    // Still return the generic success message — do not leak internal state.
  }

  return { submitted: true };
}
