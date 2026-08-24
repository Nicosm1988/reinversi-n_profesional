import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260824064027_career_anchor_internal_result_emails.sql",
  ),
  "utf8",
);

const originalOutboxMigration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260823032739_career_anchor_report_email_outbox.sql",
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

describe("Career Anchor internal result email migration", () => {
  it("adds exactly one durable email kind for each required Senda recipient", () => {
    expect(migration).toContain("'career_anchor_internal_hola_v1'");
    expect(migration).toContain("'career_anchor_internal_tanisardella_v1'");
    expect(migration).toContain("'hola@universosenda.com'");
    expect(migration).toContain("'tanisardella@gmail.com'");

    const wrapper = sqlFunction("finalize_career_anchor_diagnostic_with_result_email");
    expect(wrapper).toMatch(
      /VALUES\s*\(\s*finalized_id,\s*p_user_id,\s*'career_anchor_internal_hola_v1',\s*p_locale\s*\),\s*\(\s*finalized_id,\s*p_user_id,\s*'career_anchor_internal_tanisardella_v1',\s*p_locale\s*\)/,
    );
    expect(wrapper).not.toContain("career_anchor_completed_v1");
  });

  it("does not enqueue historical completed diagnostics", () => {
    expect(migration).not.toContain(
      "CREATE OR REPLACE FUNCTION public.backfill_career_anchor_internal_result",
    );
    expect(migration).not.toContain("FROM public.user_diagnostics");
    expect(migration).not.toMatch(
      /INSERT INTO public\.diagnostic_report_email_deliveries[\s\S]*?SELECT[\s\S]*?completed_at/i,
    );
  });

  it("requires express versioned consent in a service-role-only wrapper", () => {
    const wrapper = sqlFunction("finalize_career_anchor_diagnostic_with_result_email");

    expect(wrapper).toContain("p_result_email_consent IS DISTINCT FROM TRUE");
    expect(wrapper).toContain("'career-anchor-team-result-email-v1'");
    expect(wrapper).toContain("'senda_team_result_review'");
    expect(wrapper).toContain("'account_email'");
    expect(wrapper).toContain("'career_stage'");
    expect(wrapper).toContain("'eight_anchor_ranking'");
    expect(wrapper).toContain("'scores'");
    expect(wrapper).toContain("'deterministic_guidance'");
    expect(wrapper).toContain("'excludes', JSONB_BUILD_ARRAY('raw_answers')");
    expect(wrapper).toContain("SECURITY INVOKER");
    expect(wrapper).toContain("SET search_path = ''");
    expect(migration).not.toContain("SECURITY DEFINER");

    const normalized = migration.replace(/\s+/g, " ");
    const signature =
      "public.finalize_career_anchor_diagnostic_with_result_email( UUID, JSONB, JSONB, JSONB, JSONB, TEXT, TEXT, TEXT, TEXT, BOOLEAN )";
    expect(normalized).toContain(`REVOKE ALL ON FUNCTION ${signature} FROM PUBLIC, anon, authenticated`);
    expect(normalized).toContain(`GRANT EXECUTE ON FUNCTION ${signature} TO service_role`);
  });

  it("validates the complete frozen result and atomically finalizes, audits consent, and enqueues twice", () => {
    const wrapper = sqlFunction("finalize_career_anchor_diagnostic_with_result_email");

    expect(wrapper).toContain("JSONB_ARRAY_LENGTH(p_score_result) <> 8");
    expect(wrapper).toContain("JSONB_OBJECT_KEYS(scored.anchor)");
    expect(wrapper).toContain("scored.anchor->'name'");
    expect(wrapper).toContain("(scored.anchor->>'score')::NUMERIC < 0");
    expect(wrapper).toContain("TRUNC((scored.anchor->>'score')::NUMERIC)");
    expect(wrapper).toContain("(scored.anchor->>'mean')::NUMERIC < 0");
    expect(wrapper).toContain("COUNT(DISTINCT scored.anchor->>'id')");
    expect(wrapper).toContain("COUNT(DISTINCT scored.anchor->>'rank')");
    expect(wrapper).toContain("public.is_valid_career_anchor_interpretation(p_result_base)");
    expect(wrapper).toContain("p_result_base->>'mode' IS DISTINCT FROM 'fallback'");
    expect(wrapper).toContain("public.finalize_career_anchor_diagnostic(");
    expect(wrapper).toContain("UPDATE public.user_diagnostics AS diagnostic");
    expect(wrapper).toContain("INSERT INTO public.diagnostic_report_email_deliveries");
    expect(wrapper).toContain("ON CONFLICT (diagnostic_id, email_kind) DO NOTHING");

    const finalizeAt = wrapper.indexOf("finalized_id := public.finalize_career_anchor_diagnostic(");
    const consentAt = wrapper.indexOf("UPDATE public.user_diagnostics AS diagnostic");
    const enqueueAt = wrapper.indexOf("INSERT INTO public.diagnostic_report_email_deliveries");
    expect(finalizeAt).toBeGreaterThan(-1);
    expect(finalizeAt).toBeLessThan(consentAt);
    expect(consentAt).toBeLessThan(enqueueAt);
    expect(originalOutboxMigration).toContain("UNIQUE (diagnostic_id, email_kind)");
  });

  it("claims only internal jobs with row locking, stale-lease recovery, and service-role access", () => {
    const claim = sqlFunction("claim_career_anchor_internal_result_email_delivery");

    expect(claim).toContain("'career_anchor_internal_hola_v1'");
    expect(claim).toContain("'career_anchor_internal_tanisardella_v1'");
    expect(claim).not.toContain("'career_anchor_completed_v1'");
    expect(claim).toContain("FOR UPDATE SKIP LOCKED");
    expect(claim).toContain("INTERVAL '15 minutes'");
    expect(claim).toContain("error_code = 'lease_expired'");
    expect(claim).toContain("INSERT INTO public.diagnostic_report_email_attempts");
    expect(claim).toContain("SECURITY INVOKER");

    expect(migration).toContain(
      "REVOKE ALL ON FUNCTION public.claim_career_anchor_internal_result_email_delivery(UUID)\nFROM PUBLIC, anon, authenticated",
    );
    expect(migration).toContain(
      "GRANT EXECUTE ON FUNCTION public.claim_career_anchor_internal_result_email_delivery(UUID)\nTO service_role",
    );
  });
});
