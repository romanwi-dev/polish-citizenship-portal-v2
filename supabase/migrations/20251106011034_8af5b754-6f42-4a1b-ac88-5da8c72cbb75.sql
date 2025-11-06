-- FIX #1 & #2: Atomic upload + workflow creation with version locking
-- Creates a database function that atomically:
-- 1. Locks the document (SELECT FOR UPDATE)
-- 2. Verifies version hasn't changed
-- 3. Creates workflow instance
-- All in a single transaction with ACID guarantees

CREATE OR REPLACE FUNCTION public.atomic_create_document_workflow(
  p_case_id UUID,
  p_document_id UUID,
  p_initial_version INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_version INTEGER;
  v_workflow_id UUID;
  v_user_id UUID;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Authentication required'
    );
  END IF;
  
  -- FIX #1: Lock document with SELECT FOR UPDATE (prevents race conditions)
  SELECT version INTO v_current_version
  FROM documents
  WHERE id = p_document_id
  FOR UPDATE NOWAIT; -- Fail fast if already locked
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Document not found'
    );
  END IF;
  
  -- FIX #2: Verify version hasn't changed (optimistic locking)
  IF v_current_version != p_initial_version THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Version conflict detected',
      'expected_version', p_initial_version,
      'actual_version', v_current_version
    );
  END IF;
  
  -- Verify case access
  IF NOT (
    public.has_role(v_user_id, 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM cases 
      WHERE id = p_case_id 
      AND user_id = v_user_id
    )
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Access denied to case'
    );
  END IF;
  
  -- FIX #2: Create workflow instance atomically (same transaction)
  INSERT INTO workflow_instances (
    workflow_type,
    case_id,
    source_table,
    source_id,
    current_stage,
    status,
    priority,
    deadline
  ) VALUES (
    'ai_documents',
    p_case_id,
    'documents',
    p_document_id,
    'upload',
    'in_progress',
    'medium',
    now() + interval '7 days'
  )
  RETURNING id INTO v_workflow_id;
  
  -- Log to HAC logs
  INSERT INTO hac_logs (
    case_id,
    action_type,
    action_description,
    field_changed,
    new_value
  ) VALUES (
    p_case_id,
    'workflow_created',
    'Document workflow instance created atomically',
    'workflow_instance_id',
    v_workflow_id::text
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'workflow_instance_id', v_workflow_id,
    'document_id', p_document_id,
    'version_verified', true
  );
  
EXCEPTION
  WHEN lock_not_available THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Document is locked by another process - retry in a moment'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- FIX #3: Error recovery - function to mark workflow for retry
CREATE OR REPLACE FUNCTION public.mark_workflow_for_retry(
  p_workflow_instance_id UUID,
  p_error_phase TEXT,
  p_error_message TEXT,
  p_retry_delay_minutes INTEGER DEFAULT 5
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workflow_record RECORD;
  v_retry_count INTEGER;
BEGIN
  -- Get current workflow state
  SELECT * INTO v_workflow_record
  FROM workflow_instances
  WHERE id = p_workflow_instance_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Workflow instance not found'
    );
  END IF;
  
  -- Increment retry count (stored in metadata)
  v_retry_count := COALESCE((v_workflow_record.metadata->>'retry_count')::INTEGER, 0) + 1;
  
  -- Update workflow with retry information
  UPDATE workflow_instances
  SET 
    status = CASE 
      WHEN v_retry_count >= 3 THEN 'failed'::workflow_status
      ELSE 'pending'::workflow_status
    END,
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'retry_count', v_retry_count,
      'last_error_phase', p_error_phase,
      'last_error_message', p_error_message,
      'last_error_at', now(),
      'next_retry_at', now() + (p_retry_delay_minutes || ' minutes')::interval,
      'max_retries', 3
    )
  WHERE id = p_workflow_instance_id;
  
  -- Log error for monitoring
  INSERT INTO hac_logs (
    case_id,
    action_type,
    action_description,
    field_changed,
    old_value,
    new_value
  ) VALUES (
    v_workflow_record.case_id,
    'workflow_error',
    format('Workflow error in phase %s: %s', p_error_phase, p_error_message),
    'workflow_status',
    v_workflow_record.status::text,
    CASE WHEN v_retry_count >= 3 THEN 'failed' ELSE 'pending_retry' END
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'workflow_instance_id', p_workflow_instance_id,
    'retry_count', v_retry_count,
    'status', CASE WHEN v_retry_count >= 3 THEN 'failed' ELSE 'pending_retry' END,
    'next_retry_at', now() + (p_retry_delay_minutes || ' minutes')::interval
  );
