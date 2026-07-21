/**
 * Provisioning script for the self-serve checkout flow.
 * Called by the GitHub Actions workflow `provision-client.yml` after a
 * prospect has paid via the /contratar flow on the main site.
 *
 * Unlike new-client.ts, this script does NOT create an Asaas customer or
 * subscription — those already exist (created when the prospect initiated
 * checkout). It only handles infrastructure: Neon + Vercel + Admin account +
 * Asaas webhook registration for the new client's deployment.
 *
 * Required env vars (from GH Actions secrets + workflow inputs):
 *   PROVISIONING_REQUEST_ID, CLIENT_SLUG, CLIENT_NAME, VERTENTE_ATIVA,
 *   ADMIN_EMAIL, ASAAS_CUSTOMER_ID, ASAAS_SUBSCRIPTION_ID,
 *   NEON_API_KEY, NEON_ORG_ID, VERCEL_API_TOKEN, ASAAS_API_KEY,
 *   RESEND_API_KEY, PROVISIONING_CALLBACK_URL, PROVISIONING_CALLBACK_TOKEN
 */
import "dotenv/config";
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
import { createAsaasWebhook } from "./lib/asaas";

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,98}[a-z0-9])?$/;
const VALID_VERTICALS = ["assistencia", "estetica"];
const ACTIVATION_TOKEN_TTL_MS = 72 * 60 * 60 * 1000;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Faltou a variável ${name}.`);
  return value;
}

async function postCallback(
  status: "COMPLETED" | "FAILED",
  extra: Record<string, string> = {}
): Promise<void> {
  const url = process.env.PROVISIONING_CALLBACK_URL;
  const token = process.env.PROVISIONING_CALLBACK_TOKEN;
  const id = process.env.PROVISIONING_REQUEST_ID;
  if (!url || !token || !id) return;

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-provisioning-token": token,
    },
    body: JSON.stringify({ provisioningRequestId: id, status, ...extra }),
  }).catch((e) => console.error("Callback falhou (não crítico):", e));
}

async function main() {
  const provisioningRequestId = requireEnv("PROVISIONING_REQUEST_ID");
  const clientSlug = requireEnv("CLIENT_SLUG");
  const clientName = requireEnv("CLIENT_NAME");
  const vertente = requireEnv("VERTENTE_ATIVA");
  const adminEmail = requireEnv("ADMIN_EMAIL").toLowerCase();
  const asaasCustomerId = requireEnv("ASAAS_CUSTOMER_ID");
  // Empty string = vitalício (one-time payment, no recurring subscription ID).
  const asaasSubscriptionId = process.env.ASAAS_SUBSCRIPTION_ID?.trim() || null;
  const isLifetime = asaasSubscriptionId === null;

  if (!SLUG_PATTERN.test(clientSlug)) {
    throw new Error(`CLIENT_SLUG inválido: "${clientSlug}".`);
  }
  if (!VALID_VERTICALS.includes(vertente)) {
    throw new Error(`VERTENTE_ATIVA inválida: "${vertente}".`);
  }

  let neonProjectId: string | undefined;
  let vercelProjectId: string | undefined;

  try {
    console.log(`1/4 — Criando banco Neon (${clientSlug})...`);
    const neon = await createNeonProject(clientSlug);
    neonProjectId = neon.projectId;

    console.log("2/4 — Rodando migrations e criando a conta do dono...");
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: neon.databaseUrl, DIRECT_URL: neon.directUrl },
    });

    const adapter = new PrismaPg({ connectionString: neon.databaseUrl });
    const clientPrisma = new PrismaClient({ adapter });

    // Generate a temporary random password — the activation link below
    // lets the client set their own password; this value is never exposed.
    const tempPassword = randomBytes(24).toString("hex");
    const passwordHash = await hashPassword(tempPassword);
    const admin = await clientPrisma.admin.create({
      data: { email: adminEmail, passwordHash },
    });

    // Activate the subscription — payment was already confirmed at checkout.
    // Lifetime: no currentPeriodEnd (access never expires via billing cycle).
    // Monthly: webhook will update currentPeriodEnd on each renewal; for now
    // just activate so the client can access the dashboard immediately.
    await clientPrisma.subscription.create({
      data: {
        adminId: admin.id,
        status: "ACTIVE",
        asaasCustomerId,
        asaasSubscriptionId: isLifetime ? null : asaasSubscriptionId,
        currentPeriodEnd: null,
      },
    });

    // Activation token (72 h TTL) — sent in the welcome email so the client
    // can set their password without ever seeing a plain-text credential.
    const rawToken = randomBytes(32).toString("hex");
    const { createHash } = await import("node:crypto");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + ACTIVATION_TOKEN_TTL_MS);
    await clientPrisma.passwordResetToken.create({
      data: { adminId: admin.id, tokenHash, expiresAt },
    });

    await clientPrisma.$disconnect();

    console.log("3/4 — Criando projeto Vercel e configurando variáveis...");
    const vercel = await createVercelProject(clientSlug);
    vercelProjectId = vercel.projectId;
    const deploymentDomain = `${clientSlug}.vercel.app`;
    const asaasWebhookToken = randomBytes(32).toString("hex");

    const envVars: Record<string, string> = {
      VERTENTE_ATIVA: vertente,
      DATABASE_URL: neon.databaseUrl,
      DIRECT_URL: neon.directUrl,
      SESSION_SECRET: randomBytes(48).toString("hex"),
      ASAAS_WEBHOOK_TOKEN: asaasWebhookToken,
      ASAAS_CUSTOMER_ID: asaasCustomerId,
    };

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

    console.log("4/4 — Disparando o deploy...");
    await triggerVercelDeployment(vercel.projectId, clientSlug);

    const dashboardUrl = `https://${deploymentDomain}`;
    const activationUrl = `https://${deploymentDomain}/redefinir-senha?token=${rawToken}`;

    console.log("\n" + "─".repeat(72));
    console.log(`Cliente provisionado: ${clientName}`);
    console.log(`Painel:           ${dashboardUrl}`);
    console.log(`Link de ativação: ${activationUrl}`);
    console.log("─".repeat(72));

    await postCallback("COMPLETED", {
      dashboardUrl,
      activationUrl,
      ownerName: clientName,
    });
  } catch (error) {
    console.error("\nFalha ao provisionar cliente:", error);
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
    await postCallback("FAILED", {
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

main();
