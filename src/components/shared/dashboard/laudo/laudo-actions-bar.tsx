"use client";

import { useState } from "react";

interface LaudoActionsBarProps {
  whatsappSummary: string;
  laudoId: string;
}

type CopyState = "idle" | "copied" | "error";

/**
 * navigator.clipboard.writeText requires a secure context + user-gesture
 * permission that isn't always granted (older browsers, some in-app
 * WebViews). Falls back to the legacy execCommand selection-copy trick,
 * which has broader support, before giving up.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy fallback
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const succeeded = document.execCommand("copy");
  document.body.removeChild(textarea);
  return succeeded;
}

export function LaudoActionsBar({ whatsappSummary, laudoId }: LaudoActionsBarProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  async function handleCopy() {
    const succeeded = await copyToClipboard(whatsappSummary);
    setCopyState(succeeded ? "copied" : "error");
    setTimeout(() => setCopyState("idle"), 2000);
  }

  const copyLabel =
    copyState === "copied" ? "Copiado!" : copyState === "error" ? "Não foi possível copiar" : "Copiar para WhatsApp";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors duration-150 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
      >
        {copyLabel}
      </button>
      <a
        href={`/api/laudo/${laudoId}/pdf`}
        className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.98] dark:bg-white dark:text-zinc-900"
      >
        Baixar PDF
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors duration-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        Imprimir
      </button>
    </div>
  );
}
