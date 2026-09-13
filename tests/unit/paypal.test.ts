import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { paypalConfig, servicePrice } from "@/lib/paypal/config";
import { PayPal, approvalUrl } from "@/lib/paypal/adapter";
import { assertOrder, assertCapture, type Payment } from "@/lib/paypal/payments";

const ref = "48d5cb89-e7c2-4a7e-90fa-0fdcbb0b3e11";
const payment = { id: ref, external_id: "ORDER1", amount: "450.00", merchant_id: "MERCHANT" } as Payment;
const capture = { id: "CAP1", status: "COMPLETED", payee: { merchant_id: "MERCHANT" }, amount: { value: "450.00", currency_code: "USD" }, supplementary_data: { related_ids: { order_id: "ORDER1" } } };
const order = { id: "ORDER1", status: "COMPLETED", purchase_units: [{ custom_id: ref, payee: { merchant_id: "MERCHANT" }, amount: { value: "450.00", currency_code: "USD" }, payments: { captures: [capture] } }] };

beforeEach(() => {
  vi.stubEnv("PAYPAL_ENV", "sandbox"); vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("PAYPAL_CLIENT_ID", "sandbox-client"); vi.stubEnv("PAYPAL_CLIENT_SECRET", "sandbox-secret"); vi.stubEnv("PAYPAL_WEBHOOK_ID", "sandbox-webhook");
  vi.stubEnv("PAYPAL_PRODUCTS_OR_PLANS", JSON.stringify({ environment: "sandbox", services: { "orientacion-vocacional": { amount: "450.00", currency: "USD" }, "transiciones-laborales": { amount: "850.00", currency: "USD" } } }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("PayPal configuration", () => {
  it("uses only explicitly configured USD prices", () => {
    expect(servicePrice("orientacion-vocacional").amount).toBe("450.00");
    expect(servicePrice("transiciones-laborales").amount).toBe("850.00");
  });
  it.each(["", "test", "SANDBOX"])("rejects invalid environment %s", env => { vi.stubEnv("PAYPAL_ENV", env); expect(paypalConfig).toThrow(); });
  it("blocks sandbox in production and live in preview", () => {
    vi.stubEnv("VERCEL_ENV", "production"); expect(paypalConfig).toThrow();
    vi.stubEnv("VERCEL_ENV", "preview"); vi.stubEnv("PAYPAL_ENV", "live"); expect(paypalConfig).toThrow();
  });
  it("blocks missing secrets, missing prices and mismatched catalog environments", () => {
    vi.stubEnv("PAYPAL_CLIENT_SECRET", ""); expect(paypalConfig).toThrow();
    vi.stubEnv("PAYPAL_CLIENT_SECRET", "secret"); vi.stubEnv("PAYPAL_PRODUCTS_OR_PLANS", ""); expect(() => servicePrice("orientacion-vocacional")).toThrow();
    vi.stubEnv("PAYPAL_PRODUCTS_OR_PLANS", JSON.stringify({ environment: "live", services: {} })); expect(() => servicePrice("orientacion-vocacional")).toThrow();
  });
  it.each(["0.00", "-1.00", "450", "450.001"])("rejects invalid amounts %s", amount => {
    vi.stubEnv("PAYPAL_PRODUCTS_OR_PLANS", JSON.stringify({ environment: "sandbox", services: { "orientacion-vocacional": { amount, currency: "USD" } } }));
    expect(() => servicePrice("orientacion-vocacional")).toThrow();
  });
});
describe("payment identity and amount", () => {
  it("accepts an opaque reference without any payer email", () => { expect(() => assertOrder(order, payment)).not.toThrow(); expect(() => assertCapture(capture, order, payment)).not.toThrow(); });
  it("rejects wrong reference, order, currency, amount and unrelated capture", () => {
    expect(() => assertOrder(order, { ...payment, id: "another-user-reference" })).toThrow();
    expect(() => assertOrder(order, { ...payment, external_id: "OTHER" })).toThrow();
    expect(() => assertOrder(order, { ...payment, amount: "850.00" })).toThrow();
    expect(() => assertCapture({ ...capture, id: "OTHER" }, order, payment)).toThrow();
    expect(() => assertCapture({ ...capture, amount: { ...capture.amount, currency_code: "ARS" } }, order, payment)).toThrow();
  });
  it("rejects a changed or missing recipient on order and capture", () => {
    expect(() => assertOrder(order, { ...payment, merchant_id: "OTHER" })).toThrow();
    expect(() => assertOrder(order, { ...payment, merchant_id: null })).toThrow();
    expect(() => assertCapture({ ...capture, payee: { merchant_id: "OTHER" } }, order, payment)).toThrow();
  });
  it("rejects non-PayPal redirect hosts", () => { expect(() => approvalUrl({ ...order, links: [{ rel: "approve", href: "https://www.sandbox.paypal.com.evil.test/pay" }] })).toThrow(); });
});
describe("official server API", () => {
  it("uses OAuth, a stable idempotency key and opaque custom_id, with no email", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ access_token: "access" })).mockResolvedValueOnce(Response.json(order)).mockResolvedValueOnce(Response.json(order));
    vi.stubGlobal("fetch", fetcher);
    const api = new PayPal();
    await api.createOrder({ id: ref, service: "orientacion-vocacional", amount: "450.00" }, "https://preview.test/return", "https://preview.test/cancel");
    await api.captureOrder("ORDER1", ref);
    expect(fetcher).toHaveBeenCalledTimes(3);
    const [url, init] = fetcher.mock.calls[1];
    expect(url).toBe("https://api-m.sandbox.paypal.com/v2/checkout/orders");
    expect(init.headers["PayPal-Request-Id"]).toBe(ref);
    expect(JSON.parse(init.body).purchase_units[0].custom_id).toBe(ref);
    expect(init.body).not.toContain("email");
    expect(fetcher.mock.calls[2][1].headers["PayPal-Request-Id"]).toBe(`${ref}-c`);
  });
  it("rejects missing signature headers without making a network call", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    expect(await new PayPal().verifyWebhook(new Headers(), {})).toBe(false); expect(fetcher).not.toHaveBeenCalled();
  });
  it("asks PayPal to verify the complete event and fails closed", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ access_token: "access" })).mockResolvedValueOnce(Response.json({ verification_status: "FAILURE" })); vi.stubGlobal("fetch", fetcher);
    const headers = new Headers(Object.fromEntries(["auth-algo", "cert-url", "transmission-id", "transmission-sig", "transmission-time"].map(key => [`paypal-${key}`, "value"])));
    const event = { id: "event", resource: { id: "capture" } };
    expect(await new PayPal().verifyWebhook(headers, event)).toBe(false);
    expect(JSON.parse(fetcher.mock.calls[1][1].body)).toMatchObject({ webhook_id: "sandbox-webhook", webhook_event: event });
  });
  it("does not expose PayPal error bodies", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(Response.json({ access_token: "access" })).mockResolvedValueOnce(Response.json({ secret: "private" }, { status: 422 })));
    await expect(new PayPal().getOrder("ORDER1")).rejects.toThrow("PayPal no pudo completar");
  });
});
