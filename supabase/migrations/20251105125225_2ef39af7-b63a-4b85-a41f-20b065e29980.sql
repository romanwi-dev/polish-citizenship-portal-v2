-- Edge Function Health Monitoring Tables

-- Table to store health check results
CREATE TABLE IF NOT EXISTS public.edge_function_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  overall_status TEXT NOT NULL CHECK (overall_status IN ('healthy', 'degraded', 'critical')),
  total_functions INTEGER NOT NULL,
  healthy_count INTEGER NOT NULL,
  degraded_count INTEGER NOT NULL,
  down_count INTEGER NOT NULL,
  health_report JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table to store healing actions
CREATE TABLE IF NOT EXISTS public.edge_function_healing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  healing_action TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('success', 'failed')),
  details TEXT,
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_check_timestamp ON public.edge_function_health(check_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_health_status ON public.edge_function_health(overall_status);
CREATE INDEX IF NOT EXISTS idx_healing_log_function ON public.edge_function_healing_log(function_name);
CREATE INDEX IF NOT EXISTS idx_healing_log_timestamp ON public.edge_function_healing_log(performed_at DESC);

-- RLS Policies (admin only)
ALTER TABLE public.edge_function_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edge_function_healing_log ENABLE ROW LEVEL SECURITY;

-- Admin can view all health data
CREATE POLICY "Admins can view health data"
ON public.edge_function_health
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can view healing log"
ON public.edge_function_healing_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
);

-- Service role can insert (for edge functions)
CREATE POLICY "Service can insert health data"
ON public.edge_function_health
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service can insert healing log"
ON public.edge_function_healing_log
FOR INSERT
WITH CHECK (true);

-- Clean up old health data (keep last 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_health_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.edge_function_health
  WHERE check_timestamp < NOW() - INTERVAL '7 days';
  
  DELETE FROM public.edge_function_healing_log
  WHERE performed_at < NOW() - INTERVAL '7 days';
END;
$$;