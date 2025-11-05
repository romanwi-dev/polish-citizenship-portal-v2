/**
 * Database lock utilities for preventing race conditions in document processing
 * Uses atomic DB operations to ensure only one worker processes a document at a time
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Attempts to acquire an exclusive lock on a document
 * Returns true if lock acquired, false if document is already locked
 */
export async function acquireDocumentLock(
  supabase: SupabaseClient,
  documentId: string,
  workerId: string,
  lockTimeoutSeconds: number = 300 // 5 minutes default
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('acquire_document_lock', {
      p_document_id: documentId,
      p_worker_id: workerId,
      p_lock_timeout: lockTimeoutSeconds
    });

    if (error) {
      console.error(`Failed to acquire lock for document ${documentId}:`, error);
      return false;
    }

    return data === true;
  } catch (err) {
    console.error(`Exception acquiring lock for document ${documentId}:`, err);
    return false;
  }
}

/**
 * Releases the lock on a document
 * Should be called in finally block to ensure cleanup even on errors
 */
export async function releaseDocumentLock(
  supabase: SupabaseClient,
  documentId: string
): Promise<void> {
  try {
    const { error } = await supabase.rpc('release_document_lock', {
      p_document_id: documentId
    });

    if (error) {
      console.error(`Failed to release lock for document ${documentId}:`, error);
    }
  } catch (err) {
    console.error(`Exception releasing lock for document ${documentId}:`, err);
  }
}

/**
 * Checks if a document is currently locked
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
