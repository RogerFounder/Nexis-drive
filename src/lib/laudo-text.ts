import type { Vertical } from "@/config/verticals";

const VERTICAL_NOUNS: Record<Vertical, { item: string; establishment: string }> = {
  assistencia: { item: "aparelho", establishment: "desta assistência técnica" },
  estetica: { item: "veículo", establishment: "desta oficina" },
};

export function buildWarrantyText(vertical: Vertical): string {
  const { item, establishment } = VERTICAL_NOUNS[vertical];
  const itemCapitalizedPlural = `${item[0].toUpperCase()}${item.slice(1)}s`;

  return [
    `O prazo de garantia para o serviço executado é de 90 (noventa) dias corridos, contados a partir da data de retirada do ${item}, cobrindo exclusivamente o defeito relatado e as peças ou serviços diretamente relacionados a ele.`,
    `As condições de entrada registradas neste laudo (avarias, riscos, itens faltantes etc.) refletem o estado do ${item} no momento do recebimento e não são de responsabilidade ${establishment}.`,
    `A garantia perde a validade em casos de contato com líquidos, quedas, impactos, atos de terceiros ou intervenção por pessoa não autorizada após a entrega.`,
    `${itemCapitalizedPlural} não retirados em até 90 dias após a conclusão do serviço poderão ser considerados abandonados, mediante tentativa prévia de contato com o cliente.`,
  ].join("\n\n");
}

interface WhatsAppSummaryInput {
  numero: number;
  clienteNome: string;
  identificadorLabel: string;
  identificadorValor: string;
  itensChecklist: string[];
  observacoesEntrada: string;
  createdAt: Date;
}

const SUMMARY_DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function buildWhatsAppSummary(laudo: WhatsAppSummaryInput): string {
  const checklistText =
    laudo.itensChecklist.length > 0
      ? laudo.itensChecklist.map((item) => `• ${item}`).join("\n")
      : "• Nenhuma avaria visível registrada na entrada";

  return [
    `*Laudo Técnico #${laudo.numero}* — Nexus Drive`,
    `📅 ${SUMMARY_DATE_FORMATTER.format(laudo.createdAt)}`,
    "",
    `*Cliente:* ${laudo.clienteNome}`,
    `*${laudo.identificadorLabel}:* ${laudo.identificadorValor}`,
    "",
    `*Condições registradas na entrada:*`,
    checklistText,
    "",
    `*Observações:*`,
    laudo.observacoesEntrada,
    "",
    `_Este resumo confirma o estado registrado no momento da entrega. Guarde esta mensagem como comprovante._`,
  ].join("\n");
}
