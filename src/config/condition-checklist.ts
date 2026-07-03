import type { Vertical } from "./verticals";

export const CONDITION_CHECKLIST_ITEMS: Record<Vertical, readonly string[]> = {
  assistencia: [
    "Tela com trincas ou riscos",
    "Carcaça amassada ou arranhada",
    "Sem capa protetora",
    "Botões com defeito",
    "Sinais de oxidação ou umidade",
    "Sem acessórios (carregador, fone, caixa)",
  ],
  estetica: [
    "Riscos ou marcas na pintura",
    "Amassados na lataria",
    "Retrovisor trincado ou faltando",
    "Pneus visivelmente desgastados",
    "Itens faltantes (baú, capacete, chave reserva)",
    "Vazamento aparente",
  ],
};

export function isValidChecklistItem(vertical: Vertical, item: string): boolean {
  return CONDITION_CHECKLIST_ITEMS[vertical].includes(item);
}
