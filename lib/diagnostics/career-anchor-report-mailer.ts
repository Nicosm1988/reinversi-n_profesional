import "next/dist/compiled/server-only";

import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
import { z } from "zod";
import { smtpAcceptedDelivery } from "@/lib/contact/smtp-result";
import {
  buildCareerAnchorInternalResultEmailContent,
  type CareerAnchorInternalResultEmailContentInput,
} from "@/lib/diagnostics/career-anchor-internal-result-email-content";
import {
  buildCareerAnchorReportEmailContent,
  type CareerAnchorReportEmailContentInput,
} from "@/lib/diagnostics/career-anchor-report-email-content";

const smtpEnvironmentSchema = z
  .object({
    SMTP_HOST: z.string().trim().min(1).max(253).regex(/^(?=.{1,253}$)(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)*[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i),
    SMTP_PORT: z.coerce.number().int().min(1).max(65_535),
    SMTP_USER: z.email().max(254),
    SMTP_PASSWORD: z.string().min(1).max(1_024).refine((value) => !/^\[(?:sensitive|redacted|hidden)\]$/i.test(value.trim())),
  })
  .strict();

const recipientSchema = z.email().max(254);

export class CareerAnchorReportEmailConfigurationError extends Error {
  readonly code = "smtp_configuration";

  constructor() {
    super("Career Anchor report SMTP configuration is unavailable");
    this.name = "CareerAnchorReportEmailConfigurationError";
  }
}

export class CareerAnchorReportEmailRecipientError extends Error {
  readonly code = "recipient_invalid";

  constructor() {
    super("Career Anchor report recipient is invalid");
    this.name = "CareerAnchorReportEmailRecipientError";
  }
}

export class CareerAnchorReportEmailDeliveryError extends Error {
  readonly code = "smtp_rejected";

  constructor() {
    super("SMTP did not accept the Career Anchor report message");
    this.name = "CareerAnchorReportEmailDeliveryError";
  }
}

function readSmtpConfig() {
  const parsed = smtpEnvironmentSchema.safeParse({
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  });

  if (!parsed.success) {
    throw new CareerAnchorReportEmailConfigurationError();
  }

  return parsed.data;
}

function deterministicMessageId(deliveryId: string, senderAddress: string) {
  const senderDomain = senderAddress.split("@")[1] ?? "universosenda.com";
  const opaqueDeliveryId = createHash("sha256").update(deliveryId).digest("hex").slice(0, 40);
  return `<career-anchor-${opaqueDeliveryId}@${senderDomain}>`;
}

type CareerAnchorEmailContent = {
  subject: string;
  text: string;
  html: string;
};

async function sendCareerAnchorEmail(
  input: { recipient: string; deliveryId: string },
  buildContent: () => CareerAnchorEmailContent,
) {
  const config = readSmtpConfig();
  const recipient = recipientSchema.safeParse(input.recipient);
  if (!recipient.success) {
    throw new CareerAnchorReportEmailRecipientError();
  }

  const content = buildContent();
  const messageId = deterministicMessageId(input.deliveryId, config.SMTP_USER);
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
    from: { name: "Senda", address: config.SMTP_USER },
    to: recipient.data,
    replyTo: { name: "Equipo Senda", address: config.SMTP_USER },
    subject: content.subject,
    text: content.text,
    html: content.html,
    messageId,
  });

  if (!smtpAcceptedDelivery(result)) {
    throw new CareerAnchorReportEmailDeliveryError();
  }

  return {
    messageId: typeof result.messageId === "string" ? result.messageId.slice(0, 500) : messageId,
  };
}

export async function sendCareerAnchorReportEmail(
  input: CareerAnchorReportEmailContentInput & {
    recipient: string;
    deliveryId: string;
  },
) {
  return sendCareerAnchorEmail(input, () => buildCareerAnchorReportEmailContent(input));
}

export async function sendCareerAnchorInternalResultEmail(
  input: CareerAnchorInternalResultEmailContentInput & {
    recipient: string;
    deliveryId: string;
  },
) {
  const { recipient, deliveryId, ...contentInput } = input;
  return sendCareerAnchorEmail(
    { recipient, deliveryId },
    () => buildCareerAnchorInternalResultEmailContent(contentInput),
  );
}
