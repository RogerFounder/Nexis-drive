import { LoginForm } from "@/components/shared/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-20 dark:bg-zinc-950">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Nexis Drive
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Acesso restrito ao painel administrativo
        </p>
      </div>
      <LoginForm redirectTo={from} />
    </div>
  );
}
