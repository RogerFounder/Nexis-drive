"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard-error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-200 py-20 text-center dark:border-zinc-800">
      <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">Algo deu errado</p>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Não foi possível carregar esta seção do painel
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        Isso já foi registrado. Seus leads e laudos continuam salvos — tente de novo.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.98] dark:bg-white dark:text-zinc-900"
      >
        Tentar novamente
      </button>
    </div>
  );
}
