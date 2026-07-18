-- Enforce one free Career Anchor diagnostic per authenticated account.
-- A short processing lease prevents concurrent requests from consuming AI twice,
-- while allowing a safe retry after an interrupted request.

ALTER TABLE public.user_diagnostics
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW());

ALTER TABLE public.user_diagnostics
  DROP CONSTRAINT IF EXISTS user_diagnostics_status_check;

ALTER TABLE public.user_diagnostics
  ADD CONSTRAINT user_diagnostics_status_check
  CHECK (status IN ('processing', 'completed'));

CREATE UNIQUE INDEX IF NOT EXISTS user_diagnostics_user_type_unique_idx
ON public.user_diagnostics (user_id, diagnostic_type);

CREATE OR REPLACE FUNCTION public.claim_free_career_anchor_diagnostic(
  p_user_data JSONB,
  p_raw_answers JSONB,
  p_dominant_result JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  claimed_id UUID;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.user_diagnostics (
    user_id,
    diagnostic_type,
    user_data,
    raw_answers,
    dominant_result,
    ai_feedback,
    status,
    updated_at
  )
  VALUES (
    current_user_id,
    'career_anchor',
    p_user_data,
    p_raw_answers,
    p_dominant_result,
    NULL,
    'processing',
    TIMEZONE('utc', NOW())
  )
  ON CONFLICT (user_id, diagnostic_type) DO UPDATE
  SET
    user_data = EXCLUDED.user_data,
    raw_answers = EXCLUDED.raw_answers,
    dominant_result = EXCLUDED.dominant_result,
    ai_feedback = NULL,
    status = 'processing',
    updated_at = TIMEZONE('utc', NOW())
  WHERE
    public.user_diagnostics.status = 'processing'
    AND public.user_diagnostics.updated_at < TIMEZONE('utc', NOW()) - INTERVAL '15 minutes'
  RETURNING id INTO claimed_id;

  RETURN claimed_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_free_career_anchor_diagnostic(
  p_diagnostic_id UUID,
  p_ai_feedback JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  affected_rows INTEGER;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.user_diagnostics
  SET
    ai_feedback = p_ai_feedback,
    status = 'completed',
    updated_at = TIMEZONE('utc', NOW())
  WHERE id = p_diagnostic_id
    AND user_id = current_user_id
    AND diagnostic_type = 'career_anchor'
    AND status = 'processing';

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_free_career_anchor_diagnostic(JSONB, JSONB, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_free_career_anchor_diagnostic(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_free_career_anchor_diagnostic(JSONB, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_free_career_anchor_diagnostic(UUID, JSONB) TO authenticated;
