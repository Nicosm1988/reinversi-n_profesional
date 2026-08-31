import { z } from "zod";

export const CONTACT_LIMITS = {
  name: 100,
  phone: 40,
  email: 254,
  message: 4_000,
  explorationInterest: 1_000,
  resultSummary: 2_400,
  resultLabel: 180,
  sourcePage: 80,
  honeypot: 200,
} as const;

export const CONTACT_FORM_ORIGINS = [
  "contacto",
  "laboratorio_narrativas_laborales_alternativas",
  "diagnostic_result",
  "career_anchor_contact",
  "transiciones_laborales_interes",
] as const;

// Kept in sync by hand with transitionServiceSlugs in lib/data/senda-processes.ts,
// which is server-only and cannot be imported from the client forms that use this schema.
export const transitionServiceInterestSlugs = [
  "explorar-direccion",
  "cambiar-empleo",
  "proyecto-propio",
  "liderazgo-empresa",
  "desafio-puntual",
  "elegir-formacion",
  "transicion-a-otro-rol",
] as const;

export type ContactFormOrigin = (typeof CONTACT_FORM_ORIGINS)[number];

const SINGLE_LINE_CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/;
const MULTILINE_CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/;

function normalizeSingleLine(value: string) {
  return value.normalize("NFC").trim().replace(/[ \t]+/g, " ");
}

function normalizeMultiline(value: string) {
  return value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .trim();
}

function safeSingleLine(maxLength: number) {
  return z
    .string()
    .max(maxLength + 32)
    .refine((value) => !SINGLE_LINE_CONTROL_CHARACTERS.test(value))
    .transform(normalizeSingleLine)
    .pipe(z.string().max(maxLength));
}

function safeMultiline(maxLength: number) {
  return z
    .string()
    .max(maxLength + 128)
    .refine((value) => !MULTILINE_CONTROL_CHARACTERS.test(value))
    .transform(normalizeMultiline)
    .pipe(z.string().max(maxLength));
}

const contactSourcePageSchema = z
  .string()
  .max(CONTACT_LIMITS.sourcePage)
  .regex(/^\/(?:en\/)?contacto\/?$/);

const commonContactFields = {
  name: safeSingleLine(CONTACT_LIMITS.name).pipe(z.string().min(2)),
  phone: safeSingleLine(CONTACT_LIMITS.phone)
    .refine((value) => /^[+()\d .-]{6,40}$/.test(value)),
  email: safeSingleLine(CONTACT_LIMITS.email)
    .transform((value) => value.toLowerCase())
    .pipe(z.email().max(CONTACT_LIMITS.email)),
  consent: z.literal(true),
  companyWebsite: safeSingleLine(CONTACT_LIMITS.honeypot),
  locale: z.enum(["es", "en"]),
} as const;

const standardContactSubmissionSchema = z
  .object({
    ...commonContactFields,
    formOrigin: z.literal("contacto"),
    message: safeMultiline(CONTACT_LIMITS.message)
      .pipe(z.string().min(10).max(CONTACT_LIMITS.message)),
    sourcePage: contactSourcePageSchema,
  })
  .strict();

const laboratorySourcePageSchema = z.enum([
  "/laboratorio-narrativas-laborales-alternativas",
  "/en/laboratorio-narrativas-laborales-alternativas",
]);

const laboratoryContactSubmissionSchema = z
  .object({
    ...commonContactFields,
    formOrigin: z.literal("laboratorio_narrativas_laborales_alternativas"),
    explorationInterest: safeMultiline(CONTACT_LIMITS.explorationInterest)
      .optional()
      .transform((value) => value ?? ""),
    sourcePage: laboratorySourcePageSchema,
  })
  .strict();

const transitionsInterestSourcePageSchema = z.enum([
  "/transiciones-laborales",
  "/en/transiciones-laborales",
]);

const transitionsInterestContactSubmissionSchema = z
  .object({
    ...commonContactFields,
    formOrigin: z.literal("transiciones_laborales_interes"),
    service: z.enum(transitionServiceInterestSlugs),
    sourcePage: transitionsInterestSourcePageSchema,
  })
  .strict();

const diagnosticResultSourcePageSchema = z.enum([
  "/encontrar-mi-recorrido",
  "/en/encontrar-mi-recorrido",
]);

const optionalResultLabel = safeSingleLine(CONTACT_LIMITS.resultLabel)
  .pipe(z.string().min(1).max(CONTACT_LIMITS.resultLabel))
  .optional();

const optionalResultLabels = z
  .array(
    safeSingleLine(CONTACT_LIMITS.resultLabel).pipe(
      z.string().min(1).max(CONTACT_LIMITS.resultLabel),
    ),
  )
  .max(8)
  .optional();

