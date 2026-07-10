import type { StatusPagamento } from "@/generated/prisma/client";

export const PAYMENT_STATUS_LABELS: Record<StatusPagamento, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
};

const PAYMENT_STATUS_STYLES: Record<StatusPagamento, string> = {
  PENDENTE: "bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/20",
  PAGO: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/20",
};

export function PaymentStatusBadge({ status }: { status: StatusPagamento }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${PAYMENT_STATUS_STYLES[status]}`}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
