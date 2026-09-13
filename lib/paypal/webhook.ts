import "server-only";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { paypalConfig, PaymentError } from "./config";
import { PayPal } from "./adapter";
import { assertCapture, assertOrder, capturePayment, paymentFields, type Payment } from "./payments";

const eventSchema = z.object({ id: z.string().min(1).max(128), event_type: z.string(), resource: z.object({ id: z.string().min(1).max(128) }) });
const events = new Set(["CHECKOUT.ORDER.APPROVED", "PAYMENT.CAPTURE.COMPLETED", "PAYMENT.CAPTURE.PENDING", "PAYMENT.CAPTURE.DENIED", "PAYMENT.CAPTURE.REFUNDED", "PAYMENT.CAPTURE.REVERSED"]);
export async function processWebhook(headers: Headers, raw: unknown) {
  const paypal = new PayPal();
  if (!await paypal.verifyWebhook(headers, raw)) throw new PaymentError("Firma inválida.", 401);
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) throw new PaymentError("Evento inválido.", 400);
  const event = parsed.data;
  if (!events.has(event.event_type)) return;
  const db = createAdminClient();
  const { data: previous, error: previousError } = await db.from("paypal_webhook_events").select("webhook_event_id").eq("webhook_event_id", event.id).maybeSingle();
  if (previousError) throw new PaymentError("No pudimos consultar el evento.");
  if (previous) return;
  let orderId: string;
  let capture;
  if (event.event_type === "CHECKOUT.ORDER.APPROVED") orderId = event.resource.id;
  else {
    // A refund resource has a refund id, not a capture id. Resolve the linked
    // capture from PayPal's refund API, never by following an untrusted URL.
    let captureId = event.resource.id;
    if (event.event_type === "PAYMENT.CAPTURE.REFUNDED") {
      const refund = await paypal.request<{ links?: { rel: string; href: string }[] }>(`/v2/payments/refunds/${encodeURIComponent(event.resource.id)}`);
      const up = refund.links?.find(link => link.rel === "up")?.href;
      const match = up && new URL(up).pathname.match(/^\/v2\/payments\/captures\/([A-Za-z0-9]+)$/);
      if (!match) throw new PaymentError("Referencia de reembolso inválida.");
      captureId = match[1];
    }
    capture = await paypal.getCapture(captureId);
    orderId = capture.supplementary_data?.related_ids?.order_id || "";
    if (!orderId) throw new PaymentError("La captura no tiene una orden verificable.");
  }
  const { data, error } = await db.from("paypal_payments").select(paymentFields).eq("external_id", orderId).eq("environment", paypalConfig().env).maybeSingle();
  // A webhook can arrive before the create-order response is saved. Retry it.
  if (error || !data) throw new PaymentError("Orden pendiente de registro.");
  const payment = data as Payment;
  const order = await paypal.getOrder(orderId);
  assertOrder(order, payment);
  let status = "pending";
  if (!capture) await capturePayment(payment, paypal);
  else {
    assertCapture(capture, order, payment);
    const statuses: Record<string, string> = { COMPLETED: "approved", PENDING: "pending", DECLINED: "failed", FAILED: "failed", REFUNDED: "refunded", PARTIALLY_REFUNDED: "refunded", REVERSED: "reversed" };
    status = statuses[capture.status];
    if (!status || (status === "approved" && order.status !== "COMPLETED")) throw new PaymentError("Estado PayPal aún no confirmable.");
    // A reversal/refund notification must never grant access while the API is
    // still eventually consistent. Ask PayPal to redeliver it instead.
    if ((event.event_type === "PAYMENT.CAPTURE.REFUNDED" && status !== "refunded") ||
        (event.event_type === "PAYMENT.CAPTURE.REVERSED" && status !== "reversed" && status !== "refunded")) throw new PaymentError("Estado PayPal pendiente de actualización.");
  }
  const { error: writeError } = await db.rpc("record_paypal_event", { p_event_id: event.id, p_payment_id: payment.id, p_status: status, p_capture_id: capture?.id ?? null });
  if (writeError) throw new PaymentError("No pudimos registrar la confirmación.");
}
