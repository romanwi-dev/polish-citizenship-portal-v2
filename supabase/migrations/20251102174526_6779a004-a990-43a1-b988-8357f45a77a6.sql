-- Create performance monitoring table
CREATE TABLE IF NOT EXISTS public.performance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL CHECK (metric_type IN ('cls', 'fcp', 'lcp', 'fid', 'ttfb', 'inp')),
  value integer NOT NULL,
  page text NOT NULL,
  user_agent text,
  connection_type text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.performance_logs ENABLE ROW LEVEL SECURITY;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_perf_logs_metric ON public.performance_logs(metric_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_perf_logs_page ON public.performance_logs(page, created_at DESC);

-- Policy: Anyone can insert performance logs (anonymous monitoring)
CREATE POLICY "Anyone can insert performance logs"
ON public.performance_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Only admins can read performance logs
CREATE POLICY "Admins can read performance logs"
ON public.performance_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);