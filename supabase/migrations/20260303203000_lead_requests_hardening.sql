-- Hardening: consistency and query performance for lead intake

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'lead_requests_locale_check'
      AND conrelid = 'public.lead_requests'::regclass
  ) THEN
    ALTER TABLE public.lead_requests
      ADD CONSTRAINT lead_requests_locale_check
      CHECK (locale IN ('es', 'en'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_lead_requests_created_at
  ON public.lead_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lead_requests_type_created_at
  ON public.lead_requests (lead_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lead_requests_email_lower
  ON public.lead_requests ((LOWER(email)));
