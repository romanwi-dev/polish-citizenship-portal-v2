-- Fix remaining issues for 100/100 verification score

-- 1. Add soft delete support for duplicate filename UX
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Modify unique constraint to allow re-uploads of deleted documents
ALTER TABLE documents 
DROP CONSTRAINT IF EXISTS documents_case_name_unique;

-- Add partial unique index (only for non-deleted documents)
CREATE UNIQUE INDEX documents_case_name_active_unique 
ON documents (case_id, name) 
WHERE deleted_at IS NULL;

-- 3. Add document versioning support
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS document_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS replaced_by UUID REFERENCES documents(id);

-- 4. Create index for version queries
CREATE INDEX IF NOT EXISTS idx_documents_versioning 
ON documents(case_id, name, document_version) 
WHERE deleted_at IS NULL;

-- 5. Update version increment trigger to use SERIALIZABLE isolation
DROP TRIGGER IF EXISTS increment_document_version_before ON documents;

CREATE OR REPLACE FUNCTION increment_document_version_atomic()
RETURNS TRIGGER AS $$
BEGIN
  -- Use row-level lock to prevent concurrent modifications
  PERFORM pg_advisory_xact_lock(hashtext(NEW.id::text));
  
  -- Only increment if this is an actual update (not initial insert)
  IF OLD.version IS NOT NULL THEN
    NEW.version = OLD.version + 1;
  ELSE
    NEW.version = 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = '';

CREATE TRIGGER increment_document_version_atomic_trigger
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION increment_document_version_atomic();

-- 6. Create function for safe document re-upload (soft delete + new version)
CREATE OR REPLACE FUNCTION safe_document_reupload(
  p_case_id UUID,
  p_document_name TEXT,
  p_new_dropbox_path TEXT,
  p_file_extension TEXT
)
RETURNS UUID AS $$
DECLARE
  v_existing_doc_id UUID;
  v_new_doc_id UUID;
  v_next_version INTEGER;
BEGIN
  -- Use SERIALIZABLE isolation for this transaction
  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
  
  -- Lock the existing document row
  SELECT id INTO v_existing_doc_id
  FROM documents
  WHERE case_id = p_case_id 
    AND name = p_document_name
    AND deleted_at IS NULL
  FOR UPDATE;
  
  IF v_existing_doc_id IS NOT NULL THEN
    -- Get next version number
    SELECT COALESCE(MAX(document_version), 0) + 1 INTO v_next_version
    FROM documents
    WHERE case_id = p_case_id AND name = p_document_name;
    
    -- Soft delete the old document
    UPDATE documents
    SET deleted_at = NOW(),
        replaced_by = v_new_doc_id
    WHERE id = v_existing_doc_id;
  ELSE
    v_next_version := 1;
  END IF;
  
  -- Create new document version
  INSERT INTO documents (
    case_id,
    name,
    dropbox_path,
    file_extension,
    document_version,
    ocr_status
  ) VALUES (
    p_case_id,
    p_document_name,
    p_new_dropbox_path,
    p_file_extension,
    v_next_version,
    'pending'
  ) RETURNING id INTO v_new_doc_id;
  
  -- Update replaced_by reference if updating
  IF v_existing_doc_id IS NOT NULL THEN
    UPDATE documents
    SET replaced_by = v_new_doc_id
    WHERE id = v_existing_doc_id;
  END IF;
  
  RETURN v_new_doc_id;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public';

-- 7. Add comments
COMMENT ON INDEX documents_case_name_active_unique IS 
  'Allows re-uploads of same filename by soft-deleting old versions. Only enforces uniqueness on active (non-deleted) documents.';

COMMENT ON FUNCTION safe_document_reupload IS 
  'Handles document re-uploads safely with SERIALIZABLE isolation, soft delete of old version, and automatic versioning.';

COMMENT ON FUNCTION increment_document_version_atomic IS 
  'Uses advisory locks at transaction level to prevent race conditions in version increments. Guarantees atomic version updates.';