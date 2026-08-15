import { describe, expect, it } from "vitest";
import { sanitizeNextPath } from "@/lib/security/navigation";

describe("sanitizeNextPath", () => {
  it("returns fallback when next is null", () => {
    expect(sanitizeNextPath(null)).toBe("/test-anclas-de-carrera");
  });

  it("returns fallback for unsafe redirects", () => {
    expect(sanitizeNextPath("https://evil.com")).toBe("/test-anclas-de-carrera");
    expect(sanitizeNextPath("//evil.com")).toBe("/test-anclas-de-carrera");
    expect(sanitizeNextPath("/\\evil.com")).toBe("/test-anclas-de-carrera");
    expect(sanitizeNextPath("/\nevil.com")).toBe("/test-anclas-de-carrera");
  });

  it("keeps safe internal paths", () => {
    expect(sanitizeNextPath("/en/test-anclas-de-carrera")).toBe("/en/test-anclas-de-carrera");
    expect(sanitizeNextPath("/en/panel?tab=profile#result")).toBe(
      "/en/panel?tab=profile#result",
    );
  });
});