END;
$$;

-- FIX #4: Batch atomicity - function to track batch uploads
CREATE TABLE IF NOT EXISTS public.document_batch_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL,
  batch_id TEXT NOT NULL UNIQUE,
  total_files INTEGER NOT NULL,
  uploaded_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress',
  document_ids UUID[] DEFAULT '{}',
  error_details JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.document_batch_uploads ENABLE ROW LEVEL SECURITY;

-- RLS policies for batch uploads
CREATE POLICY "Staff can manage batch uploads"
ON public.document_batch_uploads
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'assistant'::app_role)
);

CREATE POLICY "Users can view their batch uploads"
ON public.document_batch_uploads
FOR SELECT
USING (created_by = auth.uid());

-- Function to create batch record
CREATE OR REPLACE FUNCTION public.create_batch_upload(
  p_case_id UUID,
  p_batch_id TEXT,
  p_total_files INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_batch_record_id UUID;
BEGIN
  INSERT INTO document_batch_uploads (
    case_id,
    batch_id,
    total_files,
    created_by
  ) VALUES (
    p_case_id,
    p_batch_id,
    p_total_files,
    auth.uid()
  )
  RETURNING id INTO v_batch_record_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'batch_record_id', v_batch_record_id,
    'batch_id', p_batch_id
  );
END;
$$;

-- Function to update batch progress
CREATE OR REPLACE FUNCTION public.update_batch_upload_progress(
  p_batch_id TEXT,
  p_document_id UUID,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_batch RECORD;
  v_new_status TEXT;
BEGIN
  -- Get current batch state with lock
  SELECT * INTO v_batch
  FROM document_batch_uploads
  WHERE batch_id = p_batch_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Batch not found'
    );
  END IF;
  
  -- Update batch record
  IF p_success THEN
    UPDATE document_batch_uploads
    SET 
      uploaded_count = uploaded_count + 1,
      document_ids = array_append(document_ids, p_document_id)
    WHERE batch_id = p_batch_id;
  ELSE
    UPDATE document_batch_uploads
    SET 
      failed_count = failed_count + 1,
      error_details = error_details || jsonb_build_object(
        'document_id', p_document_id,
        'error', p_error_message,
        'failed_at', now()
      )
    WHERE batch_id = p_batch_id;
  END IF;
  
  -- Refresh batch state
  SELECT * INTO v_batch
  FROM document_batch_uploads
  WHERE batch_id = p_batch_id;
  
  -- Check if batch is complete
  IF v_batch.uploaded_count + v_batch.failed_count >= v_batch.total_files THEN
    v_new_status := CASE 
      WHEN v_batch.failed_count = 0 THEN 'completed'
      WHEN v_batch.uploaded_count = 0 THEN 'failed'
      ELSE 'partial'
    END;
    
    UPDATE document_batch_uploads
    SET 
      status = v_new_status,
      completed_at = now()
    WHERE batch_id = p_batch_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'batch_id', p_batch_id,
    'uploaded_count', v_batch.uploaded_count + (CASE WHEN p_success THEN 1 ELSE 0 END),
    'failed_count', v_batch.failed_count + (CASE WHEN p_success THEN 0 ELSE 1 END),
    'status', COALESCE(v_new_status, v_batch.status)
  );
END;
$$;