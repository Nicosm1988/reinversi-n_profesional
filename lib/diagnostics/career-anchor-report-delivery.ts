import "next/dist/compiled/server-only";

import { z } from "zod";
import {
  calculateCareerAnchorRanking,
  careerAnchorRawAnswersSchema,
} from "@/lib/diagnostics/career-anchor";
import {
  CareerAnchorReportEmailConfigurationError,
  CareerAnchorReportEmailDeliveryError,
  CareerAnchorReportEmailRecipientError,
  sendCareerAnchorReportEmail,
} from "@/lib/diagnostics/career-anchor-report-mailer";
import { logEvent } from "@/lib/observability/logger";
import { getSiteUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";

const deliveryClaimSchema = z
  .object({
    delivery_id: z.uuid(),
    diagnostic_id: z.uuid(),
    user_id: z.uuid(),
    locale: z.enum(["es", "en"]),
    attempt_id: z.uuid(),
    attempt_number: z.number().int().positive(),
  })
  .strict();

const storedReportSchema = z
  .object({
    status: z.literal("completed"),
    raw_answers: careerAnchorRawAnswersSchema,
    dominant_result: z.object({ name: z.string().trim().min(1).max(240) }).passthrough(),
    ai_feedback: z
      .object({
        title: z.string().trim().min(1).max(500),
        summary: z.string().trim().min(1).max(8_000),
        frictionAreas: z.array(z.string().trim().min(1).max(2_000)).max(8).optional(),
        idealEcosystem: z.string().trim().min(1).max(4_000).nullish(),
        strategicQuestion: z.string().trim().min(1).max(2_000).nullish(),
      })
      .passthrough(),
  })
  .strict();

type DeliveryOutcome = "sent" | "failed" | "permanent_failure";

export type CareerAnchorReportDeliverySummary = {
  claimed: number;
  sent: number;
  retryScheduled: number;
  permanentFailures: number;
  unavailable: boolean;
};

function retryDelaySeconds(attemptNumber: number) {
  return Math.min(7 * 24 * 60 * 60, 15 * 60 * 2 ** Math.min(attemptNumber - 1, 9));
}

function localizedReportUrl(locale: "es" | "en") {
  return `${getSiteUrl()}${locale === "en" ? "/en" : ""}/panel#resultado`;
}

function normalizeRpcRows(value: unknown) {
  if (Array.isArray(value)) return value;
  return value === null || value === undefined ? [] : [value];
}

async function finishDelivery(
  admin: ReturnType<typeof createAdminClient>,
  claim: z.infer<typeof deliveryClaimSchema>,
  input: {
    outcome: DeliveryOutcome;
    messageId?: string | null;
    errorCode?: string | null;
    retryAfterSeconds?: number | null;
  },
) {
  const { data, error } = await admin.rpc("finish_career_anchor_report_email_delivery", {
    p_delivery_id: claim.delivery_id,
    p_attempt_id: claim.attempt_id,
    p_outcome: input.outcome,
    p_provider_message_id: input.messageId ?? null,
    p_error_code: input.errorCode ?? null,
    p_retry_after_seconds: input.retryAfterSeconds ?? null,
  });

  if (error || data !== true) {
    logEvent("error", "diagnostics.report_email.finalize_failed", {
      outcome: input.outcome,
      attemptNumber: claim.attempt_number,
      reason: error?.code ?? "not_finalized",
    });
    return false;
  }

  return true;
}

async function scheduleRetry(
  admin: ReturnType<typeof createAdminClient>,
  claim: z.infer<typeof deliveryClaimSchema>,
  errorCode: string,
) {
  await finishDelivery(admin, claim, {
    outcome: "failed",
    errorCode,
    retryAfterSeconds: retryDelaySeconds(claim.attempt_number),
  });
}

async function processClaim(
  admin: ReturnType<typeof createAdminClient>,
  claim: z.infer<typeof deliveryClaimSchema>,
): Promise<"sent" | "retry" | "permanent_failure"> {
  const { data: diagnostic, error: diagnosticError } = await admin
    .from("user_diagnostics")
    .select("status, raw_answers, dominant_result, ai_feedback")
    .eq("id", claim.diagnostic_id)
    .eq("user_id", claim.user_id)
    .eq("diagnostic_type", "career_anchor")
    .maybeSingle();

  if (diagnosticError) {
    await scheduleRetry(admin, claim, "report_lookup_failed");
    return "retry";
  }

  const report = storedReportSchema.safeParse(diagnostic);
  if (!report.success) {
    await finishDelivery(admin, claim, {
      outcome: "permanent_failure",
      errorCode: "report_data_invalid",
    });
    return "permanent_failure";
  }

  const { data: authData, error: authError } = await admin.auth.admin.getUserById(claim.user_id);
  if (authError) {
    await scheduleRetry(admin, claim, "recipient_lookup_failed");
    return "retry";
  }

  const recipient = authData.user?.email;
  if (!recipient) {
    await finishDelivery(admin, claim, {
      outcome: "permanent_failure",
      errorCode: "recipient_unavailable",
    });
    return "permanent_failure";
  }

  try {
    const ranking = calculateCareerAnchorRanking(report.data.raw_answers, claim.locale);
    const delivery = await sendCareerAnchorReportEmail({
      recipient,
      deliveryId: claim.delivery_id,
      locale: claim.locale,
      dominantAnchor: report.data.dominant_result.name,
      ranking: ranking.map(({ rank, name }) => ({ rank, name })),
      title: report.data.ai_feedback.title,
      summary: report.data.ai_feedback.summary,
      frictionAreas: report.data.ai_feedback.frictionAreas,
      idealEcosystem: report.data.ai_feedback.idealEcosystem,
      strategicQuestion: report.data.ai_feedback.strategicQuestion,
      reportUrl: localizedReportUrl(claim.locale),
    });
    const finalized = await finishDelivery(admin, claim, {
      outcome: "sent",
      messageId: delivery.messageId,
    });
    return finalized ? "sent" : "retry";
  } catch (error) {
    if (error instanceof CareerAnchorReportEmailRecipientError) {
      await finishDelivery(admin, claim, {
        outcome: "permanent_failure",
        errorCode: error.code,
      });
      return "permanent_failure";
    }

    const errorCode =
      error instanceof CareerAnchorReportEmailConfigurationError
        ? error.code
        : error instanceof CareerAnchorReportEmailDeliveryError
          ? error.code
          : "smtp_transport";
    await scheduleRetry(admin, claim, errorCode);
    return "retry";
  }
}

export async function processCareerAnchorReportEmails(options: {
  diagnosticId?: string;
  maxDeliveries?: number;
} = {}): Promise<CareerAnchorReportDeliverySummary> {
  const maxDeliveries = Math.max(1, Math.min(options.maxDeliveries ?? 1, 25));
  const summary: CareerAnchorReportDeliverySummary = {
    claimed: 0,
    sent: 0,
    retryScheduled: 0,
    permanentFailures: 0,
    unavailable: false,
  };

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    logEvent("error", "diagnostics.report_email.worker_unavailable", {
      reason: "supabase_admin_configuration",
    });
    return { ...summary, unavailable: true };
  }

  for (let index = 0; index < maxDeliveries; index += 1) {
    const { data, error } = await admin.rpc("claim_career_anchor_report_email_delivery", {
      p_diagnostic_id: options.diagnosticId ?? null,
    });

    if (error) {
      logEvent("error", "diagnostics.report_email.claim_failed", {
        reason: error.code ?? "database_error",
      });
      return { ...summary, unavailable: true };
    }

    const firstClaim = normalizeRpcRows(data)[0];
    if (!firstClaim) break;
    const claim = deliveryClaimSchema.safeParse(firstClaim);
    if (!claim.success) {
      logEvent("error", "diagnostics.report_email.claim_invalid", {
        reason: "invalid_database_payload",
      });
      return { ...summary, unavailable: true };
    }

    summary.claimed += 1;
    const outcome = await processClaim(admin, claim.data);
    if (outcome === "sent") summary.sent += 1;
    else if (outcome === "retry") summary.retryScheduled += 1;
    else summary.permanentFailures += 1;
  }

  logEvent("info", "diagnostics.report_email.worker_completed", summary);
  return summary;
}
