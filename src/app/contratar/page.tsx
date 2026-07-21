import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthSplitLayout } from "@/components/shared/auth/auth-split-layout";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Contratar — Nexus Drive" };

const PLAN_LABELS: Record<string, { label: string; tagline: string }> = {
  mensal: {
    label: "Plano mensal — R$ 147/mês",
    tagline: "Sem taxa de entrada. Cancele quando quiser.",
  },
  vitalicio: {
    label: "Plano vitalício — R$ 597",
    tagline: "Pagamento único. Acesso permanente, sem mensalidade.",
  },
};

export default async function ContratarPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string }>;
}) {
  const { plano } = await searchParams;
  const planKey = plano === "vitalicio" ? "vitalicio" : "mensal";
  const planInfo = PLAN_LABELS[planKey];

  if (!planInfo) notFound();

  return (
    <AuthSplitLayout heading="Nexus Drive" tagline={planInfo.tagline}>
      <CheckoutForm planType={planKey === "vitalicio" ? "VITALICIO" : "MENSAL"} planLabel={planInfo.label} />
    </AuthSplitLayout>
  );
}
