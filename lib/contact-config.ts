export const CONTACT_EMAIL = "hola@universosenda.com";

const DEFAULT_WHATSAPP_NUMBER = "5491136736778";
const configuredWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");

export const WHATSAPP_NUMBER = configuredWhatsAppNumber || DEFAULT_WHATSAPP_NUMBER;
export const WHATSAPP_DISPLAY_NUMBER = "+54 9 11 3673-6778";
export const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const WHATSAPP_DEFAULT_MESSAGE_ES =
  "Hola, estuve recorriendo la web de Senda y quisiera recibir más información.";

export function getWhatsAppHref(message = WHATSAPP_DEFAULT_MESSAGE_ES) {
  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}

export const SENDA_CONTACT = {
  email: CONTACT_EMAIL,
  whatsapp: {
    number: WHATSAPP_NUMBER,
    display: WHATSAPP_DISPLAY_NUMBER,
    baseUrl: WHATSAPP_BASE_URL,
    defaultMessage: WHATSAPP_DEFAULT_MESSAGE_ES,
  },
} as const;
