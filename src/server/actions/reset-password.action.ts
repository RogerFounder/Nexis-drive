"use server";

import { redirect } from "next/navigation";
import { resetPasswordSchema } from "@/server/validators/password-reset.schema";
import {
  findValidPasswordResetToken,
  markPasswordResetTokenUsed,
} from "@/server/db/repositories/password-reset-token.repository";
import { updateAdminPassword } from "@/server/db/repositories/admin.repository";
import { hashResetToken } from "@/server/services/auth/password-reset-token";
import { hashPassword } from "@/server/services/auth/password";
import { reportError } from "@/server/services/monitoring/report-error";

export interface ResetPasswordState {
  fieldErrors?: Record<string, string[]>;
  formError?: string;
}

export async function resetPasswordAction(
  token: string,
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const tokenHash = hashResetToken(token);
  const found = await findValidPasswordResetToken(tokenHash);

  if (!found) {
    return {
      formError: "Este link é inválido ou já expirou. Solicite um novo link de redefinição.",
    };
  }

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    await updateAdminPassword(found.admin.id, passwordHash);
    await markPasswordResetTokenUsed(found.id);
  } catch (error) {
    reportError("resetPasswordAction", error);
    return { formError: "Não foi possível redefinir sua senha agora. Tente novamente." };
  }

  redirect("/login?reset=success");
}
