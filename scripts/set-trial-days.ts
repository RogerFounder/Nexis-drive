/**
 * Adjusts how many trial days a specific client gets, without touching
 * their password or re-running migrations. Safe to run anytime.
 *
 * Usage:
 *   DATABASE_URL="<pooled do cliente>" \
 *   ADMIN_EMAIL="dono@clientexyz.com" \
 *   ADMIN_TRIAL_DAYS="30" \
 *   npx tsx scripts/set-trial-days.ts
 */
import "dotenv/config";
import { prisma } from "../src/server/db/client";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const trialDaysRaw = process.env.ADMIN_TRIAL_DAYS?.trim();
  const trialDurationDays = trialDaysRaw ? Number(trialDaysRaw) : NaN;

  if (!email) {
    console.error("Defina ADMIN_EMAIL.");
    process.exit(1);
  }
  if (!Number.isInteger(trialDurationDays) || trialDurationDays <= 0) {
    console.error(`ADMIN_TRIAL_DAYS inválido: "${trialDaysRaw}". Use um número inteiro positivo de dias.`);
    process.exit(1);
  }

  const admin = await prisma.admin.update({
    where: { email },
    data: { trialDurationDays },
  });
  await prisma.$disconnect();

  console.log(`${admin.email} agora tem ${trialDurationDays} dias de trial (id: ${admin.id}).`);
}

main().catch((error) => {
  console.error("Falha ao atualizar trial:", error);
  process.exit(1);
});
