/**
 * Provisions a new client's deployment: applies migrations to their Neon
 * database and creates their owner account. See docs/onboarding-cliente.md
 * for the full checklist (this only covers the DB side; Vercel project
 * creation and Asaas billing setup are still manual steps).
 *
 * Usage:
 *   VERTENTE_ATIVA="assistencia" \
 *   DATABASE_URL="<pooled do cliente>" \
 *   DIRECT_URL="<direct do cliente>" \
 *   ADMIN_EMAIL="dono@clientexyz.com" \
 *   ADMIN_PASSWORD="SenhaForte123!" \
 *   ADMIN_TRIAL_DAYS="7" \
 *   npx tsx scripts/provision-client.ts
 *
 * ADMIN_TRIAL_DAYS is optional (defaults to 7) — set it higher for a
 * promotional extended trial on a specific client.
 */
import "dotenv/config";
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { prisma } from "../src/server/db/client";
import { hashPassword } from "../src/server/services/auth/password";

const VALID_VERTICALS = ["assistencia", "estetica"];

async function main() {
  const vertente = process.env.VERTENTE_ATIVA?.trim();
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  const missing: string[] = [];
  if (!vertente) missing.push("VERTENTE_ATIVA");
  if (!databaseUrl) missing.push("DATABASE_URL");
  if (!directUrl) missing.push("DIRECT_URL");
  if (!adminEmail) missing.push("ADMIN_EMAIL");
  if (!adminPassword) missing.push("ADMIN_PASSWORD");

  if (missing.length > 0) {
    console.error(`Faltam variáveis: ${missing.join(", ")}. Veja o exemplo de comando no topo do script.`);
    process.exit(1);
  }

  if (!VALID_VERTICALS.includes(vertente!)) {
    console.error(`VERTENTE_ATIVA inválida: "${vertente}". Use "assistencia" ou "estetica".`);
    process.exit(1);
  }

  console.log("1/3 — Aplicando migrations no banco do cliente...");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });

  const trialDaysRaw = process.env.ADMIN_TRIAL_DAYS?.trim();
  const trialDurationDays = trialDaysRaw ? Number(trialDaysRaw) : 7;
  if (!Number.isInteger(trialDurationDays) || trialDurationDays <= 0) {
    console.error(`ADMIN_TRIAL_DAYS inválido: "${trialDaysRaw}". Use um número inteiro positivo de dias.`);
    process.exit(1);
  }

  console.log("2/3 — Criando conta do dono...");
  const passwordHash = await hashPassword(adminPassword!);
  const admin = await prisma.admin.upsert({
    where: { email: adminEmail! },
    update: { passwordHash, trialDurationDays },
    create: { email: adminEmail!, passwordHash, trialDurationDays },
  });
  await prisma.$disconnect();

  console.log("3/3 — Pronto no banco. Falta configurar a Vercel:\n");

  const sessionSecret = randomBytes(48).toString("hex");

  console.log("Variáveis de ambiente para o novo projeto Vercel (Production + Preview):");
  console.log("─".repeat(72));
  console.log(`VERTENTE_ATIVA="${vertente}"`);
  console.log(`DATABASE_URL="${databaseUrl}"`);
  console.log(`DIRECT_URL="${directUrl}"`);
  console.log(`SESSION_SECRET="${sessionSecret}"`);
  console.log(`ASAAS_WEBHOOK_TOKEN=""   # gere um valor forte, configure igual no Asaas`);
  console.log(`ASAAS_CHECKOUT_URL=""    # link de pagamento da assinatura desse cliente no Asaas`);
  console.log("─".repeat(72));
  console.log(`\nLogin do cliente: ${admin.email}`);
  console.log(`Senha: (a que você definiu em ADMIN_PASSWORD)`);
  console.log(
    `\nTrial de ${trialDurationDays} dias inicia automaticamente a partir de agora (id: ${admin.id}).`
  );
}

main().catch((error) => {
  console.error("Falha ao provisionar cliente:", error);
  process.exit(1);
});
