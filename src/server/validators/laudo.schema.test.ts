import { describe, expect, it } from "vitest";
import { laudoIntakeSchema } from "./laudo.schema";

describe("laudoIntakeSchema", () => {
  const allowedItems = ["Riscos ou marcas na pintura", "Amassados na lataria"];
  const schema = laudoIntakeSchema(allowedItems);

  it("accepts a valid subset of the allowed checklist items", () => {
    const result = schema.parse({
      itensChecklist: ["Amassados na lataria"],
      observacoesEntrada: "Sem outras avarias visíveis.",
    });
    expect(result.itensChecklist).toEqual(["Amassados na lataria"]);
  });

  it("accepts an empty checklist (no visible damage)", () => {
    const result = schema.parse({
      itensChecklist: [],
      observacoesEntrada: "Nenhuma avaria visível.",
    });
    expect(result.itensChecklist).toEqual([]);
  });

  it("rejects an item that isn't in the allowlist (tampered client request)", () => {
    expect(() =>
      schema.parse({
        itensChecklist: ["Item forjado que não existe na configuração"],
        observacoesEntrada: "Tentativa de burlar a validação.",
      })
    ).toThrow();
  });

  it("rejects more items than the allowlist could possibly contain", () => {
    expect(() =>
      schema.parse({
        itensChecklist: [
          "Riscos ou marcas na pintura",
          "Amassados na lataria",
          "Item extra inventado",
        ],
        observacoesEntrada: "Mais itens do que o permitido.",
      })
    ).toThrow();
  });

  it("rejects observações shorter than the minimum", () => {
    expect(() =>
      schema.parse({ itensChecklist: [], observacoesEntrada: "oi" })
    ).toThrow();
  });
});
