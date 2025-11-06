-- Add optimistic locking constraint for concurrent upload protection
-- This ensures version increments are atomic and prevents race conditions

-- Add unique constraint on case_id + name to prevent duplicate uploads
ALTER TABLE documents 
ADD CONSTRAINT documents_case_name_unique UNIQUE (case_id, name);

-- Create index for version-based queries to optimize concurrent access
CREATE INDEX IF NOT EXISTS idx_documents_version ON documents(id, version);

-- Add trigger to prevent version conflicts (optimistic locking enforcement)
CREATE OR REPLACE FUNCTION check_version_conflict()
RETURNS TRIGGER AS $$
BEGIN
  -- If version is being updated, ensure it's incremental
  IF NEW.version IS NOT NULL AND OLD.version IS NOT NULL THEN
    IF NEW.version <= OLD.version THEN
      RAISE EXCEPTION 'Version conflict detected. Document was modified by another process.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS enforce_version_increment ON documents;

-- Create trigger to enforce version increments
CREATE TRIGGER enforce_version_increment
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION check_version_conflict();

-- Add comment explaining the locking strategy
COMMENT ON CONSTRAINT documents_case_name_unique ON documents IS 
  'Prevents duplicate document uploads for the same case. Part of concurrent upload protection strategy.';

COMMENT ON TRIGGER enforce_version_increment ON documents IS 
  'Enforces optimistic locking by preventing non-incremental version updates. Protects against race conditions in concurrent uploads.';