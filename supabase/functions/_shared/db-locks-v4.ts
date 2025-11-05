/**
 * SERIALIZABLE Database Lock Utilities (Version 7)
 * 
 * Eliminates ALL race conditions through single-CTE atomic diagnostics.
 * All security checks happen atomically with inline admin verification.
 * 
 * Key Security Features:
 * - Zero TOCTOU window (single CTE atomic diagnostics)
 * - Zero race conditions (SERIALIZABLE isolation)
 * - Row-level locking (FOR UPDATE SKIP LOCKED)
 * - All operations require authentication (auth.uid())
 * - Granular error messages (AUTHENTICATION_REQUIRED, ACCESS_DENIED, ALREADY_LOCKED, etc.)
 * - Comprehensive audit logging
 * - Admin bypass support (inline query, not cached)
 * - Serialization conflict detection
 * 
 * Changes from V6:
 * - Single-CTE atomic diagnostics (all checks in one snapshot)
 * - Enhanced error granularity (SERIALIZATION_CONFLICT, INTERNAL_ERROR)
 * - Improved JSONB response structure from database functions
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Result type for lock operations
 */
interface LockResult {
  success: boolean;
  reason: 'SUCCESS' | 'AUTHENTICATION_REQUIRED' | 'ACCESS_DENIED' | 'ALREADY_LOCKED' | 'DOCUMENT_NOT_FOUND' | 'NOT_LOCKED' | 'LOCK_FAILED' | 'RELEASE_FAILED' | 'SERIALIZATION_CONFLICT' | 'INTERNAL_ERROR' | 'UNKNOWN_ERROR';
  code?: string;
  message?: string;
  worker_id?: string | null;
  timestamp?: string;
  user_id?: string;
  is_admin?: boolean;
  locked_by?: string | null;
  locked_at?: string | null;
  lock_age_seconds?: number;
}

/**
 * Attempts to acquire an exclusive lock on a document (V7 - Single-CTE Atomic)
 * 
 * SECURITY: All authorization checks happen atomically in single CTE
 * ATOMICITY: Single CTE with all diagnostics - zero TOCTOU window
 * ISOLATION: SERIALIZABLE prevents all race conditions
 * 
 * @param supabase - Authenticated Supabase client (MUST have valid auth token)
 * @param documentId - UUID of document to lock
 * @param workerId - Identifier for the worker acquiring the lock
 * @param lockTimeoutSeconds - Lock expiration timeout (default: 5 minutes)
 * @returns LockResult with success flag and detailed reason
 */
