import { z } from "zod";
import { nomeCompletoSchema, sanitizedTextSchema, whatsappSchema } from "./shared/common.schema";

const MODELO_DISPOSITIVO_REGEX = /^[\p{L}\p{N}\s'.,+/-]+$/u;

export const assistenciaTecnicaLeadSchema = z.object({
  nome: nomeCompletoSchema,
  whatsapp: whatsappSchema,
  modeloDispositivo: sanitizedTextSchema({
    min: 2,
    max: 80,
    fieldLabel: "O modelo do dispositivo",
  }).refine((value) => MODELO_DISPOSITIVO_REGEX.test(value), {
    message: "O modelo do dispositivo contém caracteres inválidos.",
  }),
  descricaoProblema: sanitizedTextSchema({
    min: 10,
    max: 1000,
    fieldLabel: "A descrição do problema",
  }),
});

export type AssistenciaTecnicaLeadInput = z.input<typeof assistenciaTecnicaLeadSchema>;
export type AssistenciaTecnicaLeadOutput = z.output<typeof assistenciaTecnicaLeadSchema>;
