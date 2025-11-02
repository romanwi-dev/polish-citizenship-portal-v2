-- Create table for AI verification history
CREATE TABLE IF NOT EXISTS public.ai_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  proposal_type TEXT NOT NULL,
  description TEXT NOT NULL,
  files_affected TEXT[] NOT NULL,
  openai_score NUMERIC(3,1) NOT NULL,
  recommendation TEXT NOT NULL,
  critical_issues TEXT[],
  warnings TEXT[],
  suggestions TEXT[],
  user_decision TEXT, -- 'approved', 'rejected', 'modified'
  implemented_at TIMESTAMPTZ,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_verifications_created_at ON public.ai_verifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_verifications_proposal_type ON public.ai_verifications(proposal_type);
CREATE INDEX IF NOT EXISTS idx_ai_verifications_openai_score ON public.ai_verifications(openai_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_verifications_case_id ON public.ai_verifications(case_id);

-- Enable RLS
ALTER TABLE public.ai_verifications ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Admin full access to ai_verifications"
  ON public.ai_verifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Comment for documentation
COMMENT ON TABLE public.ai_verifications IS 'Stores all AI verification reviews for change proposals';
COMMENT ON COLUMN public.ai_verifications.proposal_type IS 'Type of change: database, edge_function, frontend, mixed';
COMMENT ON COLUMN public.ai_verifications.openai_score IS 'Overall AI score from 0-10';
COMMENT ON COLUMN public.ai_verifications.user_decision IS 'User decision: approved, rejected, or modified';