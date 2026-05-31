-- Require authenticated users for diagnostics and store richer Google profile metadata.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS auth_provider TEXT;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  metadata JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  app_metadata JSONB := COALESCE(NEW.raw_app_meta_data, '{}'::jsonb);
  derived_full_name TEXT := NULLIF(TRIM(COALESCE(
    metadata->>'full_name',
    metadata->>'name',
    CONCAT_WS(' ', metadata->>'first_name', metadata->>'last_name')
  )), '');
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    email,
    full_name,
    avatar_url,
    auth_provider,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(metadata->>'first_name', NULLIF(SPLIT_PART(COALESCE(derived_full_name, ''), ' ', 1), '')),
    metadata->>'last_name',
    NEW.email,
    derived_full_name,
    metadata->>'avatar_url',
    COALESCE(metadata->>'provider', app_metadata->>'provider', 'google'),
    TIMEZONE('utc'::text, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    auth_provider = COALESCE(EXCLUDED.auth_provider, public.profiles.auth_provider),
    updated_at = TIMEZONE('utc'::text, NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

UPDATE public.profiles profile
SET
  email = COALESCE(profile.email, auth_user.email),
  full_name = COALESCE(
    profile.full_name,
    NULLIF(TRIM(COALESCE(
      auth_user.raw_user_meta_data->>'full_name',
      auth_user.raw_user_meta_data->>'name',
      CONCAT_WS(' ', auth_user.raw_user_meta_data->>'first_name', auth_user.raw_user_meta_data->>'last_name')
    )), '')
  ),
  avatar_url = COALESCE(profile.avatar_url, auth_user.raw_user_meta_data->>'avatar_url'),
  auth_provider = COALESCE(
    profile.auth_provider,
    auth_user.raw_user_meta_data->>'provider',
    auth_user.raw_app_meta_data->>'provider',
    'google'
  ),
  updated_at = TIMEZONE('utc'::text, NOW())
FROM auth.users auth_user
WHERE profile.id = auth_user.id;

DELETE FROM public.user_diagnostics WHERE user_id IS NULL;

ALTER TABLE public.user_diagnostics
  ALTER COLUMN user_id SET NOT NULL;

DROP POLICY IF EXISTS "Users can insert their own diagnostics" ON public.user_diagnostics;
DROP POLICY IF EXISTS "Users can view their own diagnostics" ON public.user_diagnostics;

CREATE POLICY "Users can insert their own diagnostics"
ON public.user_diagnostics
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own diagnostics"
ON public.user_diagnostics
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS user_diagnostics_user_created_idx
ON public.user_diagnostics (user_id, created_at DESC);
