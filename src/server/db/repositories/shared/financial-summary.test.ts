import { describe, expect, it } from "vitest";
import { buildFinancialSummary } from "./financial-summary";

describe("buildFinancialSummary", () => {
  it("maps PAGO to totalRecebido and PENDENTE to totalEmAberto", () => {
    const summary = buildFinancialSummary([
      { statusPagamento: "PAGO", _sum: { valorServico: 150.5 } },
      { statusPagamento: "PENDENTE", _sum: { valorServico: 89.9 } },
    ]);
    expect(summary).toEqual({ totalRecebido: 150.5, totalEmAberto: 89.9 });
  });

  it("defaults missing groups to zero", () => {
    const summary = buildFinancialSummary([
      { statusPagamento: "PAGO", _sum: { valorServico: 100 } },
    ]);
    expect(summary).toEqual({ totalRecebido: 100, totalEmAberto: 0 });
  });

  it("treats a null sum (no leads with a value in that group) as zero", () => {
    const summary = buildFinancialSummary([
      { statusPagamento: "PAGO", _sum: { valorServico: null } },
      { statusPagamento: "PENDENTE", _sum: { valorServico: null } },
    ]);
    expect(summary).toEqual({ totalRecebido: 0, totalEmAberto: 0 });
  });

  it("returns zeros for an empty group list", () => {
    expect(buildFinancialSummary([])).toEqual({ totalRecebido: 0, totalEmAberto: 0 });
  });
});
