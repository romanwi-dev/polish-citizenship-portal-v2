-- ============================================================================
-- MIGRATION: Fix Race Conditions and Authentication Bypass
-- ============================================================================
-- This migration adds:
-- 1. Document locking columns to prevent race conditions
-- 2. Atomic lock acquisition/release functions
-- 3. RLS policies to enforce proper authentication
-- ============================================================================

-- ============================================================================
-- PART 1: Add Lock Columns to Documents Table
-- ============================================================================

-- Add columns for distributed locking
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS locked_by TEXT,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;

-- Add index for lock queries (performance optimization)
CREATE INDEX IF NOT EXISTS idx_documents_locked_by ON documents(locked_by);
CREATE INDEX IF NOT EXISTS idx_documents_locked_at ON documents(locked_at);
CREATE INDEX IF NOT EXISTS idx_documents_status_locked ON documents(status, locked_by);

-- ============================================================================
-- PART 2: Atomic Lock Acquisition Function
-- ============================================================================

CREATE OR REPLACE FUNCTION acquire_document_lock(
  p_document_id UUID,
  p_worker_id TEXT,
  p_lock_timeout INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lock_acquired BOOLEAN;
BEGIN
  -- Attempt to acquire lock with atomic UPDATE
  -- Only succeeds if:
  -- 1. Document is not locked (locked_by IS NULL), OR
  -- 2. Lock has expired (locked_at is older than timeout)
  -- 3. Document status is 'queued'
  
  UPDATE documents
  SET 
    locked_by = p_worker_id,
    locked_at = now(),
    status = 'processing'
  WHERE id = p_document_id
    AND (
      locked_by IS NULL 
      OR locked_at < now() - (p_lock_timeout || ' seconds')::interval
    )
    AND status = 'queued';
  
  -- Return true if UPDATE affected a row (lock acquired)
  GET DIAGNOSTICS v_lock_acquired = ROW_COUNT;
  
  RETURN v_lock_acquired > 0;
END;
$$;

-- Add function comment for documentation
COMMENT ON FUNCTION acquire_document_lock IS 
'Atomically acquires a lock on a document for processing. Returns true if lock acquired, false if already locked.';

-- ============================================================================
-- PART 3: Lock Release Function
-- ============================================================================

CREATE OR REPLACE FUNCTION release_document_lock(p_document_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear lock fields
  UPDATE documents
  SET 
    locked_by = NULL,
    locked_at = NULL
  WHERE id = p_document_id;
  
  -- Note: We don't change status here because the calling function
  -- will set it to 'completed', 'failed', etc. based on processing result
END;
$$;

COMMENT ON FUNCTION release_document_lock IS 
'Releases the lock on a document. Should be called after processing completes or fails.';

-- ============================================================================
-- PART 4: Lock Cleanup Function (for stuck locks)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_locks(p_timeout_seconds INT DEFAULT 600)
RETURNS TABLE(document_id UUID, worker_id TEXT, locked_duration INTERVAL)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Find and clear locks older than timeout
  RETURN QUERY
  WITH cleared_locks AS (
    UPDATE documents
    SET 
      locked_by = NULL,
      locked_at = NULL,
      status = 'queued'
    WHERE locked_by IS NOT NULL
      AND locked_at < now() - (p_timeout_seconds || ' seconds')::interval
    RETURNING id, locked_by, now() - locked_at as duration
  )
  SELECT 
    id as document_id,
    locked_by as worker_id,
    duration as locked_duration
  FROM cleared_locks;
END;
$$;

COMMENT ON FUNCTION cleanup_expired_locks IS 
'Clears locks that have been held longer than the timeout. Returns list of cleared locks.';

-- ============================================================================
-- PART 5: Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own documents
CREATE POLICY "Users can view own documents"
ON documents
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only update their own documents
CREATE POLICY "Users can update own documents"
ON documents
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can only insert documents for themselves
CREATE POLICY "Users can insert own documents"
ON documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own documents
CREATE POLICY "Users can delete own documents"
ON documents
FOR DELETE
USING (auth.uid() = user_id);

-- Policy: Service role can manage all documents (for system operations)
CREATE POLICY "Service role can manage all documents"
ON documents
FOR ALL
USING (
  CASE 
    WHEN current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' 
    THEN true
    ELSE false
  END
);

-- ============================================================================
-- PART 6: Verification Queries (for testing)
-- ============================================================================

-- Test lock acquisition
-- SELECT acquire_document_lock('some-uuid', 'worker-123', 300);

-- Test lock release
-- SELECT release_document_lock('some-uuid');

-- Check for expired locks
-- SELECT * FROM cleanup_expired_locks(600);

-- View locked documents
-- SELECT id, locked_by, locked_at, status FROM documents WHERE locked_by IS NOT NULL;
