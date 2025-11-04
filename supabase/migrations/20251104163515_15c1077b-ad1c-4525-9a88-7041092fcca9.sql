-- Create ai_verification_results table for Stage 6 verification
CREATE TABLE IF NOT EXISTS public.ai_verification_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL CHECK (form_type IN ('intake', 'oby', 'master')),
  
  -- OpenAI Results
  openai_is_valid BOOLEAN,
  openai_confidence NUMERIC(5,2),
  openai_issues JSONB DEFAULT '[]'::jsonb,
  openai_suggestions JSONB DEFAULT '[]'::jsonb,
  openai_completeness NUMERIC(5,2),
  openai_raw_response JSONB,
  
  -- Gemini Results (via Lovable AI)
  gemini_is_valid BOOLEAN,
  gemini_confidence NUMERIC(5,2),
  gemini_issues JSONB DEFAULT '[]'::jsonb,
  gemini_suggestions JSONB DEFAULT '[]'::jsonb,
  gemini_completeness NUMERIC(5,2),
  gemini_raw_response JSONB,
  
  -- Consensus Analysis
  consensus_valid BOOLEAN,
  consensus_confidence NUMERIC(5,2),
  disagreements JSONB DEFAULT '[]'::jsonb,
  
  -- HAC Review
  hac_approved BOOLEAN DEFAULT false,
  hac_reviewed_by UUID REFERENCES auth.users(id),
  hac_reviewed_at TIMESTAMPTZ,
  hac_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(case_id, form_type)
);

-- Enable RLS
ALTER TABLE public.ai_verification_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view ai_verification_results"
  ON public.ai_verification_results FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert ai_verification_results"
  ON public.ai_verification_results FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update ai_verification_results"
  ON public.ai_verification_results FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Admins can update ai_verification_results"
  ON public.ai_verification_results FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_ai_verification_results_updated_at
  BEFORE UPDATE ON public.ai_verification_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_ai_verification_results_case_id ON public.ai_verification_results(case_id);
CREATE INDEX idx_ai_verification_results_form_type ON public.ai_verification_results(form_type);
CREATE INDEX idx_ai_verification_results_hac_approved ON public.ai_verification_results(hac_approved);

-- HAC Log for verification reviews
COMMENT ON TABLE public.ai_verification_results IS 'Stores dual AI verification results (OpenAI + Gemini) for form validation with HAC approval workflow';