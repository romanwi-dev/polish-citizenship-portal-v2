-- Create table for Phase A/B verification results persistence
CREATE TABLE IF NOT EXISTS public.verification_phase_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  verification_run_id UUID,
  
  -- Phase A data
  phase_a_completed BOOLEAN DEFAULT false,
  phase_a_completed_at TIMESTAMP WITH TIME ZONE,
  phase_a_issues JSONB DEFAULT '[]'::jsonb,
  phase_a_files_analyzed JSONB DEFAULT '[]'::jsonb,
  
  -- Phase B data
  phase_b_completed BOOLEAN DEFAULT false,
  phase_b_completed_at TIMESTAMP WITH TIME ZONE,
  phase_b_score INTEGER,
  phase_b_all_models_100 BOOLEAN DEFAULT false,
  phase_b_response JSONB,
  
  -- Phase EX data
  phase_ex_authorized BOOLEAN DEFAULT false,
  phase_ex_authorized_at TIMESTAMP WITH TIME ZONE,
  phase_ex_completed BOOLEAN DEFAULT false,
  phase_ex_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  workflow_type TEXT NOT NULL,
  focus_areas TEXT[],
  models_used TEXT[],
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for efficient queries
CREATE INDEX idx_verification_phase_results_case_id ON public.verification_phase_results(case_id);
CREATE INDEX idx_verification_phase_results_run_id ON public.verification_phase_results(verification_run_id);
CREATE INDEX idx_verification_phase_results_workflow_type ON public.verification_phase_results(workflow_type);
CREATE INDEX idx_verification_phase_results_created_at ON public.verification_phase_results(created_at DESC);
CREATE INDEX idx_verification_phase_results_phase_b_score ON public.verification_phase_results(phase_b_score DESC);

-- Enable RLS
ALTER TABLE public.verification_phase_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all verification results"
  ON public.verification_phase_results
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create verification results"
  ON public.verification_phase_results
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update verification results"
  ON public.verification_phase_results
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_verification_phase_results_updated_at
  BEFORE UPDATE ON public.verification_phase_results
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to get latest verification for a case
CREATE OR REPLACE FUNCTION public.get_latest_verification_for_case(p_case_id UUID)
RETURNS public.verification_phase_results
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT *
  FROM public.verification_phase_results
  WHERE case_id = p_case_id
  ORDER BY created_at DESC
  LIMIT 1;
$$;

-- Function to get verification history for workflow type
CREATE OR REPLACE FUNCTION public.get_verification_history(
  p_workflow_type TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  case_id UUID,
  workflow_type TEXT,
  phase_a_completed BOOLEAN,
  phase_b_completed BOOLEAN,
  phase_b_score INTEGER,
  phase_b_all_models_100 BOOLEAN,
  phase_ex_authorized BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  case_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    vpr.id,
    vpr.case_id,
    vpr.workflow_type,
    vpr.phase_a_completed,
    vpr.phase_b_completed,
    vpr.phase_b_score,
    vpr.phase_b_all_models_100,
    vpr.phase_ex_authorized,
    vpr.created_at,
    c.client_name as case_name
  FROM public.verification_phase_results vpr
  LEFT JOIN public.cases c ON c.id = vpr.case_id
  WHERE (p_workflow_type IS NULL OR vpr.workflow_type = p_workflow_type)
    AND public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY vpr.created_at DESC
  LIMIT p_limit;
$$;

COMMENT ON TABLE public.verification_phase_results IS 'Stores Phase A/B/EX verification results for A→B→EX protocol with full persistence';
COMMENT ON COLUMN public.verification_phase_results.phase_a_issues IS 'JSONB array of issues found in Phase A';
COMMENT ON COLUMN public.verification_phase_results.phase_b_response IS 'Full multi-model verification response from Phase B';
COMMENT ON COLUMN public.verification_phase_results.phase_b_all_models_100 IS 'True only if ALL 3 models scored 100/100';