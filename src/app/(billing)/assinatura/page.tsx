import Link from "next/link";
import { loadDashboardAccess } from "@/server/services/billing/require-access";
import { logoutAction } from "@/server/actions/logout.action";
import { FormCard } from "@/components/ui/form-card";
import { AuthSplitLayout } from "@/components/shared/auth/auth-split-layout";

export const dynamic = "force-dynamic";

const CHECKOUT_URL = process.env.ASAAS_CHECKOUT_URL;

export default async function AssinaturaPage() {
  const { access } = await loadDashboardAccess();
  const expired = access.reason === "EXPIRED";

  return (
    <AuthSplitLayout
      heading={expired ? "Seu período de teste terminou" : "Assinatura Nexus Drive"}
      tagline={
        expired
          ? "Para continuar gerenciando seus leads e emitir laudos, ative sua assinatura. Seus dados seguem salvos e intactos."
          : "Ative sua assinatura para manter o acesso ao painel após o período de teste."
      }
    >
      <FormCard>
        <div className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-zinc-300">Plano mensal</span>
            <span className="text-2xl font-semibold tracking-tight text-zinc-50">Nexus Drive</span>
          </div>

          <ul className="flex flex-col gap-2 text-sm text-zinc-400">
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
              className="flex w-full items-center justify-center rounded-full bg-white px-6 py-3.5 text-[15px] font-medium text-zinc-900 transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.98]"
            >
              Assinar via Asaas
            </a>
          ) : (
            <p className="rounded-xl bg-zinc-800 px-4 py-3 text-center text-xs leading-relaxed text-zinc-400">
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
            className="font-medium text-zinc-500 transition-colors hover:text-zinc-100"
          >
            Voltar ao painel
          </Link>
        )}
        <form action={logoutAction}>
          <button
            type="submit"
            className="font-medium text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Sair
          </button>
        </form>
      </div>
    </AuthSplitLayout>
  );
}
