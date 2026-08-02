import { describe, expect, it } from "vitest";
import { sanitizeNextPath } from "@/lib/security/navigation";

describe("sanitizeNextPath", () => {
  it("returns fallback when next is null", () => {
    expect(sanitizeNextPath(null)).toBe("/diagnostico/ancla-de-carrera");
  });

  it("returns fallback for unsafe redirects", () => {
    expect(sanitizeNextPath("https://evil.com")).toBe("/diagnostico/ancla-de-carrera");
    expect(sanitizeNextPath("//evil.com")).toBe("/diagnostico/ancla-de-carrera");
    expect(sanitizeNextPath("/\\evil.com")).toBe("/diagnostico/ancla-de-carrera");
    expect(sanitizeNextPath("/\nevil.com")).toBe("/diagnostico/ancla-de-carrera");
  });

  it("keeps safe internal paths", () => {
    expect(sanitizeNextPath("/en/diagnostico/ancla-de-carrera")).toBe("/en/diagnostico/ancla-de-carrera");
    expect(sanitizeNextPath("/en/panel?tab=profile#result")).toBe(
      "/en/panel?tab=profile#result",
    );
  });
});
