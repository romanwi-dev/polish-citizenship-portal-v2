-- Add index for faster pending document queries
CREATE INDEX IF NOT EXISTS idx_documents_pending_status 
ON documents(case_id, ocr_status) 
WHERE ocr_status IN ('pending', 'queued');

-- Function to get pending document count
CREATE OR REPLACE FUNCTION get_pending_document_count(p_case_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM documents
  WHERE case_id = p_case_id
    AND ocr_status IN ('pending', 'queued')
    AND deleted_at IS NULL;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path TO 'public';

-- Function to clear pending documents for a case
CREATE OR REPLACE FUNCTION clear_pending_documents(p_case_id UUID)
RETURNS jsonb AS $$
DECLARE
  v_deleted_count INTEGER;
  v_document_ids UUID[];
BEGIN
  -- Get IDs of documents to delete (only pending/queued, not processing)
  SELECT ARRAY_AGG(id) INTO v_document_ids
  FROM documents
  WHERE case_id = p_case_id
    AND ocr_status IN ('pending', 'queued')
    AND deleted_at IS NULL
    AND created_at < NOW() - INTERVAL '5 seconds'; -- Safety: only clear docs older than 5s
  
  -- Soft delete pending documents
  UPDATE documents
  SET deleted_at = NOW()
  WHERE id = ANY(v_document_ids);
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Delete associated workflow instances
  DELETE FROM workflow_instances
  WHERE source_table = 'documents'
    AND source_id = ANY(v_document_ids);
  
  -- Log the cleanup
  INSERT INTO hac_logs (
    case_id,
    action_type,
    action_description,
    field_changed,
    old_value,
    new_value
  ) VALUES (
    p_case_id,
    'queue_cleanup',
    'Cleared pending documents for new Dropbox file selection',
    'pending_documents',
    v_deleted_count::text,
    '0'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', v_deleted_count,
    'document_ids', COALESCE(v_document_ids, ARRAY[]::UUID[])
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';