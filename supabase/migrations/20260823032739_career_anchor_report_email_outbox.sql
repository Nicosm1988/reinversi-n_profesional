-- Durable, server-only outbox for Career Anchor completion emails.
-- The completion trigger and the diagnostic update share the same transaction,
-- so a successfully completed report cannot be lost between persistence and mail delivery.

CREATE UNIQUE INDEX IF NOT EXISTS user_diagnostics_id_user_id_unique_idx
ON public.user_diagnostics (id, user_id);

-- Older migrations revoked the implicit PUBLIC grant but could leave an
-- explicit anon grant behind. Keep the claim RPC callable only by signed-in
-- accounts; the function also enforces auth.uid() internally.
REVOKE ALL ON FUNCTION public.claim_free_career_anchor_diagnostic(JSONB, JSONB, JSONB)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_free_career_anchor_diagnostic(JSONB, JSONB, JSONB)
TO authenticated;

CREATE TABLE public.diagnostic_report_email_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_id UUID NOT NULL,
  user_id UUID NOT NULL,
  email_kind TEXT NOT NULL DEFAULT 'career_anchor_completed_v1',
  locale TEXT NOT NULL DEFAULT 'es',
  status TEXT NOT NULL DEFAULT 'pending',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  locked_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  provider_message_id TEXT,
  last_error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT diagnostic_report_email_delivery_diagnostic_owner_fk
    FOREIGN KEY (diagnostic_id, user_id)
    REFERENCES public.user_diagnostics (id, user_id)
    ON DELETE CASCADE,
  CONSTRAINT diagnostic_report_email_delivery_user_fk
    FOREIGN KEY (user_id)
    REFERENCES auth.users (id)
    ON DELETE CASCADE,
  CONSTRAINT diagnostic_report_email_delivery_kind_check
    CHECK (email_kind = 'career_anchor_completed_v1'),
  CONSTRAINT diagnostic_report_email_delivery_locale_check
    CHECK (locale IN ('es', 'en')),
  CONSTRAINT diagnostic_report_email_delivery_status_check
    CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'permanent_failure')),
  CONSTRAINT diagnostic_report_email_delivery_attempt_count_check
    CHECK (attempt_count >= 0),
  CONSTRAINT diagnostic_report_email_delivery_provider_message_id_check
    CHECK (provider_message_id IS NULL OR CHAR_LENGTH(provider_message_id) <= 500),
  CONSTRAINT diagnostic_report_email_delivery_last_error_code_check
    CHECK (last_error_code IS NULL OR last_error_code ~ '^[a-z0-9_]{1,80}$'),
  CONSTRAINT diagnostic_report_email_delivery_unique
    UNIQUE (diagnostic_id, email_kind)
);

CREATE INDEX diagnostic_report_email_delivery_retry_claim_idx
ON public.diagnostic_report_email_deliveries (next_attempt_at, created_at)
WHERE email_kind = 'career_anchor_completed_v1'
  AND status IN ('pending', 'failed');

CREATE INDEX diagnostic_report_email_delivery_stale_lease_idx
ON public.diagnostic_report_email_deliveries (locked_at)
WHERE email_kind = 'career_anchor_completed_v1'
  AND status = 'processing';

CREATE INDEX diagnostic_report_email_delivery_user_idx
ON public.diagnostic_report_email_deliveries (user_id);

CREATE TABLE public.diagnostic_report_email_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL
    REFERENCES public.diagnostic_report_email_deliveries (id)
    ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  outcome TEXT NOT NULL DEFAULT 'processing',
  error_code TEXT,
  provider_message_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  finished_at TIMESTAMPTZ,
  CONSTRAINT diagnostic_report_email_attempt_number_check
    CHECK (attempt_number > 0),
  CONSTRAINT diagnostic_report_email_attempt_outcome_check
    CHECK (outcome IN ('processing', 'sent', 'failed', 'permanent_failure')),
  CONSTRAINT diagnostic_report_email_attempt_error_code_check
    CHECK (error_code IS NULL OR error_code ~ '^[a-z0-9_]{1,80}$'),
  CONSTRAINT diagnostic_report_email_attempt_provider_message_id_check
    CHECK (provider_message_id IS NULL OR CHAR_LENGTH(provider_message_id) <= 500),
  CONSTRAINT diagnostic_report_email_attempt_unique
    UNIQUE (delivery_id, attempt_number)
);

