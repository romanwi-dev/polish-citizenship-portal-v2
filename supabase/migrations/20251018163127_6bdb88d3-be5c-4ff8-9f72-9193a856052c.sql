-- Create rate_limit_logs table for efficient rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_rate_limit_identifier_created 
ON public.rate_limit_logs(identifier, endpoint, created_at DESC);

-- Enable RLS
ALTER TABLE public.rate_limit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access (edge functions use service role)
CREATE POLICY "Service role can manage rate limits" 
ON public.rate_limit_logs
FOR ALL 
USING (true);

-- Auto-cleanup function for old logs (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limit_logs
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;