export function getFieldControlClassName(hasError: boolean, className?: string): string {
  const base =
    "w-full rounded-xl border bg-zinc-800/50 px-4 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-500 transition-[border-color,box-shadow,background-color] duration-200 ease-out outline-none focus:bg-zinc-900 focus:ring-4";
  const state = hasError
    ? "border-red-500/40 focus:border-red-500 focus:ring-red-500/10"
    : "border-zinc-700 focus:border-zinc-100 focus:ring-zinc-100/10";

  return `${base} ${state} ${className ?? ""}`;
}

export function getFieldLabelClassName(): string {
  return "text-sm font-medium text-zinc-300";
}

export function getFieldErrorClassName(): string {
  return "animate-field-message text-xs font-medium text-red-400";
}

export function getFieldHintClassName(): string {
  return "text-xs text-zinc-500";
}
