-- Create crash_reports table for error boundary telemetry
CREATE TABLE IF NOT EXISTS public.crash_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component_stack TEXT,
  user_agent TEXT,
  user_id UUID REFERENCES auth.users(id),
  case_id UUID REFERENCES public.cases(id),
  url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create edge_function_logs table for monitoring
CREATE TABLE IF NOT EXISTS public.edge_function_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('start', 'success', 'error')),
  duration_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crash_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edge_function_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crash_reports
CREATE POLICY "Users can insert their own crash reports"
ON public.crash_reports
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all crash reports"
ON public.crash_reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- RLS Policies for edge_function_logs
CREATE POLICY "Edge functions can insert logs"
ON public.edge_function_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all edge function logs"
ON public.edge_function_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Create indexes for performance
CREATE INDEX idx_crash_reports_timestamp ON public.crash_reports(timestamp DESC);
CREATE INDEX idx_crash_reports_user_id ON public.crash_reports(user_id);
CREATE INDEX idx_edge_function_logs_timestamp ON public.edge_function_logs(timestamp DESC);
CREATE INDEX idx_edge_function_logs_function_name ON public.edge_function_logs(function_name);
CREATE INDEX idx_edge_function_logs_status ON public.edge_function_logs(status);