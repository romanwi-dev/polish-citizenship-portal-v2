import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument } from 'https://esm.sh/pdf-lib@1.17.1';
import { checkFileSize, checkHeapMemory, logMemoryStats } from '../_shared/memory-guard.ts';
import { performanceTracker } from '../_shared/performance-tracker.ts';
import { tracer } from '../_shared/distributed-tracer.ts';
import { getPooledAdminClient } from '../_shared/connection-pool.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_LOCKS_PER_DOCUMENT_PER_HOUR = 3;
const LOCK_PDF_SLA_MS = 15000; // 15 seconds

interface LockPDFRequest {
  documentId?: string; // Optional for direct URL locking
  caseId?: string;
  pdfUrl: string;
}

serve(async (req) => {
  const requestStart = Date.now();
  const correlationId = tracer.getCorrelationId(req);
  const perfId = performanceTracker.start('lock-pdf-request');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let lockAcquired = false;
  let documentId: string | null = null;
  let uploadedFilename: string | null = null;

  try {
    logMemoryStats('lock-pdf-start');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create authenticated client using connection pool
    const supabase = getPooledAdminClient();

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      console.error('[lock-pdf] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { documentId: docId, caseId, pdfUrl }: LockPDFRequest = await req.json();
    documentId = docId || null;

    console.log(`[lock-pdf] Request received:`, { documentId, caseId, pdfUrl: pdfUrl.substring(0, 50) + '...', userId: user.id });

    tracer.startSpan(correlationId, 'lock-pdf', 'lock-pdf', { documentId, caseId, userId: user.id });

    // If no documentId provided, this is a direct URL lock (skip DB checks)
    const isDirectLock = !documentId;
    console.log(`[lock-pdf] Mode: ${isDirectLock ? 'DIRECT_LOCK' : 'DOCUMENT_LOCK'}`);

    // PRIORITY 1: Ownership verification (skip for direct locks)
    if (!isDirectLock) {
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('id, case_id, pdf_status, cases(user_id)')
        .eq('id', documentId)
        .single();

      if (docError || !document) {
        console.error('[lock-pdf] Document not found:', docError);
        return new Response(
          JSON.stringify({ error: 'Document not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Extract user_id from nested cases object
      const caseUserId = (document.cases as any)?.user_id;

      // Check ownership (user must own the case OR be admin)
      const { data: isAdmin } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (caseUserId !== user.id && !isAdmin) {
        console.warn(`[lock-pdf] Access denied: User ${user.id} attempted to lock document ${documentId} owned by ${caseUserId}`);
        
        // Log security event
        await supabase.rpc('log_security_event', {
          p_event_type: 'unauthorized_access',
          p_severity: 'warning',
          p_action: 'lock_pdf_denied',
          p_user_id: user.id,
          p_resource_type: 'document',
          p_resource_id: documentId,
          p_details: { caseId, ownerId: caseUserId },
          p_success: false
        });

        return new Response(
          JSON.stringify({ error: 'Access denied: You do not own this document' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // PRIORITY 1: Rate limiting (3 locks per document per hour)
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const { count: recentLocks } = await supabase
        .from('pdf_history')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', documentId)
        .eq('action', 'locked_for_print')
        .gte('created_at', oneHourAgo);

      if (recentLocks && recentLocks >= MAX_LOCKS_PER_DOCUMENT_PER_HOUR) {
        console.warn(`[lock-pdf] Rate limit exceeded: ${recentLocks} locks in past hour for document ${documentId}`);
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            message: `Maximum ${MAX_LOCKS_PER_DOCUMENT_PER_HOUR} lock operations per hour per document`,
            retryAfter: 3600
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '3600' } }
        );
      }

      // PRIORITY 1: State validation
      if (document.pdf_status !== 'generated') {
        console.warn(`[lock-pdf] Invalid state transition: Current state is '${document.pdf_status}', expected 'generated'`);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid state',
            message: `Cannot lock PDF in state '${document.pdf_status}'. Expected 'generated'.`
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // PRIORITY 1: Acquire document lock
      const workerId = `lock-pdf-${crypto.randomUUID()}`;
      const { data: lockResult } = await supabase.rpc('acquire_document_lock_v7', {
        p_document_id: documentId,
        p_worker_id: workerId,
        p_lock_timeout: 300
      });

      if (!lockResult?.success) {
        console.warn('[lock-pdf] Failed to acquire lock:', lockResult?.reason);
        return new Response(
          JSON.stringify({ 
            error: 'Document is locked',
            reason: lockResult?.reason || 'Another operation is in progress',
            message: 'Please try again in a few moments'
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      lockAcquired = true;
      console.log(`[lock-pdf] Lock acquired for document ${documentId}`);
    } else {
      console.log('[lock-pdf] Direct lock mode - skipping DB validation');
    }

    // PRIORITY 1: Memory guards - Check file size before fetching
    console.log(`[lock-pdf] Fetching PDF from: ${pdfUrl.substring(0, 80)}...`);
    const pdfResponse = await performanceTracker.track('fetch-pdf', async () => {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        console.error(`[lock-pdf] Fetch failed: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }
      console.log(`[lock-pdf] PDF fetched successfully, status: ${response.status}`);
      return response;
    });

    const contentLength = pdfResponse.headers.get('content-length');
    if (contentLength) {
      const sizeCheck = checkFileSize(parseInt(contentLength), 'pdf');
      if (!sizeCheck.allowed) {
        console.error('[lock-pdf] File size check failed:', sizeCheck.reason);
        throw new Error(sizeCheck.reason);
      }
      console.log(`[lock-pdf] PDF size: ${(parseInt(contentLength) / 1024 / 1024).toFixed(2)} MB`);
    }

    // Check heap memory before loading PDF
    const heapCheck = checkHeapMemory();
    if (!heapCheck.allowed) {
      console.error('[lock-pdf] Heap memory check failed:', heapCheck.reason);
      throw new Error(heapCheck.reason);
    }

    const pdfBytes = await performanceTracker.track('load-pdf-bytes', async () => {
      return await pdfResponse.arrayBuffer();
    });
    
    // Load and process PDF
    const { pdfDoc, fields } = await performanceTracker.track('load-and-flatten-pdf', async () => {
      const doc = await PDFDocument.load(pdfBytes);
      const pdfForm = doc.getForm();
      const formFields = pdfForm.getFields();
      
      console.log(`[lock-pdf] Found ${formFields.length} fields to flatten`);
      
      // Flatten all fields (makes them non-editable)
      pdfForm.flatten();
      
      console.log(`[lock-pdf] All fields flattened successfully`);
      
      return { pdfDoc: doc, fields: formFields };
    });

    // Save the locked PDF
    const lockedPdfBytes = await performanceTracker.track('save-pdf', async () => {
      return await pdfDoc.save();
    });

    logMemoryStats('lock-pdf-after-processing');
    
    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeCaseId = caseId || 'direct';
    const safeDocId = documentId || crypto.randomUUID().substring(0, 8);
    const filename = `${safeCaseId}/${safeDocId}_locked_${timestamp}.pdf`;
    uploadedFilename = filename; // Track for rollback
    console.log(`[lock-pdf] Generated filename: ${filename}`);
    
    // PRIORITY 1: Upload with rollback capability
    await performanceTracker.track('upload-pdf', async () => {
      const { error: uploadError } = await supabase.storage
        .from('generated-pdfs')
        .upload(filename, lockedPdfBytes, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        console.error('[lock-pdf] Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      console.log(`[lock-pdf] Uploaded to: ${filename}`);
    });

    // Get signed URL (PRIORITY 1: Reduced to 1 hour for security)
    const { data: signedUrlData, error: signedUrlError } = await performanceTracker.track('create-signed-url', async () => {
      return await supabase.storage
        .from('generated-pdfs')
        .createSignedUrl(filename, 3600); // 1 hour (was 1 year)
    });

    if (signedUrlError) {
      // ROLLBACK: Delete uploaded file
      console.error('[lock-pdf] Signed URL error, rolling back upload');
      await supabase.storage.from('generated-pdfs').remove([filename]);
      uploadedFilename = null;
      throw new Error(`Failed to create signed URL: ${signedUrlError.message}`);
    }

    // PRIORITY 1: Update document record with CORRECT state transition (skip for direct locks)
    if (!isDirectLock) {
      const { error: updateError } = await performanceTracker.track('update-document', async () => {
        const { error } = await supabase
          .from('documents')
          .update({
            pdf_locked_url: signedUrlData.signedUrl,
            locked_at: new Date().toISOString(),
            pdf_status: 'locked_for_print',
            status_updated_at: new Date().toISOString()
          })
          .eq('id', documentId);
        
        return { error };
      });

      if (updateError.error) {
        // PRIORITY 1: ROLLBACK - Delete uploaded file on DB failure
        console.error('[lock-pdf] Database update failed, rolling back upload');
        await supabase.storage.from('generated-pdfs').remove([filename]);
        uploadedFilename = null;
        throw new Error(`Database update failed: ${updateError.error.message}`);
      }

      // Log to pdf_history with correct state
      await supabase
        .from('pdf_history')
        .insert({
          document_id: documentId,
          action: 'locked_for_print',
          old_status: 'generated',
          new_status: 'locked_for_print',
          changed_by: user.id,
          metadata: {
            locked_url: signedUrlData.signedUrl,
            field_count: fields.length,
            file_size_bytes: lockedPdfBytes.byteLength,
            correlation_id: correlationId
          }
        });

      // Log security event
      await supabase.rpc('log_security_event', {
        p_event_type: 'pdf_lock',
        p_severity: 'info',
        p_action: 'lock_for_print',
        p_user_id: user.id,
        p_resource_type: 'document',
        p_resource_id: documentId,
        p_details: { 
          caseId, 
          fieldsFlattened: fields.length,
          fileSizeBytes: lockedPdfBytes.byteLength,
          correlationId
        },
        p_success: true
      });
    } else {
      console.log('[lock-pdf] Direct lock - skipping document DB update and history logging');
    }

    const duration = Date.now() - requestStart;
    performanceTracker.end(perfId, 'lock-pdf-request', { 
      success: true, 
      documentId, 
      fieldsFlattened: fields.length,
      fileSizeBytes: lockedPdfBytes.byteLength
    });

    // Check SLA compliance
    if (duration > LOCK_PDF_SLA_MS) {
      console.warn(`[lock-pdf] ⚠️ SLA VIOLATION: ${duration}ms > ${LOCK_PDF_SLA_MS}ms target`);
    } else {
      console.log(`[lock-pdf] ✅ Completed in ${duration}ms (SLA: ${LOCK_PDF_SLA_MS}ms)`);
    }

    tracer.endSpan(correlationId, 'lock-pdf', { 
      success: true, 
      duration,
      fieldsFlattened: fields.length 
    });

    console.log(`[lock-pdf] Successfully locked PDF: ${filename}`);
    logMemoryStats('lock-pdf-complete');

    return new Response(
      JSON.stringify({
        success: true,
        lockedUrl: signedUrlData.signedUrl,
        filename,
        fieldsFlattened: fields.length,
        duration,
        correlationId
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          ...tracer.addTraceHeaders(correlationId)
        }
      }
    );

  } catch (error) {
    const duration = Date.now() - requestStart;
    
    // PRIORITY 1: Clean up on error
    if (lockAcquired && documentId) {
      console.log('[lock-pdf] Releasing lock due to error');
      try {
        await getPooledAdminClient().rpc('release_document_lock_v7', {
          p_document_id: documentId
        });
      } catch (releaseError) {
        console.error('[lock-pdf] Failed to release lock:', releaseError);
      }
    }

    // PRIORITY 1: Rollback uploaded file if DB update failed
    if (uploadedFilename) {
      console.log('[lock-pdf] Rolling back uploaded file due to error');
      try {
        await getPooledAdminClient().storage
          .from('generated-pdfs')
          .remove([uploadedFilename]);
      } catch (rollbackError) {
        console.error('[lock-pdf] Failed to rollback file:', rollbackError);
      }
    }

    performanceTracker.end(perfId, 'lock-pdf-request', { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    tracer.endSpan(correlationId, 'lock-pdf', { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    });

    console.error('[lock-pdf] Error:', error);
    logMemoryStats('lock-pdf-error');

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        correlationId,
        duration
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          ...tracer.addTraceHeaders(correlationId)
        }
      }
    );
  }
});