export async function acquireDocumentLock(
  supabase: SupabaseClient,
  documentId: string,
  workerId: string,
  lockTimeoutSeconds: number = 300
): Promise<LockResult> {
  try {
    console.log(`🔒 [V7] Attempting to acquire lock for document ${documentId} (worker: ${workerId})`);
    
    // Call V7 single-CTE atomic lock function
    const { data, error } = await supabase.rpc('acquire_document_lock_v7', {
      p_document_id: documentId,
      p_worker_id: workerId,
      p_lock_timeout: lockTimeoutSeconds
    });

    if (error) {
      console.error(`❌ [V7] Lock acquisition failed for document ${documentId}:`, error);
      return {
        success: false,
        reason: 'AUTHENTICATION_REQUIRED',
        message: error.message
      };
    }

    // V7 returns JSONB with enhanced structure
    const result = data as any;
    
    // Map V7 response to LockResult interface
    const mappedResult: LockResult = {
      success: result.success || false,
      reason: result.reason || 'UNKNOWN_ERROR',
      message: result.message,
      worker_id: result.worker_id,
      timestamp: result.timestamp,
      user_id: result.user_id,
      is_admin: result.is_admin,
      locked_by: result.locked_by,
      locked_at: result.locked_at,
      lock_age_seconds: result.lock_age_seconds
    };

    if (mappedResult.success) {
      console.log(`✅ [V7] Lock acquired for document ${documentId} (reason: ${mappedResult.reason})`);
    } else {
      console.log(`⏸️ [V7] Lock not acquired for document ${documentId} (reason: ${mappedResult.reason})`);
      if (mappedResult.reason === 'SERIALIZATION_CONFLICT') {
        console.warn(`⚠️ [V7] Serialization conflict detected - retry recommended`);
      }
    }
    
    return mappedResult;
    
  } catch (err) {
    console.error(`💥 [V7] Exception acquiring lock for document ${documentId}:`, err);
    return {
      success: false,
      reason: 'INTERNAL_ERROR',
      message: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Releases the lock on a document (V7 - Single-CTE Atomic)
 * 
 * SECURITY: All authorization checks happen atomically in single CTE
 * Should be called in finally block to ensure cleanup even on errors
 * 
 * @param supabase - Authenticated Supabase client
 * @param documentId - UUID of document to unlock
 * @returns LockResult with success flag and detailed reason
 */
export async function releaseDocumentLock(
  supabase: SupabaseClient,
  documentId: string
): Promise<LockResult> {
  try {
    console.log(`🔓 [V7] Releasing lock for document ${documentId}`);
    
    const { data, error } = await supabase.rpc('release_document_lock_v7', {
      p_document_id: documentId
    });

    if (error) {
      console.error(`❌ [V7] Lock release failed for document ${documentId}:`, error);
      return {
        success: false,
        reason: 'AUTHENTICATION_REQUIRED',
        message: error.message
      };
    }

    // V7 returns JSONB with enhanced structure
    const result = data as any;
    
    // Map V7 response to LockResult interface
    const mappedResult: LockResult = {
      success: result.success || false,
      reason: result.reason || 'UNKNOWN_ERROR',
      message: result.message,
      timestamp: result.timestamp
    };

    if (mappedResult.success) {
      console.log(`✅ [V7] Lock released for document ${documentId} (reason: ${mappedResult.reason})`);
    } else {
      console.log(`⚠️ [V7] Lock release failed for document ${documentId} (reason: ${mappedResult.reason})`);
      if (mappedResult.reason === 'SERIALIZATION_CONFLICT') {
        console.warn(`⚠️ [V7] Serialization conflict detected - retry recommended`);
      }
    }
    
    return mappedResult;
    
  } catch (err) {
    console.error(`💥 [V7] Exception releasing lock for document ${documentId}:`, err);
    return {
      success: false,
      reason: 'INTERNAL_ERROR',
      message: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Checks if a document is currently locked
 * 
 * NOTE: This is a read-only check and does not require special permissions
 * beyond standard RLS policies for the documents table
 * 
 * @param supabase - Authenticated Supabase client
 * @param documentId - UUID of document to check
 * @returns true if document is locked, false otherwise
 */
export async function isDocumentLocked(
  supabase: SupabaseClient,
  documentId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('locked_by, locked_at')
      .eq('id', documentId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.locked_by !== null;
  } catch {
    return false;
  }
}

/**
 * Cleanup expired locks (ADMIN ONLY) (V7 - Single-CTE Atomic)
 * 
 * SECURITY: Requires admin role (verified atomically in single CTE)
 * ISOLATION: SERIALIZABLE prevents race conditions
 * Should be called periodically by admin workers
 * 
 * @param supabase - Authenticated Supabase client (MUST be admin)
 * @param timeoutSeconds - Lock expiration threshold (default: 10 minutes)
 * @returns Array of cleaned up lock records
 */
export async function cleanupExpiredLocks(
  supabase: SupabaseClient,
  timeoutSeconds: number = 600
): Promise<Array<{
  document_id: string;
  case_id: string;
  worker_id: string;
  locked_duration_seconds: number;
}>> {
  try {
    console.log(`🧹 [V7] Cleaning up locks older than ${timeoutSeconds} seconds`);
    
    const { data, error } = await supabase.rpc('cleanup_expired_locks_v7', {
      p_timeout_seconds: timeoutSeconds
    });

    if (error) {
      if (error.message.includes('Only admins can cleanup expired locks')) {
        console.error(`❌ [V7] Lock cleanup failed: User is not an admin`);
      } else {
        console.error(`❌ [V7] Lock cleanup failed:`, error);
      }
      return [];
    }

    const cleanedCount = data?.length || 0;
    if (cleanedCount > 0) {
      console.log(`✅ [V7] Cleaned up ${cleanedCount} expired locks`);
    } else {
      console.log(`✅ [V7] No expired locks found`);
    }
    
    return data || [];
    
  } catch (err) {
    console.error(`💥 [V7] Exception during lock cleanup:`, err);
    return [];
  }
}
