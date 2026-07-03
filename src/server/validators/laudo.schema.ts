import { z } from "zod";
import { sanitizedTextSchema } from "./shared/common.schema";
import { CONDITION_CHECKLIST_ITEMS } from "@/config/condition-checklist";
import type { Vertical } from "@/config/verticals";

export function laudoIntakeSchema(vertical: Vertical) {
  const allowedItems = CONDITION_CHECKLIST_ITEMS[vertical];

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
