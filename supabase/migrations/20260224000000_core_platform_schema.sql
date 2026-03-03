-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Perfiles de Usuarios (Extiende auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  country_code TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Row Level Security para Perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios pueden ver su propio perfil" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Definición de Diagnósticos (Catálogo de tests)
CREATE TABLE public.diagnostics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Catálogo de Diagnósticos
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cualquiera puede ver diagnósticos activos" ON public.diagnostics FOR SELECT USING (is_active = true);

-- 3. Sesiones de Diagnóstico del Usuario
CREATE TABLE public.diagnostic_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  diagnostic_id UUID REFERENCES public.diagnostics(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  raw_answers JSONB DEFAULT '{}'::jsonb, -- Almacena opciones elegidas dinámicamente
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Sesiones de Diagnóstico
ALTER TABLE public.diagnostic_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios pueden ver sus propias sesiones" ON public.diagnostic_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden insertar sus propias sesiones" ON public.diagnostic_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden actualizar sus propias sesiones" ON public.diagnostic_sessions FOR UPDATE USING (auth.uid() = user_id);

-- 4. Resultados Analizados de Diagnósticos
CREATE TABLE public.diagnostic_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.diagnostic_sessions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  result_data JSONB NOT NULL, -- El JSON resultante (Ej: ancla predominante, puntajes)
  ai_feedback_summary TEXT, -- Feedback generado por LLM a través de Vercel AI SDK
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Resultados
ALTER TABLE public.diagnostic_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios pueden ver sus propios resultados" ON public.diagnostic_results FOR SELECT USING (auth.uid() = user_id);

-- 5. Aplicaciones (Para agendamiento 1:1)
CREATE TABLE public.applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'booked')),
  answers JSONB NOT NULL, -- Respuestas del formulario de aplicación
  ai_pre_analysis JSONB, -- Análisis previo de perfil hecho por Agente AI
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Aplicaciones
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios pueden ver sus propias aplicaciones" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden enviar sus propias aplicaciones" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger Automático para creación de perfiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Types gen setup script for Supabase CLI (Reference command only)
-- supabase gen types typescript --local > types/supabase.ts
