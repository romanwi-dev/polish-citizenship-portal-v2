-- ============================================================================
-- Document Lock System V5 - ATOMIC AUTHORIZATION (TOCTOU ELIMINATION)
-- ============================================================================
-- CRITICAL FIX: Eliminates Time-of-Check-Time-of-Use (TOCTOU) vulnerability
-- by performing ALL authorization checks atomically within the UPDATE operation.
-- 
-- V5 CHANGES FROM V4:
-- - Removed separate user_can_access_document pre-check (TOCTOU vector)
-- - Authorization now happens atomically in UPDATE WHERE clause
-- - Returns JSONB with detailed success/failure reasons
-- - Single point of truth for all authorization logic
-- - Granular error messages (AUTH_REQUIRED, ACCESS_DENIED, ALREADY_LOCKED, etc.)
-- 
-- SECURITY IMPROVEMENTS:
-- - Zero TOCTOU window (atomic operation)
-- - One database query instead of two
-- - Explicit error categorization
-- - Admin bypass can be added atomically
-- ============================================================================

-- ============================================================================
-- ACQUIRE LOCK V5: Atomic lock acquisition with embedded authorization
-- ============================================================================
CREATE OR REPLACE FUNCTION public.acquire_document_lock_v5(
  p_document_id UUID,
  p_worker_id TEXT,
  p_lock_timeout INT DEFAULT 300
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_rows_affected INT;
  v_lock_acquired BOOLEAN := false;
  v_reason TEXT;
  v_is_admin BOOLEAN := false;
BEGIN
  -- 1. Authentication check (required)
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'AUTH_REQUIRED',
      'code', 'RLS-AUTH-001',
      'message', 'Authentication required to acquire document lock'
    );
  END IF;
  
  -- 2. Check admin status (if has_role function exists)
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'has_role' 
    AND pronamespace = 'public'::regnamespace
  ) THEN
    v_is_admin := public.has_role(v_user_id, 'admin');
  END IF;
  
  -- 3. ATOMIC lock acquisition with embedded authorization
  -- All authorization checks happen in WHERE clause - no TOCTOU window
  WITH lock_attempt AS (
    UPDATE public.documents d
    SET 
      locked_by = p_worker_id,
      locked_at = now()
    FROM public.cases c
    WHERE d.id = p_document_id
      AND d.case_id = c.id
      -- ATOMIC AUTHORIZATION: All checks in single WHERE clause
      AND (
        c.owner_id = v_user_id  -- User owns the case
        OR v_is_admin = true     -- OR user is admin
      )
      AND (
        d.locked_by IS NULL  -- Not currently locked
        OR d.locked_at < (now() - (p_lock_timeout || ' seconds')::interval)  -- Lock expired
      )
    RETURNING d.id
  )
  SELECT COUNT(*) INTO v_rows_affected FROM lock_attempt;
  
  v_lock_acquired := (v_rows_affected > 0);
  
  -- 4. Determine specific failure reason (if lock not acquired)
  IF NOT v_lock_acquired THEN
    -- Check: Does document exist?
    IF NOT EXISTS (SELECT 1 FROM public.documents WHERE id = p_document_id) THEN
      v_reason := 'DOCUMENT_NOT_FOUND';
    -- Check: Does user have access (ownership or admin)?
    ELSIF NOT EXISTS (
      SELECT 1 FROM public.documents d
      JOIN public.cases c ON c.id = d.case_id
      WHERE d.id = p_document_id 
        AND (c.owner_id = v_user_id OR v_is_admin = true)
    ) THEN
      v_reason := 'ACCESS_DENIED';
    -- Must be locked by someone else
    ELSE
      v_reason := 'ALREADY_LOCKED';
    END IF;
  ELSE
    v_reason := 'SUCCESS';
  END IF;
  
  -- 5. Audit log with detailed metadata
  INSERT INTO public.document_lock_log (
    document_id,
    worker_id,
    action,
    success,
    user_id,
    metadata
  ) VALUES (
    p_document_id,
    p_worker_id,
    'ACQUIRE_V5',
    v_lock_acquired,
    v_user_id,
    jsonb_build_object(
      'reason', v_reason,
      'is_admin', v_is_admin,
      'lock_timeout', p_lock_timeout
    )
  );
  
  -- 6. Return detailed result
  RETURN jsonb_build_object(
    'success', v_lock_acquired,
    'reason', v_reason,
    'worker_id', CASE WHEN v_lock_acquired THEN p_worker_id ELSE NULL END,
    'timestamp', now(),
    'user_id', v_user_id,
    'is_admin', v_is_admin
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- RELEASE LOCK V5: Atomic lock release with embedded authorization
-- ============================================================================
CREATE OR REPLACE FUNCTION public.release_document_lock_v5(
  p_document_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_rows_affected INT;
  v_lock_released BOOLEAN := false;
  v_reason TEXT;
  v_is_admin BOOLEAN := false;
BEGIN
  -- 1. Authentication check
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'reason', 'AUTH_REQUIRED',
      'code', 'RLS-AUTH-003',
      'message', 'Authentication required to release document lock'
    );
  END IF;
  
  -- 2. Check admin status
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'has_role' 
    AND pronamespace = 'public'::regnamespace
  ) THEN
    v_is_admin := public.has_role(v_user_id, 'admin');
  END IF;
  
  -- 3. ATOMIC lock release with embedded authorization
  WITH release_attempt AS (
    UPDATE public.documents d
    SET 
      locked_by = NULL,
      locked_at = NULL
    FROM public.cases c
    WHERE d.id = p_document_id
      AND d.case_id = c.id
      AND (
        c.owner_id = v_user_id  -- User owns the case
        OR v_is_admin = true     -- OR user is admin
      )
    RETURNING d.id
  )
  SELECT COUNT(*) INTO v_rows_affected FROM release_attempt;
  
  v_lock_released := (v_rows_affected > 0);
  
  -- 4. Determine failure reason
  IF NOT v_lock_released THEN
    IF NOT EXISTS (SELECT 1 FROM public.documents WHERE id = p_document_id) THEN
      v_reason := 'DOCUMENT_NOT_FOUND';
    ELSIF NOT EXISTS (
      SELECT 1 FROM public.documents d
      JOIN public.cases c ON c.id = d.case_id
      WHERE d.id = p_document_id 
        AND (c.owner_id = v_user_id OR v_is_admin = true)
    ) THEN
      v_reason := 'ACCESS_DENIED';
    ELSE
      v_reason := 'NOT_LOCKED';
    END IF;
  ELSE
    v_reason := 'SUCCESS';
  END IF;
  
  -- 5. Audit log
  INSERT INTO public.document_lock_log (
    document_id,
    worker_id,
    action,
    success,
    user_id,
    metadata
  ) VALUES (
    p_document_id,
    NULL,
    'RELEASE_V5',
    v_lock_released,
    v_user_id,
    jsonb_build_object(
      'reason', v_reason,
      'is_admin', v_is_admin
    )
  );
  
  -- 6. Return result
  RETURN jsonb_build_object(
    'success', v_lock_released,
    'reason', v_reason,
    'timestamp', now(),
    'user_id', v_user_id,
    'is_admin', v_is_admin
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- CLEANUP V5: Remove expired locks (ADMIN ONLY)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_locks_v5(
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
  -- Authentication check
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required (RLS-AUTH-005)';
  END IF;
  
  -- Admin check
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
    'CLEANUP_V5',
    TRUE,
    v_user_id
  FROM expired_locks;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- PERMISSIONS
-- ============================================================================
GRANT EXECUTE ON FUNCTION public.acquire_document_lock_v5(UUID, TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_document_lock_v5(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_locks_v5(INT) TO authenticated;
