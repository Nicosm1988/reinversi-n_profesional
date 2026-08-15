import "next/dist/compiled/server-only";

import nodemailer from "nodemailer";
import { z } from "zod";
import { buildContactEmailText } from "@/lib/contact/email-content";
import { type ContactSubmission } from "@/lib/contact/schema";
import { smtpAcceptedDelivery } from "@/lib/contact/smtp-result";

const LABORATORY_CONTACT_SUBJECT =
  "Interés en el Laboratorio de Narrativas Laborales Alternativas";
const DIAGNOSTIC_RESULT_SUBJECT = "Resultado orientativo compartido desde Senda";

const smtpEnvironmentSchema = z
  .object({
    SMTP_HOST: z.string().trim().min(1).max(253).regex(/^(?=.{1,253}$)(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)*[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i),
    SMTP_PORT: z.coerce.number().int().min(1).max(65_535),
    SMTP_USER: z.email().max(254),
    SMTP_PASSWORD: z.string().min(1).max(1_024).refine((value) => !/^\[(?:sensitive|redacted|hidden)\]$/i.test(value.trim())),
    CONTACT_TO_EMAIL: z.email().max(254),
  })
  .strict();

export class ContactConfigurationError extends Error {
  constructor() {
    super("Contact SMTP configuration is unavailable");
    this.name = "ContactConfigurationError";
  }
}

export class ContactDeliveryError extends Error {
  constructor() {
    super("SMTP did not accept the contact message");
    this.name = "ContactDeliveryError";
  }
}

function readSmtpConfig() {
  const parsed = smtpEnvironmentSchema.safeParse({
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
  });

  if (!parsed.success) {
    throw new ContactConfigurationError();
  }

  return parsed.data;
}

function contactEmailSubject(submission: ContactSubmission) {
  if (submission.formOrigin === "laboratorio_narrativas_laborales_alternativas") {
    return LABORATORY_CONTACT_SUBJECT;
  }

  if (submission.formOrigin === "diagnostic_result") {
    return DIAGNOSTIC_RESULT_SUBJECT;
  }

  return "Nueva consulta desde la web de Senda";
}

export async function sendContactEmail(
  submission: ContactSubmission,
  context: { date: Date; source: string },
) {
  const config = readSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    requireTLS: config.SMTP_PORT !== 465,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASSWORD,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  const result = await transporter.sendMail({
    from: { name: "Senda web", address: config.SMTP_USER },
    to: config.CONTACT_TO_EMAIL,
    replyTo: { name: submission.name, address: submission.email },
    subject: contactEmailSubject(submission),
    text: buildContactEmailText(submission, context),
  });

  if (!smtpAcceptedDelivery(result)) {
    throw new ContactDeliveryError();
  }
}
