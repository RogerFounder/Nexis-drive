/**
 * Fully automated client onboarding: creates the Neon database, runs
 * migrations, creates the owner account, creates the Vercel project (linked
 * to the shared repo) with all env vars set, deploys it, and creates the
 * Asaas customer + subscription + webhook — replacing the manual checklist
 * in docs/onboarding-cliente.md with one command.
 *
 * Usage:
 *   CLIENT_SLUG="oficina-do-joao" \
 *   CLIENT_NAME="Oficina do João" \
 *   VERTENTE_ATIVA="estetica" \
 *   ADMIN_EMAIL="joao@oficinadojoao.com" \
 *   ADMIN_PASSWORD="SenhaForte123!" \
 *   ASAAS_CLIENT_CPF_CNPJ="12345678900" \
 *   ASAAS_SUBSCRIPTION_VALUE="97.00" \
 *   npx tsx scripts/provisioning/new-client.ts
 *
 * Credentials for Vercel/Neon/Asaas come from .env.provisioning (never
 * committed — see that file). If any step fails, already-created cloud
 * resources from this run are rolled back automatically.
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { hashPassword } from "../../src/server/services/auth/password";
import { createNeonProject, deleteNeonProject } from "./lib/neon";
import {
  createVercelProject,
  setVercelEnvVars,
  triggerVercelDeployment,
  deleteVercelProject,
} from "./lib/vercel";
import { createAsaasCustomer, createAsaasSubscription, createAsaasWebhook } from "./lib/asaas";

loadEnv({ path: ".env.provisioning" });

const VALID_VERTICALS = ["assistencia", "estetica"];
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,98}[a-z0-9])?$/;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Faltou a variável ${name}.`);
  return value;
}

async function main() {
  const clientSlug = requireEnv("CLIENT_SLUG");
  const clientName = requireEnv("CLIENT_NAME");
  const vertente = requireEnv("VERTENTE_ATIVA");
  const adminEmail = requireEnv("ADMIN_EMAIL").toLowerCase();
  const adminPassword = requireEnv("ADMIN_PASSWORD");
  const cpfCnpj = requireEnv("ASAAS_CLIENT_CPF_CNPJ").replace(/\D/g, "");
  const subscriptionValue = Number(requireEnv("ASAAS_SUBSCRIPTION_VALUE"));
  const trialDurationDays = Number(process.env.ADMIN_TRIAL_DAYS?.trim() ?? "7");

  if (!SLUG_PATTERN.test(clientSlug)) {
    throw new Error(
      `CLIENT_SLUG inválido: "${clientSlug}". Use só letras minúsculas, números e hífen (vira o nome do projeto Vercel).`
    );
  }
  if (!VALID_VERTICALS.includes(vertente)) {
    throw new Error(`VERTENTE_ATIVA inválida: "${vertente}". Use "assistencia" ou "estetica".`);
  }
  if (!Number.isFinite(subscriptionValue) || subscriptionValue <= 0) {
    throw new Error(`ASAAS_SUBSCRIPTION_VALUE inválido: "${process.env.ASAAS_SUBSCRIPTION_VALUE}".`);
  }
  if (!Number.isInteger(trialDurationDays) || trialDurationDays <= 0) {
    throw new Error(`ADMIN_TRIAL_DAYS inválido: "${process.env.ADMIN_TRIAL_DAYS}".`);
  }

  let neonProjectId: string | undefined;
  let vercelProjectId: string | undefined;

  try {
    console.log(`1/5 — Criando banco Neon (${clientSlug})...`);
    const neon = await createNeonProject(clientSlug);
    neonProjectId = neon.projectId;

    console.log("2/5 — Rodando migrations e criando a conta do dono...");
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: neon.databaseUrl, DIRECT_URL: neon.directUrl },
    });

    const adapter = new PrismaPg({ connectionString: neon.databaseUrl });
    const clientPrisma = new PrismaClient({ adapter });
    const passwordHash = await hashPassword(adminPassword);
    await clientPrisma.admin.create({
      data: { email: adminEmail, passwordHash, trialDurationDays },
    });
    await clientPrisma.$disconnect();

    console.log("3/5 — Criando cliente e assinatura no Asaas...");
    const asaasWebhookToken = randomBytes(32).toString("hex");
    const { customerId } = await createAsaasCustomer({
      name: clientName,
      email: adminEmail,
      cpfCnpj,
    });
    const { invoiceUrl } = await createAsaasSubscription({
      customerId,
      value: subscriptionValue,
      description: `Nexus Drive — assinatura mensal (${clientName})`,
    });

    console.log("4/5 — Criando projeto Vercel e configurando variáveis...");
    const vercel = await createVercelProject(clientSlug);
    vercelProjectId = vercel.projectId;
    const deploymentDomain = `${clientSlug}.vercel.app`;

    await setVercelEnvVars(vercel.projectId, {
      VERTENTE_ATIVA: vertente,
      DATABASE_URL: neon.databaseUrl,
      DIRECT_URL: neon.directUrl,
      SESSION_SECRET: randomBytes(48).toString("hex"),
      ASAAS_WEBHOOK_TOKEN: asaasWebhookToken,
      ASAAS_CHECKOUT_URL: invoiceUrl,
      ASAAS_CUSTOMER_ID: customerId,
    });

    await createAsaasWebhook(
      `Nexus Drive — ${clientName}`,
      `https://${deploymentDomain}/api/webhooks/asaas`,
      asaasWebhookToken,
      adminEmail
    );

    console.log("5/5 — Disparando o deploy...");
    await triggerVercelDeployment(vercel.projectId, clientSlug);

    console.log("\n" + "─".repeat(72));
    console.log(`Cliente provisionado: ${clientName}`);
    console.log("─".repeat(72));
    console.log(`Painel:        https://${deploymentDomain}`);
    console.log(`Login:         ${adminEmail}`);
    console.log(`Senha:         (a que você definiu em ADMIN_PASSWORD)`);
    console.log(`Trial:         ${trialDurationDays} dias, a partir de agora`);
    console.log(`Link de pagamento (Asaas): ${invoiceUrl}`);
    console.log(`Painel Vercel: https://vercel.com/dashboard/projects → ${clientSlug}`);
    console.log(
      "\nO deploy leva 1-2 min para ficar pronto. Depois disso, mande o painel + login para o cliente."
    );
  } catch (error) {
    console.error("\nFalha ao provisionar cliente:", error);
    console.error("Desfazendo o que já foi criado nesta execução...");
    if (vercelProjectId) {
      await deleteVercelProject(vercelProjectId).catch((e) =>
        console.error("  ⚠ não consegui apagar o projeto Vercel:", e)
      );
    }
    if (neonProjectId) {
      await deleteNeonProject(neonProjectId).catch((e) =>
        console.error("  ⚠ não consegui apagar o projeto Neon:", e)
      );
    }
    console.error(
      "Nota: se um cliente/assinatura já foi criado no Asaas antes da falha, ele não é desfeito automaticamente — confira manualmente em Meus Clientes."
    );
    process.exit(1);
  }
}

main();
