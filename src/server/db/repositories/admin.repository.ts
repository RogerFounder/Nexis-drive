import { prisma } from "@/server/db/client";
import type { Admin, Subscription } from "@/generated/prisma/client";

export function getAdminByEmail(email: string): Promise<Admin | null> {
  return prisma.admin.findUnique({ where: { email } });
}

export function createAdmin(data: { email: string; passwordHash: string }): Promise<Admin> {
  return prisma.admin.create({ data });
}

export type AdminWithSubscription = Admin & { subscription: Subscription | null };

export function getAdminWithSubscription(id: string): Promise<AdminWithSubscription | null> {
  return prisma.admin.findUnique({ where: { id }, include: { subscription: true } });
}

export async function updateAdminPassword(id: string, passwordHash: string): Promise<void> {
  await prisma.admin.update({ where: { id }, data: { passwordHash } });
}
