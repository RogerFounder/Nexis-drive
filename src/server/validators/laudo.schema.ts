import { z } from "zod";
import { sanitizedTextSchema } from "./shared/common.schema";

export function laudoIntakeSchema(allowedItems: readonly string[]) {
  return z.object({
    itensChecklist: z
      .array(z.string())
      .max(allowedItems.length)
      .refine((items) => items.every((item) => allowedItems.includes(item)), {
        message: "Item de checklist inválido.",
      }),
    observacoesEntrada: sanitizedTextSchema({
      min: 5,
      max: 1000,
      fieldLabel: "As observações de entrada",
    }),
  });
}

export type LaudoIntakeInput = z.infer<ReturnType<typeof laudoIntakeSchema>>;
