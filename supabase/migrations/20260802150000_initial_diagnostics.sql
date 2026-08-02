-- Dedicated intake for Senda's non-clinical initial diagnostic.
-- Public clients never write directly: the protected backend route uses service_role.
CREATE TABLE IF NOT EXISTS public.initial_diagnostics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email TEXT NOT NULL CHECK (char_length(email) <= 160),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 40),
  situation TEXT NOT NULL CHECK (situation IN (
    'choosing-direction',
    'trajectory-no-longer-represents-me',
    'concrete-work-change',
    'need-clarity'
  )),
  need TEXT NOT NULL CHECK (need IN (
    'know-myself',
    'choose-alternatives',
    'redefine-direction',
    'organize-transition',
    'reposition-professionally',
    'move-again'
  )),
  career_stage TEXT NOT NULL CHECK (career_stage IN (
    'secondary-school',
    'higher-education',
    'early-career',
    'experienced-professional',
    'leadership',
    'life-stage-change'
  )),
  urgency TEXT NOT NULL CHECK (urgency IN (
    'exploring',
    'move-soon',
    'short-term-decision',
    'urgent'
  )),
  suggested_route TEXT NOT NULL CHECK (suggested_route IN (
    'orientacion-vocacional',
    'reinvencion-profesional',
    'transicion-laboral',
    'entrevista-admision-requerida'
  )),
  routing_version SMALLINT NOT NULL DEFAULT 1 CHECK (routing_version > 0),
  form_version SMALLINT NOT NULL DEFAULT 1 CHECK (form_version > 0),
  locale TEXT NOT NULL DEFAULT 'es' CHECK (locale IN ('es', 'en')),
  source_page TEXT,
  consent_accepted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  privacy_policy_version TEXT NOT NULL,
  integration_status TEXT NOT NULL DEFAULT 'pending' CHECK (integration_status IN ('pending', 'processed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.initial_diagnostics ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.initial_diagnostics FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.initial_diagnostics TO service_role;

CREATE INDEX IF NOT EXISTS idx_initial_diagnostics_created_at
  ON public.initial_diagnostics (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_initial_diagnostics_email_lower
  ON public.initial_diagnostics ((LOWER(email)));

CREATE INDEX IF NOT EXISTS idx_initial_diagnostics_route_status
  ON public.initial_diagnostics (suggested_route, integration_status, created_at DESC);
