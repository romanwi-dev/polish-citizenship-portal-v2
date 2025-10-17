-- Security Audit Logging System
-- Tracks all security-relevant events for monitoring and compliance

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  resource_type TEXT,
  resource_id UUID,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  success BOOLEAN DEFAULT true,
  error_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_security_audit_logs_event_type ON public.security_audit_logs(event_type);
CREATE INDEX idx_security_audit_logs_severity ON public.security_audit_logs(severity);
CREATE INDEX idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX idx_security_audit_logs_created_at ON public.security_audit_logs(created_at DESC);
CREATE INDEX idx_security_audit_logs_resource ON public.security_audit_logs(resource_type, resource_id);

-- Enable RLS
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view security audit logs"
ON public.security_audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- System can insert audit logs
CREATE POLICY "System can insert security audit logs"
ON public.security_audit_logs
FOR INSERT
WITH CHECK (true);

-- Create security metrics table for monitoring
CREATE TABLE IF NOT EXISTS public.security_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_value INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_security_metrics_type ON public.security_metrics(metric_type);
CREATE INDEX idx_security_metrics_recorded_at ON public.security_metrics(recorded_at DESC);

-- Enable RLS
ALTER TABLE public.security_metrics ENABLE ROW LEVEL SECURITY;

-- Only admins can view metrics
CREATE POLICY "Only admins can view security metrics"
ON public.security_metrics
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- System can insert metrics
CREATE POLICY "System can insert security metrics"
ON public.security_metrics
FOR INSERT
WITH CHECK (true);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_severity TEXT,
  p_action TEXT,
  p_user_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_success BOOLEAN DEFAULT true,
  p_error_code TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_audit_logs (
    event_type,
    severity,
    user_id,
    ip_address,
    user_agent,
    resource_type,
    resource_id,
    action,
    details,
    success,
    error_code
  ) VALUES (
    p_event_type,
    p_severity,
    p_action,
    p_user_id,
    p_ip_address,
    p_user_agent,
    p_resource_type,
    p_resource_id,
    p_details,
    p_success,
    p_error_code
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create function to record security metrics
CREATE OR REPLACE FUNCTION public.record_security_metric(
  p_metric_type TEXT,
  p_metric_value INTEGER,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO public.security_metrics (
    metric_type,
    metric_value,
    metadata
  ) VALUES (
    p_metric_type,
    p_metric_value,
    p_metadata
  )
  RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$;