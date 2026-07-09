/**
 * Grants a client permanent (or optionally time-limited) paid access
 * without going through the Asaas subscription/webhook flow — for a
 * one-time payment received manually (PIX direto, cobrança avulsa, etc.).
 *
 * Usage:
 *   DATABASE_URL="<pooled do cliente>" \
 *   ADMIN_EMAIL="dono@clientexyz.com" \
 *   npx tsx scripts/activate-lifetime-access.ts
 *
 * Optional: ACCESS_UNTIL="2027-12-31" to set an expiry date instead of
 * permanent access (format YYYY-MM-DD).
 */
import "dotenv/config";
import { prisma } from "../src/server/db/client";
import { upsertSubscriptionForAdmin } from "../src/server/db/repositories/subscription.repository";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    console.error("Defina ADMIN_EMAIL.");
    process.exit(1);
  }

  const untilRaw = process.env.ACCESS_UNTIL?.trim();
  let currentPeriodEnd: Date | null = null;
  if (untilRaw) {
    currentPeriodEnd = new Date(untilRaw);
    if (Number.isNaN(currentPeriodEnd.getTime())) {
      console.error(`ACCESS_UNTIL inválido: "${untilRaw}". Use o formato YYYY-MM-DD.`);
      process.exit(1);
    }
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    console.error(`Nenhuma conta encontrada com o e-mail ${email}.`);
    process.exit(1);
  }

  await upsertSubscriptionForAdmin({
    adminId: admin.id,
    status: "ACTIVE",
    currentPeriodEnd,
  });
  await prisma.$disconnect();

  console.log(
    currentPeriodEnd
      ? `${email} liberado com acesso ativo até ${currentPeriodEnd.toLocaleDateString("pt-BR")}.`
      : `${email} liberado com acesso ativo permanente (sem data de expiração).`
  );
}

main().catch((error) => {
  console.error("Falha ao ativar acesso:", error);
  process.exit(1);
});
