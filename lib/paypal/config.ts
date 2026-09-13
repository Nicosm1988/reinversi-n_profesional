import "server-only";
import { z } from "zod";

export const services = {
  "orientacion-vocacional": "Orientación Vocacional",
  "transiciones-laborales": "Transiciones Laborales",
} as const;
export const serviceSchema = z.enum(["orientacion-vocacional", "transiciones-laborales"]);
export type Service = z.infer<typeof serviceSchema>;
export class PaymentError extends Error {
  constructor(message: string, public status = 503) { super(message); }
}
const amount = z.string().regex(/^(0|[1-9]\d{0,6})\.\d{2}$/).refine(value => Number(value) > 0);
const catalogSchema = z.object({
  environment: z.enum(["sandbox", "live"]),
  services: z.partialRecord(serviceSchema, z.object({ amount, currency: z.literal("USD") })),
});

export function paypalConfig() {
  const env = process.env.PAYPAL_ENV;
  if (env !== "sandbox" && env !== "live") throw new PaymentError("PayPal no está configurado: PAYPAL_ENV debe ser sandbox o live.");
  if ((process.env.VERCEL_ENV === "production" && env === "sandbox") ||
      (process.env.VERCEL_ENV !== "production" && env === "live")) {
    throw new PaymentError("El entorno de PayPal no corresponde a este despliegue.");
  }
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const secret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim();
  if (!clientId || !secret || !webhookId) throw new PaymentError("PayPal no está disponible: falta configuración del servidor.");
  return { env, clientId, secret, webhookId, base: env === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com" };
}

export function servicePrice(service: Service) {
  const config = paypalConfig();
  let input: unknown;
  try { input = JSON.parse(process.env.PAYPAL_PRODUCTS_OR_PLANS || ""); } catch { throw new PaymentError("Falta configurar el importe USD del servicio."); }
  const parsed = catalogSchema.safeParse(input);
  if (!parsed.success || parsed.data.environment !== config.env || !parsed.data.services?.[service]) {
    throw new PaymentError("El servicio no tiene un importe USD válido para este entorno.");
  }
  return parsed.data.services[service]!;
}

export function checkoutOrigin() {
  // Explicit trusted origin: never build PayPal redirects from a request Host header.
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) throw new PaymentError("Falta configurar la URL de este entorno.");
  const url = new URL(raw);
  if (url.username || url.password || (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "localhost"))) throw new PaymentError("La URL del checkout no es válida.");
  return url.origin;
}
