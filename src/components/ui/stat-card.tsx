import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  tone?: "neutral" | "emphasis" | "success" | "warning";
}

const TONE_STYLES: Record<
  NonNullable<StatCardProps["tone"]>,
  { card: string; value: string; label: string }
> = {
  neutral: {
    card: "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
    value: "text-zinc-900 dark:text-zinc-50",
    label: "text-zinc-500 dark:text-zinc-400",
  },
  emphasis: {
    card: "border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100",
    value: "text-white dark:text-zinc-900",
    label: "text-zinc-300 dark:text-zinc-600",
  },
  success: {
    card: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10",
    value: "text-emerald-900 dark:text-emerald-300",
    label: "text-emerald-700/70 dark:text-emerald-400/70",
  },
  warning: {
    card: "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10",
    value: "text-amber-900 dark:text-amber-300",
    label: "text-amber-700/70 dark:text-amber-400/70",
  },
};

export function StatCard({ label, value, tone = "neutral" }: StatCardProps) {
  const styles = TONE_STYLES[tone];

  return (
    <div className={`rounded-2xl border p-5 ${styles.card}`}>
      <p className={`text-3xl font-semibold tracking-tight ${styles.value}`}>{value}</p>
      <p className={`mt-1 text-xs font-medium ${styles.label}`}>{label}</p>
    </div>
  );
}
