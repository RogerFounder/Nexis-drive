import type { StatusPagamento } from "@/generated/prisma/client";

interface PaymentSumGroup {
  statusPagamento: StatusPagamento;
  _sum: { valorServico: unknown };
}

export interface FinancialSummary {
  totalRecebido: number;
  totalEmAberto: number;
}

/** Reduces a groupBy-by-statusPagamento result into the two totals the leads dashboard shows. */
export function buildFinancialSummary(groups: PaymentSumGroup[]): FinancialSummary {
  let totalRecebido = 0;
  let totalEmAberto = 0;

  for (const group of groups) {
    const sum = group._sum.valorServico ? Number(group._sum.valorServico) : 0;
    if (group.statusPagamento === "PAGO") totalRecebido = sum;
    if (group.statusPagamento === "PENDENTE") totalEmAberto = sum;
  }

  return { totalRecebido, totalEmAberto };
}
