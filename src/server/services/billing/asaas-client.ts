/**
 * Asaas API client used by the main nexis-drive site for the self-serve
 * checkout flow — creates one customer + recurring subscription per prospect.
 * The master provisioning keys (Neon, Vercel) stay out of this site;
 * ASAAS_API_KEY is safe here because it only scopes to billing operations,
 * not to infrastructure creation.
 */

const ASAAS_API_BASE = "https://api.asaas.com/v3";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Env var ${name} não configurada.`);
  return value;
}

async function asaasFetch(path: string, init: RequestInit): Promise<unknown> {
  const apiKey = requireEnv("ASAAS_API_KEY");
  const response = await fetch(`${ASAAS_API_BASE}${path}`, {
    ...init,
    headers: {
      access_token: apiKey,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const body = (await response.json()) as unknown;
  if (!response.ok) {
    throw new Error(`Asaas ${path} (${response.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

export async function createAsaasCustomer(input: {
  name: string;
  email: string;
  cpfCnpj: string;
}): Promise<{ customerId: string }> {
  const body = (await asaasFetch("/customers", {
    method: "POST",
    body: JSON.stringify(input),
  })) as { id: string };

  return { customerId: body.id };
}

const SUBSCRIPTION_VALUE = Number(process.env.ASAAS_SUBSCRIPTION_VALUE ?? "147");

export async function createAsaasSubscription(input: {
  customerId: string;
  clientName: string;
  externalReference: string;
}): Promise<{ subscriptionId: string; invoiceUrl: string }> {
  const nextDueDate = new Date().toISOString().slice(0, 10);

  const body = (await asaasFetch("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customerId,
      billingType: "UNDEFINED",
      value: SUBSCRIPTION_VALUE,
      nextDueDate,
      cycle: "MONTHLY",
      description: `Nexus Drive — assinatura mensal (${input.clientName})`,
      externalReference: input.externalReference,
    }),
  })) as { id: string };

  const payments = (await asaasFetch(`/payments?subscription=${body.id}&limit=1`, {
    method: "GET",
  })) as { data: [{ invoiceUrl: string }] };

  return { subscriptionId: body.id, invoiceUrl: payments.data[0].invoiceUrl };
}

const LIFETIME_VALUE = Number(process.env.ASAAS_LIFETIME_VALUE ?? "597");

export async function createAsaasSinglePayment(input: {
  customerId: string;
  clientName: string;
  externalReference: string;
}): Promise<{ invoiceUrl: string }> {
  const dueDate = new Date().toISOString().slice(0, 10);

  const body = (await asaasFetch("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customerId,
      billingType: "UNDEFINED",
      value: LIFETIME_VALUE,
      dueDate,
      description: `Nexus Drive — acesso vitalício, plano fundador (${input.clientName})`,
      externalReference: input.externalReference,
    }),
  })) as { invoiceUrl: string };

  return { invoiceUrl: body.invoiceUrl };
}
