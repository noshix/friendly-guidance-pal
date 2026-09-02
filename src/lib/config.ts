export const PIZZATTO_WHATSAPP = {
  NUMBER: "5565992535039", // (65) 99253-5039
  MESSAGE_TEMPLATE: "Olá! Gostaria de mais informações sobre materiais elétricos.",
  getLink: (message?: string) => {
    const text = message || PIZZATTO_WHATSAPP.MESSAGE_TEMPLATE;
    return `https://wa.me/${PIZZATTO_WHATSAPP.NUMBER}?text=${encodeURIComponent(text)}`;
  }
};
