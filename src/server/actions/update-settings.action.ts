"use server";

import { revalidatePath } from "next/cache";
import { getActiveVertical } from "@/config/verticals";
import { settingsSchema } from "@/server/validators/settings.schema";
import { upsertSettings } from "@/server/db/repositories/settings.repository";
import { getCurrentAdminSession } from "@/server/services/auth/current-admin";
import type { MotorServiceMode } from "@/generated/prisma/client";

export interface UpdateSettingsActionState {
  success: boolean;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
}

export async function updateSettingsAction(
  _prevState: UpdateSettingsActionState,
  formData: FormData
): Promise<UpdateSettingsActionState> {
  const session = await getCurrentAdminSession();
  if (!session) {
    return { success: false, formError: "Sessão expirada. Faça login novamente." };
  }

  const vertical = getActiveVertical();
  const rawMode = formData.get("motorServiceMode");
  const checklistItems = formData
    .getAll("checklistItems")
    .map((value) => String(value))
    .filter((value) => value.trim().length > 0);

  const parsed = settingsSchema(vertical).safeParse({
    motorServiceMode: rawMode ? (String(rawMode) as MotorServiceMode) : null,
    checklistItems,
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await upsertSettings(session.adminId, {
      motorServiceMode: parsed.data.motorServiceMode,
      checklistItems: parsed.data.checklistItems,
    });
  } catch (error) {
    console.error("[updateSettingsAction] Falha ao salvar configurações:", error);
    return { success: false, formError: "Não foi possível salvar agora. Tente novamente." };
  }

  revalidatePath("/dashboard/configuracoes");
  return { success: true };
}
