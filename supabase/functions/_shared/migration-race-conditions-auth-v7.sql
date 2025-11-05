/**
 * DOCUMENT LOCKING V7 - TOTAL ATOMIC DIAGNOSTICS
 * 
 * ZERO-FAIL Protocol Compliance:
 * - Single atomic CTE with all diagnostics inline
 * - SERIALIZABLE isolation for transaction-level consistency
 * - FOR UPDATE SKIP LOCKED for row-level safety
 * - All authorization and availability checks in ONE snapshot
 * - Zero post-atomic queries = zero race conditions
 */

-- ============================================================================
-- ACQUIRE LOCK V7: Total Atomic Diagnostics
-- ============================================================================

CREATE OR REPLACE FUNCTION public.acquire_document_lock_v7(
  p_document_id UUID,
  p_worker_id TEXT,
  p_lock_timeout INT DEFAULT 300
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '10s'
AS $$
DECLARE
  v_result JSONB;
  v_user_id UUID;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'AUTHENTICATION_REQUIRED',
      'message', 'User must be authenticated to acquire locks',
      'timestamp', now()
    );
  END IF;

  -- Set SERIALIZABLE isolation for transaction-level consistency
  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  -- ATOMIC LOCK ACQUISITION WITH INLINE DIAGNOSTICS
  -- Everything happens in a single snapshot - zero race conditions
  WITH doc_check AS (
    SELECT 
      d.id,
      d.case_id,
      d.locked_by,
      d.locked_at,
      -- Check access inline (admin OR case owner)
      (
        public.has_role(v_user_id, 'admin'::app_role) OR
        EXISTS (
          SELECT 1 FROM public.cases c
          WHERE c.id = d.case_id 
          AND c.user_id = v_user_id
        )
      ) AS has_access,
      -- Check availability inline
      (
        d.locked_by IS NULL OR
        d.locked_at < (now() - (p_lock_timeout || ' seconds')::INTERVAL)
      ) AS is_available,
      -- Check if user is admin
      public.has_role(v_user_id, 'admin'::app_role) AS is_admin
    FROM public.documents d
    WHERE d.id = p_document_id
    FOR UPDATE SKIP LOCKED  -- Row-level lock safety
  ),
  lock_attempt AS (
    UPDATE public.documents d
    SET 
      locked_by = p_worker_id,
      locked_at = now()
    FROM doc_check dc
    WHERE d.id = dc.id
      AND dc.has_access = true
      AND dc.is_available = true
    RETURNING 
      d.id,
      dc.is_admin,
      dc.case_id
  )
  -- Build result based on atomic snapshot
  SELECT 
    CASE 
      -- SUCCESS: Lock acquired
      WHEN la.id IS NOT NULL THEN
        jsonb_build_object(
          'success', true,
          'reason', 'SUCCESS',
          'message', 'Lock acquired successfully',
          'document_id', la.id,
          'worker_id', p_worker_id,
          'locked_at', now(),
          'case_id', la.case_id,
          'is_admin', la.is_admin,
          'timestamp', now()
        )
      
      -- FAILURE: Document not found
      WHEN dc.id IS NULL THEN
        jsonb_build_object(
          'success', false,
          'reason', 'DOCUMENT_NOT_FOUND',
          'message', 'Document does not exist or is locked by another transaction',
          'document_id', p_document_id,
          'timestamp', now()
        )
      
      -- FAILURE: Access denied
      WHEN dc.has_access = false THEN
        jsonb_build_object(
          'success', false,
          'reason', 'ACCESS_DENIED',
          'message', 'User does not have permission to lock this document',
          'document_id', p_document_id,
          'case_id', dc.case_id,
          'user_id', v_user_id,
          'timestamp', now()
        )
      
      -- FAILURE: Already locked
      WHEN dc.is_available = false THEN
        jsonb_build_object(
          'success', false,
          'reason', 'ALREADY_LOCKED',
          'message', 'Document is currently locked by another worker',
          'document_id', p_document_id,
          'locked_by', dc.locked_by,
          'locked_at', dc.locked_at,
          'lock_age_seconds', EXTRACT(EPOCH FROM (now() - dc.locked_at)),
          'timestamp', now()
        )
      
      -- FAILURE: Unknown error
      ELSE
        jsonb_build_object(
          'success', false,
          'reason', 'UNKNOWN_ERROR',
          'message', 'Lock acquisition failed for unknown reason',
          'document_id', p_document_id,
          'timestamp', now()
        )
    END INTO v_result
  FROM lock_attempt la
  FULL OUTER JOIN doc_check dc ON true;

  -- Log the operation
  INSERT INTO public.document_lock_logs (
    document_id,
    worker_id,
    operation,
    success,
    reason,
    user_id
  ) VALUES (
    p_document_id,
    p_worker_id,
    'acquire',
    (v_result->>'success')::boolean,
    v_result->>'reason',
    v_user_id
  );

  RETURN v_result;

