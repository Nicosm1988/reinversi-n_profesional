import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260825025902_decouple_internal_result_email_notice.sql",
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

function normalizeSql(sql: string) {
  return sql.replace(/\s+/g, " ").trim();
}

describe("Career Anchor internal result email notice decoupling migration", () => {
  it("adds a service-role-only canonical finalizer without a consent argument", () => {
    const finalizer = sqlFunction(
      "finalize_career_anchor_diagnostic_with_internal_result_emails",
    );
    const normalizedMigration = normalizeSql(migration);
    const signature =
      "public.finalize_career_anchor_diagnostic_with_internal_result_emails( UUID, JSONB, JSONB, JSONB, JSONB, TEXT, TEXT, TEXT, TEXT )";

    expect(finalizer).not.toContain("p_result_email_consent");
    expect(finalizer).toContain("SECURITY INVOKER");
    expect(finalizer).toContain("SET search_path = ''");
    expect(migration).not.toContain("SECURITY DEFINER");
    expect(normalizedMigration).toContain(
      `REVOKE ALL ON FUNCTION ${signature} FROM PUBLIC, anon, authenticated`,
    );
    expect(normalizedMigration).toContain(
      `GRANT EXECUTE ON FUNCTION ${signature} TO service_role`,
    );
  });

  it("retains frozen-result validation and atomically queues both internal deliveries", () => {
    const finalizer = sqlFunction(
      "finalize_career_anchor_diagnostic_with_internal_result_emails",
    );

    expect(finalizer).toContain("JSONB_ARRAY_LENGTH(p_score_result) <> 8");
    expect(finalizer).toContain("JSONB_OBJECT_KEYS(scored.anchor)");
    expect(finalizer).toContain("COUNT(DISTINCT scored.anchor->>'id')");
    expect(finalizer).toContain("COUNT(DISTINCT scored.anchor->>'rank')");
    expect(finalizer).toContain(
      "public.is_valid_career_anchor_interpretation(p_result_base)",
    );
    expect(finalizer).toContain(
      "p_result_base->>'mode' IS DISTINCT FROM 'fallback'",
    );
    expect(finalizer).toContain("public.finalize_career_anchor_diagnostic(");
    expect(finalizer).toContain("INSERT INTO public.diagnostic_report_email_deliveries");
    expect(finalizer).toContain("'career_anchor_internal_hola_v1'");
    expect(finalizer).toContain("'career_anchor_internal_tanisardella_v1'");
    expect(finalizer).toContain("ON CONFLICT (diagnostic_id, email_kind) DO NOTHING");
    expect(finalizer).not.toContain("UPDATE public.user_diagnostics");
    expect(finalizer).not.toContain("resultEmailConsent");

    const finalizeAt = finalizer.indexOf(
      "finalized_id := public.finalize_career_anchor_diagnostic(",
    );
    const enqueueAt = finalizer.indexOf(
      "INSERT INTO public.diagnostic_report_email_deliveries",
    );
    expect(finalizeAt).toBeGreaterThan(-1);
    expect(finalizeAt).toBeLessThan(enqueueAt);
  });

  it("keeps the old boolean signature only as an ignored compatibility shim", () => {
    const compatibility = sqlFunction(
      "finalize_career_anchor_diagnostic_with_result_email",
    );
    const normalizedMigration = normalizeSql(migration);
    const signature =
      "public.finalize_career_anchor_diagnostic_with_result_email( UUID, JSONB, JSONB, JSONB, JSONB, TEXT, TEXT, TEXT, TEXT, BOOLEAN )";

    expect(compatibility.match(/p_result_email_consent/g)).toHaveLength(2);
    expect(compatibility).toContain("PERFORM p_result_email_consent");
    expect(compatibility).toContain(
      "RETURN public.finalize_career_anchor_diagnostic_with_internal_result_emails(",
    );
    expect(compatibility).not.toContain(
      "p_result_email_consent IS DISTINCT FROM TRUE",
    );
    expect(compatibility).not.toContain("UPDATE public.user_diagnostics");
    expect(compatibility).not.toContain("resultEmailConsent");
    expect(normalizedMigration).toContain(
      `REVOKE ALL ON FUNCTION ${signature} FROM PUBLIC, anon, authenticated`,
    );
    expect(normalizedMigration).toContain(
      `GRANT EXECUTE ON FUNCTION ${signature} TO service_role`,
    );
  });
});
