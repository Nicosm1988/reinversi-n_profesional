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
  formOrigin: "laboratorio_narrativas_laborales_alternativas",
  name: "  Ana   Pérez  ",
  phone: " +54 9 11 1234-5678 ",
  email: " ANA@EXAMPLE.COM ",
  explorationInterest: "Explorar nuevos relatos sobre mi trabajo.  \r\nCon otras personas.  ",
  consent: true,
  companyWebsite: "",
  sourcePage: "/laboratorio-narrativas-laborales-alternativas",
  locale: "es",
};

const VALID_DIAGNOSTIC_RESULT_SUBMISSION = {
  formOrigin: "diagnostic_result",
  name: "  Ana   Pérez  ",
  email: " ANA@EXAMPLE.COM ",
  phone: " +54 9 11 1234-5678 ",
  preferredContact: "email",
  message: "Me gustaría conversar sobre este resultado.",
  consent: true,
  companyWebsite: "",
  sourcePage: "/test-anclas-de-carrera",
  locale: "es",
  result: {
    questionnaire: "career_anchors",
    primaryAnchors: ["Autonomía/Independencia"],
    secondaryAnchors: ["Creatividad Emprendedora"],
    summary: "Una lectura orientativa de las motivaciones vinculadas con el trabajo.",
  },
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
      formOrigin: "laboratorio_narrativas_laborales_alternativas",
      name: "Ana Pérez",
      phone: "+54 9 11 1234-5678",
      email: "ana@example.com",
      explorationInterest:
        "Explorar nuevos relatos sobre mi trabajo.\nCon otras personas.",
      consent: true,
      companyWebsite: "",
      sourcePage: "/laboratorio-narrativas-laborales-alternativas",
      locale: "es",
    });
    expect("message" in parsed).toBe(false);
  });

  it("allows the laboratory exploration field to be omitted", () => {
    const parsed = contactSubmissionSchema.parse({
      formOrigin: "laboratorio_narrativas_laborales_alternativas",
      name: "Ana Pérez",
      phone: "+54 9 11 1234-5678",
      email: "ana@example.com",
      consent: true,
      companyWebsite: "",
      sourcePage: "/laboratorio-narrativas-laborales-alternativas",
      locale: "es",
    });

    expect(parsed.formOrigin).toBe("laboratorio_narrativas_laborales_alternativas");
    if (parsed.formOrigin === "laboratorio_narrativas_laborales_alternativas") {
      expect(parsed.explorationInterest).toBe("");
    }
  });

  it("rejects laboratory source mismatches, unknown origins and client subjects", () => {
    const wrongLocaleSource = contactSubmissionSchema.safeParse({
      ...VALID_LABORATORY_SUBMISSION,
      sourcePage: "/en/laboratorio-narrativas-laborales-alternativas",
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

  it("accepts a consented diagnostic result without raw answers", () => {
    const parsed = contactSubmissionSchema.parse(VALID_DIAGNOSTIC_RESULT_SUBMISSION);

    expect(parsed).toMatchObject({
      formOrigin: "diagnostic_result",
      name: "Ana Pérez",
      email: "ana@example.com",
      preferredContact: "email",
      sourcePage: "/test-anclas-de-carrera",
      result: {
        questionnaire: "career_anchors",
        primaryAnchors: ["Autonomía/Independencia"],
      },
    });
    expect(JSON.stringify(parsed)).not.toContain("rawAnswers");
  });

  it("rejects diagnostic source mismatches, missing consent and raw answer injection", () => {
    expect(
      contactSubmissionSchema.safeParse({
        ...VALID_DIAGNOSTIC_RESULT_SUBMISSION,
        locale: "en",
      }).success,
    ).toBe(false);
    expect(
      contactSubmissionSchema.safeParse({
        ...VALID_DIAGNOSTIC_RESULT_SUBMISSION,
        consent: false,
      }).success,
    ).toBe(false);
    expect(
      contactSubmissionSchema.safeParse({
        ...VALID_DIAGNOSTIC_RESULT_SUBMISSION,
        result: {
          ...VALID_DIAGNOSTIC_RESULT_SUBMISSION.result,
          rawAnswers: { answers: { "1": 6 } },
        },
      }).success,
    ).toBe(false);
    expect(
      contactSubmissionSchema.safeParse({
        ...VALID_DIAGNOSTIC_RESULT_SUBMISSION,
        sourcePage: "/encontrar-mi-recorrido",
      }).success,
    ).toBe(false);
  });

  it("accepts a transitions-page service interest lead", () => {
    const submission = {
      formOrigin: "transiciones_laborales_interes",
      name: "Ana Pérez",
      phone: "+54 9 11 1234-5678",
      email: "ana@example.com",
      consent: true,
      companyWebsite: "",
      service: "cambiar-empleo",
      sourcePage: "/transiciones-laborales",
      locale: "es",
    };
    const parsed = contactSubmissionSchema.parse(submission);

    expect(parsed).toMatchObject({
      formOrigin: "transiciones_laborales_interes",
      service: "cambiar-empleo",
      sourcePage: "/transiciones-laborales",
    });
    expect(
      contactSubmissionSchema.safeParse({ ...submission, service: "not-a-service" }).success,
    ).toBe(false);
    expect(
      contactSubmissionSchema.safeParse({ ...submission, sourcePage: "/contacto" }).success,
    ).toBe(false);
    expect(
      contactSubmissionSchema.safeParse({ ...submission, phone: "" }).success,
    ).toBe(false);
  });
});
