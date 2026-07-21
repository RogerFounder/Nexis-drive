import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthSplitLayout } from "@/components/shared/auth/auth-split-layout";
import { findCheckoutSessionByToken } from "@/server/db/repositories/checkout-session.repository";
import { PostPaymentForm } from "./post-payment-form";

export const metadata: Metadata = { title: "Configurar seu painel — Nexus Drive" };

export default async function BemVindoPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s: token } = await searchParams;
  if (!token) notFound();

  const session = await findCheckoutSessionByToken(token);
  if (!session || session.expiresAt < new Date()) notFound();

  return (
    <AuthSplitLayout
      heading={`Olá, ${session.ownerName.split(" ")[0]}!`}
      tagline="Só mais dois dados para configurar seu painel"
    >
      <PostPaymentForm sessionToken={token} />
    </AuthSplitLayout>
  );
}
