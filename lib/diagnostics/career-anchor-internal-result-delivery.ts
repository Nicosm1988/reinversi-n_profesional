import "next/dist/compiled/server-only";

import { z } from "zod";
import {
  CAREER_ANCHOR_RESULT_EMAIL_CONSENT_VERSION,
  careerAnchorInterpretationSchema,
  careerAnchorStoredScoreSchema,
  careerStageSchema,
} from "@/lib/diagnostics/career-anchor";
import {
  CareerAnchorReportEmailConfigurationError,
  CareerAnchorReportEmailDeliveryError,
  CareerAnchorReportEmailRecipientError,
  sendCareerAnchorInternalResultEmail,
} from "@/lib/diagnostics/career-anchor-report-mailer";
import { logEvent } from "@/lib/observability/logger";
import { createAdminClient } from "@/lib/supabase/admin";

const internalEmailKindSchema = z.enum([
  "career_anchor_internal_hola_v1",
  "career_anchor_internal_tanisardella_v1",
]);

const INTERNAL_RECIPIENTS: Record<z.infer<typeof internalEmailKindSchema>, string> = {
  career_anchor_internal_hola_v1: "hola@universosenda.com",
  career_anchor_internal_tanisardella_v1: "tanisardella@gmail.com",
};

const deliveryClaimSchema = z
  .object({
    delivery_id: z.uuid(),
    diagnostic_id: z.uuid(),
    user_id: z.uuid(),
    email_kind: internalEmailKindSchema,
    locale: z.enum(["es", "en"]),
    attempt_id: z.uuid(),
    attempt_number: z.number().int().positive(),
  })
  .strict();

const resultEmailConsentSchema = z
  .object({
    granted: z.literal(true),
    version: z.literal(CAREER_ANCHOR_RESULT_EMAIL_CONSENT_VERSION),
    recordedAt: z.iso.datetime({ offset: true }),
    purpose: z.literal("senda_team_result_review"),
    recipients: z.tuple([
      z.literal("hola@universosenda.com"),
      z.literal("tanisardella@gmail.com"),
    ]),
    includes: z.tuple([
      z.literal("account_email"),
      z.literal("career_stage"),
      z.literal("eight_anchor_ranking"),
      z.literal("scores"),
      z.literal("deterministic_guidance"),
    ]),
    excludes: z.tuple([z.literal("raw_answers")]),
  })
  .strict();

const storedReportSchema = z
  .object({
    status: z.literal("completed"),
    score_result: careerAnchorStoredScoreSchema,
    result_base: careerAnchorInterpretationSchema.refine(
      (interpretation) => interpretation.mode === "fallback",
      "The emailed interpretation must be the frozen deterministic result.",
    ),
    user_data: z
      .object({
        careerStage: careerStageSchema,
        resultEmailConsent: resultEmailConsentSchema,
      })
      .passthrough(),
  })
  .strict();

type DeliveryOutcome = "sent" | "failed" | "permanent_failure";

export type CareerAnchorInternalResultDeliverySummary = {
  claimed: number;
  sent: number;
  retryScheduled: number;
  permanentFailures: number;
  unavailable: boolean;
};

function retryDelaySeconds(attemptNumber: number) {
  return Math.min(7 * 24 * 60 * 60, 15 * 60 * 2 ** Math.min(attemptNumber - 1, 9));
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
    logEvent("error", "diagnostics.internal_result_email.finalize_failed", {
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
    .select("status, score_result, result_base, user_data")
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
    await scheduleRetry(admin, claim, "account_lookup_failed");
    return "retry";
  }

  const accountEmail = z.email().max(254).safeParse(authData.user?.email);
  if (!accountEmail.success) {
    await finishDelivery(admin, claim, {
      outcome: "permanent_failure",
      errorCode: "account_email_unavailable",
    });
    return "permanent_failure";
  }

  try {
    const delivery = await sendCareerAnchorInternalResultEmail({
      recipient: INTERNAL_RECIPIENTS[claim.email_kind],
      deliveryId: claim.delivery_id,
      locale: claim.locale,
      accountEmail: accountEmail.data,
      careerStage: report.data.user_data.careerStage,
      scoreResult: report.data.score_result,
      resultBase: report.data.result_base,
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

export async function processCareerAnchorInternalResultEmails(options: {
  diagnosticId?: string;
  maxDeliveries?: number;
} = {}): Promise<CareerAnchorInternalResultDeliverySummary> {
  const maxDeliveries = Math.max(1, Math.min(options.maxDeliveries ?? 1, 25));
  const summary: CareerAnchorInternalResultDeliverySummary = {
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
    logEvent("error", "diagnostics.internal_result_email.worker_unavailable", {
      reason: "supabase_admin_configuration",
    });
    return { ...summary, unavailable: true };
  }

  for (let index = 0; index < maxDeliveries; index += 1) {
    const { data, error } = await admin.rpc(
      "claim_career_anchor_internal_result_email_delivery",
      { p_diagnostic_id: options.diagnosticId ?? null },
    );

    if (error) {
      logEvent("error", "diagnostics.internal_result_email.claim_failed", {
        reason: error.code ?? "database_error",
      });
      return { ...summary, unavailable: true };
    }

    const firstClaim = normalizeRpcRows(data)[0];
    if (!firstClaim) break;
    const claim = deliveryClaimSchema.safeParse(firstClaim);
    if (!claim.success) {
      logEvent("error", "diagnostics.internal_result_email.claim_invalid", {
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

  logEvent("info", "diagnostics.internal_result_email.worker_completed", summary);
  return summary;
}
