-- Consolidate the public recommendation model into Senda's two canonical journeys.
-- Historical records are retained and mapped forward before the constraint changes.
ALTER TABLE public.initial_diagnostics
  DROP CONSTRAINT IF EXISTS initial_diagnostics_suggested_route_check;

UPDATE public.initial_diagnostics
SET
  suggested_route = CASE suggested_route
    WHEN 'orientacion-vocacional' THEN 'brujula'
    WHEN 'reinvencion-profesional' THEN 'nueva-etapa-profesional'
    WHEN 'transicion-laboral' THEN 'nueva-etapa-profesional'
    ELSE suggested_route
  END,
  routing_version = GREATEST(routing_version, 2)
WHERE suggested_route IN (
  'orientacion-vocacional',
  'reinvencion-profesional',
  'transicion-laboral'
);

ALTER TABLE public.initial_diagnostics
  ADD CONSTRAINT initial_diagnostics_suggested_route_check
  CHECK (suggested_route IN (
    'brujula',
    'nueva-etapa-profesional',
    'entrevista-admision-requerida'
  ));
