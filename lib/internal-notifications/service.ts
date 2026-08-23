import "next/dist/compiled/server-only";

import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
import { z } from "zod";
import { smtpAcceptedDelivery } from "@/lib/contact/smtp-result";
import {
  readInternalNotificationConfig,
  type InternalNotificationConfig,
} from "@/lib/internal-notifications/config";
import { buildInternalNotificationContent } from "@/lib/internal-notifications/content";
import {
  InternalNotificationOutbox,
  type InternalNotificationEnqueueOutcome,
  type InternalNotificationOutboxClaim,
  type InternalNotificationOutboxItem,
} from "@/lib/internal-notifications/outbox";
import type {
  InternalActivityInput,
  InternalNotificationDelivery,
  InternalNotificationFailureCode,
  InternalNotificationResult,
  ProcessInternalNotificationOutboxOptions,
} from "@/lib/internal-notifications/types";

const MAX_WORKER_DELIVERIES = 25;
const MAX_CONCURRENT_DELIVERIES = 4;
const MAX_RETRY_DELAY_MS = 6 * 60 * 60 * 1_000;

const activityInputSchema = z
  .object({
    type: z.enum(["login", "career_anchor_completed"]),
    eventId: z.string().trim().min(1).max(500),
    occurredAt: z.date().refine((date) => Number.isFinite(date.getTime())),
    audience: z.enum(["authenticated", "anonymous"]),
  })
  .strict();

const workerOptionsSchema = z
  .object({
    maxDeliveries: z.number().int().min(1).max(MAX_WORKER_DELIVERIES).optional(),
    deliveryIds: z.array(z.string().regex(/^[a-f0-9]{64}$/)).max(MAX_WORKER_DELIVERIES).optional(),
  })
  .strict();

type ParsedActivityInput = z.infer<typeof activityInputSchema>;

type PreparedDelivery = {
  deliveryId: string;
  recipientFingerprint: string;
  recipientKey: InternalNotificationDelivery["recipientKey"];
  item: InternalNotificationOutboxItem;
};

type ProcessedDelivery = {
  deliveryId: string;
  delivery: InternalNotificationDelivery;
  outboxUnavailable: boolean;
};

function emptyResult(
  errorCode: InternalNotificationFailureCode,
): InternalNotificationResult {
  return {
    sent: 0,
    duplicates: 0,
    failed: 0,
    unavailable: true,
    errorCode,
    deliveries: [],
  };
}

function recipientFingerprint(recipient: string) {
  return createHash("sha256")
    .update(`senda-internal-recipient-v1\0${recipient.trim().toLowerCase()}`)
    .digest("hex");
}

function recipientKey(fingerprint: string): InternalNotificationDelivery["recipientKey"] {
  return `recipient-${fingerprint.slice(0, 12)}`;
}

function deliveryHash(input: ParsedActivityInput, fingerprint: string) {
  return createHash("sha256")
    .update(`v2\0${input.type}\0${input.eventId}\0${fingerprint}`)
    .digest("hex");
}

function messageId(deliveryId: string, senderAddress: string) {
  const senderDomain = senderAddress.split("@")[1] ?? "universosenda.com";
  return `<senda-internal-${deliveryId.slice(0, 40)}@${senderDomain}>`;
}

function orderedRecipients(config: InternalNotificationConfig) {
  // Keep immediate result ordering deterministic. Persisted jobs are resolved by
  // fingerprint, so adding or reordering recipients cannot redirect a pending job.
  return [...config.recipients].sort((left, right) => left.localeCompare(right));
}

function resolveRecipient(
  config: InternalNotificationConfig,
  fingerprint: string,
) {
  return config.recipients.find(
    (recipient) => recipientFingerprint(recipient) === fingerprint,
  );
}

async function mapWithConcurrencyLimit<T, Result>(
  items: readonly T[],
  maximumConcurrency: number,
  operation: (item: T) => Promise<Result>,
) {
  const results: Result[] = [];

  for (let index = 0; index < items.length; index += maximumConcurrency) {
    const batch = await Promise.all(
      items.slice(index, index + maximumConcurrency).map(operation),
    );
    results.push(...batch);
  }

  return results;
}

function summarize(
  deliveries: InternalNotificationDelivery[],
  outboxUnavailable = false,
): InternalNotificationResult {
  const sent = deliveries.filter((delivery) => delivery.status === "sent").length;
  const duplicates = deliveries.filter((delivery) => delivery.status === "duplicate").length;
  const failed = deliveries.filter((delivery) => delivery.status === "failed").length;

  return {
    sent,
    duplicates,
    failed,
    unavailable: outboxUnavailable,
    ...(outboxUnavailable ? { errorCode: "outbox_unavailable" as const } : {}),
    deliveries,
  };
}

function createOutbox(config: InternalNotificationConfig) {
  return new InternalNotificationOutbox({
    url: config.redisUrl,
    token: config.redisToken,
  });
}

