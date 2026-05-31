-- Lock down direct lead insertion from anon/auth clients.
-- Lead intake must go through backend route protections (captcha + rate limit).

DROP POLICY IF EXISTS "Public can insert lead requests" ON public.lead_requests;
