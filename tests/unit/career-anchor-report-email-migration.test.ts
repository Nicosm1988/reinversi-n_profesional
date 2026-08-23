import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260823032739_career_anchor_report_email_outbox.sql",
  ),
  "utf8",
);

describe("Career Anchor report email outbox migration", () => {
  it("makes completion and enqueueing atomic and idempotent", () => {
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.complete_free_career_anchor_diagnostic");
    expect(migration).toContain("UPDATE public.user_diagnostics");
    expect(migration).toContain("INSERT INTO public.diagnostic_report_email_deliveries");
    expect(migration).toContain("ON CONFLICT (diagnostic_id, email_kind) DO NOTHING");
    expect(migration).toContain("UNIQUE (diagnostic_id, email_kind)");
    expect(migration).toContain(
      "REVOKE ALL ON FUNCTION public.claim_free_career_anchor_diagnostic(JSONB, JSONB, JSONB)",
    );
  });

  it("locks claims, audits attempts, and keeps operational tables server-only", () => {
    expect(migration).toContain("FOR UPDATE SKIP LOCKED");
    expect(migration).toContain("diagnostic_report_email_attempts");
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
    expect(migration).toContain("FROM PUBLIC, anon, authenticated");
    expect(migration).toContain("SECURITY INVOKER");
    expect(migration).toContain("TO service_role");
  });

  it("provides a dry-run-capable, bounded historical backfill", () => {
    expect(migration).toContain("backfill_career_anchor_report_email_deliveries");
    expect(migration).toContain("p_dry_run BOOLEAN DEFAULT TRUE");
    expect(migration).toContain("p_limit INTEGER DEFAULT 100");
  });
});
