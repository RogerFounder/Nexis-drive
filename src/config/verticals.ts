export type Vertical = "assistencia" | "estetica";

const VALID_VERTICALS: readonly Vertical[] = ["assistencia", "estetica"];

export function getActiveVertical(): Vertical {
  const value = process.env.VERTENTE_ATIVA;

  if (!value || !VALID_VERTICALS.includes(value as Vertical)) {
    throw new Error(
      `VERTENTE_ATIVA inválida ou não definida (valor: ${JSON.stringify(value)}). ` +
        `Defina-a em .env como um destes valores: ${VALID_VERTICALS.join(" | ")}.`
    );
  }

  return value as Vertical;
}
