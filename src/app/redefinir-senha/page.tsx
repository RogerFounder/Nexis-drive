import Link from "next/link";
import { ResetPasswordForm } from "@/components/shared/auth/reset-password-form";

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-6 py-20 text-center dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Link inválido
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Este link de redefinição está incompleto ou já foi usado.
        </p>
        <Link
          href="/esqueci-senha"
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.98] dark:bg-white dark:text-zinc-900"
        >
          Solicitar novo link
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-20 dark:bg-zinc-950">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Escolha uma nova senha
        </h1>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
}
