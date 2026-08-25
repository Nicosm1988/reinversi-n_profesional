BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

SELECT plan(87);

SELECT has_column('public', 'user_diagnostics', 'started_at', 'journey start is durable');
SELECT has_column('public', 'user_diagnostics', 'completed_at', 'completion time is durable');
SELECT has_column('public', 'user_diagnostics', 'current_statement', 'resume cursor is durable');
SELECT has_column('public', 'user_diagnostics', 'progress_revision', 'progress revisions are durable');
SELECT has_column('public', 'user_diagnostics', 'instrument_version', 'instrument version is durable');
SELECT has_column('public', 'user_diagnostics', 'algorithm_version', 'algorithm version is durable');
SELECT has_column('public', 'user_diagnostics', 'score_result', 'canonical score is durable');
SELECT has_column('public', 'user_diagnostics', 'result_base', 'base interpretation is durable');
SELECT has_column('public', 'user_diagnostics', 'result_ai', 'AI interpretation is durable');
SELECT has_column(
  'public',
  'user_diagnostics',
  'interpretation_started_at',
  'interpretation lease time is durable'
);
SELECT has_column(
  'public',
  'user_diagnostics',
  'interpretation_claim_token',
  'interpretation lease fencing token is durable'
);
SELECT has_index(
  'public',
  'user_diagnostics',
  'user_diagnostics_user_type_unique_idx',
  'one row exists per user and diagnostic type'
);
SELECT is(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.user_diagnostics'::regclass),
  TRUE,
  'RLS remains enabled for diagnostics'
);

SELECT ok(has_table_privilege('authenticated', 'public.user_diagnostics', 'SELECT'), 'authenticated can read');
SELECT ok(NOT has_table_privilege('authenticated', 'public.user_diagnostics', 'INSERT'), 'authenticated cannot insert');
SELECT ok(NOT has_table_privilege('authenticated', 'public.user_diagnostics', 'UPDATE'), 'authenticated cannot update');
SELECT ok(NOT has_table_privilege('authenticated', 'public.user_diagnostics', 'DELETE'), 'authenticated cannot delete');
SELECT ok(NOT has_table_privilege('anon', 'public.user_diagnostics', 'SELECT'), 'anonymous users cannot read');

SELECT ok(
  has_function_privilege('service_role', 'public.save_career_anchor_progress(uuid,jsonb,jsonb,integer,bigint,text,text)', 'EXECUTE'),
  'service role can save progress'
);
SELECT ok(
  has_function_privilege('service_role', 'public.finalize_career_anchor_diagnostic(uuid,jsonb,jsonb,jsonb,jsonb,text,text,text,text)', 'EXECUTE'),
  'service role can finalize'
);
SELECT ok(
  has_function_privilege('service_role', 'public.finalize_career_anchor_diagnostic_with_internal_result_emails(uuid,jsonb,jsonb,jsonb,jsonb,text,text,text,text)', 'EXECUTE'),
  'service role can finalize and queue internal result emails'
);
SELECT ok(
  has_function_privilege('service_role', 'public.claim_career_anchor_internal_result_email_delivery(uuid)', 'EXECUTE'),
  'service role can claim internal result email deliveries'
);
SELECT ok(
  has_function_privilege('service_role', 'public.save_career_anchor_interpretation(uuid,uuid,jsonb)', 'EXECUTE'),
  'service role can save the canonical interpretation'
);
SELECT ok(
  has_function_privilege('service_role', 'public.is_valid_career_anchor_interpretation(jsonb)', 'EXECUTE'),
  'service role can validate canonical interpretations'
);
SELECT ok(
  has_function_privilege('service_role', 'public.claim_career_anchor_interpretation(uuid)', 'EXECUTE'),
  'service role can claim the interpretation lease'
);
SELECT ok(
  NOT has_function_privilege('authenticated', 'public.save_career_anchor_progress(uuid,jsonb,jsonb,integer,bigint,text,text)', 'EXECUTE'),
  'browser users cannot call progress RPC directly'
);
SELECT ok(
  NOT has_function_privilege('authenticated', 'public.finalize_career_anchor_diagnostic(uuid,jsonb,jsonb,jsonb,jsonb,text,text,text,text)', 'EXECUTE'),
  'browser users cannot call finalization RPC directly'
);
SELECT ok(
  NOT has_function_privilege('authenticated', 'public.finalize_career_anchor_diagnostic_with_internal_result_emails(uuid,jsonb,jsonb,jsonb,jsonb,text,text,text,text)', 'EXECUTE'),
  'browser users cannot call internal result-email finalization directly'
);
SELECT ok(
  NOT has_function_privilege('authenticated', 'public.claim_career_anchor_internal_result_email_delivery(uuid)', 'EXECUTE'),
  'browser users cannot claim internal result email deliveries'
);
SELECT ok(
  NOT has_function_privilege('authenticated', 'public.save_career_anchor_interpretation(uuid,uuid,jsonb)', 'EXECUTE'),
  'browser users cannot write interpretations directly'
);
SELECT ok(
  NOT has_function_privilege('authenticated', 'public.is_valid_career_anchor_interpretation(jsonb)', 'EXECUTE'),
  'browser users cannot invoke the canonical interpretation validator'
);
SELECT ok(
  NOT has_function_privilege('authenticated', 'public.claim_career_anchor_interpretation(uuid)', 'EXECUTE'),
  'browser users cannot claim the interpretation lease directly'
);
SELECT ok(
  NOT has_function_privilege('anon', 'public.claim_career_anchor_interpretation(uuid)', 'EXECUTE'),
  'anonymous users cannot claim the interpretation lease'
);
SELECT ok(
  to_regprocedure('public.claim_free_career_anchor_diagnostic(jsonb,jsonb,jsonb)') IS NULL,
  'legacy claim RPC is removed after rollout'
);
SELECT ok(
  to_regprocedure('public.complete_free_career_anchor_diagnostic(uuid,jsonb)') IS NULL,
  'legacy completion RPC is removed after rollout'
);

INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  is_sso_user,
  is_anonymous,
  created_at,
  updated_at
)
VALUES
  (
    '11111111-1111-4111-8111-111111111111',
    'authenticated',
    'authenticated',
    'career-a@example.test',
    '{}'::jsonb,
    '{}'::jsonb,
    FALSE,
    FALSE,
    NOW(),
    NOW()
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'authenticated',
    'authenticated',
    'career-b@example.test',
    '{}'::jsonb,
    '{}'::jsonb,
    FALSE,
    FALSE,
    NOW(),
    NOW()
  );

CREATE TEMP VIEW career_anchor_test_payload AS
SELECT jsonb_build_object(
  'answers', (
    SELECT jsonb_object_agg(statement_id::text, ((statement_id - 1) % 6) + 1)
    FROM generate_series(1, 40) AS statement_id
  ),
  'bonus', '[1, 2, 3]'::jsonb
) AS raw_answers;

CREATE TEMP VIEW career_anchor_test_interpretation AS
SELECT '{
  "title": "IA canónica",
  "summary": "Una síntesis orientativa y prudente.",
  "tensions": [],
  "reflectionQuestions": [
    "¿Qué querés preservar?",
    "¿Qué sentís que falta hoy?",
    "¿Qué experiencia pequeña podrías probar?"
  ],
  "stageConnection": "El momento profesional puede revisarse con estos criterios.",
  "relevantServices": [
    {
      "slug": "/transiciones-laborales/cambiar-empleo",
      "label": "Preparar un cambio de empleo",
      "reason": "Permite ordenar alternativas de forma reflexiva."
    }
  ],
  "nextSteps": [
    "Revisar experiencias recientes.",
    "Comparar alternativas concretas.",
    "Definir un experimento pequeño."
  ],
  "mode": "ai"
}'::jsonb AS interpretation;

CREATE TEMP VIEW career_anchor_test_scores AS
SELECT '[
  {"id":"technical","name":"Competencia Técnica/Funcional","score":31,"mean":6.2,"rank":1},
  {"id":"management","name":"Dirección General","score":28,"mean":5.6,"rank":2},
  {"id":"autonomy","name":"Autonomía/Independencia","score":25,"mean":5,"rank":3},
  {"id":"security","name":"Seguridad/Estabilidad","score":22,"mean":4.4,"rank":4},
  {"id":"entrepreneurial","name":"Creatividad Emprendedora","score":19,"mean":3.8,"rank":5},
  {"id":"service","name":"Servicio/Dedicación a una Causa","score":16,"mean":3.2,"rank":6},
  {"id":"challenge","name":"Desafío Puro","score":13,"mean":2.6,"rank":7},
  {"id":"lifestyle","name":"Estilo de Vida","score":10,"mean":2,"rank":8}
]'::jsonb AS scores;