function createTransport(config: InternalNotificationConfig) {
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    requireTLS: config.smtpPort !== 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
}

function retryAtEpochMs(attemptCount: number) {
  const exponent = Math.max(0, Math.min(attemptCount - 1, 10));
  const delay = Math.min(60_000 * 2 ** exponent, MAX_RETRY_DELAY_MS);
  return Date.now() + delay;
}

async function rescheduleFailedClaim(
  outbox: InternalNotificationOutbox,
  claim: InternalNotificationOutboxClaim,
  errorCode: InternalNotificationFailureCode,
): Promise<ProcessedDelivery> {
  const nextItem = {
    ...claim.item,
    attemptCount: claim.item.attemptCount + 1,
  };
  const key = recipientKey(claim.item.recipientFingerprint);

  try {
    const rescheduled = await outbox.reschedule(
      claim,
      nextItem,
      retryAtEpochMs(nextItem.attemptCount),
    );
    if (!rescheduled) {
      return {
        deliveryId: claim.item.deliveryId,
        outboxUnavailable: true,
        delivery: {
          recipientKey: key,
          status: "failed",
          reservationBackend: "redis",
          errorCode: "outbox_unavailable",
          queued: true,
        },
      };
    }

    return {
      deliveryId: claim.item.deliveryId,
      outboxUnavailable: false,
      delivery: {
        recipientKey: key,
        status: "failed",
        reservationBackend: "redis",
        errorCode,
        queued: true,
      },
    };
  } catch {
    return {
      deliveryId: claim.item.deliveryId,
      outboxUnavailable: true,
      delivery: {
        recipientKey: key,
        status: "failed",
        reservationBackend: "redis",
        errorCode: "outbox_unavailable",
        queued: true,
      },
    };
  }
}

async function processClaim(
  outbox: InternalNotificationOutbox,
  claim: InternalNotificationOutboxClaim,
  config: InternalNotificationConfig,
  transporter: ReturnType<typeof nodemailer.createTransport>,
): Promise<ProcessedDelivery> {
  const recipient = resolveRecipient(config, claim.item.recipientFingerprint);
  if (!recipient) {
    return rescheduleFailedClaim(outbox, claim, "recipient_unavailable");
  }

  const key = recipientKey(claim.item.recipientFingerprint);
  const content = buildInternalNotificationContent({
    type: claim.item.type,
    audience: claim.item.audience,
    occurredAt: new Date(claim.item.occurredAtEpochMs),
  });

  try {
    const result = await transporter.sendMail({
      from: { name: "Senda", address: config.smtpUser },
      to: recipient,
      replyTo: { name: "Equipo Senda", address: config.smtpUser },
      subject: content.subject,
      text: content.text,
      messageId: messageId(claim.item.deliveryId, config.smtpUser),
    });

    if (!smtpAcceptedDelivery(result)) {
      return rescheduleFailedClaim(outbox, claim, "smtp_rejected");
    }
  } catch {
    return rescheduleFailedClaim(outbox, claim, "smtp_transport");
  }

  try {
    const completed = await outbox.markDelivered(claim);
    if (!completed) {
      return {
        deliveryId: claim.item.deliveryId,
        outboxUnavailable: true,
        delivery: {
          recipientKey: key,
          status: "failed",
          reservationBackend: "redis",
          errorCode: "outbox_unavailable",
          queued: true,
        },
      };
    }
  } catch {
    return {
      deliveryId: claim.item.deliveryId,
      outboxUnavailable: true,
      delivery: {
        recipientKey: key,
        status: "failed",
        reservationBackend: "redis",
        errorCode: "outbox_unavailable",
        queued: true,
      },
    };
  }

  return {
    deliveryId: claim.item.deliveryId,
    outboxUnavailable: false,
    delivery: {
      recipientKey: key,
      status: "sent",
      reservationBackend: "redis",
      queued: false,
    },
  };
}

async function processWithOutbox(
  outbox: InternalNotificationOutbox,
  config: InternalNotificationConfig,
  options: Required<Pick<ProcessInternalNotificationOutboxOptions, "maxDeliveries">>
    & Pick<ProcessInternalNotificationOutboxOptions, "deliveryIds">,
): Promise<InternalNotificationResult & { processed: ProcessedDelivery[] }> {
  let claims: InternalNotificationOutboxClaim[];
  try {
    claims = await outbox.claimDue(options);
  } catch {
    return { ...emptyResult("outbox_unavailable"), processed: [] };
  }

  if (claims.length === 0) {
    return { ...summarize([]), processed: [] };
  }

  let transporter: ReturnType<typeof nodemailer.createTransport>;
  try {
    transporter = createTransport(config);
  } catch {
    const processed = await Promise.all(
      claims.map((claim) => {
        return rescheduleFailedClaim(outbox, claim, "smtp_transport");
      }),
    );
    return {
      ...summarize(
        processed.map(({ delivery }) => delivery),
        processed.some(({ outboxUnavailable }) => outboxUnavailable),
      ),
      processed,
    };
  }

  const processed = await mapWithConcurrencyLimit(
    claims,
    MAX_CONCURRENT_DELIVERIES,
    (claim) => processClaim(outbox, claim, config, transporter),
  );
  return {
    ...summarize(
      processed.map(({ delivery }) => delivery),
      processed.some(({ outboxUnavailable }) => outboxUnavailable),
    ),
    processed,
  };
}

