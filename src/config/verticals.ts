import type { MotorServiceMode } from "@/generated/prisma/client";

export type Vertical = "assistencia" | "estetica";

const VALID_VERTICALS: readonly Vertical[] = ["assistencia", "estetica"];

export const VERTICAL_TAGLINE: Record<Vertical, string> = {
  assistencia: "Assistência técnica premium para o seu dispositivo, do diagnóstico à entrega.",
  estetica: "Cuidado especializado para o seu veículo, com transparência do início ao fim.",
};

export const VERTICAL_HIGHLIGHTS: Record<Vertical, readonly string[]> = {
  assistencia: [
    "Diagnóstico transparente antes de qualquer serviço",
    "Atualizações do reparo direto pelo WhatsApp",
    "Laudo técnico de entrada contra reclamações indevidas",
  ],
  estetica: [
    "Orçamento claro antes de iniciar o serviço",
    "Atualizações do veículo direto pelo WhatsApp",
    "Laudo técnico de entrada contra reclamações indevidas",
  ],
};

export const MOTOR_MODE_HEADING: Record<MotorServiceMode, string> = {
  ESTETICA: "Estética Automotiva",
  OFICINA: "Oficina Mecânica",
  AMBOS: "Estética e Manutenção de Motores",
};

export const MOTOR_MODE_TAGLINE: Record<MotorServiceMode, string> = {
  ESTETICA: "Cuidado especializado para a estética do seu veículo, com transparência do início ao fim.",
  OFICINA: "Manutenção mecânica de confiança para o seu veículo, com transparência do início ao fim.",
  AMBOS: "Cuidado especializado para o seu veículo, com transparência do início ao fim.",
};

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
