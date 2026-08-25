-- Treat Senda's two result emails as an internal completion notification.
-- They remain transactionally queued by the server, but are no longer modeled
-- as a participant-facing notice or as user consent.

CREATE OR REPLACE FUNCTION public.finalize_career_anchor_diagnostic_with_internal_result_emails(
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
BEGIN
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

REVOKE ALL ON FUNCTION public.finalize_career_anchor_diagnostic_with_internal_result_emails(
  UUID, JSONB, JSONB, JSONB, JSONB, TEXT, TEXT, TEXT, TEXT
)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_career_anchor_diagnostic_with_internal_result_emails(
  UUID, JSONB, JSONB, JSONB, JSONB, TEXT, TEXT, TEXT, TEXT
)
TO service_role;

COMMENT ON FUNCTION public.finalize_career_anchor_diagnostic_with_internal_result_emails(
  UUID, JSONB, JSONB, JSONB, JSONB, TEXT, TEXT, TEXT, TEXT
) IS 'Finalizes a Career Anchors result and atomically queues Senda internal notifications.';

-- Keep the previous signature during the database-first rollout so the
-- currently deployed application remains compatible. The legacy boolean is
-- intentionally ignored and no consent metadata is created.
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
BEGIN
  PERFORM p_result_email_consent;
  RETURN public.finalize_career_anchor_diagnostic_with_internal_result_emails(
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

COMMENT ON FUNCTION public.finalize_career_anchor_diagnostic_with_result_email(
  UUID, JSONB, JSONB, JSONB, JSONB, TEXT, TEXT, TEXT, TEXT, BOOLEAN
) IS 'Compatibility shim; the legacy consent argument is ignored and no consent audit is written.';
