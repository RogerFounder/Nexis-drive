import Link from "next/link";
import { ResetPasswordForm } from "@/components/shared/auth/reset-password-form";
import { AuthSplitLayout } from "@/components/shared/auth/auth-split-layout";

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthSplitLayout
        heading="Link inválido"
        tagline="Este link de redefinição está incompleto ou já foi usado."
      >
        <Link
          href="/esqueci-senha"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.98]"
        >
          Solicitar novo link
        </Link>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout heading="Escolha uma nova senha" tagline="Defina uma senha nova para sua conta.">
      <ResetPasswordForm token={token} />
    </AuthSplitLayout>
  );
}
