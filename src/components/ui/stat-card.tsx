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
    card: "border-zinc-800 bg-zinc-900",
    value: "text-zinc-50",
    label: "text-zinc-400",
  },
  emphasis: {
    card: "border-zinc-100 bg-zinc-100",
    value: "text-zinc-900",
    label: "text-zinc-600",
  },
  success: {
    card: "border-emerald-500/20 bg-emerald-500/10",
    value: "text-emerald-300",
    label: "text-emerald-400",
  },
  warning: {
    card: "border-amber-500/20 bg-amber-500/10",
    value: "text-amber-300",
    label: "text-amber-400",
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
