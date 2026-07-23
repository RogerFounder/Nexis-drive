"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { toSlug } from "@/lib/slug";
import {
  findCheckoutSessionByToken,
  claimCheckoutSessionForDispatch,
} from "@/server/db/repositories/checkout-session.repository";
import { createProvisioningRequest } from "@/server/db/repositories/provisioning-request.repository";
import { dispatchProvisioningWorkflow } from "@/server/services/provisioning/github-dispatch";
import { sendProvisioningStartedEmail } from "@/server/services/notifications/email-channel";
import { reportError } from "@/server/services/monitoring/report-error";

const schema = z.object({
  sessionToken: z.string().min(1),
  clientName: z.string().min(2, "Informe o nome do negócio."),
  vertical: z.enum(["assistencia", "estetica"], {
    error: () => "Selecione a área de atuação.",
  }),
});

export interface SubmitProvisioningState {
  success: boolean;
  fieldErrors?: Partial<Record<"clientName" | "vertical", string>>;
  formError?: string;
}

export async function submitProvisioningAction(
  _prev: SubmitProvisioningState,
  formData: FormData
): Promise<SubmitProvisioningState> {
  const parsed = schema.safeParse({
    sessionToken: formData.get("sessionToken"),
    clientName: formData.get("clientName"),
    vertical: formData.get("vertical"),
  });

  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      fieldErrors: {
        clientName: fe.clientName?.[0],
        vertical: fe.vertical?.[0],
      },
    };
  }

  const { sessionToken, clientName, vertical } = parsed.data;

  const session = await findCheckoutSessionByToken(sessionToken);
  if (!session || session.expiresAt < new Date()) {
    return { success: false, formError: "Link expirado. Entre em contato pelo WhatsApp." };
  }
  if (session.status === "DISPATCHED") {
    redirect("/provisionando");
  }
  if (session.status !== "PAID") {
    return {
      success: false,
      formError:
        "Pagamento ainda não confirmado. Aguarde alguns segundos e tente novamente.",
    };
  }

  const clientSlug = toSlug(clientName);
  if (!clientSlug) {
    return {
      success: false,
      fieldErrors: { clientName: "Nome inválido para gerar o slug do projeto." },
    };
  }

  // Atomic claim: only the first concurrent request transitions PAID→DISPATCHED.
  const claimed = await claimCheckoutSessionForDispatch(session.id);
  if (!claimed) {
    // Another request already claimed it — provisioning is underway.
    redirect("/provisionando");
  }

  const request = await createProvisioningRequest({
    clientName,
    clientSlug,
    vertical,
    adminEmail: session.email,
    asaasCustomerId: session.asaasCustomerId,
    asaasSubscriptionId: session.asaasSubscriptionId ?? "",
    checkoutSessionId: session.id,
  });

  try {
    await dispatchProvisioningWorkflow({
      provisioningRequestId: request.id,
      clientName,
      clientSlug,
      vertical,
      adminEmail: session.email,
      cpfCnpj: session.cpfCnpj,
      asaasCustomerId: session.asaasCustomerId,
      asaasSubscriptionId: session.asaasSubscriptionId ?? "",
    });
  } catch {
    return {
      success: false,
      formError:
        "Erro ao iniciar o provisionamento. Nossa equipe foi notificada. Tente novamente ou entre em contato.",
    };
  }

  await sendProvisioningStartedEmail(session.email, session.ownerName).catch((error) =>
    reportError("submit-provisioning:started-email", error)
  );

  redirect("/provisionando");
}
