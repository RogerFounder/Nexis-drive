import Link from "next/link";

export function TrialBanner({ daysRemaining }: { daysRemaining: number }) {
  const dayLabel = daysRemaining === 1 ? "1 dia" : `${daysRemaining} dias`;

  return (
    <div className="relative z-10 border-b border-amber-500/20 bg-amber-500/10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-6 py-2.5">
        <p className="text-sm text-amber-300">
          Período de teste gratuito · restam <span className="font-semibold">{dayLabel}</span>
        </p>
        <Link
          href="/assinatura"
          className="text-sm font-semibold text-amber-200 underline-offset-2 hover:underline"
        >
          Assinar agora
        </Link>
      </div>
    </div>
  );
}
