-- The project creators need to repeat the full diagnostic for product testing.
-- All other authenticated accounts remain limited to one completed free test.

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
  current_user_email TEXT;
  has_unlimited_access BOOLEAN := FALSE;
  claimed_id UUID;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT LOWER(email)
  INTO current_user_email
  FROM auth.users
  WHERE id = current_user_id;

  has_unlimited_access := current_user_email IN (
    'nmarcosan@gmail.com',
    'tanisardella@gmail.com'
  );

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
    has_unlimited_access
    OR (
      public.user_diagnostics.status = 'processing'
      AND public.user_diagnostics.updated_at < TIMEZONE('utc', NOW()) - INTERVAL '15 minutes'
    )
  RETURNING id INTO claimed_id;

  RETURN claimed_id;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_free_career_anchor_diagnostic(JSONB, JSONB, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_free_career_anchor_diagnostic(JSONB, JSONB, JSONB) TO authenticated;
