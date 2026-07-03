import { z } from "zod";

const NOME_REGEX = /^[\p{L}\s'.-]+$/u;

export const nomeCompletoSchema = z
  .string()
  .trim()
  .min(3, "Informe o nome completo.")
  .max(120, "O nome deve ter no máximo 120 caracteres.")
  .refine((value) => NOME_REGEX.test(value), {
    message: "O nome deve conter apenas letras, espaços, apóstrofos, pontos e hifens.",
  });

/**
 * Accepts common Brazilian mobile formats — with/without +55, DDD in
 * parentheses, with/without the leading 9 and separators — then normalizes
 * everything to E.164 (+55DDDXXXXXXXXX) so downstream code never has to
 * branch on input shape.
 */
const WHATSAPP_REGEX =
  /^(?:\+?55\s?)?\(?([1-9][0-9])\)?[\s.-]?9?[6-9][0-9]{3}[\s.-]?[0-9]{4}$/;

export const whatsappSchema = z
  .string()
  .trim()
  .min(10, "Informe um número de WhatsApp válido.")
  .max(20, "Número de WhatsApp inválido.")
  .refine((value) => WHATSAPP_REGEX.test(value), {
    message: "Use o formato (DDD) 9XXXX-XXXX, com ou sem +55.",
  })
  .transform((value) => {
    const digits = value.replace(/\D/g, "");
    const nationalNumber =
      digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;
    return `+55${nationalNumber}`;
  });

/**
 * Allowlist (not blocklist) of characters permitted in free-text fields:
 * letters (incl. accents), digits, whitespace and common punctuation. This
 * rejects control characters, HTML/script delimiters ('<', '>', backticks)
 * and anything else outside the list by construction — closing off
 * injection at the validation boundary, on top of (not instead of)
 * output-side escaping wherever the value is later rendered.
 */
const SAFE_TEXT_REGEX = /^[\p{L}\p{N}\s.,!?:;'"()\-/@+]*$/u;

interface SanitizedTextOptions {
  min: number;
  max: number;
  fieldLabel: string;
}

export function sanitizedTextSchema({ min, max, fieldLabel }: SanitizedTextOptions) {
  return z
    .string()
    .trim()
    .min(min, `${fieldLabel} deve ter pelo menos ${min} caracteres.`)
    .max(max, `${fieldLabel} deve ter no máximo ${max} caracteres.`)
    .refine((value) => SAFE_TEXT_REGEX.test(value), {
      message: `${fieldLabel} contém caracteres não permitidos.`,
    });
}