export async function notifyInternalActivity(
  input: InternalActivityInput,
): Promise<InternalNotificationResult> {
  try {
    const parsed = activityInputSchema.safeParse(input);
    if (!parsed.success) return emptyResult("invalid_input");

    const config = readInternalNotificationConfig();
    if (!config) return emptyResult("configuration");

    let outbox: InternalNotificationOutbox;
    try {
      outbox = createOutbox(config);
    } catch {
      return emptyResult("outbox_unavailable");
    }

    const activity = parsed.data;
    const prepared = orderedRecipients(config).map(
      (recipient): PreparedDelivery => {
        const fingerprint = recipientFingerprint(recipient);
        const deliveryId = deliveryHash(activity, fingerprint);
        return {
          deliveryId,
          recipientFingerprint: fingerprint,
          recipientKey: recipientKey(fingerprint),
          item: {
            version: 1,
            deliveryId,
            type: activity.type,
            occurredAtEpochMs: activity.occurredAt.getTime(),
            audience: activity.audience,
            recipientFingerprint: fingerprint,
            attemptCount: 0,
          },
        };
      },
    );

    const enqueueResults = await Promise.all(
      prepared.map(async (delivery) => {
        try {
          const outcome = await outbox.enqueue(delivery.item);
          return { delivery, outcome };
        } catch {
          return { delivery, outcome: null };
        }
      }),
    );

    const persisted = enqueueResults.filter(
      (result): result is typeof result & { outcome: InternalNotificationEnqueueOutcome } =>
        result.outcome !== null,
    );
    const deliveryIds = persisted
      .filter(({ outcome }) => outcome !== "delivered")
      .map(({ delivery }) => delivery.deliveryId);
    const immediate = deliveryIds.length > 0
      ? await processWithOutbox(outbox, config, {
          maxDeliveries: Math.min(deliveryIds.length, MAX_WORKER_DELIVERIES),
          deliveryIds,
        })
      : { ...summarize([]), processed: [] as ProcessedDelivery[] };
    const processedById = new Map(
      immediate.processed.map((processed) => [processed.deliveryId, processed.delivery]),
    );

    const deliveries = enqueueResults.map(({ delivery, outcome }) => {
      if (outcome === null) {
        return {
          recipientKey: delivery.recipientKey,
          status: "failed" as const,
          reservationBackend: "redis" as const,
          errorCode: "outbox_unavailable" as const,
          queued: false,
        };
      }
      if (outcome === "delivered") {
        return {
          recipientKey: delivery.recipientKey,
          status: "duplicate" as const,
          reservationBackend: "redis" as const,
          queued: false,
        };
      }

      return processedById.get(delivery.deliveryId) ?? {
        recipientKey: delivery.recipientKey,
        status: "duplicate" as const,
        reservationBackend: "redis" as const,
        queued: true,
      };
    });
    const enqueueUnavailable = enqueueResults.some(({ outcome }) => outcome === null);

    return summarize(deliveries, enqueueUnavailable || immediate.unavailable);
  } catch {
    return emptyResult("unexpected");
  }
}

export async function processInternalNotificationOutbox(
  options: ProcessInternalNotificationOutboxOptions = {},
): Promise<InternalNotificationResult> {
  try {
    const parsed = workerOptionsSchema.safeParse(options);
    if (!parsed.success) return emptyResult("invalid_input");

    const config = readInternalNotificationConfig();
    if (!config) return emptyResult("configuration");

    let outbox: InternalNotificationOutbox;
    try {
      outbox = createOutbox(config);
    } catch {
      return emptyResult("outbox_unavailable");
    }

    const result = await processWithOutbox(outbox, config, {
      maxDeliveries: parsed.data.maxDeliveries ?? 10,
      ...(parsed.data.deliveryIds ? { deliveryIds: parsed.data.deliveryIds } : {}),
    });
    return {
      sent: result.sent,
      duplicates: result.duplicates,
      failed: result.failed,
      unavailable: result.unavailable,
      ...(result.errorCode ? { errorCode: result.errorCode } : {}),
      deliveries: result.deliveries,
    };
  } catch {
    return emptyResult("unexpected");
  }
}

export type {
  InternalActivityAudience,
  InternalActivityInput,
  InternalActivityType,
  InternalNotificationDelivery,
  InternalNotificationFailureCode,
  InternalNotificationResult,
  ProcessInternalNotificationOutboxOptions,
} from "@/lib/internal-notifications/types";
