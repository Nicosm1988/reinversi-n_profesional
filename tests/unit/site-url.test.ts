import { afterEach, describe, expect, it } from "vitest";
import { getSiteUrl } from "@/lib/site-url";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
});

describe("getSiteUrl", () => {
  it("uses the current production URL as a safe fallback", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getSiteUrl()).toBe("https://reinvension-profesional.vercel.app");
  });

  it("normalizes a configured domain to its origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://senda.example/path";
    expect(getSiteUrl()).toBe("https://senda.example");
  });

  it("falls back when the configured value is invalid", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "not a URL";
    expect(getSiteUrl()).toBe("https://reinvension-profesional.vercel.app");
  });
});