export const diagnosticResultSchema = z
  .object({
    questionnaire: z.literal("route_finder"),
    situation: optionalResultLabel,
    recommendedService: optionalResultLabel,
    alternativeService: optionalResultLabel,
    primaryAnchors: optionalResultLabels,
    secondaryAnchors: optionalResultLabels,
    summary: safeMultiline(CONTACT_LIMITS.resultSummary).pipe(
      z.string().min(1).max(CONTACT_LIMITS.resultSummary),
    ),
  })
  .strict();

const diagnosticResultContactSubmissionSchema = z
  .object({
    ...commonContactFields,
    formOrigin: z.literal("diagnostic_result"),
    preferredContact: z.enum(["email", "whatsapp", "either"]),
    message: safeMultiline(CONTACT_LIMITS.message)
      .optional()
      .transform((value) => value ?? ""),
    result: diagnosticResultSchema,
    sourcePage: diagnosticResultSourcePageSchema,
  })
  .strict();

const careerAnchorContactSourcePageSchema = z.enum([
  "/test-anclas-de-carrera",
  "/en/test-anclas-de-carrera",
]);

const careerAnchorContactSubmissionSchema = z
  .object({
    ...commonContactFields,
    formOrigin: z.literal("career_anchor_contact"),
    preferredContact: z.enum(["email", "whatsapp", "either"]),
    message: safeMultiline(CONTACT_LIMITS.message)
      .optional()
      .transform((value) => value ?? ""),
    sourcePage: careerAnchorContactSourcePageSchema,
  })
  .strict();

const submissionWithExplicitOriginSchema = z
  .discriminatedUnion("formOrigin", [
    standardContactSubmissionSchema,
    laboratoryContactSubmissionSchema,
    diagnosticResultContactSubmissionSchema,
    careerAnchorContactSubmissionSchema,
    transitionsInterestContactSubmissionSchema,
  ])
  .superRefine((value, context) => {
    const normalizedSourcePage = value.sourcePage.replace(/\/$/, "");

    if (value.formOrigin === "diagnostic_result") {
      const localePrefix = value.locale === "en" ? "/en" : "";
      const expectedQuestionnaire = "route_finder";
      const allowedSources = [`${localePrefix}/encontrar-mi-recorrido`];

      if (!allowedSources.includes(normalizedSourcePage)) {
        context.addIssue({
          code: "custom",
          path: ["sourcePage"],
          message: "Source page does not match locale",
        });
      }

      if (value.result.questionnaire !== expectedQuestionnaire) {
        context.addIssue({
          code: "custom",
          path: ["result", "questionnaire"],
          message: "Questionnaire does not match source page",
        });
      }

      return;
    }

    if (value.formOrigin === "career_anchor_contact") {
      const expectedSourcePage = value.locale === "en"
        ? "/en/test-anclas-de-carrera"
        : "/test-anclas-de-carrera";

      if (normalizedSourcePage !== expectedSourcePage) {
        context.addIssue({
          code: "custom",
          path: ["sourcePage"],
          message: "Source page does not match locale",
        });
      }

      return;
    }

    const expectedSourcePage =
      value.formOrigin === "laboratorio_narrativas_laborales_alternativas"
        ? value.locale === "en"
          ? "/en/laboratorio-narrativas-laborales-alternativas"
          : "/laboratorio-narrativas-laborales-alternativas"
        : value.formOrigin === "transiciones_laborales_interes"
          ? value.locale === "en"
            ? "/en/transiciones-laborales"
            : "/transiciones-laborales"
          : value.locale === "en"
            ? "/en/contacto"
            : "/contacto";

    if (normalizedSourcePage !== expectedSourcePage) {
      context.addIssue({
        code: "custom",
        path: ["sourcePage"],
        message: "Source page does not match locale",
      });
    }
  });

export const contactSubmissionSchema = z.preprocess((value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  if (Object.prototype.hasOwnProperty.call(value, "formOrigin")) return value;

  return { ...value, formOrigin: "contacto" };
}, submissionWithExplicitOriginSchema);

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;
export type DiagnosticResult = z.infer<typeof diagnosticResultSchema>;

export type ContactField =
  | "name"
  | "phone"
  | "email"
  | "message"
  | "explorationInterest"
  | "consent";

export function getContactFieldNames(error: z.ZodError): ContactField[] {
  const fields = new Set<ContactField>();

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (
      field === "name" ||
      field === "phone" ||
      field === "email" ||
      field === "message" ||
      field === "explorationInterest" ||
      field === "consent"
    ) {
      fields.add(field);
    }
  }

  return [...fields];
}
