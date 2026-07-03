import { z } from "zod";
import { nomeCompletoSchema, sanitizedTextSchema, whatsappSchema } from "./shared/common.schema";

const VEICULO_REGEX = /^[\p{L}\p{N}\s'.,+/-]+$/u;

export const esteticaMotoresLeadSchema = z.object({
  nome: nomeCompletoSchema,
  whatsapp: whatsappSchema,
  veiculo: sanitizedTextSchema({
    min: 2,
    max: 80,
    fieldLabel: "A marca/modelo do veículo",
  }).refine((value) => VEICULO_REGEX.test(value), {
    message: "A marca/modelo do veículo contém caracteres inválidos.",
  }),
  servicoDesejado: sanitizedTextSchema({
    min: 5,
    max: 500,
    fieldLabel: "O serviço desejado",
  }),
});

export type EsteticaMotoresLeadInput = z.input<typeof esteticaMotoresLeadSchema>;
export type EsteticaMotoresLeadOutput = z.output<typeof esteticaMotoresLeadSchema>;
