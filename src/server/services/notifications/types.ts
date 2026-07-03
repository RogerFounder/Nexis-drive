export type LeadVertical = "assistencia-tecnica" | "estetica-motores";

export interface LeadNotificationPayload {
  vertical: LeadVertical;
  leadId: string;
  nome: string;
  whatsapp: string;
  createdAt: string;
  details: Record<string, string>;
}
