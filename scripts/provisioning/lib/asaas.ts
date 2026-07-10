/**
 * Thin wrapper over the Asaas API for provisioning one customer +
 * subscription + webhook per client — the standard "one merchant, many
 * customers" B2B billing pattern (not the "subcontas" white-label feature,
 * which is for a different use case: platforms whose *users* need their own
 * payment-collection identity, not this one).
 */

const ASAAS_API_BASE = "https://api.asaas.com/v3";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} não está definida em .env.provisioning.`);
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

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Asaas API ${path} falhou (${response.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

interface CreateCustomerInput {
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone?: string;
}

export async function createAsaasCustomer(input: CreateCustomerInput): Promise<{ customerId: string }> {
  const body = (await asaasFetch("/customers", {
    method: "POST",
    body: JSON.stringify(input),
  })) as { id: string };

  return { customerId: body.id };
}

interface CreateSubscriptionInput {
  customerId: string;
  value: number;
  description: string;
  /** First charge date, "YYYY-MM-DD". Defaults to today if omitted. */
  nextDueDate?: string;
}

export async function createAsaasSubscription(
  input: CreateSubscriptionInput
): Promise<{ subscriptionId: string; invoiceUrl: string }> {
  const nextDueDate = input.nextDueDate ?? new Date().toISOString().slice(0, 10);

  const body = (await asaasFetch("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customerId,
      billingType: "UNDEFINED", // lets the payer choose Pix, boleto or card at checkout
      value: input.value,
      nextDueDate,
      cycle: "MONTHLY",
      description: input.description,
    }),
  })) as { id: string };

  // The subscription itself doesn't return a checkout link — fetch the first
  // generated charge for its invoice URL, matching the "Link de Pagamento"
  // flow used for the main deployment.
  const payments = (await asaasFetch(`/payments?subscription=${body.id}&limit=1`, {
    method: "GET",
  })) as { data: [{ invoiceUrl: string }] };

  return { subscriptionId: body.id, invoiceUrl: payments.data[0].invoiceUrl };
}

const WEBHOOK_EVENTS = [
  "PAYMENT_CONFIRMED",
  "PAYMENT_RECEIVED",
  "PAYMENT_OVERDUE",
  "PAYMENT_DELETED",
  "PAYMENT_REFUNDED",
  "SUBSCRIPTION_DELETED",
];

/** Registers a webhook for this client's deployment on Roger's single shared Asaas account. */
export async function createAsaasWebhook(
  name: string,
  targetUrl: string,
  authToken: string,
  notifyEmail: string
): Promise<{ webhookId: string }> {
  const body = (await asaasFetch("/webhooks", {
    method: "POST",
    body: JSON.stringify({
      name,
      url: targetUrl,
      email: notifyEmail,
      enabled: true,
      interrupted: false,
      apiVersion: 3,
      authToken,
      sendType: "SEQUENTIALLY",
      events: WEBHOOK_EVENTS,
    }),
  })) as { id: string };

  return { webhookId: body.id };
}
