-- Queue two consented, server-derived Career Anchor result emails for the
-- Senda team without changing the participant's existing private notification.
-- Existing completions are intentionally not backfilled.

ALTER TABLE public.diagnostic_report_email_deliveries
  DROP CONSTRAINT IF EXISTS diagnostic_report_email_delivery_kind_check;

ALTER TABLE public.diagnostic_report_email_deliveries
  ADD CONSTRAINT diagnostic_report_email_delivery_kind_check
  CHECK (email_kind IN (
    'career_anchor_completed_v1',
    'career_anchor_internal_hola_v1',
    'career_anchor_internal_tanisardella_v1'
  ));

CREATE INDEX diagnostic_report_internal_email_delivery_retry_claim_idx
ON public.diagnostic_report_email_deliveries (next_attempt_at, created_at)
WHERE email_kind IN (
    'career_anchor_internal_hola_v1',
    'career_anchor_internal_tanisardella_v1'
  )
  AND status IN ('pending', 'failed');

CREATE INDEX diagnostic_report_internal_email_delivery_stale_lease_idx
ON public.diagnostic_report_email_deliveries (locked_at)
WHERE email_kind IN (
    'career_anchor_internal_hola_v1',
    'career_anchor_internal_tanisardella_v1'
  )
  AND status = 'processing';

