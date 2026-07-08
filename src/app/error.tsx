"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side render/runtime errors don't reach our Server Action
    // catch blocks — this is the last line of defense, so it must log too.
    console.error("[global-error]", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-6 py-20 text-center dark:bg-zinc-950">
      <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">Algo deu errado</p>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Não foi possível carregar esta página
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        Isso já foi registrado. Tente de novo — se persistir, seus dados continuam salvos e
        intactos.
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
