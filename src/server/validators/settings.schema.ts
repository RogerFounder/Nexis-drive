import { z } from "zod";
import type { Vertical } from "@/config/verticals";

const CHECKLIST_ITEM_REGEX = /^[\p{L}\p{N}\s'.,()/-]+$/u;

const checklistItemSchema = z
  .string()
  .trim()
  .min(3, "Cada item precisa ter ao menos 3 caracteres.")
  .max(80, "Cada item pode ter no máximo 80 caracteres.")
  .refine((value) => CHECKLIST_ITEM_REGEX.test(value), {
    message: "O item contém caracteres inválidos.",
  });

export function settingsSchema(vertical: Vertical) {
  return z
    .object({
      motorServiceMode: z.enum(["ESTETICA", "OFICINA", "AMBOS"]).nullable(),
      checklistItems: z
        .array(checklistItemSchema)
        .min(1, "Adicione ao menos um item ao checklist.")
        .max(20, "No máximo 20 itens no checklist."),
    })
    .refine((data) => vertical !== "estetica" || data.motorServiceMode !== null, {
      message: "Selecione se atende estética, oficina ou ambos.",
      path: ["motorServiceMode"],
    });
}

export type SettingsInput = z.infer<ReturnType<typeof settingsSchema>>;
