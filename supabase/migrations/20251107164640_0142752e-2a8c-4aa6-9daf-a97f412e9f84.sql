-- Phase 3D: Security Hardening

-- Fix mutable search_path in functions
ALTER FUNCTION cleanup_old_pdf_queue_jobs()
SET search_path = public, pg_temp;

ALTER FUNCTION reset_stuck_pdf_jobs()
SET search_path = public, pg_temp;

-- Create rate limiting tracking table
CREATE TABLE IF NOT EXISTS public.pdf_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.pdf_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage rate limits
CREATE POLICY "Service role can manage rate limits"
ON public.pdf_rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_pdf_rate_limits_case_window 
ON public.pdf_rate_limits(case_id, window_start DESC);

-- Cleanup function for old rate limit entries (keep last 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM pdf_rate_limits
  WHERE window_start < now() - interval '24 hours';
END;
$$;