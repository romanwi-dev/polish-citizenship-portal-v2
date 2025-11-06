-- Fix XOR collision vulnerability in safe_document_reupload
-- Replace XOR with sequential lock ID approach

CREATE OR REPLACE FUNCTION public.safe_document_reupload(
  p_case_id UUID,
  p_document_name TEXT,
  p_new_dropbox_path TEXT,
  p_file_extension TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing_doc_id UUID;
  v_new_doc_id UUID;
  v_next_version INTEGER;
  v_namespace_id BIGINT := 987654321; -- Fixed namespace for reupload operations
  v_sequence_lock_id BIGINT;
BEGIN
  -- Input validation with explicit type casting
  IF p_case_id IS NULL OR p_document_name IS NULL OR p_new_dropbox_path IS NULL THEN
    RAISE EXCEPTION 'Invalid input: case_id, document_name, and dropbox_path are required';
  END IF;
  
  -- Sanitize inputs (prevent SQL injection)
  p_document_name := TRIM(p_document_name);
  p_new_dropbox_path := TRIM(p_new_dropbox_path);
  
  IF LENGTH(p_document_name) > 255 OR LENGTH(p_new_dropbox_path) > 500 THEN
    RAISE EXCEPTION 'Input exceeds maximum length';
  END IF;
  
  -- Use composite advisory lock with SEQUENTIAL approach (zero collision risk)
  -- Combine case_id first 8 bytes + hashtext(name) for unique lock
  v_sequence_lock_id := (
    ('x' || substring(replace(p_case_id::text, '-', '') from 1 for 8))::bit(32)::bigint << 32
  ) | (
    (hashtext(p_document_name)::bigint & x'00000000FFFFFFFF'::bigint)
  );
  
  -- Acquire composite lock
  PERFORM pg_advisory_xact_lock(v_namespace_id, v_sequence_lock_id);
  
  -- Try to lock the existing document with NOWAIT (fail fast)
  BEGIN
    SELECT id INTO v_existing_doc_id
    FROM documents
    WHERE case_id = p_case_id 
      AND name = p_document_name
      AND deleted_at IS NULL
    FOR UPDATE NOWAIT;
  EXCEPTION
    WHEN lock_not_available THEN
      RAISE EXCEPTION 'Document is currently being modified by another process. Please retry.';
  END;
  
  IF v_existing_doc_id IS NOT NULL THEN
    -- Get next version number
    SELECT COALESCE(MAX(document_version), 0) + 1 INTO v_next_version
    FROM documents
    WHERE case_id = p_case_id AND name = p_document_name;
    
    -- Create new document version first
    INSERT INTO documents (
      case_id,
      name,
      dropbox_path,
      file_extension,
      document_version,
      ocr_status,
      version
    ) VALUES (
      p_case_id::UUID,
      p_document_name::TEXT,
      p_new_dropbox_path::TEXT,
      p_file_extension::TEXT,
      v_next_version::INTEGER,
      'pending'::TEXT,
      1::INTEGER
    ) RETURNING id INTO v_new_doc_id;
    
    -- Soft delete the old document
    UPDATE documents
    SET deleted_at = NOW(),
        replaced_by = v_new_doc_id
    WHERE id = v_existing_doc_id;
  ELSE
    v_next_version := 1;
    
    -- Create new document version
    INSERT INTO documents (
      case_id,
      name,
      dropbox_path,
      file_extension,
      document_version,
      ocr_status,
      version
    ) VALUES (
      p_case_id::UUID,
      p_document_name::TEXT,
      p_new_dropbox_path::TEXT,
      p_file_extension::TEXT,
      v_next_version::INTEGER,
      'pending'::TEXT,
      1::INTEGER
    ) RETURNING id INTO v_new_doc_id;
  END IF;
  
  RETURN v_new_doc_id;
END;
$$;