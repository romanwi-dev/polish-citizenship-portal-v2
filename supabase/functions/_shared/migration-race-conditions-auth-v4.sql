-- ============================================================================
-- Document Lock System V4 - ZERO-FAIL SECURITY FIX
-- ============================================================================
-- CRITICAL FIX: user_can_access_document now explicitly checks case ownership
-- via JOIN instead of relying on RLS (which SECURITY DEFINER bypasses).
-- 
-- This prevents authorization bypass where:
-- 1. User A locks a document in Case X (which they own)
-- 2. User B tries to lock a document in Case Y (which User B owns)
-- 3. If both documents have same UUID, User B could bypass authorization
-- 
-- V4 CHANGES FROM V3:
-- - Added INNER JOIN to cases table in user_can_access_document
-- - Explicit check: c.owner_id = p_user_id (not just document existence)
-- - No longer relies on RLS for authorization (SECURITY DEFINER bypasses RLS)
-- ============================================================================

-- ============================================================================
-- HELPER: Check if user can access document (WITH EXPLICIT OWNERSHIP CHECK)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.user_can_access_document(
  p_document_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Admin check (if has_role function exists)
  -- Admins can access any document
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'has_role' 
    AND pronamespace = 'public'::regnamespace
  ) THEN
    IF public.has_role(p_user_id, 'admin') THEN
      RETURN true;
    END IF;
  END IF;
  
  -- CRITICAL FIX: Ownership check via explicit JOIN
  -- User must OWN the case that owns the document
  -- This is the ZERO-FAIL security requirement
  RETURN EXISTS (
    SELECT 1 
    FROM public.documents d
    INNER JOIN public.cases c ON c.id = d.case_id
    WHERE d.id = p_document_id
      AND c.owner_id = p_user_id  -- EXPLICIT ownership check
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- ACQUIRE LOCK: Atomic lock acquisition with RLS compliance
-- ============================================================================
CREATE OR REPLACE FUNCTION public.acquire_document_lock(
  p_document_id UUID,
  p_worker_id TEXT,
  p_lock_timeout INT DEFAULT 300
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_has_access BOOLEAN;
  v_locked BOOLEAN;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Enforce authentication
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required (RLS-AUTH-001)';
  END IF;
  
  -- Check access using helper function
  v_has_access := public.user_can_access_document(p_document_id, v_user_id);
  
  IF NOT v_has_access THEN
    RAISE EXCEPTION 'Access denied: user % cannot access document % (RLS-AUTH-002)', 
      v_user_id, p_document_id;
  END IF;
  
  -- Try to acquire lock atomically using FOR UPDATE SKIP LOCKED
  -- This prevents race conditions by making other transactions wait or skip
  UPDATE public.documents
  SET 
    locked_by = p_worker_id,
    locked_at = now()
  WHERE id = p_document_id
    AND (
      locked_by IS NULL  -- Not locked
      OR locked_at < (now() - (p_lock_timeout || ' seconds')::interval)  -- Lock expired
    )
    AND id IN (
      -- Re-verify access within UPDATE to prevent TOCTOU
      SELECT d.id 
      FROM public.documents d
      INNER JOIN public.cases c ON c.id = d.case_id
      WHERE d.id = p_document_id
        AND c.owner_id = v_user_id
      FOR UPDATE SKIP LOCKED  -- Atomic lock - skip if someone else is updating
    );
  
  -- Check if lock was acquired
  v_locked := FOUND;
  
  -- Log the acquisition attempt
  INSERT INTO public.document_lock_log (
    document_id,
    worker_id,
    action,
    success,
    user_id
  ) VALUES (
    p_document_id,
    p_worker_id,
    'ACQUIRE',
    v_locked,
    v_user_id
  );
  
  RETURN v_locked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- RELEASE LOCK: Release document lock
-- ============================================================================
CREATE OR REPLACE FUNCTION public.release_document_lock(
  p_document_id UUID
) RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_has_access BOOLEAN;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Enforce authentication
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required (RLS-AUTH-003)';
  END IF;
  
  -- Check access
  v_has_access := public.user_can_access_document(p_document_id, v_user_id);
  
  IF NOT v_has_access THEN
    RAISE EXCEPTION 'Access denied: user % cannot access document % (RLS-AUTH-004)', 
      v_user_id, p_document_id;
  END IF;
  
  -- Release lock
  UPDATE public.documents
  SET 
    locked_by = NULL,
    locked_at = NULL
  WHERE id = p_document_id
    AND id IN (
      -- Re-verify access within UPDATE
      SELECT d.id 
      FROM public.documents d
      INNER JOIN public.cases c ON c.id = d.case_id
      WHERE d.id = p_document_id
        AND c.owner_id = v_user_id
    );
  
  -- Log the release
  INSERT INTO public.document_lock_log (
    document_id,
    worker_id,
    action,
    success,
    user_id
  ) VALUES (
    p_document_id,
    NULL,
    'RELEASE',
    TRUE,
    v_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- CLEANUP: Remove expired locks (ADMIN ONLY)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_locks(
  p_timeout_seconds INT DEFAULT 600
) RETURNS TABLE (
  document_id UUID,
  case_id UUID,
  worker_id TEXT,
  locked_duration_seconds INT
) AS $$
DECLARE
  v_user_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Enforce authentication
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required (RLS-AUTH-005)';
  END IF;
  
  -- Check if has_role function exists and user is admin
  v_is_admin := FALSE;
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'has_role' 
    AND pronamespace = 'public'::regnamespace
  ) THEN
    v_is_admin := public.has_role(v_user_id, 'admin');
  END IF;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Admin access required (RLS-AUTH-006)';
  END IF;
  
  -- Return and clear expired locks
  RETURN QUERY
  WITH expired_locks AS (
    SELECT 
      d.id as doc_id,
      d.case_id,
      d.locked_by,
      EXTRACT(EPOCH FROM (now() - d.locked_at))::INT as duration
    FROM public.documents d
    WHERE d.locked_by IS NOT NULL
      AND d.locked_at < (now() - (p_timeout_seconds || ' seconds')::interval)
  ),
  cleared AS (
    UPDATE public.documents d
    SET 
      locked_by = NULL,
      locked_at = NULL
    FROM expired_locks el
    WHERE d.id = el.doc_id
    RETURNING d.id
  )
  SELECT 
    el.doc_id,
    el.case_id,
    el.locked_by,
    el.duration
  FROM expired_locks el;
  
  -- Log cleanup
  INSERT INTO public.document_lock_log (
    document_id,
    worker_id,
    action,
    success,
    user_id
  )
  SELECT 
    doc_id,
    locked_by,
    'CLEANUP',
    TRUE,
    v_user_id
  FROM expired_locks;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- PERMISSIONS
-- ============================================================================
GRANT EXECUTE ON FUNCTION public.acquire_document_lock(UUID, TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_document_lock(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_locks(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_can_access_document(UUID, UUID) TO authenticated;
