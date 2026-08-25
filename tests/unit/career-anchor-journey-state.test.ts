import { describe, expect, it } from "vitest";
import { getCareerAnchorInitialStep } from "@/lib/diagnostics/career-anchor-journey-state";

describe("getCareerAnchorInitialStep", () => {
  it("routes every unfinished journey through the preparation screen before resuming", () => {
    expect(getCareerAnchorInitialStep("in_progress", false)).toBe("ready");
    expect(getCareerAnchorInitialStep("processing", false)).toBe("ready");
  });

  it("preserves anonymous and stored-result entry states", () => {
    expect(getCareerAnchorInitialStep(undefined, false)).toBe("intro");
    expect(getCareerAnchorInitialStep("completed", false)).toBe("completed");
    expect(getCareerAnchorInitialStep("completed", true)).toBe("results");
  });
});