SELECT ok(
  public.is_valid_career_anchor_interpretation(
    (SELECT interpretation FROM career_anchor_test_interpretation)
  ),
  'the complete canonical interpretation shape is valid'
);
SELECT ok(
  NOT public.is_valid_career_anchor_interpretation('{"mode":"ai"}'::jsonb),
  'an incomplete interpretation is invalid'
);
SELECT ok(
  NOT public.is_valid_career_anchor_interpretation(
    (SELECT interpretation || '{"extra":true}'::jsonb FROM career_anchor_test_interpretation)
  ),
  'an extra top-level key violates the strict canonical shape'
);
SELECT ok(
  NOT public.is_valid_career_anchor_interpretation(
    JSONB_SET(
      (SELECT interpretation FROM career_anchor_test_interpretation),
      '{relevantServices,0,slug}',
      '"/ruta-no-permitida"'::jsonb
    )
  ),
  'an unsupported service slug is invalid'
);
SELECT ok(
  NOT public.is_valid_career_anchor_interpretation(
    JSONB_SET(
      (SELECT interpretation FROM career_anchor_test_interpretation),
      '{title}',
      TO_JSONB(E' \t\n '::TEXT)
    )
  ),
  'a whitespace-only canonical string is invalid'
);
SELECT ok(
  NOT public.is_valid_career_anchor_interpretation(
    JSONB_SET(
      (SELECT interpretation FROM career_anchor_test_interpretation),
      '{summary}',
      TO_JSONB(REPEAT('x', 2401))
    )
  ),
  'an overlong canonical string is invalid'
);
SELECT ok(
  NOT public.is_valid_career_anchor_interpretation(
    JSONB_SET(
      (SELECT interpretation FROM career_anchor_test_interpretation),
      '{tensions}',
      TO_JSONB(ARRAY['1', '2', '3', '4', '5', '6'])
    )
  ),
  'too many tension entries are invalid'
);
SELECT ok(
  NOT public.is_valid_career_anchor_interpretation(
    JSONB_SET(
      (SELECT interpretation FROM career_anchor_test_interpretation),
      '{reflectionQuestions}',
      TO_JSONB(ARRAY['Una', 'Dos'])
    )
  ),
  'too few reflection questions are invalid'
);
SELECT ok(
  NOT public.is_valid_career_anchor_interpretation(
    JSONB_SET(
      (SELECT interpretation FROM career_anchor_test_interpretation),
      '{relevantServices,0}',
      (
        SELECT interpretation->'relevantServices'->0 || '{"extra":true}'::jsonb
        FROM career_anchor_test_interpretation
      )
    )
  ),
  'an extra nested service key violates the strict canonical shape'
);

SELECT lives_ok(
  $$SELECT public.save_career_anchor_progress(
    '11111111-1111-4111-8111-111111111111'::uuid,
    '{"1": 6}'::jsonb,
    '[]'::jsonb,
    1,
    1,
    'es',
    'prefer_not_to_say'
  )$$,
  'a valid partial response creates resumable progress'
);
SELECT is(
  (SELECT status FROM public.user_diagnostics WHERE user_id = '11111111-1111-4111-8111-111111111111'),
  'in_progress',
  'new journey is in progress'
);
SELECT is(
  (SELECT progress_revision FROM public.user_diagnostics WHERE user_id = '11111111-1111-4111-8111-111111111111'),
  1::bigint,
  'first progress revision is recorded'
);
SELECT is(
  (
    public.save_career_anchor_progress(
      '11111111-1111-4111-8111-111111111111'::uuid,
      '{"1": 2}'::jsonb,
      '[]'::jsonb,
      1,
      1,
      'es',
      'prefer_not_to_say'
    )
  )->>'accepted',
  'false',
  'a stale revision is rejected'
);
SELECT is(
  (SELECT raw_answers->'answers'->>'1' FROM public.user_diagnostics WHERE user_id = '11111111-1111-4111-8111-111111111111'),
  '6',
  'stale progress cannot overwrite an accepted answer'
);
SELECT lives_ok(
  $$SELECT public.save_career_anchor_progress(
    '11111111-1111-4111-8111-111111111111'::uuid,
    '{"2": 5}'::jsonb,
    '[]'::jsonb,
    2,
    2,
    'es',
    'exploring_direction'
  )$$,
  'the next revision is accepted'
);
SELECT is(
  (
    SELECT COUNT(*)
    FROM public.user_diagnostics AS diagnostic,
      jsonb_object_keys(diagnostic.raw_answers->'answers')
    WHERE diagnostic.user_id = '11111111-1111-4111-8111-111111111111'
  ),
  2::bigint,
  'accepted progress merges statement answers'
);
SELECT is(
  (SELECT current_statement FROM public.user_diagnostics WHERE user_id = '11111111-1111-4111-8111-111111111111'),
  2,
  'resume cursor follows the latest accepted revision'
);

