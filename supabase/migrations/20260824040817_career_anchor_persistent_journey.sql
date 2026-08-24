-- Turn the Career Anchors test into a resumable, single-completion journey.
-- Browser clients may only read their own row. All mutations are performed by
-- authenticated Next.js routes through service-role-only functions.

ALTER TABLE public.user_diagnostics
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_statement INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS progress_revision BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS instrument_version TEXT,
  ADD COLUMN IF NOT EXISTS algorithm_version TEXT,
  ADD COLUMN IF NOT EXISTS score_result JSONB,
  ADD COLUMN IF NOT EXISTS result_base JSONB,
  ADD COLUMN IF NOT EXISTS result_ai JSONB,
  ADD COLUMN IF NOT EXISTS interpretation_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS interpretation_claim_token UUID;

UPDATE public.user_diagnostics
SET
  started_at = COALESCE(started_at, created_at),
  completed_at = CASE
    WHEN status = 'completed' THEN COALESCE(completed_at, updated_at, created_at)
    ELSE completed_at
  END,
  instrument_version = COALESCE(instrument_version, 'schein-career-anchors-40-v1'),
  algorithm_version = COALESCE(algorithm_version, 'senda-career-anchor-score-v1')
WHERE diagnostic_type = 'career_anchor';

ALTER TABLE public.user_diagnostics
  DROP CONSTRAINT IF EXISTS user_diagnostics_status_check;

ALTER TABLE public.user_diagnostics
  ADD CONSTRAINT user_diagnostics_status_check
  CHECK (status IN ('in_progress', 'processing', 'completed'));

ALTER TABLE public.user_diagnostics
  DROP CONSTRAINT IF EXISTS user_diagnostics_current_statement_check;

ALTER TABLE public.user_diagnostics
  ADD CONSTRAINT user_diagnostics_current_statement_check
  CHECK (current_statement BETWEEN 1 AND 40);

ALTER TABLE public.user_diagnostics
  DROP CONSTRAINT IF EXISTS user_diagnostics_progress_revision_check;

ALTER TABLE public.user_diagnostics
  ADD CONSTRAINT user_diagnostics_progress_revision_check
  CHECK (progress_revision >= 0);

-- The original policy already protected ownership, but recreating it with an
-- explicit role and a cached auth.uid() expression also documents the public
-- read contract for progress and completed results.
DROP POLICY IF EXISTS "Users can insert their own diagnostics" ON public.user_diagnostics;
DROP POLICY IF EXISTS "Users can view their own diagnostics" ON public.user_diagnostics;

CREATE POLICY "Users can view their own diagnostics"
ON public.user_diagnostics
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON TABLE public.user_diagnostics FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.user_diagnostics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_diagnostics TO service_role;

-- Legacy RPC execution is intentionally revoked in the follow-up lockdown
-- migration. Keeping it during this additive migration makes the database-first
-- rollout compatible with the currently deployed application.

