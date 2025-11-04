-- Create ai_confidence_overrides table
CREATE TABLE public.ai_confidence_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  ai_classification TEXT NOT NULL,
  ai_confidence NUMERIC(5,2) CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  ai_detected_person TEXT,
  human_override TEXT,
  human_classification TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ DEFAULT now(),
  verification_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create workflow_preflight_logs table
CREATE TABLE public.workflow_preflight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_run_id UUID REFERENCES public.workflow_runs(id) ON DELETE CASCADE NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  stage TEXT NOT NULL,
  check_type TEXT NOT NULL,
  check_name TEXT NOT NULL,
  check_passed BOOLEAN NOT NULL,
  severity TEXT CHECK (severity IN ('critical', 'warning', 'info')) NOT NULL,
  message TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  blocked_transition BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create quality_metrics_history table
CREATE TABLE public.quality_metrics_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  workflow_run_id UUID REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  overall_score NUMERIC(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
  completeness_score NUMERIC(5,2) CHECK (completeness_score >= 0 AND completeness_score <= 100),
  accuracy_score NUMERIC(5,2) CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
  confidence_score NUMERIC(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  blocker_count INTEGER DEFAULT 0,
  warning_count INTEGER DEFAULT 0,
  info_count INTEGER DEFAULT 0,
  total_checks INTEGER DEFAULT 0,
  stage TEXT,
  metrics_data JSONB DEFAULT '{}'::jsonb,
  snapshot_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_confidence_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_preflight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_metrics_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_confidence_overrides
CREATE POLICY "Staff can manage AI confidence overrides"
  ON public.ai_confidence_overrides
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "Clients can view their AI confidence overrides"
  ON public.ai_confidence_overrides
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.client_portal_access
      WHERE client_portal_access.case_id = ai_confidence_overrides.case_id
        AND client_portal_access.user_id = auth.uid()
    )
  );

-- RLS Policies for workflow_preflight_logs
CREATE POLICY "Staff can manage workflow preflight logs"
  ON public.workflow_preflight_logs
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "Clients can view their workflow preflight logs"
  ON public.workflow_preflight_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.client_portal_access
      WHERE client_portal_access.case_id = workflow_preflight_logs.case_id
        AND client_portal_access.user_id = auth.uid()
    )
  );

-- RLS Policies for quality_metrics_history
CREATE POLICY "Staff can manage quality metrics history"
  ON public.quality_metrics_history
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'assistant'::app_role));

CREATE POLICY "Clients can view their quality metrics history"
  ON public.quality_metrics_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.client_portal_access
      WHERE client_portal_access.case_id = quality_metrics_history.case_id
        AND client_portal_access.user_id = auth.uid()
    )
  );

-- Add indexes for performance
CREATE INDEX idx_ai_confidence_overrides_case_id ON public.ai_confidence_overrides(case_id);
CREATE INDEX idx_ai_confidence_overrides_document_id ON public.ai_confidence_overrides(document_id);
CREATE INDEX idx_ai_confidence_overrides_verified_at ON public.ai_confidence_overrides(verified_at DESC);

CREATE INDEX idx_workflow_preflight_logs_workflow_run_id ON public.workflow_preflight_logs(workflow_run_id);
CREATE INDEX idx_workflow_preflight_logs_case_id ON public.workflow_preflight_logs(case_id);
CREATE INDEX idx_workflow_preflight_logs_severity ON public.workflow_preflight_logs(severity);
CREATE INDEX idx_workflow_preflight_logs_checked_at ON public.workflow_preflight_logs(checked_at DESC);

CREATE INDEX idx_quality_metrics_history_case_id ON public.quality_metrics_history(case_id);
CREATE INDEX idx_quality_metrics_history_workflow_run_id ON public.quality_metrics_history(workflow_run_id);
CREATE INDEX idx_quality_metrics_history_snapshot_at ON public.quality_metrics_history(snapshot_at DESC);

-- Add updated_at trigger for ai_confidence_overrides
CREATE TRIGGER update_ai_confidence_overrides_updated_at
  BEFORE UPDATE ON public.ai_confidence_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();