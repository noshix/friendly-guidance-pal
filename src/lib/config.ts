export const PIZZATTO_WHATSAPP = {
  NUMBER: "556530524200", // (65) 3052-4200
  MESSAGE_TEMPLATE: "Olá! Gostaria de mais informações sobre materiais elétricos.",
  getLink: (message?: string) => {
    const text = message || PIZZATTO_WHATSAPP.MESSAGE_TEMPLATE;
    return `https://wa.me/${PIZZATTO_WHATSAPP.NUMBER}?text=${encodeURIComponent(text)}`;
  }
};
