/**
 * ATOMIC Database Lock Utilities (Version 3)
 * 
 * Eliminates TOCTOU vulnerabilities through atomic authorization.
 * All security checks happen within database UPDATE operations.
 * 
 * Key Security Features:
 * - Zero TOCTOU window (atomic authorization)
 * - All operations require authentication (auth.uid())
 * - Granular error messages (AUTH_REQUIRED, ACCESS_DENIED, ALREADY_LOCKED, etc.)
 * - Comprehensive audit logging
 * - Admin bypass support
 * 
 * Breaking Changes from V2:
 * - Functions return JSONB instead of BOOLEAN
 * - Callers must check result.success instead of direct boolean
 * - More detailed error information available
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Result type for lock operations
 */
interface LockResult {
  success: boolean;
  reason: 'SUCCESS' | 'AUTH_REQUIRED' | 'ACCESS_DENIED' | 'ALREADY_LOCKED' | 'DOCUMENT_NOT_FOUND' | 'NOT_LOCKED';
  code?: string;
  message?: string;
  worker_id?: string | null;
  timestamp?: string;
  user_id?: string;
  is_admin?: boolean;
}

/**
 * Attempts to acquire an exclusive lock on a document (V5 - Atomic Authorization)
 * 
 * SECURITY: All authorization checks happen atomically within UPDATE operation
 * ATOMICITY: Uses single UPDATE with embedded WHERE clause - no TOCTOU window
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
    console.log(`🔒 [V5] Attempting to acquire lock for document ${documentId} (worker: ${workerId})`);
    
    // Call V5 atomic lock function
    const { data, error } = await supabase.rpc('acquire_document_lock_v5', {
      p_document_id: documentId,
      p_worker_id: workerId,
      p_lock_timeout: lockTimeoutSeconds
    });

    if (error) {
      console.error(`❌ [V5] Lock acquisition failed for document ${documentId}:`, error);
      return {
        success: false,
        reason: 'AUTH_REQUIRED',
        message: error.message
      };
    }

    const result = data as LockResult;

    if (result.success) {
      console.log(`✅ [V5] Lock acquired for document ${documentId} (reason: ${result.reason})`);
    } else {
      console.log(`⏸️ [V5] Lock not acquired for document ${documentId} (reason: ${result.reason})`);
    }
    
    return result;
    
  } catch (err) {
    console.error(`💥 [V5] Exception acquiring lock for document ${documentId}:`, err);
    return {
      success: false,
      reason: 'AUTH_REQUIRED',
      message: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Releases the lock on a document (V5 - Atomic Authorization)
 * 
 * SECURITY: All authorization checks happen atomically within UPDATE operation
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
    console.log(`🔓 [V5] Releasing lock for document ${documentId}`);
    
    const { data, error } = await supabase.rpc('release_document_lock_v5', {
      p_document_id: documentId
    });

    if (error) {
      console.error(`❌ [V5] Lock release failed for document ${documentId}:`, error);
      return {
        success: false,
        reason: 'AUTH_REQUIRED',
        message: error.message
      };
    }

    const result = data as LockResult;

    if (result.success) {
      console.log(`✅ [V5] Lock released for document ${documentId} (reason: ${result.reason})`);
    } else {
      console.log(`⚠️ [V5] Lock release failed for document ${documentId} (reason: ${result.reason})`);
    }
    
    return result;
    
  } catch (err) {
    console.error(`💥 [V5] Exception releasing lock for document ${documentId}:`, err);
    return {
      success: false,
      reason: 'AUTH_REQUIRED',
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
 * Cleanup expired locks (ADMIN ONLY) (V5)
 * 
 * SECURITY: Requires admin role
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
    console.log(`🧹 [V5] Cleaning up locks older than ${timeoutSeconds} seconds`);
    
    const { data, error } = await supabase.rpc('cleanup_expired_locks_v5', {
      p_timeout_seconds: timeoutSeconds
    });

    if (error) {
      if (error.message.includes('Admin access required')) {
        console.error(`❌ [V5] Lock cleanup failed: User is not an admin`);
      } else {
        console.error(`❌ [V5] Lock cleanup failed:`, error);
      }
      return [];
    }

    const cleanedCount = data?.length || 0;
    if (cleanedCount > 0) {
      console.log(`✅ [V5] Cleaned up ${cleanedCount} expired locks`);
    } else {
      console.log(`✅ [V5] No expired locks found`);
    }
    
    return data || [];
    
  } catch (err) {
    console.error(`💥 [V5] Exception during lock cleanup:`, err);
    return [];
  }
}
