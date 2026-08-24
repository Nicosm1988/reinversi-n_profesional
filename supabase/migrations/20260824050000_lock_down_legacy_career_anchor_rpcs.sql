-- Apply only after the persistent Career Anchors application code is live.
-- These legacy functions accept caller-supplied calculated fields and must not
-- remain browser-callable once all traffic uses the service-role-only RPCs.

REVOKE ALL ON FUNCTION public.claim_free_career_anchor_diagnostic(JSONB, JSONB, JSONB)
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.complete_free_career_anchor_diagnostic(UUID, JSONB)
FROM PUBLIC, anon, authenticated;

DROP FUNCTION public.claim_free_career_anchor_diagnostic(JSONB, JSONB, JSONB);
DROP FUNCTION public.complete_free_career_anchor_diagnostic(UUID, JSONB);