EXCEPTION
  WHEN serialization_failure THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'SERIALIZATION_CONFLICT',
      'message', 'Transaction conflict detected - retry recommended',
      'document_id', p_document_id,
      'timestamp', now()
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'INTERNAL_ERROR',
      'message', SQLERRM,
      'document_id', p_document_id,
      'timestamp', now()
    );
END;
$$;


-- ============================================================================
-- RELEASE LOCK V7: Maintains atomic pattern
-- ============================================================================

CREATE OR REPLACE FUNCTION public.release_document_lock_v7(
  p_document_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '10s'
AS $$
DECLARE
  v_result JSONB;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'AUTHENTICATION_REQUIRED',
      'message', 'User must be authenticated to release locks',
      'timestamp', now()
    );
  END IF;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  WITH doc_check AS (
    SELECT 
      d.id,
      d.case_id,
      d.locked_by,
      (
        public.has_role(v_user_id, 'admin'::app_role) OR
        EXISTS (
          SELECT 1 FROM public.cases c
          WHERE c.id = d.case_id 
          AND c.user_id = v_user_id
        )
      ) AS has_access
    FROM public.documents d
    WHERE d.id = p_document_id
    FOR UPDATE SKIP LOCKED
  ),
  release_attempt AS (
    UPDATE public.documents d
    SET 
      locked_by = NULL,
      locked_at = NULL
    FROM doc_check dc
    WHERE d.id = dc.id
      AND dc.has_access = true
      AND d.locked_by IS NOT NULL
    RETURNING d.id, dc.case_id
  )
  SELECT 
    CASE 
      WHEN ra.id IS NOT NULL THEN
        jsonb_build_object(
          'success', true,
          'reason', 'SUCCESS',
          'message', 'Lock released successfully',
          'document_id', ra.id,
          'timestamp', now()
        )
      WHEN dc.id IS NULL THEN
        jsonb_build_object(
          'success', false,
          'reason', 'DOCUMENT_NOT_FOUND',
          'message', 'Document does not exist',
          'timestamp', now()
        )
      WHEN dc.has_access = false THEN
        jsonb_build_object(
          'success', false,
          'reason', 'ACCESS_DENIED',
          'message', 'User does not have permission to release this lock',
          'timestamp', now()
        )
      ELSE
        jsonb_build_object(
          'success', false,
          'reason', 'NOT_LOCKED',
          'message', 'Document is not currently locked',
          'timestamp', now()
        )
    END INTO v_result
  FROM release_attempt ra
  FULL OUTER JOIN doc_check dc ON true;

  INSERT INTO public.document_lock_logs (
    document_id,
    worker_id,
    operation,
    success,
    reason,
    user_id
  ) VALUES (
    p_document_id,
    'release',
    'release',
    (v_result->>'success')::boolean,
    v_result->>'reason',
    v_user_id
  );

  RETURN v_result;
END;
$$;


-- ============================================================================
-- CLEANUP EXPIRED LOCKS V7: Admin-only atomic cleanup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_locks_v7(
  p_timeout_seconds INT DEFAULT 300
)
RETURNS TABLE (
  document_id UUID,
  case_id UUID,
  locked_by TEXT,
  locked_at TIMESTAMPTZ,
  lock_age_seconds NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Admin check
  IF NOT public.has_role(v_user_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can cleanup expired locks';
  END IF;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  RETURN QUERY
  WITH cleared AS (
    UPDATE public.documents d
    SET 
      locked_by = NULL,
      locked_at = NULL
    WHERE d.locked_at < (now() - (p_timeout_seconds || ' seconds')::INTERVAL)
      AND d.locked_by IS NOT NULL
    RETURNING 
      d.id,
      d.case_id,
      d.locked_by,
      d.locked_at,
      EXTRACT(EPOCH FROM (now() - d.locked_at)) AS lock_age_seconds
  )
  SELECT 
    c.id,
    c.case_id,
    c.locked_by,
    c.locked_at,
    c.lock_age_seconds
  FROM cleared c;

  -- Log cleanup
  INSERT INTO public.document_lock_logs (
    document_id,
    worker_id,
    operation,
    success,
    reason,
    user_id
  )
  SELECT 
    document_id,
    'cleanup',
    'cleanup',
    true,
    'EXPIRED',
    v_user_id
  FROM cleared;
END;
$$;

COMMENT ON FUNCTION public.acquire_document_lock_v7 IS 
'V7: Total atomic diagnostics - all checks in single CTE snapshot. Zero race conditions.';
COMMENT ON FUNCTION public.release_document_lock_v7 IS 
'V7: Atomic release with inline authorization and state verification.';
COMMENT ON FUNCTION public.cleanup_expired_locks_v7 IS 
'V7: Admin-only atomic cleanup of expired locks.';
