import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { limitRequest } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/http/json-body";
import { z } from "zod";
import { PaymentError, checkoutOrigin, paypalConfig, serviceSchema, servicePrice, type Service } from "./config";
import { PayPal, approvalUrl, type Order, type Capture } from "./adapter";

export type Payment = { id: string; user_id: string; service: Service; environment: string; external_id: string | null; amount: string; currency: string; status: string; created_at: string; capture_id: string | null; merchant_id: string | null };
export const paymentFields = "id,user_id,service,environment,external_id,amount,currency,status,created_at,capture_id,merchant_id";
export function paymentResponse(data: unknown, status = 200) { return Response.json(data, { status, headers: { "Cache-Control": "no-store" } }); }
export function paymentFailure(error: unknown) { return paymentResponse({ error: error instanceof PaymentError ? error.message : "No pudimos procesar el pago. Intentá nuevamente." }, error instanceof PaymentError ? error.status : 503); }

export async function checkoutRequest(request: Request) {
  if (request.headers.get("origin") !== checkoutOrigin()) throw new PaymentError("Origen no permitido.", 403);
  const auth = await getAuthenticatedUser();
  if (!auth.ok) throw new PaymentError("Ingresá a tu cuenta para continuar.", auth.status);
  const limit = await limitRequest({ key: auth.user.id, prefix: "paypal-checkout", limit: 10, windowMs: 60000 });
  if (limit.limited) throw new PaymentError("Esperá un momento antes de reintentar.", 429);
  const body = await readJsonBody(request, 2048);
  const parsed = z.object({ service: serviceSchema, locale: z.enum(["es", "en"]).default("es"), amount: z.string().optional() }).strict().safeParse(body.ok ? body.value : null);
  if (!parsed.success) throw new PaymentError("Solicitud inválida.", 400);
  return { auth, ...parsed.data };
}

export async function ownedPayment(userId: string, service: Service) {
  const { data, error } = await createAdminClient().from("paypal_payments").select(paymentFields)
    .eq("user_id", userId).eq("service", service).eq("environment", paypalConfig().env).maybeSingle();
  if (error) throw new PaymentError("No pudimos consultar el pago.");
  return data as Payment | null;
}

export function assertOrder(order: Order, payment: Payment) {
  const unit = order.purchase_units?.[0];
  if (order.id !== payment.external_id || order.purchase_units?.length !== 1 || unit?.custom_id !== payment.id ||
      !payment.merchant_id || unit?.payee?.merchant_id !== payment.merchant_id || unit.amount.currency_code !== "USD" || Number(unit.amount.value) !== Number(payment.amount)) {
    throw new PaymentError("No pudimos verificar la referencia o el importe del pago.");
  }
}
export function assertCapture(capture: Capture, order: Order, payment: Payment) {
  assertOrder(order, payment);
  const captures = order.purchase_units[0].payments?.captures;
  if (!captures?.some(item => item.id === capture.id) || captures.length !== 1 ||
      capture.payee?.merchant_id !== payment.merchant_id || capture.amount.currency_code !== "USD" || Number(capture.amount.value) !== Number(payment.amount) ||
      capture.supplementary_data?.related_ids?.order_id !== payment.external_id) {
    throw new PaymentError("No pudimos verificar la captura del pago.");
  }
}

export async function startCheckout(userId: string, service: Service, locale: string, displayedAmount?: string) {
  const price = servicePrice(service);
  const db = createAdminClient();
  let payment = await ownedPayment(userId, service);
  if (!payment) {
    if (displayedAmount !== price.amount) throw new PaymentError("El importe cambió. Actualizá la página antes de pagar.", 409);
    const { error } = await db.from("paypal_payments").upsert({ user_id: userId, service, environment: paypalConfig().env, amount: price.amount, currency: "USD" }, { onConflict: "user_id,service,environment", ignoreDuplicates: true });
    if (error) throw new PaymentError("No pudimos iniciar el pago.");
    payment = await ownedPayment(userId, service);
  }
  if (!payment) throw new PaymentError("No pudimos iniciar el pago.");
  if (payment.status === "approved") return { status: "approved" };
  if (["refunded", "reversed", "failed"].includes(payment.status)) throw new PaymentError("Contactá al equipo para continuar con este servicio.", 409);
  if (Number(displayedAmount) !== Number(payment.amount)) throw new PaymentError("Actualizá la página para consultar el importe guardado.", 409);
  const paypal = new PayPal();
  let order: Order;
  if (payment.external_id) {
    order = await paypal.getOrder(payment.external_id);
  } else {
    // Default PayPal idempotency retention is six hours. Never recreate an
    // uncertain order after that window: an operator must reconcile it first.
    if (Date.now() - Date.parse(payment.created_at) > 5 * 3600000) throw new PaymentError("El inicio del pago venció. Contactá al equipo para revisarlo.", 409);
    const url = `${checkoutOrigin()}${locale === "en" ? "/en" : ""}/pagos/${service}`;
    order = await paypal.createOrder({ ...payment, amount: Number(payment.amount).toFixed(2) }, `${url}?retorno=1`, `${url}?cancelado=1`);
    // PayPal defaults payee to the authenticated merchant when creating the order.
    const merchantId = order.purchase_units?.[0]?.payee?.merchant_id;
    if (!merchantId) throw new PaymentError("No pudimos verificar el destinatario de la orden.");
    const { error } = await db.from("paypal_payments").update({ external_id: order.id, merchant_id: merchantId }).eq("id", payment.id).is("external_id", null);
    if (error) throw new PaymentError("La orden está pendiente de registro. Reintentá en un momento.");
    payment.external_id = order.id;
    payment.merchant_id = merchantId;
  }
  assertOrder(order, payment);
  if (["APPROVED", "COMPLETED"].includes(order.status)) {
    await capturePayment(payment, paypal);
    return { status: "pending" };
  }
  return { status: "pending", url: approvalUrl(order) };
}

export async function capturePayment(payment: Payment, paypal = new PayPal()) {
  if (!payment.external_id) throw new PaymentError("Todavía no hay una orden para este servicio.", 409);
  const order = await paypal.getOrder(payment.external_id);
  assertOrder(order, payment);
  if (order.status === "APPROVED") await paypal.captureOrder(order.id, payment.id);
  else if (order.status !== "COMPLETED") throw new PaymentError("El pago todavía necesita tu aprobación en PayPal.", 409);
  // Only the verified webhook may change payment status or enable the service.
}
