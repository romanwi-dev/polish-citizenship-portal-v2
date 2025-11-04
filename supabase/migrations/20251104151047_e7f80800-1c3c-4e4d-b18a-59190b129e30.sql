-- Create workflow_runs table for state persistence
CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  workflow_type TEXT NOT NULL DEFAULT 'ai_documents',
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed')),
  current_stage TEXT NOT NULL,
  total_steps INTEGER NOT NULL DEFAULT 7,
  completed_steps INTEGER NOT NULL DEFAULT 0,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  
  -- Step tracking
  steps JSONB NOT NULL DEFAULT '[]',
  
  -- Metadata
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  paused_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  
  -- Documents being processed
  document_ids UUID[] NOT NULL DEFAULT '{}',
  processed_documents JSONB NOT NULL DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view workflow runs for their cases"
  ON public.workflow_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = workflow_runs.case_id
    )
  );

CREATE POLICY "Users can create workflow runs"
  ON public.workflow_runs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = workflow_runs.case_id
    )
  );

CREATE POLICY "Users can update workflow runs"
  ON public.workflow_runs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = workflow_runs.case_id
    )
  );

-- Create indexes
CREATE INDEX idx_workflow_runs_case_id ON public.workflow_runs(case_id);
CREATE INDEX idx_workflow_runs_status ON public.workflow_runs(status);
CREATE INDEX idx_workflow_runs_created_at ON public.workflow_runs(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_workflow_runs_updated_at
  BEFORE UPDATE ON public.workflow_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_runs;