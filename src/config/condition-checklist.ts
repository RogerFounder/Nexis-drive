import type { Vertical } from "./verticals";
import type { MotorServiceMode } from "@/generated/prisma/client";

const ESTETICA_ITEMS = [
  "Riscos ou marcas na pintura",
  "Amassados na lataria",
  "Retrovisor trincado ou faltando",
] as const;

const OFICINA_ITEMS = [
  "Pneus visivelmente desgastados",
  "Itens faltantes (baú, capacete, chave reserva)",
  "Vazamento aparente",
] as const;

export const DEFAULT_CHECKLIST_ITEMS_BY_MOTOR_MODE: Record<MotorServiceMode, readonly string[]> = {
  ESTETICA: ESTETICA_ITEMS,
  OFICINA: OFICINA_ITEMS,
  AMBOS: [...ESTETICA_ITEMS, ...OFICINA_ITEMS],
};

export const CONDITION_CHECKLIST_ITEMS: Record<Vertical, readonly string[]> = {
  assistencia: [
    "Tela com trincas ou riscos",
    "Carcaça amassada ou arranhada",
    "Sem capa protetora",
    "Botões com defeito",
    "Sinais de oxidação ou umidade",
    "Sem acessórios (carregador, fone, caixa)",
  ],
  estetica: DEFAULT_CHECKLIST_ITEMS_BY_MOTOR_MODE.AMBOS,
};

export function defaultChecklistItems(vertical: Vertical, motorServiceMode: MotorServiceMode | null): readonly string[] {
  if (vertical === "estetica" && motorServiceMode) {
    return DEFAULT_CHECKLIST_ITEMS_BY_MOTOR_MODE[motorServiceMode];
  }
  return CONDITION_CHECKLIST_ITEMS[vertical];
}
