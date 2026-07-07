import { prisma } from "@/server/db/client";
import type { MotorServiceMode, Settings } from "@/generated/prisma/client";

export function getSettingsByAdminId(adminId: string): Promise<Settings | null> {
  return prisma.settings.findUnique({ where: { adminId } });
}

// This is a single-tenant deployment (one Admin per instance), so public
// pages that need the owner's configuration (e.g. landing copy) without a
// session can safely read the only Settings row that exists.
export function getDeploymentSettings(): Promise<Settings | null> {
  return prisma.settings.findFirst();
}

export function upsertSettings(
  adminId: string,
  data: { motorServiceMode: MotorServiceMode | null; checklistItems: string[] }
): Promise<Settings> {
  return prisma.settings.upsert({
    where: { adminId },
    create: { adminId, ...data, onboardingDone: true },
    update: { ...data, onboardingDone: true },
  });
}