SELECT throws_ok(
  $$SELECT public.finalize_career_anchor_diagnostic_with_internal_result_emails(
    '22222222-2222-4222-8222-222222222222'::uuid,
    (SELECT raw_answers FROM career_anchor_test_payload),
    '{"id":"technical","name":"Competencia Técnica/Funcional","score":31,"rank":1}'::jsonb,
    JSONB_SET((SELECT scores FROM career_anchor_test_scores), '{0,score}', '-1.5'::jsonb),
    (
      SELECT interpretation || '{"title":"Lectura base","mode":"fallback"}'::jsonb
      FROM career_anchor_test_interpretation
    ),
    'es',
    'exploring_direction',
    'schein-career-anchors-40-v1',
    'senda-career-anchor-score-v1'
  )$$,
  'P0001',
  'A complete eight-anchor score result is required',
  'a negative fractional score cannot finalize or poison its email jobs'
);
SELECT throws_ok(
  $$SELECT public.finalize_career_anchor_diagnostic_with_internal_result_emails(
    '22222222-2222-4222-8222-222222222222'::uuid,
    (SELECT raw_answers FROM career_anchor_test_payload),
    '{"id":"technical","name":"Competencia Técnica/Funcional","score":31,"rank":1}'::jsonb,
    JSONB_SET((SELECT scores FROM career_anchor_test_scores), '{0,mean}', '-0.1'::jsonb),
    (
      SELECT interpretation || '{"title":"Lectura base","mode":"fallback"}'::jsonb
      FROM career_anchor_test_interpretation
    ),
    'es',
    'exploring_direction',
    'schein-career-anchors-40-v1',
    'senda-career-anchor-score-v1'
  )$$,
  'P0001',
  'A complete eight-anchor score result is required',
  'a negative mean cannot finalize or poison its email jobs'
);
SELECT throws_ok(
  $$SELECT public.finalize_career_anchor_diagnostic_with_internal_result_emails(
    '22222222-2222-4222-8222-222222222222'::uuid,
    (SELECT raw_answers FROM career_anchor_test_payload),
    '{"id":"technical","name":"Competencia Técnica/Funcional","score":31,"rank":1}'::jsonb,
    (SELECT scores #- '{0,name}' FROM career_anchor_test_scores),
    (
      SELECT interpretation || '{"title":"Lectura base","mode":"fallback"}'::jsonb
      FROM career_anchor_test_interpretation
    ),
    'es',
    'exploring_direction',
    'schein-career-anchors-40-v1',
    'senda-career-anchor-score-v1'
  )$$,
  'P0001',
  'A complete eight-anchor score result is required',
  'a score item missing a strict required field cannot finalize'
);

SELECT lives_ok(
  $$SELECT public.finalize_career_anchor_diagnostic_with_internal_result_emails(
    '11111111-1111-4111-8111-111111111111'::uuid,
    (SELECT raw_answers FROM career_anchor_test_payload),
    '{"id":"technical","name":"Competencia Técnica/Funcional","score":31,"rank":1}'::jsonb,
    (SELECT scores FROM career_anchor_test_scores),
    (
      SELECT interpretation || '{"title":"Lectura base","mode":"fallback"}'::jsonb
      FROM career_anchor_test_interpretation
    ),
    'es',
    'exploring_direction',
    'schein-career-anchors-40-v1',
    'senda-career-anchor-score-v1'
  )$$,
  'a complete validated payload finalizes atomically'
);
SELECT is(
  (SELECT status FROM public.user_diagnostics WHERE user_id = '11111111-1111-4111-8111-111111111111'),
  'completed',
  'journey is completed'
);
SELECT ok(
  (SELECT ai_feedback IS NULL FROM public.user_diagnostics WHERE user_id = '11111111-1111-4111-8111-111111111111'),
  'finalization does not pretend fallback is an AI result'
);
SELECT ok(
  (SELECT result_base IS NOT NULL FROM public.user_diagnostics WHERE user_id = '11111111-1111-4111-8111-111111111111'),
  'deterministic fallback is durable'
);
SELECT ok(
  (SELECT completed_at IS NOT NULL FROM public.user_diagnostics WHERE user_id = '11111111-1111-4111-8111-111111111111'),
  'completion has an explicit timestamp'
);
SELECT is(
  public.finalize_career_anchor_diagnostic_with_internal_result_emails(
    '11111111-1111-4111-8111-111111111111'::uuid,
    (SELECT raw_answers FROM career_anchor_test_payload),
    '{"id":"technical","name":"Competencia Técnica/Funcional","score":31,"rank":1}'::jsonb,
    (SELECT scores FROM career_anchor_test_scores),
    (
      SELECT interpretation || '{"title":"Lectura base","mode":"fallback"}'::jsonb
      FROM career_anchor_test_interpretation
    ),
    'es',
    'exploring_direction',
    'schein-career-anchors-40-v1',
    'senda-career-anchor-score-v1'
  ),
  NULL::uuid,
  'a completed journey cannot be finalized twice'
);
SELECT is(
  (
    SELECT COUNT(*)
    FROM public.diagnostic_report_email_deliveries
    WHERE user_id = '11111111-1111-4111-8111-111111111111'
  ),
  3::bigint,
  'one completion queues three durable email deliveries total'
);
SELECT is(
  (
    SELECT COUNT(*)
    FROM public.diagnostic_report_email_deliveries
    WHERE user_id = '11111111-1111-4111-8111-111111111111'
      AND email_kind IN (
        'career_anchor_internal_hola_v1',
        'career_anchor_internal_tanisardella_v1'
      )
  ),
  2::bigint,
  'the two internal recipients have independent durable deliveries'
);
SELECT ok(
  (
    SELECT NOT (COALESCE(user_data, '{}'::jsonb) ? 'resultEmailConsent')
    FROM public.user_diagnostics
    WHERE user_id = '11111111-1111-4111-8111-111111111111'
  ),
  'internal result emails do not create participant consent metadata'
);
SELECT is(
  (
    public.save_career_anchor_progress(
      '11111111-1111-4111-8111-111111111111'::uuid,
      '{"3": 4}'::jsonb,
      '[]'::jsonb,
      3,
      3,
      'es',
      'exploring_direction'
    )
  )->>'status',
  'completed',
  'completed journeys are immutable to progress saves'
);
SELECT is(
  (
    SELECT COUNT(*)
    FROM public.user_diagnostics AS diagnostic,
      jsonb_object_keys(diagnostic.raw_answers->'answers')
    WHERE diagnostic.user_id = '11111111-1111-4111-8111-111111111111'
  ),
  40::bigint,
  'the completed answer set remains intact'
);

CREATE TEMP TABLE career_anchor_claim_a AS
SELECT public.claim_career_anchor_interpretation(
  '11111111-1111-4111-8111-111111111111'::uuid
) AS payload;

SELECT is(
  (SELECT payload->>'status' FROM career_anchor_claim_a),
  'claimed',
  'the first worker claims the interpretation lease'
);
SELECT matches(
  (SELECT payload->>'claimToken' FROM career_anchor_claim_a),
  '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
  'a claim returns a UUID fencing token'
);
SELECT ok(
  (
    SELECT interpretation_started_at IS NOT NULL
    FROM public.user_diagnostics
    WHERE user_id = '11111111-1111-4111-8111-111111111111'
  ),
  'claiming records the interpretation lease timestamp'
);
SELECT is(
  (
    SELECT interpretation_claim_token
    FROM public.user_diagnostics
    WHERE user_id = '11111111-1111-4111-8111-111111111111'
  ),
  (SELECT (payload->>'claimToken')::uuid FROM career_anchor_claim_a),
  'the returned fencing token is stored with the lease'
);
SELECT is(
  (public.claim_career_anchor_interpretation(
    '11111111-1111-4111-8111-111111111111'::uuid
  ))->>'status',
  'processing',
  'a concurrent worker cannot claim an active lease'
);

SELECT throws_ok(
  $$SELECT public.save_career_anchor_interpretation(
    '11111111-1111-4111-8111-111111111111'::uuid,
    (SELECT (payload->>'claimToken')::uuid FROM career_anchor_claim_a),
    '{"mode":"ai"}'::jsonb
  )$$,
  'P0001',
  'Invalid interpretation',
  'an incomplete interpretation cannot become canonical'
);

UPDATE public.user_diagnostics
SET interpretation_started_at = TIMEZONE('utc', NOW()) - INTERVAL '3 minutes'
WHERE user_id = '11111111-1111-4111-8111-111111111111';

CREATE TEMP TABLE career_anchor_claim_b AS
SELECT public.claim_career_anchor_interpretation(
  '11111111-1111-4111-8111-111111111111'::uuid
) AS payload;

SELECT is(
  (SELECT payload->>'status' FROM career_anchor_claim_b),
  'claimed',
  'an expired lease can be claimed by a new worker'
);
SELECT isnt(
  (SELECT payload->>'claimToken' FROM career_anchor_claim_b),
  (SELECT payload->>'claimToken' FROM career_anchor_claim_a),
  'a reclaimed lease rotates the fencing token'
);
SELECT is(
  public.save_career_anchor_interpretation(
    '11111111-1111-4111-8111-111111111111'::uuid,
    (SELECT (payload->>'claimToken')::uuid FROM career_anchor_claim_a),
    (
      SELECT interpretation || '{"mode":"fallback","title":"Fallback vencido"}'::jsonb
      FROM career_anchor_test_interpretation
    )
  ),
  NULL::jsonb,
  'an expired worker cannot save after the lease is reclaimed'
);
SELECT is(
  (
    SELECT interpretation_claim_token
    FROM public.user_diagnostics
    WHERE user_id = '11111111-1111-4111-8111-111111111111'
  ),
  (SELECT (payload->>'claimToken')::uuid FROM career_anchor_claim_b),
  'a stale save cannot clear or replace the current fencing token'
);
SELECT is(
  (public.save_career_anchor_interpretation(
    '11111111-1111-4111-8111-111111111111'::uuid,
    (SELECT (payload->>'claimToken')::uuid FROM career_anchor_claim_b),
    (SELECT interpretation FROM career_anchor_test_interpretation)
  ))->>'title',
  'IA canónica',
  'saving returns the canonical interpretation'
);
SELECT is(
  (SELECT result_ai->>'mode' FROM public.user_diagnostics WHERE user_id = '11111111-1111-4111-8111-111111111111'),
  'ai',
  'AI interpretation is canonical'
);
SELECT ok(
  (
    SELECT interpretation_started_at IS NULL
    FROM public.user_diagnostics
    WHERE user_id = '11111111-1111-4111-8111-111111111111'
  ),
  'saving clears the interpretation lease'
);
SELECT ok(
  (
    SELECT interpretation_claim_token IS NULL
    FROM public.user_diagnostics
    WHERE user_id = '11111111-1111-4111-8111-111111111111'
  ),
  'saving clears the interpretation fencing token'
);
SELECT is(
  (public.claim_career_anchor_interpretation(
    '11111111-1111-4111-8111-111111111111'::uuid
  ))->>'status',
  'ready',
  'a canonical interpretation is returned without a new lease'
);
SELECT is(
  (public.claim_career_anchor_interpretation(
    '11111111-1111-4111-8111-111111111111'::uuid
  ))->'interpretation'->>'title',
  'IA canónica',
  'the ready claim includes the canonical interpretation'
);
SELECT is(
  (public.save_career_anchor_interpretation(
    '11111111-1111-4111-8111-111111111111'::uuid,
    (SELECT (payload->>'claimToken')::uuid FROM career_anchor_claim_a),
    (
      SELECT interpretation || '{"mode":"fallback","title":"No sobrescribir"}'::jsonb
      FROM career_anchor_test_interpretation
    )
  ))->>'title',
  'IA canónica',
  'a losing writer receives the existing canonical interpretation'
);
SELECT is(
  (SELECT result_ai->>'title' FROM public.user_diagnostics WHERE user_id = '11111111-1111-4111-8111-111111111111'),
  'IA canónica',
  'fallback never overwrites an AI result'
);
SELECT is(
  (SELECT ai_feedback->>'title' FROM public.user_diagnostics WHERE user_id = '11111111-1111-4111-8111-111111111111'),
  'IA canónica',
  'the visible durable interpretation remains canonical'
);

SELECT set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  TRUE
);
SET LOCAL ROLE authenticated;
SELECT is(
  (SELECT COUNT(*) FROM public.user_diagnostics),
  1::bigint,
  'user A can read their own result'
);
RESET ROLE;

SELECT set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}',
  TRUE
);
SET LOCAL ROLE authenticated;
SELECT is(
  (SELECT COUNT(*) FROM public.user_diagnostics),
  0::bigint,
  'user B cannot read user A result'
);
RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
