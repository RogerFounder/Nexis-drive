import { LoginForm } from "@/components/shared/auth/login-form";
import { AuthSplitLayout } from "@/components/shared/auth/auth-split-layout";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; reset?: string }>;
}) {
  const { from, reset } = await searchParams;

  return (
    <AuthSplitLayout heading="Nexus Drive" tagline="Acesso restrito ao painel administrativo">
      <LoginForm redirectTo={from} resetSuccess={reset === "success"} />
    </AuthSplitLayout>
  );
}
