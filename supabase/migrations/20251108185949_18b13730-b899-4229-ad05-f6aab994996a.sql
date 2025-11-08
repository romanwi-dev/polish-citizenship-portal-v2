-- Create case_workflow_state table for POA wizard session persistence
CREATE TABLE IF NOT EXISTS public.case_workflow_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('poa', 'citizenship', 'usc', 'passport')),
  current_step INTEGER NOT NULL DEFAULT 1,
  form_data JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(case_id, workflow_type)
);

-- Enable RLS
ALTER TABLE public.case_workflow_state ENABLE ROW LEVEL SECURITY;

-- Staff can manage all workflow states
CREATE POLICY "Staff can manage workflow states"
  ON public.case_workflow_state
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'assistant'::app_role)
  );

-- Clients can manage their own case workflow states
CREATE POLICY "Clients can manage their workflow states"
  ON public.case_workflow_state
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM client_portal_access
      WHERE client_portal_access.case_id = case_workflow_state.case_id
      AND client_portal_access.user_id = auth.uid()
    )
  );

-- Auto-update timestamp trigger
CREATE TRIGGER update_case_workflow_state_updated_at
  BEFORE UPDATE ON public.case_workflow_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_case_workflow_state_case_id ON public.case_workflow_state(case_id);
CREATE INDEX idx_case_workflow_state_expires_at ON public.case_workflow_state(expires_at);