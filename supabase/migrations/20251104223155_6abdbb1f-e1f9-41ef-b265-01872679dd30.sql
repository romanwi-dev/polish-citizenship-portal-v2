-- Create workflow_reviews table for code review history
CREATE TABLE IF NOT EXISTS public.workflow_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  triggered_by TEXT NOT NULL, -- 'manual' | 'scheduled' | user_id
  results JSONB NOT NULL,
  overall_score INTEGER,
  total_blockers INTEGER,
  files_count INTEGER,
  duration_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'completed', -- 'completed' | 'failed' | 'timeout'
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create workflow_errors table for enhanced error tracking
CREATE TABLE IF NOT EXISTS public.workflow_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  workflow_run_id UUID REFERENCES workflow_runs(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  stage TEXT NOT NULL,
  error_message TEXT,
  error_details JSONB DEFAULT '{}'::jsonb,
  retry_count INTEGER DEFAULT 0,
  resolved BOOLEAN DEFAULT FALSE,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID
);

-- Enable RLS on workflow_reviews
ALTER TABLE public.workflow_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all review history
CREATE POLICY "Admins can view review history"
  ON public.workflow_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'::app_role
    )
  );

-- Policy: System can insert reviews
CREATE POLICY "System can insert reviews"
  ON public.workflow_reviews
  FOR INSERT
  WITH CHECK (true);

-- Enable RLS on workflow_errors
ALTER TABLE public.workflow_errors ENABLE ROW LEVEL SECURITY;

-- Policy: Staff can view workflow errors
CREATE POLICY "Staff can view workflow errors"
  ON public.workflow_errors
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'assistant'::app_role)
  );

-- Policy: System can create workflow errors
CREATE POLICY "System can create workflow errors"
  ON public.workflow_errors
  FOR INSERT
  WITH CHECK (true);

-- Policy: Staff can update workflow errors (for resolution)
CREATE POLICY "Staff can update workflow errors"
  ON public.workflow_errors
  FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'assistant'::app_role)
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_reviews_created_at 
  ON public.workflow_reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workflow_reviews_status 
  ON public.workflow_reviews(status);

CREATE INDEX IF NOT EXISTS idx_workflow_errors_workflow_run 
  ON public.workflow_errors(workflow_run_id);

CREATE INDEX IF NOT EXISTS idx_workflow_errors_resolved 
  ON public.workflow_errors(resolved) WHERE resolved = false;

-- Create function to log workflow error
CREATE OR REPLACE FUNCTION public.log_workflow_error(
  p_workflow_run_id UUID,
  p_document_id UUID,
  p_stage TEXT,
  p_error_message TEXT,
  p_error_details JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_error_id UUID;
  v_existing_error_id UUID;
  v_retry_count INTEGER;
BEGIN
  -- Check if error already exists for this document+stage
  SELECT id, retry_count INTO v_existing_error_id, v_retry_count
  FROM workflow_errors
  WHERE workflow_run_id = p_workflow_run_id
    AND document_id = p_document_id
    AND stage = p_stage
    AND resolved = false
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_existing_error_id IS NOT NULL THEN
    -- Update existing error with retry count
    UPDATE workflow_errors
    SET 
      retry_count = v_retry_count + 1,
      error_message = p_error_message,
      error_details = p_error_details,
      created_at = NOW()
    WHERE id = v_existing_error_id
    RETURNING id INTO v_error_id;
  ELSE
    -- Insert new error
    INSERT INTO workflow_errors (
      workflow_run_id,
      document_id,
      stage,
      error_message,
      error_details,
      retry_count
    ) VALUES (
      p_workflow_run_id,
      p_document_id,
      p_stage,
      p_error_message,
      p_error_details,
      0
    )
    RETURNING id INTO v_error_id;
  END IF;

  RETURN v_error_id;
END;
$$;