import { z } from "zod";

const MAX_VALOR_SERVICO = 999_999.99;

/**
 * Internal-only (dashboard) schema — never reused by the public lead capture
 * forms. A customer must never be able to set their own service price or
 * mark themselves as paid.
 */
export const leadFinancialsSchema = z.object({
  valorServico: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .refine(
      (value) => value === null || (!Number.isNaN(Number(value)) && Number.isFinite(Number(value))),
      { message: "Informe um valor numérico válido." }
    )
    .refine((value) => value === null || Number(value) >= 0, {
      message: "O valor não pode ser negativo.",
    })
    .refine((value) => value === null || Number(value) <= MAX_VALOR_SERVICO, {
      message: `O valor máximo permitido é R$ ${MAX_VALOR_SERVICO.toLocaleString("pt-BR")}.`,
    })
    .transform((value) => (value === null ? null : Number(value))),
  statusPagamento: z.enum(["PENDENTE", "PAGO"], {
    message: "Selecione um status de pagamento válido.",
  }),
});

export type LeadFinancialsInput = z.infer<typeof leadFinancialsSchema>;
