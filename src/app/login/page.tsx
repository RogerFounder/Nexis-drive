import { LoginForm } from "@/components/shared/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; reset?: string }>;
}) {
  const { from, reset } = await searchParams;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950 lg:grid lg:grid-cols-2">
      <aside
        aria-hidden
        className="relative hidden overflow-hidden bg-zinc-950 lg:flex lg:flex-col lg:justify-center lg:gap-6 lg:px-16 lg:py-20"
      >
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex max-w-md flex-col gap-4">
          <h1 className="text-5xl font-semibold tracking-tight text-zinc-50">Nexus Drive</h1>
          <p className="text-lg leading-relaxed text-zinc-400">
            Painel de gestão para leads, laudos técnicos e assinatura do seu negócio.
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 lg:py-0">
        <div className="mb-10 text-center lg:hidden">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Nexus Drive
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Acesso restrito ao painel administrativo
          </p>
        </div>
        <LoginForm redirectTo={from} resetSuccess={reset === "success"} />
      </div>
    </div>
  );
}
