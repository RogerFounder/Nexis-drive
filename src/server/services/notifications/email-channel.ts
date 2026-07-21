import { Resend } from "resend";
import type { LeadNotificationPayload } from "./types";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Transactional email via Resend. No-ops when RESEND_API_KEY or the
 * from/to addresses aren't configured — swap providers later by rewriting
 * only this file, the lead-notifier contract stays the same.
 */
export async function sendEmailNotification(payload: LeadNotificationPayload): Promise<void> {
  const client = getResendClient();
  const from = process.env.LEAD_NOTIFICATION_EMAIL_FROM;
  const to = process.env.LEAD_NOTIFICATION_EMAIL_TO;
  if (!client || !from || !to) return;

  const detailRows = Object.entries(payload.details)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666;">${escapeHtml(label)}</td><td style="padding:4px 0;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px;">
      <h2 style="margin:0 0 12px;">Novo lead — ${escapeHtml(payload.vertical)}</h2>
      <table>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">Nome</td><td style="padding:4px 0;">${escapeHtml(payload.nome)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666;">WhatsApp</td><td style="padding:4px 0;">${escapeHtml(payload.whatsapp)}</td></tr>
        ${detailRows}
      </table>
    </div>
  `;

  const result = await client.emails.send({
    from,
    to,
    subject: `Novo lead: ${payload.nome} (${payload.vertical})`,
    html,
  });

  if (result.error) {
    throw new Error(`Falha ao enviar e-mail via Resend: ${result.error.message}`);
  }
}

export async function sendWelcomeCheckoutEmail(
  to: string,
  ownerName: string,
  bemVindoUrl: string
): Promise<void> {
  const client = getResendClient();
  const from = process.env.LEAD_NOTIFICATION_EMAIL_FROM;
  if (!client || !from) return;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px;">
      <h2 style="margin:0 0 12px;">Pagamento confirmado, ${escapeHtml(ownerName.split(" ")[0])}!</h2>
      <p style="color:#444;line-height:1.6;">
        Recebemos seu pagamento com sucesso. Clique no botão abaixo para preencher
        as últimas informações e iniciar a configuração do seu painel Nexus Drive.
      </p>
      <p style="margin:20px 0;">
        <a href="${bemVindoUrl}" style="display:inline-block;background:#18181b;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;">
          Configurar meu painel →
        </a>
      </p>
      <p style="color:#999;font-size:13px;line-height:1.5;">
        Este link expira em 24 horas. Se tiver qualquer problema, entre em contato com nossa equipe.
      </p>
    </div>
  `;

  const result = await client.emails.send({
    from,
    to,
    subject: "Pagamento confirmado — configure seu painel Nexus Drive",
    html,
  });

  if (result.error) {
    throw new Error(`Falha ao enviar e-mail de boas-vindas via Resend: ${result.error.message}`);
  }
}

export async function sendProvisioningStartedEmail(to: string, ownerName: string): Promise<void> {
  const client = getResendClient();
  const from = process.env.LEAD_NOTIFICATION_EMAIL_FROM;
  if (!client || !from) return;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px;">
      <h2 style="margin:0 0 12px;">Estamos configurando seu ambiente, ${escapeHtml(ownerName.split(" ")[0])}!</h2>
      <p style="color:#444;line-height:1.6;">
        Recebemos seu pagamento e já iniciamos a configuração do seu painel Nexus Drive.
        Esse processo leva alguns minutos — assim que estiver pronto, você receberá um
        segundo e-mail com o link de acesso e as instruções para definir sua senha.
      </p>
      <p style="color:#999;font-size:13px;">Não feche nada, não é necessária nenhuma ação da sua parte agora.</p>
    </div>
  `;

  const result = await client.emails.send({
    from,
    to,
    subject: "Configurando seu painel Nexus Drive…",
    html,
  });

  if (result.error) {
    throw new Error(`Falha ao enviar e-mail de provisionamento via Resend: ${result.error.message}`);
  }
}

export async function sendActivationEmail(
  to: string,
  ownerName: string,
  dashboardUrl: string,
  activationUrl: string
): Promise<void> {
  const client = getResendClient();
  const from = process.env.LEAD_NOTIFICATION_EMAIL_FROM;
  if (!client || !from) return;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px;">
      <h2 style="margin:0 0 12px;">Seu painel está pronto, ${escapeHtml(ownerName.split(" ")[0])}!</h2>
      <p style="color:#444;line-height:1.6;">
        O ambiente do Nexus Drive foi configurado com sucesso. Clique no botão abaixo
        para definir sua senha e acessar o painel pela primeira vez.
        Este link expira em 72 horas.
      </p>
      <p style="margin:20px 0;">
        <a href="${activationUrl}" style="display:inline-block;background:#18181b;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;">
          Ativar minha conta
        </a>
      </p>
      <p style="color:#666;font-size:13px;">
        Endereço do seu painel: <a href="${escapeHtml(dashboardUrl)}" style="color:#18181b;">${escapeHtml(dashboardUrl)}</a>
      </p>
      <p style="color:#999;font-size:13px;line-height:1.5;">
        Se você não contratou o Nexus Drive, pode ignorar este e-mail com segurança.
      </p>
    </div>
  `;

  const result = await client.emails.send({
    from,
    to,
    subject: "Seu painel Nexus Drive está pronto — ative sua conta",
    html,
  });

  if (result.error) {
    throw new Error(`Falha ao enviar e-mail de ativação via Resend: ${result.error.message}`);
  }
}

/**
 * Returns false (rather than throwing) when Resend isn't configured, so the
 * caller can decide how to surface that to the admin requesting a reset.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const client = getResendClient();
  const from = process.env.LEAD_NOTIFICATION_EMAIL_FROM;
  if (!client || !from) return false;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px;">
      <h2 style="margin:0 0 12px;">Redefinir sua senha</h2>
      <p style="color:#444;line-height:1.5;">
        Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo
        para escolher uma nova senha. Este link expira em 1 hora.
      </p>
      <p style="margin:20px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#18181b;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;">
          Redefinir senha
        </a>
      </p>
      <p style="color:#999;font-size:13px;line-height:1.5;">
        Se você não pediu essa redefinição, pode ignorar este e-mail com segurança — sua senha
        atual continua válida.
      </p>
    </div>
  `;

  const result = await client.emails.send({
    from,
    to,
    subject: "Redefinir sua senha",
    html,
  });

  if (result.error) {
    throw new Error(`Falha ao enviar e-mail de redefinição via Resend: ${result.error.message}`);
  }
  return true;
}
