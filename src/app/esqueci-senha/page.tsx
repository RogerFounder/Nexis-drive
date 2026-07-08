import { RequestPasswordResetForm } from "@/components/shared/auth/request-password-reset-form";

export default function EsqueciSenhaPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-20 dark:bg-zinc-950">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Esqueceu sua senha?
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Informe o e-mail da sua conta e enviaremos um link para você escolher uma nova senha.
        </p>
      </div>
      <RequestPasswordResetForm />
    </div>
  );
}
