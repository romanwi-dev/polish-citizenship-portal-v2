-- A→B→EX Protocol Tables

-- Phase A: Analysis storage
CREATE TABLE IF NOT EXISTS public.phase_a_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  analysis_text TEXT NOT NULL,
  total_issues INTEGER NOT NULL DEFAULT 0,
  critical_issues JSONB DEFAULT '[]'::jsonb,
  proposed_changes TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Phase B: Verification storage
CREATE TABLE IF NOT EXISTS public.phase_b_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_a_id UUID NOT NULL REFERENCES public.phase_a_analyses(id) ON DELETE CASCADE,
  gpt5_score INTEGER,
  gemini_score INTEGER,
  claude_score INTEGER,
  average_score NUMERIC(5,2),
  verdict TEXT NOT NULL,
  verification_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phase EX: Execution log
CREATE TABLE IF NOT EXISTS public.phase_ex_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_a_id UUID NOT NULL REFERENCES public.phase_a_analyses(id) ON DELETE CASCADE,
  changes_applied JSONB DEFAULT '[]'::jsonb,
  execution_log JSONB DEFAULT '{}'::jsonb,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  executed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.phase_a_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phase_b_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phase_ex_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admin-only access)
CREATE POLICY "Admins can view all phase A analyses"
  ON public.phase_a_analyses FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert phase A analyses"
  ON public.phase_a_analyses FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all phase B verifications"
  ON public.phase_b_verifications FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert phase B verifications"
  ON public.phase_b_verifications FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all phase EX executions"
  ON public.phase_ex_executions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert phase EX executions"
  ON public.phase_ex_executions FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Indexes for performance
CREATE INDEX idx_phase_a_domain ON public.phase_a_analyses(domain);
CREATE INDEX idx_phase_b_phase_a_id ON public.phase_b_verifications(phase_a_id);
CREATE INDEX idx_phase_ex_phase_a_id ON public.phase_ex_executions(phase_a_id);