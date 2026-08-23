import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const bimiPath = resolve(process.cwd(), "public/bimi.svg");

describe("BIMI brand asset", () => {
  it("uses the original Senda mark in the secure SVG Tiny-PS profile", () => {
    const svg = readFileSync(bimiPath, "utf8");

    expect(Buffer.byteLength(svg)).toBeLessThanOrEqual(32 * 1024);
    expect(svg).toMatch(/^<svg\b[^>]*\bversion="1\.2"/);
    expect(svg).toMatch(/^<svg\b[^>]*\bbaseProfile="tiny-ps"/);
    expect(svg).toMatch(/^<svg\b[^>]*\bviewBox="0 0 64 64"/);
    expect(svg).toMatch(/^<svg\b[^>]*\bwidth="512"/);
    expect(svg).toMatch(/^<svg\b[^>]*\bheight="512"/);
    expect(svg).toContain("<title>Senda</title>");
    expect(svg).toContain('<rect width="64" height="64" fill="#fbf9fc"/>');
    expect(svg).toContain('fill="#cc148c"');
  });

  it("contains no external resources, scripts, animation, or root coordinates", () => {
    const svg = readFileSync(bimiPath, "utf8");
    const root = svg.match(/^<svg\b[^>]*>/)?.[0] ?? "";

    expect(root).not.toMatch(/\s(?:x|y)="/);
    expect(svg).not.toMatch(/<(?:script|animate|animateTransform|image|foreignObject|iframe|audio|video)\b/i);
    expect(svg).not.toMatch(/\sopacity\s*=/i);
    expect(svg).not.toMatch(/\b(?:href|xlink:href)\s*=/i);
    expect(svg.replace('xmlns="http://www.w3.org/2000/svg"', "")).not.toMatch(
      /\b(?:http|https|data):/i,
    );
  });
});
