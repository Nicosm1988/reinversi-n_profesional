import { describe, expect, it } from "vitest";
import { readJsonBody } from "@/lib/http/json-body";

describe("readJsonBody", () => {
  it("accepts valid JSON within the byte limit", async () => {
    const request = new Request("https://example.com/api", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: true }),
    });

    await expect(readJsonBody(request, 1024)).resolves.toEqual({
      ok: true,
      value: { ok: true },
    });
  });

  it("rejects unsupported content types", async () => {
    const request = new Request("https://example.com/api", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "{}",
    });

    await expect(readJsonBody(request, 1024)).resolves.toEqual({
      ok: false,
      reason: "invalid-content-type",
    });
  });

  it("rejects a body whose actual UTF-8 size exceeds the limit", async () => {
    const request = new Request("https://example.com/api", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: "á".repeat(20) }),
    });

    await expect(readJsonBody(request, 20)).resolves.toEqual({
      ok: false,
      reason: "too-large",
    });
  });

  it("rejects malformed JSON", async () => {
    const request = new Request("https://example.com/api", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not-json}",
    });

    await expect(readJsonBody(request, 1024)).resolves.toEqual({
      ok: false,
      reason: "invalid-json",
    });
  });
});
