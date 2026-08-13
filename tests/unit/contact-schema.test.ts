import { describe, expect, it } from "vitest";
import { contactSubmissionSchema, getContactFieldNames } from "@/lib/contact/schema";

const VALID_SUBMISSION = {
  name: "  Ana   Pérez  ",
  phone: " +54 9 11 1234-5678 ",
  email: " ANA@EXAMPLE.COM ",
  message: "Quisiera conversar sobre mi próximo paso.\r\nGracias.  ",
  consent: true,
  companyWebsite: "",
  sourcePage: "/contacto",
  locale: "es",
};

describe("contactSubmissionSchema", () => {
  it("normalizes valid contact data", () => {
    const parsed = contactSubmissionSchema.parse(VALID_SUBMISSION);

    expect(parsed).toMatchObject({
      name: "Ana Pérez",
      phone: "+54 9 11 1234-5678",
      email: "ana@example.com",
      message: "Quisiera conversar sobre mi próximo paso.\nGracias.",
    });
  });

  it("rejects header injection control characters", () => {
    const parsed = contactSubmissionSchema.safeParse({
      ...VALID_SUBMISSION,
      name: "Ana\r\nBcc: attacker@example.com",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(getContactFieldNames(parsed.error)).toContain("name");
    }
  });

  it("rejects malformed email, phone and locale/source mismatches", () => {
    const parsed = contactSubmissionSchema.safeParse({
      ...VALID_SUBMISSION,
      email: "not-an-email",
      phone: "call-me<script>",
      locale: "en",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(getContactFieldNames(parsed.error)).toEqual(expect.arrayContaining(["phone", "email"]));
      expect(parsed.error.issues.some((issue) => issue.path[0] === "sourcePage")).toBe(true);
    }
  });

  it("requires explicit consent and reasonable content lengths", () => {
    const parsed = contactSubmissionSchema.safeParse({
      ...VALID_SUBMISSION,
      consent: false,
      message: "Too short",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(getContactFieldNames(parsed.error)).toEqual(expect.arrayContaining(["message", "consent"]));
    }
  });
});
