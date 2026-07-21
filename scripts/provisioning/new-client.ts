/**
 * Fully automated client onboarding: creates the Neon database, runs
 * migrations, creates the owner account, creates the Vercel project (linked
 * to the shared repo) with all env vars set, deploys it, and creates the
 * Asaas customer + charge + webhook — replacing the manual checklist in
 * docs/onboarding-cliente.md with one command.
 *
 * Two billing modes — set exactly one:
 *
 *   ASAAS_SUBSCRIPTION_VALUE="147.00"   → regular monthly recurring plan
 *   FOUNDER_LIFETIME_PRICE="297.00"     → one-time charge, permanent access,
 *                                          no recurring billing ever (for the
 *                                          first-10-clients "founder" deal)
 *
 * Usage:
 *   CLIENT_SLUG="oficina-do-joao" \
 *   CLIENT_NAME="Oficina do João" \
 *   VERTENTE_ATIVA="estetica" \
 *   ADMIN_EMAIL="joao@oficinadojoao.com" \
 *   ADMIN_PASSWORD="SenhaForte123!" \
 *   ASAAS_CLIENT_CPF_CNPJ="12345678900" \
 *   ASAAS_SUBSCRIPTION_VALUE="147.00" \
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
import {
  createAsaasCustomer,
  createAsaasSubscription,
  createAsaasSinglePayment,
  createAsaasWebhook,
} from "./lib/asaas";

loadEnv({ path: ".env.provisioning" });

const VALID_VERTICALS = ["assistencia", "estetica"];
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,98}[a-z0-9])?$/;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Faltou a variável ${name}.`);
  return value;
}

function optionalNumberEnv(name: string): number | undefined {
  const raw = process.env[name]?.trim();
  if (!raw) return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} inválido: "${raw}".`);
  }
  return value;
}

async function main() {
  const clientSlug = requireEnv("CLIENT_SLUG");
  const clientName = requireEnv("CLIENT_NAME");
  const vertente = requireEnv("VERTENTE_ATIVA");
  const adminEmail = requireEnv("ADMIN_EMAIL").toLowerCase();
  const adminPassword = requireEnv("ADMIN_PASSWORD");
  const cpfCnpj = requireEnv("ASAAS_CLIENT_CPF_CNPJ").replace(/\D/g, "");
  const trialDurationDays = Number(process.env.ADMIN_TRIAL_DAYS?.trim() ?? "7");

  const subscriptionValue = optionalNumberEnv("ASAAS_SUBSCRIPTION_VALUE");
  const lifetimePrice = optionalNumberEnv("FOUNDER_LIFETIME_PRICE");

  if (!SLUG_PATTERN.test(clientSlug)) {
    throw new Error(
      `CLIENT_SLUG inválido: "${clientSlug}". Use só letras minúsculas, números e hífen (vira o nome do projeto Vercel).`
    );
  }
  if (!VALID_VERTICALS.includes(vertente)) {
    throw new Error(`VERTENTE_ATIVA inválida: "${vertente}". Use "assistencia" ou "estetica".`);
  }
  if (!Number.isInteger(trialDurationDays) || trialDurationDays <= 0) {
    throw new Error(`ADMIN_TRIAL_DAYS inválido: "${process.env.ADMIN_TRIAL_DAYS}".`);
  }
  if (!subscriptionValue && !lifetimePrice) {
    throw new Error(
      "Defina ASAAS_SUBSCRIPTION_VALUE (mensal recorrente) ou FOUNDER_LIFETIME_PRICE (cobrança única, acesso vitalício) — exatamente um dos dois."
    );
  }
  if (subscriptionValue && lifetimePrice) {
    throw new Error(
      "Defina só um: ASAAS_SUBSCRIPTION_VALUE ou FOUNDER_LIFETIME_PRICE, não os dois."
    );
  }
  const isLifetime = Boolean(lifetimePrice);

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
    const admin = await clientPrisma.admin.create({
      data: { email: adminEmail, passwordHash, trialDurationDays },
    });

    if (isLifetime) {
      // Access is granted permanently right here in the database — it does
      // NOT depend on the Asaas webhook firing correctly, unlike the regular
      // recurring-subscription path. A founder client keeps access even if
      // something goes wrong later with billing configuration.
      await clientPrisma.subscription.upsert({
        where: { adminId: admin.id },
        update: { status: "ACTIVE", currentPeriodEnd: null },
        create: { adminId: admin.id, status: "ACTIVE", currentPeriodEnd: null },
      });
    }
    await clientPrisma.$disconnect();

    console.log(
      isLifetime
        ? "3/5 — Criando cliente e cobrança única (vitalícia) no Asaas..."
        : "3/5 — Criando cliente e assinatura no Asaas..."
    );
    const asaasWebhookToken = randomBytes(32).toString("hex");
    const { customerId } = await createAsaasCustomer({
      name: clientName,
      email: adminEmail,
      cpfCnpj,
    });
    const { invoiceUrl } = isLifetime
      ? await createAsaasSinglePayment({
          customerId,
          value: lifetimePrice!,
          description: `Nexus Drive — acesso vitalício, plano fundador (${clientName})`,
        })
      : await createAsaasSubscription({
          customerId,
          value: subscriptionValue!,
          description: `Nexus Drive — assinatura mensal (${clientName})`,
        });

    console.log("4/5 — Criando projeto Vercel e configurando variáveis...");
    const vercel = await createVercelProject(clientSlug);
    vercelProjectId = vercel.projectId;
    const deploymentDomain = `${clientSlug}.vercel.app`;

    const envVars: Record<string, string> = {
      VERTENTE_ATIVA: vertente,
      DATABASE_URL: neon.databaseUrl,
      DIRECT_URL: neon.directUrl,
      SESSION_SECRET: randomBytes(48).toString("hex"),
      ASAAS_WEBHOOK_TOKEN: asaasWebhookToken,
      ASAAS_CHECKOUT_URL: invoiceUrl,
      ASAAS_CUSTOMER_ID: customerId,
    };

    // Wires this client's own "novo lead" email notification automatically —
    // their login email doubles as the notification address, no extra input
    // needed per client. Skipped only if Resend isn't configured for this
    // provisioning run (existing clients created before this stayed unwired).
    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    if (resendApiKey) {
      envVars.RESEND_API_KEY = resendApiKey;
      envVars.LEAD_NOTIFICATION_EMAIL_FROM = "onboarding@resend.dev";
      envVars.LEAD_NOTIFICATION_EMAIL_TO = adminEmail;
    }

    await setVercelEnvVars(vercel.projectId, envVars);

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
    if (isLifetime) {
      console.log(`Acesso:        VITALÍCIO — já ativo agora, não depende do pagamento confirmar.`);
      console.log(`Cobrança única (Asaas): ${invoiceUrl}`);
    } else {
      console.log(`Trial:         ${trialDurationDays} dias, a partir de agora`);
      console.log(`Assinatura mensal (Asaas): ${invoiceUrl}`);
    }
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
      "Nota: se um cliente/cobrança já foi criado no Asaas antes da falha, ele não é desfeito automaticamente — confira manualmente em Meus Clientes."
    );
    process.exit(1);
  }
}

main();
