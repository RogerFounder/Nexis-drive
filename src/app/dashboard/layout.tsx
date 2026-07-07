import type { ReactNode } from "react";
import Link from "next/link";
import { logoutAction } from "@/server/actions/logout.action";
import { requireDashboardAccess } from "@/server/services/billing/require-access";
import { TrialBanner } from "@/components/shared/dashboard/billing/trial-banner";
import { MobileNav } from "@/components/shared/dashboard/mobile-nav";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { email, access } = await requireDashboardAccess();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="relative border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Nexus Drive <span className="font-normal text-zinc-400">· Painel</span>
          </span>
          <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-500 sm:flex dark:text-zinc-400">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Visão geral
            </Link>
            <Link
              href="/dashboard/leads"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Leads
            </Link>
            <Link
              href="/dashboard/laudo"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Laudo Técnico
            </Link>
            <Link
              href="/dashboard/configuracoes"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Configurações
            </Link>
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-xs text-zinc-400">{email}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Sair
              </button>
            </form>
          </div>
          <MobileNav email={email} />
        </div>
      </header>
      {access.reason === "TRIAL" && <TrialBanner daysRemaining={access.trialDaysRemaining} />}
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
