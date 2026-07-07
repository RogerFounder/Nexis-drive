import Link from "next/link";
import { loadDashboardAccess } from "@/server/services/billing/require-access";
import { logoutAction } from "@/server/actions/logout.action";
import { FormCard } from "@/components/ui/form-card";

export const dynamic = "force-dynamic";

const CHECKOUT_URL = process.env.ASAAS_CHECKOUT_URL;

export default async function AssinaturaPage() {
  const { access } = await loadDashboardAccess();
  const expired = access.reason === "EXPIRED";

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950 lg:grid lg:grid-cols-2">
      <aside
        aria-hidden
        className="relative hidden overflow-hidden bg-zinc-950 lg:flex lg:flex-col lg:justify-center lg:gap-4 lg:px-16 lg:py-20"
      >
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex max-w-md flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">
            {expired ? "Seu período de teste terminou" : "Assinatura Nexus Drive"}
          </h1>
          <p className="text-lg leading-relaxed text-zinc-400">
            {expired
              ? "Para continuar gerenciando seus leads e emitir laudos, ative sua assinatura. Seus dados seguem salvos e intactos."
              : "Ative sua assinatura para manter o acesso ao painel após o período de teste."}
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 lg:py-0">
        <div className="mb-10 text-center lg:hidden">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {expired ? "Seu período de teste terminou" : "Assinatura Nexus Drive"}
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {expired
              ? "Para continuar gerenciando seus leads e emitir laudos, ative sua assinatura. Seus dados seguem salvos e intactos."
              : "Ative sua assinatura para manter o acesso ao painel após o período de teste."}
          </p>
        </div>

        <FormCard>
          <div className="flex flex-col gap-6">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Plano mensal
              </span>
              <span className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Nexus Drive
              </span>
            </div>

            <ul className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <span aria-hidden className="text-emerald-500">✓</span> Captura ilimitada de leads
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden className="text-emerald-500">✓</span> Gerenciador com funil de status
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden className="text-emerald-500">✓</span> Laudos técnicos ilimitados
              </li>
            </ul>

            {CHECKOUT_URL ? (
              <a
                href={CHECKOUT_URL}
                className="flex w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-3.5 text-[15px] font-medium text-white transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.98] dark:bg-white dark:text-zinc-900"
              >
                Assinar via Asaas
              </a>
            ) : (
              <p className="rounded-xl bg-zinc-100 px-4 py-3 text-center text-xs leading-relaxed text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                O link de pagamento ainda não foi configurado. Defina{" "}
                <code className="font-mono">ASAAS_CHECKOUT_URL</code> no ambiente para habilitar a
                assinatura.
              </p>
            )}
          </div>
        </FormCard>

        <div className="mt-6 flex items-center gap-4 text-sm">
          {!expired && (
            <Link
              href="/dashboard"
              className="font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Voltar ao painel
            </Link>
          )}
          <form action={logoutAction}>
            <button
              type="submit"
              className="font-medium text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
