import { beforeEach, afterEach, it, expect, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), limit: vi.fn(), from: vi.fn() }));
vi.mock("@/lib/supabase/auth", () => ({ getAuthenticatedUser: mocks.auth }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: mocks.from }) }));
vi.mock("@/lib/rate-limit", () => ({ limitRequest: mocks.limit }));
import { POST as checkout } from "@/app/api/paypal/checkout/route";
import { POST as capture } from "@/app/api/paypal/capture/route";
function request(body: unknown = { service: "orientacion-vocacional", amount: "450.00" }, origin = "https://preview.senda.test") {
  return new Request("https://preview.senda.test/api/paypal/checkout", { method: "POST", headers: { "Content-Type": "application/json", origin }, body: JSON.stringify(body) });
}
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://preview.senda.test");
  vi.stubEnv("PAYPAL_ENV", "sandbox"); vi.stubEnv("VERCEL_ENV", "preview"); vi.stubEnv("PAYPAL_CLIENT_ID", "client"); vi.stubEnv("PAYPAL_CLIENT_SECRET", "secret"); vi.stubEnv("PAYPAL_WEBHOOK_ID", "webhook");
  mocks.auth.mockResolvedValue({ ok: true, user: { id: "user-id" } }); mocks.limit.mockResolvedValue({ limited: false });
});
afterEach(() => vi.unstubAllEnvs());
it("requires authentication before creating or capturing an order", async () => {
  mocks.auth.mockResolvedValue({ ok: false, status: 401 });
  expect((await checkout(request())).status).toBe(401); expect((await capture(request())).status).toBe(401); expect(mocks.from).not.toHaveBeenCalled();
});
it("rejects cross-origin checkout", async () => { expect((await checkout(request(undefined, "https://evil.test"))).status).toBe(403); expect(mocks.auth).not.toHaveBeenCalled(); });
it("rejects removed services and client-supplied external IDs", async () => {
  expect((await checkout(request({ service: "reinvencion-profesional" }))).status).toBe(400);
  expect((await capture(request({ service: "orientacion-vocacional", orderId: "other-users-order" }))).status).toBe(400);
});
it("blocks checkout with missing credentials without simulating success", async () => {
  vi.stubEnv("PAYPAL_CLIENT_SECRET", ""); const response = await checkout(request()); expect(response.status).toBe(503); expect(mocks.from).not.toHaveBeenCalled();
});
it("limits retries per authenticated user", async () => { mocks.limit.mockResolvedValue({ limited: true }); expect((await checkout(request())).status).toBe(429); expect(mocks.from).not.toHaveBeenCalled(); });
it("capture only finds an order owned by the authenticated user", async () => {
  const q = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) };
  q.select.mockReturnValue(q); q.eq.mockReturnValue(q); mocks.from.mockReturnValue(q);
  expect((await capture(request())).status).toBe(404); expect(q.eq).toHaveBeenCalledWith("user_id", "user-id"); expect(q.eq).toHaveBeenCalledWith("environment", "sandbox");
});
