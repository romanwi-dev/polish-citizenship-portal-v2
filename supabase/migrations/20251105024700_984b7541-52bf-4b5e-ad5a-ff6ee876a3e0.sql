-- Create verification_runs table to track all automated verifications
CREATE TABLE IF NOT EXISTS public.verification_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Trigger information
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('github_push', 'scheduled', 'manual')),
  trigger_metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Git information
  commit_sha TEXT,
  branch TEXT,
  author TEXT,
  commit_message TEXT,
  changed_files TEXT[],
  
  -- Verification scope
  verification_scope TEXT NOT NULL CHECK (verification_scope IN ('workflow', 'full_portal', 'forms', 'security', 'custom')),
  files_analyzed INTEGER DEFAULT 0,
  
  -- Results
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'timeout')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Model results
  gpt5_result JSONB,
  gpt5_score INTEGER,
  gpt5_status TEXT CHECK (gpt5_status IN ('pending', 'success', 'failed')),
  
  gemini_result JSONB,
  gemini_score INTEGER,
  gemini_status TEXT CHECK (gemini_status IN ('pending', 'success', 'failed')),
  
  claude_result JSONB,
  claude_score INTEGER,
  claude_status TEXT CHECK (claude_status IN ('pending', 'success', 'failed')),
  
  -- Consensus
  consensus_level TEXT CHECK (consensus_level IN ('HIGH', 'MEDIUM', 'LOW', 'CRITICAL')),
  average_score INTEGER,
  successful_models INTEGER DEFAULT 0,
  total_models INTEGER DEFAULT 3,
  
  -- Critical findings aggregated
  total_blockers INTEGER DEFAULT 0,
  critical_findings JSONB DEFAULT '[]'::jsonb,
  action_items JSONB DEFAULT '[]'::jsonb,
  
  -- Error tracking
  error_message TEXT,
  error_details JSONB
);

-- Create index for querying by trigger type and status
CREATE INDEX idx_verification_runs_trigger_status ON public.verification_runs(trigger_type, status, created_at DESC);
CREATE INDEX idx_verification_runs_scope ON public.verification_runs(verification_scope, created_at DESC);
CREATE INDEX idx_verification_runs_commit ON public.verification_runs(commit_sha);
CREATE INDEX idx_verification_runs_branch ON public.verification_runs(branch, created_at DESC);

-- Create verification_alerts table for issues that need attention
CREATE TABLE IF NOT EXISTS public.verification_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  
  verification_run_id UUID REFERENCES public.verification_runs(id) ON DELETE CASCADE,
  
  alert_type TEXT NOT NULL CHECK (alert_type IN ('score_drop', 'new_blocker', 'consensus_low', 'verification_failed')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'ignored')),
  acknowledged_by TEXT,
  resolved_by TEXT,
  resolution_notes TEXT
);

CREATE INDEX idx_verification_alerts_status ON public.verification_alerts(status, severity, created_at DESC);
CREATE INDEX idx_verification_alerts_run ON public.verification_alerts(verification_run_id);

-- Create verification_trends table for tracking improvements/regressions
CREATE TABLE IF NOT EXISTS public.verification_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  verification_scope TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  
  -- Comparison to previous
  previous_value NUMERIC,
  change_percent NUMERIC,
  trend TEXT CHECK (trend IN ('improving', 'declining', 'stable')),
  
  verification_run_id UUID REFERENCES public.verification_runs(id) ON DELETE CASCADE
);

CREATE INDEX idx_verification_trends_scope_metric ON public.verification_trends(verification_scope, metric_name, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.verification_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_trends ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for authenticated users - adjust as needed)
CREATE POLICY "Allow all operations for authenticated users"
  ON public.verification_runs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users"
  ON public.verification_alerts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users"
  ON public.verification_trends
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to calculate trends
CREATE OR REPLACE FUNCTION calculate_verification_trend(
  p_verification_run_id UUID,
  p_scope TEXT,
  p_metric_name TEXT,
  p_current_value NUMERIC
) RETURNS void AS $$
DECLARE
  v_previous_value NUMERIC;
  v_change_percent NUMERIC;
  v_trend TEXT;
BEGIN
  -- Get previous value
  SELECT metric_value INTO v_previous_value
  FROM verification_trends
  WHERE verification_scope = p_scope
    AND metric_name = p_metric_name
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_previous_value IS NOT NULL THEN
    v_change_percent := ((p_current_value - v_previous_value) / v_previous_value) * 100;
    
    IF v_change_percent > 5 THEN
      v_trend := 'improving';
    ELSIF v_change_percent < -5 THEN
      v_trend := 'declining';
    ELSE
      v_trend := 'stable';
    END IF;
  ELSE
    v_change_percent := NULL;
    v_trend := 'stable';
  END IF;
  
  INSERT INTO verification_trends (
    verification_run_id,
    verification_scope,
    metric_name,
    metric_value,
    previous_value,
    change_percent,
    trend
  ) VALUES (
    p_verification_run_id,
    p_scope,
    p_metric_name,
    p_current_value,
    v_previous_value,
    v_change_percent,
    v_trend
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create alerts
CREATE OR REPLACE FUNCTION create_verification_alert(
  p_verification_run_id UUID,
  p_alert_type TEXT,
  p_severity TEXT,
  p_title TEXT,
  p_description TEXT,
  p_details JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_alert_id UUID;
BEGIN
  INSERT INTO verification_alerts (
    verification_run_id,
    alert_type,
    severity,
    title,
    description,
    details
  ) VALUES (
    p_verification_run_id,
    p_alert_type,
    p_severity,
    p_title,
    p_description,
    p_details
  ) RETURNING id INTO v_alert_id;
  
  RETURN v_alert_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_verification_runs_updated_at
  BEFORE UPDATE ON public.verification_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();