CREATE OR REPLACE FUNCTION public.save_career_anchor_progress(
  p_user_id UUID,
  p_answers JSONB,
  p_bonus JSONB,
  p_current_statement INTEGER,
  p_client_revision BIGINT,
  p_locale TEXT,
  p_career_stage TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  saved_row public.user_diagnostics%ROWTYPE;
  accepted BOOLEAN := FALSE;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User id is required';
  END IF;

  IF p_locale IS NULL OR p_locale NOT IN ('es', 'en') THEN
    RAISE EXCEPTION 'Unsupported locale';
  END IF;

  IF p_career_stage IS NULL OR p_career_stage NOT IN (
    'exploring_direction',
    'changing_employment',
    'independent_project',
    'leadership_company',
    'specific_challenge',
    'choosing_education',
    'other',
    'prefer_not_to_say'
  ) THEN
    RAISE EXCEPTION 'Unsupported career stage';
  END IF;

  IF p_current_statement IS NULL
    OR p_current_statement NOT BETWEEN 1 AND 40
    OR p_client_revision IS NULL
    OR p_client_revision < 1
  THEN
    RAISE EXCEPTION 'Invalid progress cursor';
  END IF;

  IF JSONB_TYPEOF(p_answers) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Invalid statement answers';
  END IF;

  IF (SELECT COUNT(*) FROM JSONB_OBJECT_KEYS(p_answers)) > 40 THEN
    RAISE EXCEPTION 'Invalid statement answers';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM JSONB_EACH(p_answers) AS answer(statement_id, score)
    WHERE answer.statement_id !~ '^([1-9]|[1-3][0-9]|40)$'
      OR JSONB_TYPEOF(answer.score) IS DISTINCT FROM 'number'
      OR answer.score::TEXT !~ '^[1-6]$'
  ) THEN
    RAISE EXCEPTION 'Invalid statement answer';
  END IF;

  IF JSONB_TYPEOF(p_bonus) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Invalid final selection';
  END IF;

  IF JSONB_ARRAY_LENGTH(p_bonus) > 3 THEN
    RAISE EXCEPTION 'Invalid final selection';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM JSONB_ARRAY_ELEMENTS(p_bonus) AS selected(statement_id)
    WHERE JSONB_TYPEOF(selected.statement_id) IS DISTINCT FROM 'number'
      OR selected.statement_id::TEXT !~ '^([1-9]|[1-3][0-9]|40)$'
  ) OR (
    SELECT COUNT(DISTINCT selected.statement_id::TEXT)
    FROM JSONB_ARRAY_ELEMENTS(p_bonus) AS selected(statement_id)
  ) <> JSONB_ARRAY_LENGTH(p_bonus) THEN
    RAISE EXCEPTION 'Invalid final selection';
  END IF;

  INSERT INTO public.user_diagnostics (
    user_id,
    diagnostic_type,
    user_data,
    raw_answers,
    dominant_result,
    status,
    started_at,
    updated_at,
    current_statement,
    progress_revision,
    instrument_version,
    algorithm_version
  )
  VALUES (
    p_user_id,
    'career_anchor',
    JSONB_BUILD_OBJECT('locale', p_locale, 'careerStage', p_career_stage),
    JSONB_BUILD_OBJECT('answers', p_answers, 'bonus', p_bonus),
    '{}'::JSONB,
    'in_progress',
    TIMEZONE('utc', NOW()),
    TIMEZONE('utc', NOW()),
    p_current_statement,
    p_client_revision,
    'schein-career-anchors-40-v1',
    'senda-career-anchor-score-v1'
  )
  ON CONFLICT (user_id, diagnostic_type) DO UPDATE
  SET
    user_data = JSONB_BUILD_OBJECT('locale', p_locale, 'careerStage', p_career_stage),
    raw_answers = JSONB_BUILD_OBJECT(
      'answers',
      COALESCE(public.user_diagnostics.raw_answers->'answers', '{}'::JSONB) || p_answers,
      'bonus',
      p_bonus
    ),
    current_statement = p_current_statement,
    progress_revision = p_client_revision,
    started_at = COALESCE(public.user_diagnostics.started_at, TIMEZONE('utc', NOW())),
    updated_at = TIMEZONE('utc', NOW()),
    instrument_version = 'schein-career-anchors-40-v1',
    algorithm_version = 'senda-career-anchor-score-v1'
  WHERE public.user_diagnostics.status = 'in_progress'
    AND p_client_revision > public.user_diagnostics.progress_revision
  RETURNING * INTO saved_row;

  IF saved_row.id IS NOT NULL THEN
    accepted := TRUE;
  ELSE
    SELECT diagnostic.*
    INTO saved_row
    FROM public.user_diagnostics AS diagnostic
    WHERE diagnostic.user_id = p_user_id
      AND diagnostic.diagnostic_type = 'career_anchor';
  END IF;

  IF saved_row.id IS NULL THEN
    RAISE EXCEPTION 'Progress row was not created';
  END IF;

  RETURN JSONB_BUILD_OBJECT(
    'id', saved_row.id,
    'status', saved_row.status,
    'savedAt', saved_row.updated_at,
    'revision', saved_row.progress_revision,
    'accepted', accepted
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_career_anchor_diagnostic(
  p_user_id UUID,
  p_raw_answers JSONB,
  p_dominant_result JSONB,
  p_score_result JSONB,
  p_result_base JSONB,
  p_locale TEXT,
  p_career_stage TEXT,
  p_instrument_version TEXT,
  p_algorithm_version TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  finalized_id UUID;
  answers JSONB := p_raw_answers->'answers';
  bonus JSONB := p_raw_answers->'bonus';
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User id is required';
  END IF;

  IF p_locale IS NULL
    OR p_locale NOT IN ('es', 'en')
    OR p_instrument_version IS DISTINCT FROM 'schein-career-anchors-40-v1'
    OR p_algorithm_version IS DISTINCT FROM 'senda-career-anchor-score-v1'
  THEN
    RAISE EXCEPTION 'Unsupported instrument metadata';
  END IF;

  IF p_career_stage IS NULL OR p_career_stage NOT IN (
    'exploring_direction',
    'changing_employment',
    'independent_project',
    'leadership_company',
    'specific_challenge',
    'choosing_education',
    'other',
    'prefer_not_to_say'
  ) THEN
    RAISE EXCEPTION 'Unsupported career stage';
  END IF;

  IF JSONB_TYPEOF(answers) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'All 40 statement answers are required';
  END IF;

  IF JSONB_TYPEOF(p_dominant_result) IS DISTINCT FROM 'object'
    OR JSONB_TYPEOF(p_score_result) IS DISTINCT FROM 'array'
    OR JSONB_TYPEOF(p_result_base) IS DISTINCT FROM 'object'
  THEN
    RAISE EXCEPTION 'Invalid calculated result';
  END IF;

  IF (SELECT COUNT(*) FROM JSONB_OBJECT_KEYS(answers)) <> 40
    OR EXISTS (
      SELECT 1
      FROM JSONB_EACH(answers) AS answer(statement_id, score)
      WHERE answer.statement_id !~ '^([1-9]|[1-3][0-9]|40)$'
        OR JSONB_TYPEOF(answer.score) IS DISTINCT FROM 'number'
        OR answer.score::TEXT !~ '^[1-6]$'
    )
  THEN
    RAISE EXCEPTION 'All 40 statement answers are required';
  END IF;

  IF JSONB_TYPEOF(bonus) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Exactly 3 unique final selections are required';
  END IF;

  IF JSONB_ARRAY_LENGTH(bonus) <> 3
    OR EXISTS (
      SELECT 1
      FROM JSONB_ARRAY_ELEMENTS(bonus) AS selected(statement_id)
      WHERE JSONB_TYPEOF(selected.statement_id) IS DISTINCT FROM 'number'
        OR selected.statement_id::TEXT !~ '^([1-9]|[1-3][0-9]|40)$'
    )
    OR (
      SELECT COUNT(DISTINCT selected.statement_id::TEXT)
      FROM JSONB_ARRAY_ELEMENTS(bonus) AS selected(statement_id)
    ) <> 3
  THEN
    RAISE EXCEPTION 'Exactly 3 unique final selections are required';
  END IF;

  INSERT INTO public.user_diagnostics (
    user_id,
    diagnostic_type,
    user_data,
    raw_answers,
    dominant_result,
    ai_feedback,
    status,
    started_at,
    completed_at,
    updated_at,
    current_statement,
    instrument_version,
    algorithm_version,
    score_result,
    result_base
  )
  VALUES (
    p_user_id,
    'career_anchor',
    JSONB_BUILD_OBJECT('locale', p_locale, 'careerStage', p_career_stage),
    p_raw_answers,
    p_dominant_result,
    NULL,
    'completed',
    TIMEZONE('utc', NOW()),
    TIMEZONE('utc', NOW()),
    TIMEZONE('utc', NOW()),
    40,
    p_instrument_version,
    p_algorithm_version,
    p_score_result,
    p_result_base
  )
  ON CONFLICT (user_id, diagnostic_type) DO UPDATE
  SET
    user_data = JSONB_BUILD_OBJECT('locale', p_locale, 'careerStage', p_career_stage),
    raw_answers = p_raw_answers,
    dominant_result = p_dominant_result,
    ai_feedback = NULL,
    result_ai = NULL,
    status = 'completed',
    completed_at = TIMEZONE('utc', NOW()),
    updated_at = TIMEZONE('utc', NOW()),
    current_statement = 40,
    instrument_version = p_instrument_version,
    algorithm_version = p_algorithm_version,
    score_result = p_score_result,
    result_base = p_result_base
  WHERE public.user_diagnostics.status = 'in_progress'
    OR (
      public.user_diagnostics.status = 'processing'
      AND public.user_diagnostics.updated_at < TIMEZONE('utc', NOW()) - INTERVAL '15 minutes'
    )
  RETURNING id INTO finalized_id;

  IF finalized_id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.diagnostic_report_email_deliveries (
    diagnostic_id,
    user_id,
    email_kind,
    locale
  )
  VALUES (
    finalized_id,
    p_user_id,
    'career_anchor_completed_v1',
    p_locale
  )
  ON CONFLICT (diagnostic_id, email_kind) DO NOTHING;

  RETURN finalized_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_valid_career_anchor_interpretation(
  p_interpretation JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF JSONB_TYPEOF(p_interpretation) IS DISTINCT FROM 'object' THEN
    RETURN FALSE;
  END IF;

  IF (SELECT COUNT(*) FROM JSONB_OBJECT_KEYS(p_interpretation)) <> 8 THEN
    RETURN FALSE;
  END IF;

  IF JSONB_TYPEOF(p_interpretation->'mode') IS DISTINCT FROM 'string'
    OR p_interpretation->>'mode' NOT IN ('ai', 'fallback')
    OR JSONB_TYPEOF(p_interpretation->'title') IS DISTINCT FROM 'string'
    OR CHAR_LENGTH(REGEXP_REPLACE(p_interpretation->>'title', '^[[:space:]]+|[[:space:]]+$', '', 'g')) NOT BETWEEN 1 AND 180
    OR JSONB_TYPEOF(p_interpretation->'summary') IS DISTINCT FROM 'string'
    OR CHAR_LENGTH(REGEXP_REPLACE(p_interpretation->>'summary', '^[[:space:]]+|[[:space:]]+$', '', 'g')) NOT BETWEEN 1 AND 2400
    OR JSONB_TYPEOF(p_interpretation->'stageConnection') IS DISTINCT FROM 'string'
    OR CHAR_LENGTH(REGEXP_REPLACE(p_interpretation->>'stageConnection', '^[[:space:]]+|[[:space:]]+$', '', 'g')) NOT BETWEEN 1 AND 1400
    OR JSONB_TYPEOF(p_interpretation->'tensions') IS DISTINCT FROM 'array'
    OR JSONB_TYPEOF(p_interpretation->'reflectionQuestions') IS DISTINCT FROM 'array'
    OR JSONB_TYPEOF(p_interpretation->'relevantServices') IS DISTINCT FROM 'array'
    OR JSONB_TYPEOF(p_interpretation->'nextSteps') IS DISTINCT FROM 'array'
  THEN
    RETURN FALSE;
  END IF;

  IF JSONB_ARRAY_LENGTH(p_interpretation->'tensions') > 5
    OR JSONB_ARRAY_LENGTH(p_interpretation->'reflectionQuestions') NOT BETWEEN 3 AND 5
    OR JSONB_ARRAY_LENGTH(p_interpretation->'relevantServices') > 2
    OR JSONB_ARRAY_LENGTH(p_interpretation->'nextSteps') NOT BETWEEN 3 AND 5
  THEN
    RETURN FALSE;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM JSONB_ARRAY_ELEMENTS(p_interpretation->'tensions') AS item(value)
    WHERE JSONB_TYPEOF(item.value) IS DISTINCT FROM 'string'
      OR CHAR_LENGTH(REGEXP_REPLACE(item.value #>> '{}', '^[[:space:]]+|[[:space:]]+$', '', 'g')) NOT BETWEEN 1 AND 600
  ) OR EXISTS (
    SELECT 1
    FROM JSONB_ARRAY_ELEMENTS(p_interpretation->'reflectionQuestions') AS item(value)
    WHERE JSONB_TYPEOF(item.value) IS DISTINCT FROM 'string'
      OR CHAR_LENGTH(REGEXP_REPLACE(item.value #>> '{}', '^[[:space:]]+|[[:space:]]+$', '', 'g')) NOT BETWEEN 1 AND 600
  ) OR EXISTS (
    SELECT 1
    FROM JSONB_ARRAY_ELEMENTS(p_interpretation->'nextSteps') AS item(value)
    WHERE JSONB_TYPEOF(item.value) IS DISTINCT FROM 'string'
      OR CHAR_LENGTH(REGEXP_REPLACE(item.value #>> '{}', '^[[:space:]]+|[[:space:]]+$', '', 'g')) NOT BETWEEN 1 AND 600
  ) THEN
    RETURN FALSE;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM JSONB_ARRAY_ELEMENTS(p_interpretation->'relevantServices') AS service(value)
    WHERE JSONB_TYPEOF(service.value) IS DISTINCT FROM 'object'
  ) THEN
    RETURN FALSE;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM JSONB_ARRAY_ELEMENTS(p_interpretation->'relevantServices') AS service(value)
    WHERE (SELECT COUNT(*) FROM JSONB_OBJECT_KEYS(service.value)) <> 3
      OR JSONB_TYPEOF(service.value->'slug') IS DISTINCT FROM 'string'
      OR service.value->>'slug' NOT IN (
        '/transiciones-laborales/explorar-direccion',
        '/transiciones-laborales/cambiar-empleo',
        '/transiciones-laborales/proyecto-propio',
        '/transiciones-laborales/liderazgo-empresa',
        '/transiciones-laborales/desafio-puntual',
        '/transiciones-laborales/elegir-formacion'
      )
      OR JSONB_TYPEOF(service.value->'label') IS DISTINCT FROM 'string'
      OR CHAR_LENGTH(REGEXP_REPLACE(service.value->>'label', '^[[:space:]]+|[[:space:]]+$', '', 'g')) NOT BETWEEN 1 AND 160
      OR JSONB_TYPEOF(service.value->'reason') IS DISTINCT FROM 'string'
      OR CHAR_LENGTH(REGEXP_REPLACE(service.value->>'reason', '^[[:space:]]+|[[:space:]]+$', '', 'g')) NOT BETWEEN 1 AND 600
  ) THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_career_anchor_interpretation(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  diagnostic public.user_diagnostics%ROWTYPE;
  canonical JSONB;
  claim_token UUID;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User id is required';
  END IF;

  SELECT stored.*
  INTO diagnostic
  FROM public.user_diagnostics AS stored
  WHERE stored.user_id = p_user_id
    AND stored.diagnostic_type = 'career_anchor'
    AND stored.status = 'completed'
  FOR UPDATE;

  IF diagnostic.id IS NULL THEN
    RETURN JSONB_BUILD_OBJECT('status', 'missing');
  END IF;

  canonical := CASE
    WHEN public.is_valid_career_anchor_interpretation(diagnostic.result_ai)
      THEN diagnostic.result_ai
    WHEN public.is_valid_career_anchor_interpretation(diagnostic.ai_feedback)
      THEN diagnostic.ai_feedback
    ELSE NULL
  END;

  IF canonical IS NOT NULL THEN
    RETURN JSONB_BUILD_OBJECT('status', 'ready', 'interpretation', canonical);
  END IF;

  IF diagnostic.interpretation_started_at IS NOT NULL
    AND diagnostic.interpretation_claim_token IS NOT NULL
    AND diagnostic.interpretation_started_at >= TIMEZONE('utc', NOW()) - INTERVAL '2 minutes'
  THEN
    RETURN JSONB_BUILD_OBJECT('status', 'processing');
  END IF;

  claim_token := gen_random_uuid();

  UPDATE public.user_diagnostics AS stored
  SET
    interpretation_started_at = TIMEZONE('utc', NOW()),
    interpretation_claim_token = claim_token,
    updated_at = TIMEZONE('utc', NOW())
  WHERE stored.id = diagnostic.id;

  RETURN JSONB_BUILD_OBJECT('status', 'claimed', 'claimToken', claim_token);
END;
$$;

CREATE OR REPLACE FUNCTION public.save_career_anchor_interpretation(
  p_user_id UUID,
  p_claim_token UUID,
  p_interpretation JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  diagnostic public.user_diagnostics%ROWTYPE;
  existing_canonical JSONB;
  canonical JSONB;
BEGIN
  IF p_user_id IS NULL
    OR p_claim_token IS NULL
    OR NOT public.is_valid_career_anchor_interpretation(p_interpretation)
  THEN
    RAISE EXCEPTION 'Invalid interpretation';
  END IF;

  SELECT stored.*
  INTO diagnostic
  FROM public.user_diagnostics AS stored
  WHERE stored.user_id = p_user_id
    AND stored.diagnostic_type = 'career_anchor'
    AND stored.status = 'completed'
  FOR UPDATE;

  IF diagnostic.id IS NULL THEN
    RETURN NULL;
  END IF;

  existing_canonical := CASE
    WHEN public.is_valid_career_anchor_interpretation(diagnostic.result_ai)
      THEN diagnostic.result_ai
    WHEN public.is_valid_career_anchor_interpretation(diagnostic.ai_feedback)
      THEN diagnostic.ai_feedback
    ELSE NULL
  END;

  IF existing_canonical IS NOT NULL THEN
    RETURN existing_canonical;
  END IF;

  IF diagnostic.interpretation_claim_token IS DISTINCT FROM p_claim_token
    OR diagnostic.interpretation_started_at IS NULL
    OR diagnostic.interpretation_started_at < TIMEZONE('utc', NOW()) - INTERVAL '2 minutes'
  THEN
    RETURN NULL;
  END IF;

  canonical := p_interpretation;

  UPDATE public.user_diagnostics AS stored
  SET
    ai_feedback = canonical,
    result_ai = CASE
      WHEN p_interpretation->>'mode' = 'ai' THEN p_interpretation
      ELSE NULL
    END,
    interpretation_started_at = NULL,
    interpretation_claim_token = NULL,
    updated_at = TIMEZONE('utc', NOW())
  WHERE stored.id = diagnostic.id;

  RETURN canonical;
END;
$$;

REVOKE ALL ON FUNCTION public.save_career_anchor_progress(UUID, JSONB, JSONB, INTEGER, BIGINT, TEXT, TEXT)
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finalize_career_anchor_diagnostic(UUID, JSONB, JSONB, JSONB, JSONB, TEXT, TEXT, TEXT, TEXT)
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_career_anchor_interpretation(UUID)
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_valid_career_anchor_interpretation(JSONB)
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.save_career_anchor_interpretation(UUID, UUID, JSONB)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.save_career_anchor_progress(UUID, JSONB, JSONB, INTEGER, BIGINT, TEXT, TEXT)
TO service_role;
GRANT EXECUTE ON FUNCTION public.finalize_career_anchor_diagnostic(UUID, JSONB, JSONB, JSONB, JSONB, TEXT, TEXT, TEXT, TEXT)
TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_career_anchor_interpretation(UUID)
TO service_role;
GRANT EXECUTE ON FUNCTION public.is_valid_career_anchor_interpretation(JSONB)
TO service_role;
GRANT EXECUTE ON FUNCTION public.save_career_anchor_interpretation(UUID, UUID, JSONB)
TO service_role;
