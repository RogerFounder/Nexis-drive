import { prisma } from "@/server/db/client";
import type { Admin } from "@/generated/prisma/client";

export async function createPasswordResetToken(
  adminId: string,
  tokenHash: string,
  expiresAt: Date
): Promise<void> {
  // Invalidate any still-usable tokens for this admin first — only the
  // most recently requested link should ever work.
  await prisma.passwordResetToken.deleteMany({ where: { adminId, usedAt: null } });
  await prisma.passwordResetToken.create({ data: { adminId, tokenHash, expiresAt } });
}

export async function findValidPasswordResetToken(
  tokenHash: string
): Promise<{ id: string; admin: Admin } | null> {
  const token = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { admin: true },
  });

  if (!token || token.usedAt || token.expiresAt.getTime() < Date.now()) {
    return null;
  }

  return { id: token.id, admin: token.admin };
}

export async function markPasswordResetTokenUsed(id: string): Promise<void> {
  await prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
}
