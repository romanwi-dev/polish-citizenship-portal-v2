-- PHASE A: Critical Fixes - Database Support
-- Create table to track PDF cleanup jobs

CREATE TABLE IF NOT EXISTS public.pdf_cleanup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_scanned INTEGER NOT NULL DEFAULT 0,
  deleted_old INTEGER NOT NULL DEFAULT 0,
  deleted_duplicates INTEGER NOT NULL DEFAULT 0,
  kept_locked INTEGER NOT NULL DEFAULT 0,
  errors INTEGER NOT NULL DEFAULT 0,
  bytes_freed BIGINT NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL,
  cleanup_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for querying recent cleanups
CREATE INDEX IF NOT EXISTS idx_pdf_cleanup_logs_date 
ON public.pdf_cleanup_logs(cleanup_date DESC);

-- Enable RLS
ALTER TABLE public.pdf_cleanup_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can view cleanup logs"
ON public.pdf_cleanup_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add comment
COMMENT ON TABLE public.pdf_cleanup_logs IS 'Tracks PDF cleanup job execution and metrics for monitoring storage usage';

-- Create function to get cleanup statistics
CREATE OR REPLACE FUNCTION public.get_cleanup_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE(
  total_cleanups BIGINT,
  total_files_deleted BIGINT,
  total_bytes_freed BIGINT,
  avg_duration_ms NUMERIC,
  last_cleanup TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*)::BIGINT as total_cleanups,
    SUM(deleted_old + deleted_duplicates)::BIGINT as total_files_deleted,
    SUM(bytes_freed)::BIGINT as total_bytes_freed,
    ROUND(AVG(duration_ms)::NUMERIC, 2) as avg_duration_ms,
    MAX(cleanup_date) as last_cleanup
  FROM public.pdf_cleanup_logs
  WHERE cleanup_date >= NOW() - (days_back || ' days')::INTERVAL;
$$;