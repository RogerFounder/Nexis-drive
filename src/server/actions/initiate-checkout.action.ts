"use server";

import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import {
  createAsaasCustomer,
  createAsaasSubscription,
  createAsaasSinglePayment,
} from "@/server/services/billing/asaas-client";
import { createCheckoutSession } from "@/server/db/repositories/checkout-session.repository";
import { reportError } from "@/server/services/monitoring/report-error";

const schema = z.object({
  ownerName: z.string().min(3, "Informe seu nome completo."),
  email: z.string().email("E-mail inválido."),
  cpfCnpj: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(z.string().min(11, "CPF ou CNPJ inválido.").max(14, "CPF ou CNPJ inválido.")),
  planType: z.enum(["MENSAL", "VITALICIO"]),
});

export interface InitiateCheckoutState {
  success: boolean;
  fieldErrors?: Partial<Record<"ownerName" | "email" | "cpfCnpj", string>>;
  formError?: string;
}

export async function initiateCheckoutAction(
  _prev: InitiateCheckoutState,
  formData: FormData
): Promise<InitiateCheckoutState> {
  const parsed = schema.safeParse({
    ownerName: formData.get("ownerName"),
    email: formData.get("email"),
    cpfCnpj: formData.get("cpfCnpj"),
    planType: formData.get("planType"),
  });

  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      fieldErrors: {
        ownerName: fe.ownerName?.[0],
        email: fe.email?.[0],
        cpfCnpj: fe.cpfCnpj?.[0],
      },
    };
  }

  const { ownerName, email, cpfCnpj, planType } = parsed.data;

  // Token generated before Asaas call — stored as externalReference in the
  // payment so the webhook can find this session without any redirect URL.
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  let invoiceUrl: string;
  let customerId: string;
  let subscriptionId: string | null = null;

  try {
    ({ customerId } = await createAsaasCustomer({ name: ownerName, email, cpfCnpj }));

    if (planType === "MENSAL") {
      const result = await createAsaasSubscription({
        customerId,
        clientName: ownerName,
        externalReference: token,
      });
      subscriptionId = result.subscriptionId;
      invoiceUrl = result.invoiceUrl;
    } else {
      const result = await createAsaasSinglePayment({
        customerId,
        clientName: ownerName,
        externalReference: token,
      });
      invoiceUrl = result.invoiceUrl;
    }
  } catch (error) {
    reportError("initiate-checkout:asaas", error);
    return {
      success: false,
      formError: "Erro ao iniciar o pagamento. Tente novamente em instantes.",
    };
  }

  await createCheckoutSession({
    token,
    ownerName,
    email,
    cpfCnpj,
    planType,
    asaasCustomerId: customerId,
    asaasSubscriptionId: subscriptionId,
    invoiceUrl,
    expiresAt,
  });

  redirect(invoiceUrl);
}