ALTER TABLE public.diagnostic_report_email_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_report_email_attempts ENABLE ROW LEVEL SECURITY;

-- These are operational tables. Browser clients get no grants and no policies.
REVOKE ALL ON TABLE public.diagnostic_report_email_deliveries FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.diagnostic_report_email_attempts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.diagnostic_report_email_deliveries TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.diagnostic_report_email_attempts TO service_role;

-- Completing the diagnostic and creating its outbox row are one transaction.
-- SMTP remains outside Postgres and never controls whether the report is saved.
CREATE OR REPLACE FUNCTION public.complete_free_career_anchor_diagnostic(
  p_diagnostic_id UUID,
  p_ai_feedback JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := (SELECT auth.uid());
  completed_user_id UUID;
  completed_user_data JSONB;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.user_diagnostics AS diagnostic
  SET
    ai_feedback = p_ai_feedback,
    status = 'completed',
    updated_at = TIMEZONE('utc', NOW())
  WHERE diagnostic.id = p_diagnostic_id
    AND diagnostic.user_id = current_user_id
    AND diagnostic.diagnostic_type = 'career_anchor'
    AND diagnostic.status = 'processing'
  RETURNING diagnostic.user_id, diagnostic.user_data
  INTO completed_user_id, completed_user_data;

  IF completed_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.diagnostic_report_email_deliveries (
    diagnostic_id,
    user_id,
    email_kind,
    locale
  )
  VALUES (
    p_diagnostic_id,
    completed_user_id,
    'career_anchor_completed_v1',
    CASE WHEN completed_user_data->>'locale' = 'en' THEN 'en' ELSE 'es' END
  )
  ON CONFLICT (diagnostic_id, email_kind) DO NOTHING;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_free_career_anchor_diagnostic(UUID, JSONB)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_free_career_anchor_diagnostic(UUID, JSONB)
TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_career_anchor_report_email_delivery(
  p_diagnostic_id UUID DEFAULT NULL
)
RETURNS TABLE (
  delivery_id UUID,
  diagnostic_id UUID,
  user_id UUID,
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
  WHERE delivery.email_kind = 'career_anchor_completed_v1'
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
  ORDER BY delivery.next_attempt_at NULLS FIRST, delivery.created_at
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
    claimed_delivery.locale,
    claimed_attempt_id,
    claimed_attempt_number;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_career_anchor_report_email_delivery(UUID)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_career_anchor_report_email_delivery(UUID)
TO service_role;

CREATE OR REPLACE FUNCTION public.finish_career_anchor_report_email_delivery(
  p_delivery_id UUID,
  p_attempt_id UUID,
  p_outcome TEXT,
  p_provider_message_id TEXT DEFAULT NULL,
  p_error_code TEXT DEFAULT NULL,
  p_retry_after_seconds INTEGER DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  IF p_outcome NOT IN ('sent', 'failed', 'permanent_failure') THEN
    RAISE EXCEPTION 'Unsupported delivery outcome';
  END IF;

  IF p_provider_message_id IS NOT NULL AND CHAR_LENGTH(p_provider_message_id) > 500 THEN
    RAISE EXCEPTION 'Provider message id is too long';
  END IF;

  IF p_error_code IS NOT NULL AND p_error_code !~ '^[a-z0-9_]{1,80}$' THEN
    RAISE EXCEPTION 'Invalid delivery error code';
  END IF;

  IF p_outcome = 'failed'
    AND (p_retry_after_seconds IS NULL OR p_retry_after_seconds < 60 OR p_retry_after_seconds > 604800)
  THEN
    RAISE EXCEPTION 'Invalid retry delay';
  END IF;

  PERFORM 1
  FROM public.diagnostic_report_email_deliveries AS delivery
  WHERE delivery.id = p_delivery_id
    AND delivery.status = 'processing'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE public.diagnostic_report_email_attempts AS attempt
  SET
    outcome = p_outcome,
    error_code = CASE WHEN p_outcome = 'sent' THEN NULL ELSE p_error_code END,
    provider_message_id = CASE WHEN p_outcome = 'sent' THEN p_provider_message_id ELSE NULL END,
    finished_at = TIMEZONE('utc', NOW())
  WHERE attempt.id = p_attempt_id
    AND attempt.delivery_id = p_delivery_id
    AND attempt.outcome = 'processing';

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  IF affected_rows <> 1 THEN
    RETURN FALSE;
  END IF;

  UPDATE public.diagnostic_report_email_deliveries AS delivery
  SET
    status = p_outcome,
    next_attempt_at = CASE
      WHEN p_outcome = 'failed'
        THEN TIMEZONE('utc', NOW()) + MAKE_INTERVAL(secs => p_retry_after_seconds)
      ELSE NULL
    END,
    locked_at = NULL,
    sent_at = CASE WHEN p_outcome = 'sent' THEN TIMEZONE('utc', NOW()) ELSE delivery.sent_at END,
    provider_message_id = CASE WHEN p_outcome = 'sent' THEN p_provider_message_id ELSE delivery.provider_message_id END,
    last_error_code = CASE WHEN p_outcome = 'sent' THEN NULL ELSE p_error_code END,
    updated_at = TIMEZONE('utc', NOW())
  WHERE delivery.id = p_delivery_id;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.finish_career_anchor_report_email_delivery(UUID, UUID, TEXT, TEXT, TEXT, INTEGER)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finish_career_anchor_report_email_delivery(UUID, UUID, TEXT, TEXT, TEXT, INTEGER)
TO service_role;

CREATE OR REPLACE FUNCTION public.backfill_career_anchor_report_email_deliveries(
  p_dry_run BOOLEAN DEFAULT TRUE,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  candidates BIGINT,
  enqueued BIGINT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  candidate_count BIGINT;
  inserted_count BIGINT := 0;
BEGIN
  IF p_limit < 1 OR p_limit > 1000 THEN
    RAISE EXCEPTION 'Backfill limit must be between 1 and 1000';
  END IF;

  SELECT COUNT(*)
  INTO candidate_count
  FROM public.user_diagnostics AS diagnostic
  WHERE diagnostic.diagnostic_type = 'career_anchor'
    AND diagnostic.status = 'completed'
    AND NOT EXISTS (
      SELECT 1
      FROM public.diagnostic_report_email_deliveries AS delivery
      WHERE delivery.diagnostic_id = diagnostic.id
        AND delivery.email_kind = 'career_anchor_completed_v1'
    );

  IF NOT p_dry_run THEN
    WITH missing_deliveries AS (
      SELECT
        diagnostic.id,
        diagnostic.user_id,
        CASE WHEN diagnostic.user_data->>'locale' = 'en' THEN 'en' ELSE 'es' END AS locale
      FROM public.user_diagnostics AS diagnostic
      WHERE diagnostic.diagnostic_type = 'career_anchor'
        AND diagnostic.status = 'completed'
        AND NOT EXISTS (
          SELECT 1
          FROM public.diagnostic_report_email_deliveries AS delivery
          WHERE delivery.diagnostic_id = diagnostic.id
            AND delivery.email_kind = 'career_anchor_completed_v1'
        )
      ORDER BY diagnostic.created_at, diagnostic.id
      LIMIT p_limit
    )
    INSERT INTO public.diagnostic_report_email_deliveries (
      diagnostic_id,
      user_id,
      email_kind,
      locale
    )
    SELECT
      missing.id,
      missing.user_id,
      'career_anchor_completed_v1',
      missing.locale
    FROM missing_deliveries AS missing
    ON CONFLICT (diagnostic_id, email_kind) DO NOTHING;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
  END IF;

  RETURN QUERY SELECT candidate_count, inserted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.backfill_career_anchor_report_email_deliveries(BOOLEAN, INTEGER)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.backfill_career_anchor_report_email_deliveries(BOOLEAN, INTEGER)
TO service_role;
