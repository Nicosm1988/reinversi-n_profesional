-- Enforce the same one-attempt rule for every authenticated account.
-- This supersedes the former creator-only repeat exception without rewriting history.

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

REVOKE ALL ON FUNCTION public.claim_free_career_anchor_diagnostic(JSONB, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_free_career_anchor_diagnostic(JSONB, JSONB, JSONB) TO authenticated;
