import "server-only";
import { PaymentError, paypalConfig, services, type Service } from "./config";

export type Capture = { id: string; status: string; payee?: { merchant_id?: string }; amount: { value: string; currency_code: string }; supplementary_data?: { related_ids?: { order_id?: string } } };
export type Order = { id: string; status: string; purchase_units: { custom_id?: string; payee?: { merchant_id?: string }; amount: { value: string; currency_code: string }; payments?: { captures?: Capture[] } }[]; links?: { rel: string; href: string }[] };

export class PayPal {
  private config = paypalConfig();
  private token?: string;
  async request<T>(path: string, method = "GET", body?: unknown, key?: string): Promise<T> {
    if (!this.token) {
      const response = await fetch(`${this.config.base}/v1/oauth2/token`, {
        method: "POST", cache: "no-store", signal: AbortSignal.timeout(15000),
        headers: { Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=client_credentials",
      });
      if (!response.ok) throw new PaymentError("No pudimos conectar con PayPal. Intentá nuevamente.");
      const data = await response.json();
      if (typeof data.access_token !== "string") throw new PaymentError("PayPal no está disponible.");
      this.token = data.access_token;
    }
    const response = await fetch(`${this.config.base}${path}`, {
      method, cache: "no-store", signal: AbortSignal.timeout(15000),
      headers: { Prefer: "return=representation", Authorization: `Bearer ${this.token}`, "Content-Type": "application/json", ...(key ? { "PayPal-Request-Id": key } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    // Never expose/log provider bodies, credentials or payer details.
    if (!response.ok) throw new PaymentError("PayPal no pudo completar la operación. Reintentá o contactá al equipo.");
    return response.json() as Promise<T>;
  }
  getOrder(id: string) { return this.request<Order>(`/v2/checkout/orders/${encodeURIComponent(id)}`); }
  getCapture(id: string) { return this.request<Capture>(`/v2/payments/captures/${encodeURIComponent(id)}`); }
  createOrder(payment: { id: string; service: Service; amount: string }, returnUrl: string, cancelUrl: string) {
    return this.request<Order>("/v2/checkout/orders", "POST", {
      intent: "CAPTURE",
      purchase_units: [{ custom_id: payment.id, description: services[payment.service], amount: { currency_code: "USD", value: payment.amount } }],
      payment_source: { paypal: { experience_context: { brand_name: "Universo Senda", shipping_preference: "NO_SHIPPING", user_action: "PAY_NOW", return_url: returnUrl, cancel_url: cancelUrl } } },
    }, payment.id);
  }
  captureOrder(id: string, reference: string) { return this.request<Order>(`/v2/checkout/orders/${encodeURIComponent(id)}/capture`, "POST", {}, `${reference}-c`); }
  async verifyWebhook(headers: Headers, event: unknown) {
    const names = ["auth-algo", "cert-url", "transmission-id", "transmission-sig", "transmission-time"];
    if (names.some(name => !headers.get(`paypal-${name}`))) return false;
    const result = await this.request<{ verification_status: string }>("/v1/notifications/verify-webhook-signature", "POST", {
      auth_algo: headers.get("paypal-auth-algo"), cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"), transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"), webhook_id: this.config.webhookId, webhook_event: event,
    });
    return result.verification_status === "SUCCESS";
  }
}

export function approvalUrl(order: Order) {
  const href = order.links?.find(link => link.rel === "payer-action" || link.rel === "approve")?.href;
  if (!href) throw new PaymentError("La orden no está disponible para aprobación. Contactá al equipo.");
  const url = new URL(href);
  const host = paypalConfig().env === "sandbox" ? "www.sandbox.paypal.com" : "www.paypal.com";
  if (url.protocol !== "https:" || url.hostname !== host || url.username || url.password || url.port) throw new PaymentError("PayPal devolvió una dirección inválida.");
  return url.href;
}
