"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/server/actions/logout.action";

const NAV_LINKS = [
  { href: "/dashboard", label: "Visão geral" },
  { href: "/dashboard/leads", label: "Leads" },
  { href: "/dashboard/laudo", label: "Laudo Técnico" },
  { href: "/dashboard/configuracoes", label: "Configurações" },
];

interface MobileNavProps {
  email: string;
}

export function MobileNav({ email }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        className="-m-2 flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors duration-150 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <nav className="animate-field-message absolute inset-x-0 top-full z-10 border-b border-zinc-200 bg-white px-6 py-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                        : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">{email}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Sair
              </button>
            </form>
          </div>
        </nav>
      )}
    </div>
  );
}