-- This additive wrapper preserves the currently deployed finalization RPC.
-- The new application calls this function only after an authenticated person
-- has expressly accepted the versioned disclosure. Completion, consent audit,
-- and all three outbox rows share one Postgres transaction.
CREATE OR REPLACE FUNCTION public.finalize_career_anchor_diagnostic_with_result_email(
  p_user_id UUID,
  p_raw_answers JSONB,
  p_dominant_result JSONB,
  p_score_result JSONB,
  p_result_base JSONB,
  p_locale TEXT,
  p_career_stage TEXT,
  p_instrument_version TEXT,
  p_algorithm_version TEXT,
  p_result_email_consent BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  finalized_id UUID;
BEGIN
  IF p_result_email_consent IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'Express result email consent is required';
  END IF;

  IF JSONB_TYPEOF(p_score_result) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'A complete eight-anchor score result is required';
  END IF;

  IF JSONB_ARRAY_LENGTH(p_score_result) <> 8 THEN
    RAISE EXCEPTION 'A complete eight-anchor score result is required';
  END IF;

  IF EXISTS (
      SELECT 1
      FROM JSONB_ARRAY_ELEMENTS(p_score_result) AS scored(anchor)
      WHERE CASE
        WHEN JSONB_TYPEOF(scored.anchor) IS DISTINCT FROM 'object' THEN TRUE
        ELSE
          (SELECT COUNT(*) FROM JSONB_OBJECT_KEYS(scored.anchor)) <> 5
          OR JSONB_TYPEOF(scored.anchor->'id') IS DISTINCT FROM 'string'
          OR scored.anchor->>'id' NOT IN (
            'technical',
            'management',
            'autonomy',
            'security',
            'entrepreneurial',
            'service',
            'challenge',
            'lifestyle'
          )
          OR JSONB_TYPEOF(scored.anchor->'name') IS DISTINCT FROM 'string'
          OR CHAR_LENGTH(scored.anchor->>'name') < 1
          OR CASE
            WHEN JSONB_TYPEOF(scored.anchor->'score') IS DISTINCT FROM 'number' THEN TRUE
            ELSE (scored.anchor->>'score')::NUMERIC < 0
              OR (scored.anchor->>'score')::NUMERIC
                <> TRUNC((scored.anchor->>'score')::NUMERIC)
          END
          OR CASE
            WHEN JSONB_TYPEOF(scored.anchor->'mean') IS DISTINCT FROM 'number' THEN TRUE
            ELSE (scored.anchor->>'mean')::NUMERIC < 0
          END
          OR CASE
            WHEN JSONB_TYPEOF(scored.anchor->'rank') IS DISTINCT FROM 'number' THEN TRUE
            ELSE (scored.anchor->>'rank')::NUMERIC < 1
              OR (scored.anchor->>'rank')::NUMERIC > 8
              OR (scored.anchor->>'rank')::NUMERIC
                <> TRUNC((scored.anchor->>'rank')::NUMERIC)
          END
      END
    )
    OR (
      SELECT COUNT(DISTINCT scored.anchor->>'id')
      FROM JSONB_ARRAY_ELEMENTS(p_score_result) AS scored(anchor)
    ) <> 8
    OR (
      SELECT COUNT(DISTINCT scored.anchor->>'rank')
      FROM JSONB_ARRAY_ELEMENTS(p_score_result) AS scored(anchor)
    ) <> 8
  THEN
    RAISE EXCEPTION 'A complete eight-anchor score result is required';
  END IF;

  IF NOT public.is_valid_career_anchor_interpretation(p_result_base)
    OR p_result_base->>'mode' IS DISTINCT FROM 'fallback'
  THEN
    RAISE EXCEPTION 'A complete deterministic interpretation is required';
  END IF;

  finalized_id := public.finalize_career_anchor_diagnostic(
    p_user_id,
    p_raw_answers,
    p_dominant_result,
    p_score_result,
    p_result_base,
    p_locale,
    p_career_stage,
    p_instrument_version,
    p_algorithm_version
  );

  IF finalized_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.user_diagnostics AS diagnostic
  SET user_data = COALESCE(diagnostic.user_data, '{}'::JSONB) || JSONB_BUILD_OBJECT(
    'resultEmailConsent',
    JSONB_BUILD_OBJECT(
      'granted', TRUE,
      'version', 'career-anchor-team-result-email-v1',
      'recordedAt', TO_JSONB(CURRENT_TIMESTAMP),
      'purpose', 'senda_team_result_review',
      'recipients', JSONB_BUILD_ARRAY(
        'hola@universosenda.com',
        'tanisardella@gmail.com'
      ),
      'includes', JSONB_BUILD_ARRAY(
        'account_email',
        'career_stage',
        'eight_anchor_ranking',
        'scores',
        'deterministic_guidance'
      ),
      'excludes', JSONB_BUILD_ARRAY('raw_answers')
    )
  )
  WHERE diagnostic.id = finalized_id
    AND diagnostic.user_id = p_user_id
    AND diagnostic.diagnostic_type = 'career_anchor'
    AND diagnostic.status = 'completed';

  INSERT INTO public.diagnostic_report_email_deliveries (
    diagnostic_id,
    user_id,
    email_kind,
    locale
  )
  VALUES
    (
      finalized_id,
      p_user_id,
      'career_anchor_internal_hola_v1',
      p_locale
    ),
    (
      finalized_id,
      p_user_id,
      'career_anchor_internal_tanisardella_v1',
      p_locale
    )
  ON CONFLICT (diagnostic_id, email_kind) DO NOTHING;

  RETURN finalized_id;
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_career_anchor_diagnostic_with_result_email(
  UUID, JSONB, JSONB, JSONB, JSONB, TEXT, TEXT, TEXT, TEXT, BOOLEAN
)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_career_anchor_diagnostic_with_result_email(
  UUID, JSONB, JSONB, JSONB, JSONB, TEXT, TEXT, TEXT, TEXT, BOOLEAN
)
TO service_role;

-- Internal results use their own claim RPC so the existing participant worker
-- remains compatible during a database-first rollout.
CREATE OR REPLACE FUNCTION public.claim_career_anchor_internal_result_email_delivery(
  p_diagnostic_id UUID DEFAULT NULL
)
RETURNS TABLE (
  delivery_id UUID,
  diagnostic_id UUID,
  user_id UUID,
  email_kind TEXT,
  locale TEXT,
  attempt_id UUID,
  attempt_number INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  claimed_delivery public.diagnostic_report_email_deliveries%ROWTYPE;
  claimed_attempt_id UUID;
  claimed_attempt_number INTEGER;
BEGIN
  SELECT delivery.*
  INTO claimed_delivery
  FROM public.diagnostic_report_email_deliveries AS delivery
  WHERE delivery.email_kind IN (
      'career_anchor_internal_hola_v1',
      'career_anchor_internal_tanisardella_v1'
    )
    AND (p_diagnostic_id IS NULL OR delivery.diagnostic_id = p_diagnostic_id)
    AND (
      (
        delivery.status IN ('pending', 'failed')
        AND COALESCE(delivery.next_attempt_at, TIMEZONE('utc', NOW())) <= TIMEZONE('utc', NOW())
      )
      OR (
        delivery.status = 'processing'
        AND delivery.locked_at < TIMEZONE('utc', NOW()) - INTERVAL '15 minutes'
      )
    )
  ORDER BY delivery.next_attempt_at NULLS FIRST, delivery.created_at, delivery.email_kind
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  UPDATE public.diagnostic_report_email_attempts AS attempt
  SET
    outcome = 'failed',
    error_code = 'lease_expired',
    finished_at = TIMEZONE('utc', NOW())
  WHERE attempt.delivery_id = claimed_delivery.id
    AND attempt.outcome = 'processing';

  claimed_attempt_number := claimed_delivery.attempt_count + 1;
  claimed_attempt_id := gen_random_uuid();

  UPDATE public.diagnostic_report_email_deliveries AS delivery
  SET
    status = 'processing',
    attempt_count = claimed_attempt_number,
    locked_at = TIMEZONE('utc', NOW()),
    updated_at = TIMEZONE('utc', NOW())
  WHERE delivery.id = claimed_delivery.id;

  INSERT INTO public.diagnostic_report_email_attempts (
    id,
    delivery_id,
    attempt_number,
    outcome
  )
  VALUES (
    claimed_attempt_id,
    claimed_delivery.id,
    claimed_attempt_number,
    'processing'
  );

  RETURN QUERY
  SELECT
    claimed_delivery.id,
    claimed_delivery.diagnostic_id,
    claimed_delivery.user_id,
    claimed_delivery.email_kind,
    claimed_delivery.locale,
    claimed_attempt_id,
    claimed_attempt_number;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_career_anchor_internal_result_email_delivery(UUID)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_career_anchor_internal_result_email_delivery(UUID)
TO service_role;
