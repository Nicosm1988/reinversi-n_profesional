import { describe, expect, it } from "vitest";
import { canRepeatCareerAnchorTest } from "@/lib/diagnostics/access";

describe("canRepeatCareerAnchorTest", () => {
  it.each(["nmarcosan@gmail.com", "tanisardella@gmail.com", " NMARCOSAN@GMAIL.COM "])(
    "allows the project creator account %s",
    (email) => expect(canRepeatCareerAnchorTest(email)).toBe(true),
  );

  it.each(["persona@example.com", "", null, undefined])(
    "keeps regular accounts limited (%s)",
    (email) => expect(canRepeatCareerAnchorTest(email)).toBe(false),
  );
});
