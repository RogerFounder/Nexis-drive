import type { ReactNode } from "react";
import Link from "next/link";
import { logoutAction } from "@/server/actions/logout.action";
import { requireDashboardAccess } from "@/server/services/billing/require-access";
import { TrialBanner } from "@/components/shared/dashboard/billing/trial-banner";
import { MobileNav } from "@/components/shared/dashboard/mobile-nav";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { email, access } = await requireDashboardAccess();

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-zinc-950 print:bg-white">
      <div
        aria-hidden
        className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl print:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -right-32 -bottom-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl print:hidden"
      />

      <header className="relative z-10 border-b border-zinc-800 bg-zinc-900/70 backdrop-blur-sm print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <span className="text-sm font-semibold tracking-tight text-zinc-50">
            Nexus Drive <span className="font-normal text-zinc-500">· Painel</span>
          </span>
          <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-400 sm:flex">
            <Link href="/dashboard" className="transition-colors hover:text-zinc-100">
              Visão geral
            </Link>
            <Link href="/dashboard/leads" className="transition-colors hover:text-zinc-100">
              Leads
            </Link>
            <Link href="/dashboard/laudo" className="transition-colors hover:text-zinc-100">
              Laudo Técnico
            </Link>
            <Link href="/dashboard/configuracoes" className="transition-colors hover:text-zinc-100">
              Configurações
            </Link>
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-xs text-zinc-500">{email}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
              >
                Sair
              </button>
            </form>
          </div>
          <MobileNav email={email} />
        </div>
      </header>
      {access.reason === "TRIAL" && (
        <div className="print:hidden">
          <TrialBanner daysRemaining={access.trialDaysRemaining} />
        </div>
      )}
      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 py-10 print:p-0">
        {children}
      </main>
    </div>
  );
}
