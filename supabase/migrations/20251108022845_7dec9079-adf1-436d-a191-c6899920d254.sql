-- Create phase_a_analyses table
CREATE TABLE IF NOT EXISTS public.phase_a_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  proposed_changes TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  analysis_result JSONB DEFAULT '{}'::jsonb,
  total_issues INTEGER DEFAULT 0,
  critical_issues JSONB DEFAULT '[]'::jsonb,
  warnings JSONB DEFAULT '[]'::jsonb,
  root_cause TEXT,
  proposed_solution TEXT,
  dependencies JSONB DEFAULT '[]'::jsonb,
  edge_cases JSONB DEFAULT '[]'::jsonb,
  rollback_plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create phase_b_verifications table
CREATE TABLE IF NOT EXISTS public.phase_b_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_a_id UUID REFERENCES public.phase_a_analyses(id) ON DELETE CASCADE,
  passed BOOLEAN DEFAULT false,
  overall_score NUMERIC,
  confidence NUMERIC,
  score_variance NUMERIC,
  consensus TEXT,
  models JSONB DEFAULT '{}'::jsonb,
  aggregated_findings JSONB DEFAULT '{}'::jsonb,
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create phase_ex_executions table
CREATE TABLE IF NOT EXISTS public.phase_ex_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_a_id UUID REFERENCES public.phase_a_analyses(id) ON DELETE CASCADE,
  phase_b_id UUID REFERENCES public.phase_b_verifications(id) ON DELETE CASCADE,
  success BOOLEAN DEFAULT false,
  changes_applied JSONB DEFAULT '{}'::jsonb,
  execution_duration_ms INTEGER,
  errors JSONB DEFAULT '[]'::jsonb,
  executed_by UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.phase_a_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phase_b_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phase_ex_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for phase_a_analyses
CREATE POLICY "System can insert phase_a_analyses"
  ON public.phase_a_analyses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view phase_a_analyses"
  ON public.phase_a_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'assistant')
    )
  );

-- RLS Policies for phase_b_verifications
CREATE POLICY "System can insert phase_b_verifications"
  ON public.phase_b_verifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view phase_b_verifications"
  ON public.phase_b_verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'assistant')
    )
  );

-- RLS Policies for phase_ex_executions
CREATE POLICY "System can insert phase_ex_executions"
  ON public.phase_ex_executions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can view phase_ex_executions"
  ON public.phase_ex_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'assistant')
    )
  );