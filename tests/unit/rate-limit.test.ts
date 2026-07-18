import { describe, expect, it } from "vitest";
import { limitRequest, normalizeEnvironmentSecret } from "@/lib/rate-limit";

describe("normalizeEnvironmentSecret", () => {
  it("removes accidental matching quotes and whitespace", () => {
    expect(normalizeEnvironmentSecret('  "https://redis.example"  ')).toBe("https://redis.example");
    expect(normalizeEnvironmentSecret(" 'token-value' ")).toBe("token-value");
  });

  it("preserves unquoted values", () => {
    expect(normalizeEnvironmentSecret("https://redis.example")).toBe("https://redis.example");
  });
});

describe("limitRequest (memory fallback)", () => {
  it("blocks requests after the configured limit", async () => {
    const key = `test-${Date.now()}-1`;

    const first = await limitRequest({ key, prefix: "unit", limit: 2, windowMs: 10_000 });
    const second = await limitRequest({ key, prefix: "unit", limit: 2, windowMs: 10_000 });
    const third = await limitRequest({ key, prefix: "unit", limit: 2, windowMs: 10_000 });

    expect(first.limited).toBe(false);
    expect(second.limited).toBe(false);
    expect(third.limited).toBe(true);
  });

  it("resets after the time window expires", async () => {
    const key = `test-${Date.now()}-2`;

    await limitRequest({ key, prefix: "unit", limit: 1, windowMs: 20 });
    const blocked = await limitRequest({ key, prefix: "unit", limit: 1, windowMs: 20 });
    expect(blocked.limited).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 25));

    const afterReset = await limitRequest({ key, prefix: "unit", limit: 1, windowMs: 20 });
    expect(afterReset.limited).toBe(false);
  });
});
