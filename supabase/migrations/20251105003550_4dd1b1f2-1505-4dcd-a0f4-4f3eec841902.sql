-- Create workflow persistence tables for error recovery

-- Main persistence table (one per case, latest state)
CREATE TABLE IF NOT EXISTS public.workflow_persistence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  workflow_run_id UUID,
  status TEXT NOT NULL,
  current_stage TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_document_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  retry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  has_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(case_id)
);

-- Checkpoints table (multiple snapshots per case)
CREATE TABLE IF NOT EXISTS public.workflow_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  workflow_run_id UUID,
  checkpoint_label TEXT NOT NULL,
  status TEXT NOT NULL,
  current_stage TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_document_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.workflow_persistence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_checkpoints ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflow_persistence
CREATE POLICY "Users can view their own workflow persistence"
  ON public.workflow_persistence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = workflow_persistence.case_id
    )
  );

CREATE POLICY "Users can insert their own workflow persistence"
  ON public.workflow_persistence FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = workflow_persistence.case_id
    )
  );

CREATE POLICY "Users can update their own workflow persistence"
  ON public.workflow_persistence FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = workflow_persistence.case_id
    )
  );

CREATE POLICY "Users can delete their own workflow persistence"
  ON public.workflow_persistence FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = workflow_persistence.case_id
    )
  );

-- RLS Policies for workflow_checkpoints
CREATE POLICY "Users can view their own workflow checkpoints"
  ON public.workflow_checkpoints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = workflow_checkpoints.case_id
    )
  );

CREATE POLICY "Users can insert their own workflow checkpoints"
  ON public.workflow_checkpoints FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = workflow_checkpoints.case_id
    )
  );

CREATE POLICY "Users can update their own workflow checkpoints"
  ON public.workflow_checkpoints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = workflow_checkpoints.case_id
    )
  );

CREATE POLICY "Users can delete their own workflow checkpoints"
  ON public.workflow_checkpoints FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = workflow_checkpoints.case_id
    )
  );

-- Indexes for performance
CREATE INDEX idx_workflow_persistence_case_id ON public.workflow_persistence(case_id);
CREATE INDEX idx_workflow_persistence_status ON public.workflow_persistence(status);
CREATE INDEX idx_workflow_checkpoints_case_id ON public.workflow_checkpoints(case_id);
CREATE INDEX idx_workflow_checkpoints_created_at ON public.workflow_checkpoints(created_at DESC);

-- Auto-update updated_at trigger
CREATE TRIGGER update_workflow_persistence_updated_at
  BEFORE UPDATE ON public.workflow_persistence
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();