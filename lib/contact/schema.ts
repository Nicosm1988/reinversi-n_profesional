import { z } from "zod";

export const CONTACT_LIMITS = {
  name: 100,
  phone: 40,
  email: 254,
  message: 4_000,
  explorationInterest: 1_000,
  sourcePage: 80,
  honeypot: 200,
} as const;

export const CONTACT_FORM_ORIGINS = [
  "contacto",
  "laboratorio_nuevas_narrativas",
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
    .refine((value) => value === "" || /^[+()\d .-]{6,40}$/.test(value))
    .optional()
    .transform((value) => value ?? ""),
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
  "/laboratorio-nuevas-narrativas",
  "/en/laboratorio-nuevas-narrativas",
]);

const laboratoryContactSubmissionSchema = z
  .object({
    ...commonContactFields,
    formOrigin: z.literal("laboratorio_nuevas_narrativas"),
    explorationInterest: safeMultiline(CONTACT_LIMITS.explorationInterest)
      .optional()
      .transform((value) => value ?? ""),
    sourcePage: laboratorySourcePageSchema,
  })
  .strict();

const submissionWithExplicitOriginSchema = z
  .discriminatedUnion("formOrigin", [
    standardContactSubmissionSchema,
    laboratoryContactSubmissionSchema,
  ])
  .superRefine((value, context) => {
    const expectedSourcePage =
      value.formOrigin === "laboratorio_nuevas_narrativas"
        ? value.locale === "en"
          ? "/en/laboratorio-nuevas-narrativas"
          : "/laboratorio-nuevas-narrativas"
        : value.locale === "en"
          ? "/en/contacto"
          : "/contacto";
    const normalizedSourcePage = value.sourcePage.replace(/\/$/, "");

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
