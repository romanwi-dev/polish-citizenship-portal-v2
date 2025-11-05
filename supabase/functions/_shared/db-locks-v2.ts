/**
 * ZERO-FAIL Database Lock Utilities (Version 2)
 * 
 * Authenticated, RLS-compliant lock management for document processing
 * Uses atomic DB operations with proper security checks
 * 
 * Key Security Features:
 * - All operations require authentication (auth.uid())
 * - RLS compliance through security definer functions
 * - Atomic lock acquisition with FOR UPDATE SKIP LOCKED
 * - Comprehensive audit logging
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Attempts to acquire an exclusive lock on a document
 * 
 * SECURITY: Requires authenticated user with access to document
 * ATOMICITY: Uses FOR UPDATE SKIP LOCKED to prevent race conditions
 * 
 * @param supabase - Authenticated Supabase client (MUST have valid auth token)
 * @param documentId - UUID of document to lock
 * @param workerId - Identifier for the worker acquiring the lock
 * @param lockTimeoutSeconds - Lock expiration timeout (default: 5 minutes)
 * @returns true if lock acquired, false otherwise
 */
export async function acquireDocumentLock(
  supabase: SupabaseClient,
  documentId: string,
  workerId: string,
  lockTimeoutSeconds: number = 300
): Promise<boolean> {
  try {
    console.log(`🔒 Attempting to acquire lock for document ${documentId} (worker: ${workerId})`);
    
    // Call authenticated, RLS-compliant lock function
    const { data, error } = await supabase.rpc('acquire_document_lock', {
      p_document_id: documentId,
      p_worker_id: workerId,
      p_lock_timeout: lockTimeoutSeconds
    });

    if (error) {
      // Log security/access errors separately
      if (error.message.includes('Authentication required')) {
        console.error(`❌ Lock acquisition failed: Not authenticated`);
      } else if (error.message.includes('Access denied')) {
        console.error(`❌ Lock acquisition failed: User does not have access to document ${documentId}`);
      } else {
        console.error(`❌ Lock acquisition failed for document ${documentId}:`, error);
      }
      return false;
    }

    if (data === true) {
      console.log(`✅ Lock acquired for document ${documentId}`);
      return true;
    }
    
    console.log(`⏸️ Lock not acquired for document ${documentId} (already locked or access denied)`);
    return false;
    
  } catch (err) {
    console.error(`💥 Exception acquiring lock for document ${documentId}:`, err);
    return false;
  }
}

/**
 * Releases the lock on a document
 * 
 * SECURITY: Requires authenticated user with access to document
 * Should be called in finally block to ensure cleanup even on errors
 * 
 * @param supabase - Authenticated Supabase client
 * @param documentId - UUID of document to unlock
 */
export async function releaseDocumentLock(
  supabase: SupabaseClient,
  documentId: string
): Promise<void> {
  try {
    console.log(`🔓 Releasing lock for document ${documentId}`);
    
    const { error } = await supabase.rpc('release_document_lock', {
      p_document_id: documentId
    });

    if (error) {
      if (error.message.includes('Authentication required')) {
        console.error(`❌ Lock release failed: Not authenticated`);
      } else if (error.message.includes('Access denied')) {
        console.error(`❌ Lock release failed: User does not have access to document ${documentId}`);
      } else {
        console.error(`❌ Failed to release lock for document ${documentId}:`, error);
      }
    } else {
      console.log(`✅ Lock released for document ${documentId}`);
    }
  } catch (err) {
    console.error(`💥 Exception releasing lock for document ${documentId}:`, err);
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
 * Cleanup expired locks (ADMIN ONLY)
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
    console.log(`🧹 Cleaning up locks older than ${timeoutSeconds} seconds`);
    
    const { data, error } = await supabase.rpc('cleanup_expired_locks', {
      p_timeout_seconds: timeoutSeconds
    });

    if (error) {
      if (error.message.includes('Admin access required')) {
        console.error(`❌ Lock cleanup failed: User is not an admin`);
      } else {
        console.error(`❌ Lock cleanup failed:`, error);
      }
      return [];
    }

    const cleanedCount = data?.length || 0;
    if (cleanedCount > 0) {
      console.log(`✅ Cleaned up ${cleanedCount} expired locks`);
    } else {
      console.log(`✅ No expired locks found`);
    }
    
    return data || [];
    
  } catch (err) {
    console.error(`💥 Exception during lock cleanup:`, err);
    return [];
  }
}
