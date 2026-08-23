import { z } from "zod";

const redactedSecretPattern = /^\[(?:sensitive|redacted|hidden)\]$/i;
export const REQUIRED_INTERNAL_NOTIFICATION_RECIPIENTS = [
  "hola@universosenda.com",
  "tanisardella@gmail.com",
] as const;

const smtpEnvironmentSchema = z
  .object({
    SMTP_HOST: z
      .string()
      .trim()
      .min(1)
      .max(253)
      .regex(/^(?=.{1,253}$)(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)*[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i),
    SMTP_PORT: z.coerce.number().int().min(1).max(65_535),
    SMTP_USER: z.email().max(254).transform((value) => value.toLowerCase()),
    SMTP_PASSWORD: z
      .string()
      .min(1)
      .max(1_024)
      .refine((value) => !redactedSecretPattern.test(value.trim())),
    INTERNAL_NOTIFICATION_EMAILS: z.string().trim().min(1).max(1_500),
    UPSTASH_REDIS_REST_URL: z.url().max(2_048),
    UPSTASH_REDIS_REST_TOKEN: z
      .string()
      .trim()
      .min(1)
      .max(4_096)
      .refine((value) => !redactedSecretPattern.test(value)),
  })
  .strict();

const recipientSchema = z.email().max(254);
const reconciliationEnvironmentSchema = z
  .object({
    INTERNAL_NOTIFICATION_STARTED_AT: z.iso.datetime({ offset: true }),
  })
  .strict();

export type InternalNotificationConfig = {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  recipients: string[];
  redisUrl: string;
  redisToken: string;
};

export type InternalNotificationReconciliationConfig = {
  startedAt: Date;
};

function parseRecipients(raw: string) {
  const entries = raw.split(",").map((entry) => entry.trim().toLowerCase());
  if (entries.some((entry) => entry.length === 0)) return null;

  const recipients = [...new Set(entries)];
  if (recipients.length < 1 || recipients.length > 5) return null;

  const parsed = z.array(recipientSchema).safeParse(recipients);
  if (!parsed.success) return null;

  return REQUIRED_INTERNAL_NOTIFICATION_RECIPIENTS.every((email) => parsed.data.includes(email))
    ? parsed.data
    : null;
}

export function readInternalNotificationConfig(): InternalNotificationConfig | null {
  const parsed = smtpEnvironmentSchema.safeParse({
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    INTERNAL_NOTIFICATION_EMAILS: process.env.INTERNAL_NOTIFICATION_EMAILS,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  if (!parsed.success) return null;

  const recipients = parseRecipients(parsed.data.INTERNAL_NOTIFICATION_EMAILS);
  if (!recipients) return null;

  return {
    smtpHost: parsed.data.SMTP_HOST,
    smtpPort: parsed.data.SMTP_PORT,
    smtpUser: parsed.data.SMTP_USER,
    smtpPassword: parsed.data.SMTP_PASSWORD,
    recipients,
    redisUrl: parsed.data.UPSTASH_REDIS_REST_URL,
    redisToken: parsed.data.UPSTASH_REDIS_REST_TOKEN,
  };
}

export function readInternalNotificationReconciliationConfig():
  | InternalNotificationReconciliationConfig
  | null {
  const parsed = reconciliationEnvironmentSchema.safeParse({
    INTERNAL_NOTIFICATION_STARTED_AT: process.env.INTERNAL_NOTIFICATION_STARTED_AT?.trim(),
  });
  if (!parsed.success) return null;

  return { startedAt: new Date(parsed.data.INTERNAL_NOTIFICATION_STARTED_AT) };
}
