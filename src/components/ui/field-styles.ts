export function getFieldControlClassName(hasError: boolean, className?: string): string {
  const base =
    "w-full rounded-xl border bg-zinc-50/60 px-4 py-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 transition-[border-color,box-shadow,background-color] duration-200 ease-out outline-none focus:bg-white focus:ring-4 dark:bg-zinc-800/50 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-900";
  const state = hasError
    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500/40"
    : "border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/5 dark:border-zinc-700 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10";

  return `${base} ${state} ${className ?? ""}`;
}

export function getFieldLabelClassName(): string {
  return "text-sm font-medium text-zinc-700 dark:text-zinc-300";
}

export function getFieldErrorClassName(): string {
  return "animate-field-message text-xs font-medium text-red-600 dark:text-red-400";
}

export function getFieldHintClassName(): string {
  return "text-xs text-zinc-400 dark:text-zinc-500";
}
