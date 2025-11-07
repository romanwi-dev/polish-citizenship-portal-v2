-- Create agent_memory table for persistent agent context
CREATE TABLE IF NOT EXISTS public.agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL, -- 'pdf_generator', 'ocr_processor', 'dropbox_sync', 'translation', 'form_filler', 'security'
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  memory_key TEXT NOT NULL, -- e.g., 'last_pdf_config', 'ocr_settings', 'translation_preferences'
  memory_value JSONB NOT NULL, -- flexible storage for any agent-specific data
  context_window JSONB DEFAULT '[]'::jsonb, -- recent interactions/decisions
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ, -- optional TTL for temporary memory
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create project_decisions table for architectural knowledge
CREATE TABLE IF NOT EXISTS public.project_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_type TEXT NOT NULL, -- 'architecture', 'integration', 'security', 'workflow', 'ui_ux'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rationale TEXT NOT NULL, -- why this decision was made
  alternatives_considered JSONB DEFAULT '[]'::jsonb, -- what else was considered
  implementation_details JSONB DEFAULT '{}'::jsonb,
  related_files TEXT[], -- which files are affected
  tags TEXT[], -- for easy searching
  status TEXT DEFAULT 'active', -- 'active', 'deprecated', 'superseded'
  superseded_by UUID REFERENCES public.project_decisions(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create workflow_rules table for process knowledge
CREATE TABLE IF NOT EXISTS public.workflow_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_type TEXT NOT NULL, -- 'pdf_generation', 'ocr', 'translation', 'document_processing', 'form_validation'
  rule_name TEXT NOT NULL,
  rule_description TEXT NOT NULL,
  conditions JSONB NOT NULL, -- when this rule applies
  actions JSONB NOT NULL, -- what to do when conditions are met
  priority INTEGER DEFAULT 100, -- lower number = higher priority
  is_active BOOLEAN DEFAULT true,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_agent_memory_agent_type ON public.agent_memory(agent_type);
CREATE INDEX idx_agent_memory_case_id ON public.agent_memory(case_id);
CREATE INDEX idx_agent_memory_key ON public.agent_memory(agent_type, memory_key);
CREATE INDEX idx_agent_memory_expires ON public.agent_memory(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX idx_project_decisions_type ON public.project_decisions(decision_type);
CREATE INDEX idx_project_decisions_status ON public.project_decisions(status);
CREATE INDEX idx_project_decisions_tags ON public.project_decisions USING GIN(tags);

CREATE INDEX idx_workflow_rules_type ON public.workflow_rules(workflow_type);
CREATE INDEX idx_workflow_rules_active ON public.workflow_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_workflow_rules_priority ON public.workflow_rules(priority);

-- Enable RLS
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_memory
CREATE POLICY "Admins can manage agent memory"
  ON public.agent_memory
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'::app_role
    )
  );

-- RLS Policies for project_decisions
CREATE POLICY "Admins can manage project decisions"
  ON public.project_decisions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Users can view active project decisions"
  ON public.project_decisions
  FOR SELECT
  USING (status = 'active');

-- RLS Policies for workflow_rules
CREATE POLICY "Admins can manage workflow rules"
  ON public.workflow_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'::app_role
    )
  );

CREATE POLICY "Users can view active workflow rules"
  ON public.workflow_rules
  FOR SELECT
  USING (is_active = true);

-- Add triggers for updated_at
CREATE TRIGGER update_agent_memory_updated_at
  BEFORE UPDATE ON public.agent_memory
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_project_decisions_updated_at
  BEFORE UPDATE ON public.project_decisions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_workflow_rules_updated_at
  BEFORE UPDATE ON public.workflow_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to cleanup expired agent memory
CREATE OR REPLACE FUNCTION public.cleanup_expired_agent_memory()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.agent_memory
  WHERE expires_at IS NOT NULL
    AND expires_at < now();
END;
$$;