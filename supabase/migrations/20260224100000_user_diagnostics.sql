-- Migration: Create user_diagnostics table
CREATE TABLE IF NOT EXISTS public.user_diagnostics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    diagnostic_type TEXT NOT NULL, -- Ej: 'career_anchor'
    user_data JSONB NOT NULL, -- Demografia: edad, ocupación, origen
    raw_answers JSONB NOT NULL, -- Las 40 respuestas y bonus
    dominant_result JSONB NOT NULL, -- El ancla predominante
    ai_feedback JSONB, -- La devolución de Vercel AI SDK
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.user_diagnostics ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad: Los usuarios solo pueden ver e insertar sus propios diagnósticos
CREATE POLICY "Users can insert their own diagnostics" 
ON public.user_diagnostics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own diagnostics" 
ON public.user_diagnostics FOR SELECT 
USING (auth.uid() = user_id);
