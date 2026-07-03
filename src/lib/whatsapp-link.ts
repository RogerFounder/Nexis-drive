export function buildWhatsAppLink(whatsappE164: string, message: string): string {
  const digits = whatsappE164.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
