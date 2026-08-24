import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260824040817_career_anchor_persistent_journey.sql",
  ),
  "utf8",
);

const legacyRpcLockdown = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260824050000_lock_down_legacy_career_anchor_rpcs.sql",
  ),
  "utf8",
);

function sqlFunction(name: string) {
  const match = migration.match(
    new RegExp(`CREATE OR REPLACE FUNCTION public\\.${name}\\([\\s\\S]*?\\n\\$\\$;`),
  );
  expect(match, `missing SQL function ${name}`).not.toBeNull();
  return match?.[0] ?? "";
}

describe("Career Anchor persistent journey migration", () => {
  it("adds bounded progress, versioned scoring, and separate base/AI result storage", () => {
    for (const column of [
      "started_at TIMESTAMPTZ",
      "completed_at TIMESTAMPTZ",
      "current_statement INTEGER NOT NULL DEFAULT 1",
      "progress_revision BIGINT NOT NULL DEFAULT 0",
      "instrument_version TEXT",
      "algorithm_version TEXT",
      "score_result JSONB",
      "result_base JSONB",
      "result_ai JSONB",
      "interpretation_started_at TIMESTAMPTZ",
      "interpretation_claim_token UUID",
    ]) {
      expect(migration).toContain(column);
    }

    expect(migration).toContain("CHECK (status IN ('in_progress', 'processing', 'completed'))");
    expect(migration).toContain("CHECK (current_statement BETWEEN 1 AND 40)");
    expect(migration).toContain("CHECK (progress_revision >= 0)");
    expect(migration).toContain(
      "instrument_version = COALESCE(instrument_version, 'schein-career-anchors-40-v1')",
    );
    expect(migration).toContain(
      "algorithm_version = COALESCE(algorithm_version, 'senda-career-anchor-score-v1')",
    );
  });

  it("makes the browser role read-only and keeps rows scoped to auth.uid()", () => {
    expect(migration).toContain('DROP POLICY IF EXISTS "Users can insert their own diagnostics"');
    expect(migration).toContain("FOR SELECT\nTO authenticated");
    expect(migration).toContain("USING ((SELECT auth.uid()) = user_id)");
    expect(migration).toContain(
      "REVOKE ALL ON TABLE public.user_diagnostics FROM PUBLIC, anon, authenticated",
    );
    expect(migration).toContain("GRANT SELECT ON TABLE public.user_diagnostics TO authenticated");
    expect(migration).toContain(
      "GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_diagnostics TO service_role",
    );
    expect(migration).not.toMatch(
      /GRANT\s+(?:INSERT|UPDATE|DELETE|ALL)[^;]*user_diagnostics[^;]*TO authenticated/i,
    );
  });

  it("revokes legacy client mutation RPCs and exposes every new RPC only to service_role", () => {
    expect(legacyRpcLockdown).toContain(
      "REVOKE ALL ON FUNCTION public.claim_free_career_anchor_diagnostic(JSONB, JSONB, JSONB)\nFROM PUBLIC, anon, authenticated",
    );
    expect(legacyRpcLockdown).toContain(
      "REVOKE ALL ON FUNCTION public.complete_free_career_anchor_diagnostic(UUID, JSONB)\nFROM PUBLIC, anon, authenticated",
    );
    expect(legacyRpcLockdown).toContain(
      "DROP FUNCTION public.claim_free_career_anchor_diagnostic(JSONB, JSONB, JSONB)",
    );
    expect(legacyRpcLockdown).toContain(
      "DROP FUNCTION public.complete_free_career_anchor_diagnostic(UUID, JSONB)",
    );

    const signatures = [
      "public.save_career_anchor_progress(UUID, JSONB, JSONB, INTEGER, BIGINT, TEXT, TEXT)",
      "public.finalize_career_anchor_diagnostic(UUID, JSONB, JSONB, JSONB, JSONB, TEXT, TEXT, TEXT, TEXT)",
      "public.claim_career_anchor_interpretation(UUID)",
      "public.is_valid_career_anchor_interpretation(JSONB)",
      "public.save_career_anchor_interpretation(UUID, UUID, JSONB)",
    ];

    for (const signature of signatures) {
      expect(migration).toContain(
        `REVOKE ALL ON FUNCTION ${signature}\nFROM PUBLIC, anon, authenticated`,
      );
      expect(migration).toContain(`GRANT EXECUTE ON FUNCTION ${signature}\nTO service_role`);
    }
  });

  it("uses invoker security and a fixed search path for all new functions", () => {
    expect(migration.match(/SECURITY INVOKER/g)).toHaveLength(5);
    expect(migration.match(/SET search_path = ''/g)).toHaveLength(5);
    expect(migration).not.toContain("SECURITY DEFINER");
  });

  it("validates the complete strict interpretation contract inside PostgreSQL", () => {
    const validator = sqlFunction("is_valid_career_anchor_interpretation");

    expect(validator).toContain("JSONB_TYPEOF(p_interpretation) IS DISTINCT FROM 'object'");
    expect(validator).toContain("COUNT(*) FROM JSONB_OBJECT_KEYS(p_interpretation)");
    expect(validator).toContain("<> 8");
    expect(validator).toContain("p_interpretation->>'mode' NOT IN ('ai', 'fallback')");
    expect(validator).toContain("reflectionQuestions') NOT BETWEEN 3 AND 5");
    expect(validator).toContain("relevantServices') > 2");
    expect(validator).toContain("nextSteps') NOT BETWEEN 3 AND 5");
    expect(validator).toContain("COUNT(*) FROM JSONB_OBJECT_KEYS(service.value)");
    expect(validator).toContain("/transiciones-laborales/elegir-formacion");
    expect(validator).toContain(
      "CHAR_LENGTH(REGEXP_REPLACE(service.value->>'reason', '^[[:space:]]+|[[:space:]]+$', '', 'g')) NOT BETWEEN 1 AND 600",
    );
  });

  it("validates partial progress and accepts only a newer revision of an in-progress row", () => {
    const progress = sqlFunction("save_career_anchor_progress");

    expect(progress).toContain("p_current_statement NOT BETWEEN 1 AND 40");
    expect(progress).toContain("p_client_revision < 1");
    expect(progress).toContain("(SELECT COUNT(*) FROM JSONB_OBJECT_KEYS(p_answers)) > 40");
    expect(progress).toContain("answer.statement_id !~ '^([1-9]|[1-3][0-9]|40)$'");
    expect(progress).toContain("answer.score::TEXT !~ '^[1-6]$'");
    expect(progress).toContain("JSONB_ARRAY_LENGTH(p_bonus) > 3");
    expect(progress).toContain("COUNT(DISTINCT selected.statement_id::TEXT)");
    expect(progress).toContain("WHERE public.user_diagnostics.status = 'in_progress'");
    expect(progress).toContain(
      "p_client_revision > public.user_diagnostics.progress_revision",
    );
    expect(progress).toContain("'accepted', accepted");
  });

  it("finalizes once with server versions and atomically queues one report", () => {
    const finalize = sqlFunction("finalize_career_anchor_diagnostic");

    expect(finalize).toContain("(SELECT COUNT(*) FROM JSONB_OBJECT_KEYS(answers)) <> 40");
    expect(finalize).toContain("JSONB_ARRAY_LENGTH(bonus) <> 3");
    expect(finalize).toContain("COUNT(DISTINCT selected.statement_id::TEXT)");
    expect(finalize).toContain(
      "p_instrument_version IS DISTINCT FROM 'schein-career-anchors-40-v1'",
    );
    expect(finalize).toContain(
      "p_algorithm_version IS DISTINCT FROM 'senda-career-anchor-score-v1'",
    );
    expect(finalize).toContain("public.user_diagnostics.status = 'in_progress'");
    expect(finalize).toContain("public.user_diagnostics.status = 'processing'");
    expect(finalize).toContain("INTERVAL '15 minutes'");
    expect(finalize).not.toContain("public.user_diagnostics.status = 'completed'");
    expect(finalize).toContain("INSERT INTO public.diagnostic_report_email_deliveries");
    expect(finalize).toContain("ON CONFLICT (diagnostic_id, email_kind) DO NOTHING");
  });

  it("claims one short interpretation lease and returns ready canonical data without reclaiming", () => {
    const claim = sqlFunction("claim_career_anchor_interpretation");

    expect(claim).toContain("stored.status = 'completed'");
    expect(claim).toContain("FOR UPDATE");
    expect(claim).toContain("RETURN JSONB_BUILD_OBJECT('status', 'missing')");
    expect(claim).toContain("RETURN JSONB_BUILD_OBJECT('status', 'ready', 'interpretation', canonical)");
    expect(claim).toContain("diagnostic.interpretation_started_at IS NOT NULL");
    expect(claim).toContain("diagnostic.interpretation_claim_token IS NOT NULL");
    expect(claim).toContain("INTERVAL '2 minutes'");
    expect(claim).toContain("RETURN JSONB_BUILD_OBJECT('status', 'processing')");
    expect(claim).toContain("interpretation_started_at = TIMEZONE('utc', NOW())");
    expect(claim).toContain("interpretation_claim_token = claim_token");
    expect(claim).toContain(
      "RETURN JSONB_BUILD_OBJECT('status', 'claimed', 'claimToken', claim_token)",
    );
  });

  it("fences stale writers, validates the payload, and clears the generation lease", () => {
    const interpretation = sqlFunction("save_career_anchor_interpretation");

    expect(interpretation).toContain("RETURNS JSONB");
    expect(interpretation).toContain("stored.status = 'completed'");
    expect(interpretation).toContain("FOR UPDATE");
    expect(interpretation).toContain("p_claim_token IS NULL");
    expect(interpretation).toContain(
      "NOT public.is_valid_career_anchor_interpretation(p_interpretation)",
    );
    expect(interpretation).toContain(
      "diagnostic.interpretation_claim_token IS DISTINCT FROM p_claim_token",
    );
    expect(interpretation).toContain(
      "diagnostic.interpretation_started_at < TIMEZONE('utc', NOW()) - INTERVAL '2 minutes'",
    );
    expect(interpretation).toContain("ai_feedback = canonical");
    expect(interpretation).toContain("interpretation_started_at = NULL");
    expect(interpretation).toContain("interpretation_claim_token = NULL");
    expect(interpretation).toContain("RETURN canonical");
  });
});
