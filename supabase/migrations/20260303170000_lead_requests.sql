-- Migration: unified lead capture table (contact, newsletter, therapy)
CREATE TABLE IF NOT EXISTS public.lead_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    lead_type TEXT NOT NULL CHECK (lead_type IN ('contact', 'newsletter', 'therapy')),
    full_name TEXT,
    email TEXT NOT NULL,
    reason TEXT,
    message TEXT,
    source_page TEXT,
    locale TEXT DEFAULT 'es',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.lead_requests ENABLE ROW LEVEL SECURITY;

-- Allows inserts from public site through API route using anon/auth sessions.
CREATE POLICY "Public can insert lead requests"
ON public.lead_requests
FOR INSERT
WITH CHECK (true);

-- Users can view only their own lead requests (if authenticated).
CREATE POLICY "Users can view their own lead requests"
ON public.lead_requests
FOR SELECT
USING (auth.uid() = user_id);