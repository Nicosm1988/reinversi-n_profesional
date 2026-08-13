import { z } from "zod";

export const CONTACT_LIMITS = {
  name: 100,
  phone: 40,
  email: 254,
  message: 4_000,
  sourcePage: 80,
  honeypot: 200,
} as const;

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

const contactSourcePageSchema = z
  .string()
  .max(CONTACT_LIMITS.sourcePage)
  .regex(/^\/(?:en\/)?contacto\/?$/);

export const contactSubmissionSchema = z
  .object({
    name: safeSingleLine(CONTACT_LIMITS.name).pipe(z.string().min(2)),
    phone: safeSingleLine(CONTACT_LIMITS.phone)
      .refine((value) => value === "" || /^[+()\d .-]{6,40}$/.test(value)),
    email: safeSingleLine(CONTACT_LIMITS.email)
      .transform((value) => value.toLowerCase())
      .pipe(z.email().max(CONTACT_LIMITS.email)),
    message: z
      .string()
      .max(CONTACT_LIMITS.message + 128)
      .refine((value) => !MULTILINE_CONTROL_CHARACTERS.test(value))
      .transform(normalizeMultiline)
      .pipe(z.string().min(10).max(CONTACT_LIMITS.message)),
    consent: z.literal(true),
    companyWebsite: safeSingleLine(CONTACT_LIMITS.honeypot),
    sourcePage: contactSourcePageSchema,
    locale: z.enum(["es", "en"]),
  })
  .strict()
  .superRefine((value, context) => {
    const expectedSourcePage = value.locale === "en" ? "/en/contacto" : "/contacto";
    const normalizedSourcePage = value.sourcePage.replace(/\/$/, "");

    if (normalizedSourcePage !== expectedSourcePage) {
      context.addIssue({
        code: "custom",
        path: ["sourcePage"],
        message: "Source page does not match locale",
      });
    }
  });

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;

export type ContactField = "name" | "phone" | "email" | "message" | "consent";

export function getContactFieldNames(error: z.ZodError): ContactField[] {
  const fields = new Set<ContactField>();

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (
      field === "name" ||
      field === "phone" ||
      field === "email" ||
      field === "message" ||
      field === "consent"
    ) {
      fields.add(field);
    }
  }

  return [...fields];
}
