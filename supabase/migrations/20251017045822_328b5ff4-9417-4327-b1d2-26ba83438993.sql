-- Security Scan Results Storage
-- Tracks all security audit executions with detailed findings

CREATE TABLE IF NOT EXISTS public.security_scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  critical_issues INTEGER NOT NULL DEFAULT 0,
  high_issues INTEGER NOT NULL DEFAULT 0,
  medium_issues INTEGER NOT NULL DEFAULT 0,
  low_issues INTEGER NOT NULL DEFAULT 0,
  info_issues INTEGER NOT NULL DEFAULT 0,
  scan_duration_ms INTEGER NOT NULL,
  results JSONB NOT NULL DEFAULT '{}',
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_security_scans_date ON public.security_scan_results(scan_date DESC);
CREATE INDEX idx_security_scans_score ON public.security_scan_results(overall_score);

-- Enable RLS
ALTER TABLE public.security_scan_results ENABLE ROW LEVEL SECURITY;

-- Only admins can view security scan results
CREATE POLICY "Only admins can view security scans"
ON public.security_scan_results
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert security scan results
CREATE POLICY "Only admins can create security scans"
ON public.security_scan_results
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));