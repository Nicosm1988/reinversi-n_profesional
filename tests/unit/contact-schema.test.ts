import { describe, expect, it } from "vitest";
import {
  CONTACT_LIMITS,
  contactSubmissionSchema,
  getContactFieldNames,
} from "@/lib/contact/schema";

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

const VALID_LABORATORY_SUBMISSION = {
  formOrigin: "laboratorio_nuevas_narrativas",
  name: "  Ana   Pérez  ",
  email: " ANA@EXAMPLE.COM ",
  explorationInterest: "Explorar nuevos relatos sobre mi trabajo.  \r\nCon otras personas.  ",
  consent: true,
  companyWebsite: "",
  sourcePage: "/laboratorio-nuevas-narrativas",
  locale: "es",
};

describe("contactSubmissionSchema", () => {
  it("normalizes valid contact data", () => {
    const parsed = contactSubmissionSchema.parse(VALID_SUBMISSION);

    expect(parsed).toMatchObject({
      formOrigin: "contacto",
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

  it("accepts the laboratory origin without inventing a message", () => {
    const parsed = contactSubmissionSchema.parse(VALID_LABORATORY_SUBMISSION);

    expect(parsed).toEqual({
      formOrigin: "laboratorio_nuevas_narrativas",
      name: "Ana Pérez",
      phone: "",
      email: "ana@example.com",
      explorationInterest:
        "Explorar nuevos relatos sobre mi trabajo.\nCon otras personas.",
      consent: true,
      companyWebsite: "",
      sourcePage: "/laboratorio-nuevas-narrativas",
      locale: "es",
    });
    expect("message" in parsed).toBe(false);
  });

  it("allows the laboratory exploration field to be omitted", () => {
    const parsed = contactSubmissionSchema.parse({
      formOrigin: "laboratorio_nuevas_narrativas",
      name: "Ana Pérez",
      email: "ana@example.com",
      consent: true,
      companyWebsite: "",
      sourcePage: "/laboratorio-nuevas-narrativas",
      locale: "es",
    });

    expect(parsed.formOrigin).toBe("laboratorio_nuevas_narrativas");
    if (parsed.formOrigin === "laboratorio_nuevas_narrativas") {
      expect(parsed.explorationInterest).toBe("");
    }
  });

  it("rejects laboratory source mismatches, unknown origins and client subjects", () => {
    const wrongLocaleSource = contactSubmissionSchema.safeParse({
      ...VALID_LABORATORY_SUBMISSION,
      sourcePage: "/en/laboratorio-nuevas-narrativas",
    });
    const unknownOrigin = contactSubmissionSchema.safeParse({
      ...VALID_LABORATORY_SUBMISSION,
      formOrigin: "laboratorio_desconocido",
    });
    const clientSubject = contactSubmissionSchema.safeParse({
      ...VALID_LABORATORY_SUBMISSION,
      subject: "Asunto controlado por el cliente",
    });

    expect(wrongLocaleSource.success).toBe(false);
    if (!wrongLocaleSource.success) {
      expect(
        wrongLocaleSource.error.issues.some(
          (issue) => issue.path[0] === "sourcePage",
        ),
      ).toBe(true);
    }
    expect(unknownOrigin.success).toBe(false);
    expect(clientSubject.success).toBe(false);
  });

  it("sanitizes the optional laboratory field with a strict length limit", () => {
    const tooLong = contactSubmissionSchema.safeParse({
      ...VALID_LABORATORY_SUBMISSION,
      explorationInterest: "x".repeat(CONTACT_LIMITS.explorationInterest + 1),
    });
    const controlCharacter = contactSubmissionSchema.safeParse({
      ...VALID_LABORATORY_SUBMISSION,
      explorationInterest: "Quiero explorar\u0000 nuevas narrativas",
    });

    expect(tooLong.success).toBe(false);
    if (!tooLong.success) {
      expect(getContactFieldNames(tooLong.error)).toContain(
        "explorationInterest",
      );
    }
    expect(controlCharacter.success).toBe(false);
    if (!controlCharacter.success) {
      expect(getContactFieldNames(controlCharacter.error)).toContain(
        "explorationInterest",
      );
    }
  });
});
