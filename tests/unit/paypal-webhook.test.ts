import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ verify: vi.fn(), getOrder: vi.fn(), getCapture: vi.fn(), captureOrder: vi.fn(), request: vi.fn(), from: vi.fn(), rpc: vi.fn() }));
vi.mock("@/lib/paypal/adapter", () => ({ PayPal: class { verifyWebhook = mocks.verify; getOrder = mocks.getOrder; getCapture = mocks.getCapture; captureOrder = mocks.captureOrder; request = mocks.request; } }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: mocks.from, rpc: mocks.rpc }) }));
import { processWebhook } from "@/lib/paypal/webhook";
const payment = { id: "reference", external_id: "ORDER", amount: "450.00", merchant_id: "MERCHANT", status: "created" };
const capture = { id: "CAPTURE", status: "COMPLETED", payee: { merchant_id: "MERCHANT" }, amount: { value: "450.00", currency_code: "USD" }, supplementary_data: { related_ids: { order_id: "ORDER" } } };
const order = { id: "ORDER", status: "COMPLETED", purchase_units: [{ custom_id: "reference", payee: { merchant_id: "MERCHANT" }, amount: capture.amount, payments: { captures: [capture] } }] };
const event = { id: "EVENT", event_type: "PAYMENT.CAPTURE.COMPLETED", resource: { id: "CAPTURE", status: "COMPLETED" } };
function query(data: unknown, error: unknown = null) {
  const chain = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn().mockResolvedValue({ data, error }) };
  chain.select.mockReturnValue(chain); chain.eq.mockReturnValue(chain); return chain;
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("PAYPAL_ENV", "sandbox"); vi.stubEnv("VERCEL_ENV", "preview"); vi.stubEnv("PAYPAL_CLIENT_ID", "client"); vi.stubEnv("PAYPAL_CLIENT_SECRET", "secret"); vi.stubEnv("PAYPAL_WEBHOOK_ID", "webhook");
  mocks.verify.mockResolvedValue(true); mocks.getOrder.mockResolvedValue(order); mocks.getCapture.mockResolvedValue(capture); mocks.rpc.mockResolvedValue({ error: null });
  mocks.from.mockImplementation((table: string) => query(table === "paypal_payments" ? payment : null));
});
afterEach(() => vi.unstubAllEnvs());
it("does not query or mutate the database for invalid signatures", async () => {
  mocks.verify.mockResolvedValue(false); await expect(processWebhook(new Headers(), event)).rejects.toThrow("Firma inválida"); expect(mocks.from).not.toHaveBeenCalled(); expect(mocks.rpc).not.toHaveBeenCalled();
});
it("confirms through a fresh API lookup and one atomic database operation", async () => {
  await processWebhook(new Headers(), event);
  expect(mocks.getCapture).toHaveBeenCalledWith("CAPTURE"); expect(mocks.getOrder).toHaveBeenCalledWith("ORDER");
  expect(mocks.rpc).toHaveBeenCalledWith("record_paypal_event", { p_event_id: "EVENT", p_payment_id: "reference", p_status: "approved", p_capture_id: "CAPTURE" });
});
it("never approves from a completed event when the API says pending", async () => {
  mocks.getCapture.mockResolvedValue({ ...capture, status: "PENDING" }); await processWebhook(new Headers(), event);
  expect(mocks.rpc.mock.calls[0][1].p_status).toBe("pending");
});
it("rejects wrong ownership references and amount mismatches", async () => {
  mocks.getOrder.mockResolvedValue({ ...order, purchase_units: [{ ...order.purchase_units[0], custom_id: "other" }] });
  await expect(processWebhook(new Headers(), event)).rejects.toThrow(); expect(mocks.rpc).not.toHaveBeenCalled();
});
it("deduplicates already committed events", async () => {
  mocks.from.mockReturnValue(query({ webhook_event_id: "EVENT" })); await processWebhook(new Headers(), event);
  expect(mocks.getCapture).not.toHaveBeenCalled(); expect(mocks.rpc).not.toHaveBeenCalled();
});
it("requests redelivery when the order has not been persisted yet", async () => {
  mocks.from.mockReturnValue(query(null)); await expect(processWebhook(new Headers(), event)).rejects.toThrow("Orden pendiente"); expect(mocks.rpc).not.toHaveBeenCalled();
});
it("requests redelivery when persistence fails", async () => {
  mocks.rpc.mockResolvedValue({ error: { code: "failure" } }); await expect(processWebhook(new Headers(), event)).rejects.toThrow("registrar");
});
it("captures approved orders but leaves entitlement pending until a capture event", async () => {
  mocks.getOrder.mockResolvedValue({ ...order, status: "APPROVED" });
  await processWebhook(new Headers(), { ...event, event_type: "CHECKOUT.ORDER.APPROVED", resource: { id: "ORDER" } });
  expect(mocks.captureOrder).toHaveBeenCalledWith("ORDER", "reference"); expect(mocks.rpc.mock.calls[0][1].p_status).toBe("pending");
});
it("does not grant access on an eventually consistent refund notification", async () => {
  mocks.request.mockResolvedValue({ links: [{ rel: "up", href: "https://api-m.sandbox.paypal.com/v2/payments/captures/CAPTURE" }] });
  await expect(processWebhook(new Headers(), { ...event, event_type: "PAYMENT.CAPTURE.REFUNDED", resource: { id: "REFUND" } })).rejects.toThrow("pendiente de actualización"); expect(mocks.rpc).not.toHaveBeenCalled();
});
