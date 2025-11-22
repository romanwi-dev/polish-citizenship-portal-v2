import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration
const MAX_CONCURRENT_OCR = 5;
const MAX_RETRIES = 3;
const PROCESSING_TIMEOUT_MINUTES = 5;
const RATE_LIMIT_DELAY_MS = 200; // V9.3: Delay between Dropbox API calls
const CIRCUIT_BREAKER_THRESHOLD = 5; // V9.3: Number of consecutive errors before circuit opens
const CIRCUIT_BREAKER_TIMEOUT_MS = 15 * 60 * 1000; // V9.3: 15 minutes

// V9.3: Circuit breaker state
const circuitBreaker = {
  failureCount: 0,
  lastErrorType: null as string | null,
  openedAt: null as number | null,
  
  recordFailure(errorType: string): boolean {
    if (this.lastErrorType === errorType) {
      this.failureCount++;
    } else {
      this.failureCount = 1;
      this.lastErrorType = errorType;
    }
    
    if (this.failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
      this.openedAt = Date.now();
      return true; // Circuit opened
    }
    return false;
  },
  
  recordSuccess() {
    this.failureCount = 0;
    this.lastErrorType = null;
    this.openedAt = null;
  },
  
  isOpen(): boolean {
    if (!this.openedAt) return false;
    
    const elapsed = Date.now() - this.openedAt;
    if (elapsed > CIRCUIT_BREAKER_TIMEOUT_MS) {
      // Circuit timeout expired, reset
      this.reset();
      return false;
    }
    return true;
  },
  
  reset() {
    this.failureCount = 0;
    this.lastErrorType = null;
    this.openedAt = null;
  }
};

// Error classification for intelligent retry logic with terminal states
type ErrorClassification = {
  type: 'permanent' | 'transient';
  terminalStatus?: string; // Specific terminal status if permanent
};

function classifyError(errorMessage: string, errorData?: any): ErrorClassification {
  // Permanent errors with specific terminal states
  if (/404/i.test(errorMessage) || /file.*not.*found/i.test(errorMessage) || 
      /path.*not.*found/i.test(errorMessage) || errorData?.isPermanent === true) {
    return { type: 'permanent', terminalStatus: 'missing_remote_file' };
  }
  
  if (/invalid.*pdf/i.test(errorMessage) || /corrupted.*pdf/i.test(errorMessage) || 
      /pdf.*parse.*error/i.test(errorMessage)) {
    return { type: 'permanent', terminalStatus: 'pdf_corrupt' };
  }
  
  const permanentPatterns = [
    /invalid.*image/i,
    /unsupported.*format/i,
    /image.*too.*large/i,
    /no.*text.*found/i,
    /pdf.*not.*supported/i,
    /path.*error/i,
  ];
  
  const transientPatterns = [
    /timeout/i,
    /network/i,
    /connection/i,
    /rate.*limit/i,
    /temporary/i,
  ];
  
  if (permanentPatterns.some(pattern => pattern.test(errorMessage))) {
    return { type: 'permanent' };
  }
  
  if (transientPatterns.some(pattern => pattern.test(errorMessage))) {
    return { type: 'transient' };
  }
  
  return { type: 'transient' };
}

// Calculate exponential backoff for retry timing
function calculateNextRetry(retryCount: number): Date {
  const baseDelayMs = 60000; // 1 minute
  const maxDelayMs = 3600000; // 1 hour
  
  // Exponential: 1min, 2min, 4min, 8min, etc.
  const delayMs = Math.min(
    baseDelayMs * Math.pow(2, retryCount),
    maxDelayMs
  );
  
  return new Date(Date.now() + delayMs);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );

  console.log("OCR Worker: Starting batch processing...");
  
  const results: Array<{
    documentId: string;
    name: string;
    status: 'success' | 'failed' | 'skipped';
    reason?: string;
    extractedData?: any;
  }> = [];

  try {
    // V9.3: Check circuit breaker before processing
    if (circuitBreaker.isOpen()) {
      const timeRemaining = Math.ceil((CIRCUIT_BREAKER_TIMEOUT_MS - (Date.now() - circuitBreaker.openedAt!)) / 1000 / 60);
      console.log(`⚠️  Circuit breaker OPEN due to repeated ${circuitBreaker.lastErrorType} errors. Skipping processing for ${timeRemaining} more minutes.`);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: "Circuit breaker open",
          error_type: circuitBreaker.lastErrorType,
          retry_after_minutes: timeRemaining
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
      );
    }

    // STEP 1: V9.2: Reset stuck documents (processing > 5 min OR pending with past retry time)
    console.log(`🔄 Checking for stuck documents...`);
    const timeoutThreshold = new Date(Date.now() - PROCESSING_TIMEOUT_MINUTES * 60 * 1000).toISOString();
    
    // Stuck in processing state
    const { data: stuckProcessing } = await supabase
      .from("documents")
      .select("id, case_id, name, updated_at")
      .eq("ocr_status", "processing")
      .lt("updated_at", timeoutThreshold);
    
    // Stuck in pending with past retry time
    const { data: stuckPending } = await supabase
      .from("documents")
      .select("id, case_id, name, ocr_next_retry_at")
      .eq("ocr_status", "pending")
      .not("ocr_next_retry_at", "is", null)
      .lt("ocr_next_retry_at", new Date().toISOString());
    
    const stuckDocs = [...(stuckProcessing || []), ...(stuckPending || [])];

    if (stuckDocs.length > 0) {
      console.log(`⚠️  Found ${stuckDocs.length} stuck documents, resetting to pending...`);
      
      // V9.2: Log stuck document resets to HAC
      for (const doc of stuckDocs) {
      const stuckDuration = (doc as any).updated_at 
        ? Math.floor((Date.now() - new Date((doc as any).updated_at).getTime()) / 1000 / 60)
        : 'unknown';
      
      const resetReason = (doc as any).ocr_next_retry_at 
        ? "pending_with_past_retry_time" 
        : "processing_timeout";
      
      await supabase.from("hac_logs").insert({
        case_id: doc.case_id,
        action_type: "ocr_stuck_documents_reset",
        action_details: `Reset stuck document: ${doc.name}`,
        performed_by: "system",
        metadata: {
          scope: 'ocr_worker',
          document_id: doc.id,
          stuck_duration_minutes: stuckDuration,
          reset_reason: resetReason
        }
      });
      }
      
      const { error: resetError } = await supabase
        .from("documents")
        .update({ 
          ocr_status: "pending",
          ocr_next_retry_at: null,
          ocr_error_message: "Reset from stuck state",
          updated_at: new Date().toISOString()
        })
        .in("id", stuckDocs.map(d => d.id));

      if (resetError) {
        console.error("❌ Error resetting stuck documents:", resetError);
      } else {
        console.log(`✅ Reset ${stuckDocs.length} stuck documents to pending`);
      }
    }

    // STEP 2: Fetch pending documents with exponential backoff support
    console.log("📥 Fetching pending documents from valid /CASES paths...");
    const now = new Date().toISOString();
    const { data: queuedDocs, error: fetchError } = await supabase
      .from("documents")
      .select("id, case_id, dropbox_path, document_type, person_type, name, ocr_retry_count, file_extension, ocr_next_retry_at")
      .eq("ocr_status", "pending")
      .like("dropbox_path", "/CASES/%")           // Must be in /CASES
      .not("dropbox_path", "like", "/CASES/###%") // NOT archived
      .not("dropbox_path", "like", "/TEST/%")     // NOT test
      .lt("ocr_retry_count", MAX_RETRIES)
      .or(`ocr_next_retry_at.is.null,ocr_next_retry_at.lte.${now}`) // Only ready for retry
      .order("created_at", { ascending: true })
      .limit(MAX_CONCURRENT_OCR);

    if (fetchError) {
      console.error("❌ Error fetching queued documents:", fetchError);
      throw fetchError;
    }

    if (!queuedDocs || queuedDocs.length === 0) {
      console.log("No pending documents found");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No pending documents to process",
          processed: 0,
          results: []
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📋 Found ${queuedDocs.length} documents to process`);

    // STEP 3: Process each document with rate limiting
    for (let i = 0; i < queuedDocs.length; i++) {
      const doc = queuedDocs[i];
      const logId = crypto.randomUUID();
      const startTime = new Date();
      
      // V9.3: Rate limiting - delay between Dropbox API calls (except first)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
      }
      
      try {
        console.log(`\n🔄 Processing document ${doc.id} (${doc.name})`);
        
        // Update to processing state
        await supabase
          .from("documents")
          .update({ 
            ocr_status: "processing",
            updated_at: new Date().toISOString()
          })
          .eq("id", doc.id);

        // Log start
        await supabase
          .from("ocr_processing_logs")
          .insert({
            id: logId,
            document_id: doc.id,
            case_id: doc.case_id,
            started_at: startTime.toISOString(),
            status: 'processing'
          });

        // HANDLE PDFs: Route to pdf-extract function
        const isPDF = doc.file_extension === '.pdf' || 
                      doc.file_extension === 'pdf' ||
                      doc.name?.toLowerCase().endsWith('.pdf');

        if (isPDF) {
          console.log('📄 PDF detected - routing to pdf-extract function...');
          
          const { data: pdfData, error: pdfError } = await supabase.functions.invoke('pdf-extract', {
            body: { 
              documentId: doc.id,
              dropboxPath: doc.dropbox_path 
            }
          });

          if (pdfError) {
            throw new Error(`PDF extraction failed: ${pdfError.message}`);
          }

          // Update document with PDF extraction results
          await supabase
            .from("documents")
            .update({ 
              ocr_status: "completed",
              ocr_text: pdfData.extractedText,
              ocr_confidence: 0.95, // PDFs have high confidence
              updated_at: new Date().toISOString()
            })
            .eq("id", doc.id);

          // Log completion
          await supabase
            .from("ocr_processing_logs")
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              duration_ms: Date.now() - startTime.getTime()
            })
            .eq("id", logId);

          results.push({
            documentId: doc.id,
            name: doc.name,
            status: 'success',
            reason: 'PDF text extraction',
            extractedData: pdfData
          });

          console.log(`✅ PDF extraction successful for ${doc.name}`);
          
          // V9.3: Record success for circuit breaker
          circuitBreaker.recordSuccess();
          continue;
        }

        // HANDLE IMAGES: Download from Dropbox
        if (!doc.dropbox_path) {
          throw new Error('No Dropbox path found for document');
        }

        console.log(`📥 Downloading from Dropbox: ${doc.dropbox_path}`);
        const { data: downloadData, error: downloadError } = await supabase.functions.invoke(
          "dropbox-download",
          {
            body: { 
              file_path: doc.dropbox_path,
              document_id: doc.id,
              case_id: doc.case_id
            }
          }
        );

        if (downloadError) {
          // Pass download error data for better classification
          throw Object.assign(
            new Error(`Dropbox download failed: ${downloadError.message}`),
            { dropboxErrorData: downloadData }
          );
        }

        if (!downloadData?.arrayBuffer) {
          throw new Error('No file data returned from Dropbox');
        }

        console.log(`✅ Downloaded ${downloadData.arrayBuffer.byteLength} bytes`);

        // Convert to base64
        const uint8Array = new Uint8Array(downloadData.arrayBuffer);
        const base64 = btoa(String.fromCharCode(...uint8Array));
        
        console.log(`📊 Converted to base64 (${base64.length} chars)`);

        // Call OCR Universal
        console.log(`🤖 Calling ocr-universal for document type: ${doc.document_type || 'auto-detect'}`);
        const { data: ocrData, error: ocrError } = await supabase.functions.invoke(
          "ocr-universal",
          {
            body: {
              imageBase64: base64,
              documentId: doc.id,
              caseId: doc.case_id,
              expectedType: doc.document_type || 'auto',
              personType: doc.person_type
            }
          }
        );

        if (ocrError) {
          throw new Error(`OCR processing failed: ${ocrError.message}`);
        }

        // Update document with OCR results
        await supabase
          .from("documents")
          .update({ 
            ocr_status: "completed",
            ocr_data: ocrData.extractedData,
            ocr_text: ocrData.extractedText,
            ocr_confidence: ocrData.confidence,
            updated_at: new Date().toISOString()
          })
          .eq("id", doc.id);

        // Log successful completion
        await supabase
          .from("ocr_processing_logs")
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            duration_ms: Date.now() - startTime.getTime(),
            confidence_score: ocrData.confidence
          })
          .eq("id", logId);

        results.push({
          documentId: doc.id,
          name: doc.name,
          status: 'success',
          extractedData: ocrData.extractedData
        });

        console.log(`✅ Successfully processed ${doc.name}`);
        
        // V9.3: Record success for circuit breaker
        circuitBreaker.recordSuccess();

      } catch (error) {
        console.error(`❌ Error processing document ${doc.id}:`, error);
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorData = (error as any)?.dropboxErrorData;
        const errorClassification = classifyError(errorMessage, errorData);
        const retryCount = (doc.ocr_retry_count || 0) + 1;
        
        // V9.3: Record failure for circuit breaker
        const circuitOpened = circuitBreaker.recordFailure(errorClassification.terminalStatus || errorClassification.type);
        if (circuitOpened) {
          console.error(`⚠️  CIRCUIT BREAKER OPENED after ${CIRCUIT_BREAKER_THRESHOLD} consecutive ${circuitBreaker.lastErrorType} errors`);
          
          // Log circuit breaker activation to HAC
          await supabase.from("hac_logs").insert({
            case_id: doc.case_id,
            action_type: "ocr_circuit_breaker_opened",
            action_details: `Circuit breaker activated after ${CIRCUIT_BREAKER_THRESHOLD} consecutive ${circuitBreaker.lastErrorType} errors`,
            performed_by: "system",
            metadata: {
              scope: 'ocr_worker',
              error_type: circuitBreaker.lastErrorType,
              threshold: CIRCUIT_BREAKER_THRESHOLD,
              timeout_minutes: CIRCUIT_BREAKER_TIMEOUT_MS / 1000 / 60,
              last_error_message: errorMessage,
              action_recommended: 'System will automatically resume processing after timeout period'
            }
          });
          
          // Stop processing immediately
          break;
        }
        
        let newStatus: string;
        let nextRetry: Date | null = null;
        let isTerminal = false;
        
        // Determine if this is a terminal failure
        if (errorClassification.terminalStatus) {
          // Specific terminal state (e.g., missing_remote_file, pdf_corrupt)
          newStatus = errorClassification.terminalStatus;
          isTerminal = true;
          console.log(`❌ Marking as TERMINAL: ${newStatus}`);
        } else if (errorClassification.type === 'permanent') {
          // Generic permanent failure
          newStatus = 'permanent_failure';
          isTerminal = true;
          console.log(`❌ Marking as PERMANENT_FAILURE`);
        } else if (retryCount >= MAX_RETRIES) {
          // Exhausted retries
          newStatus = 'permanent_failure';
          isTerminal = true;
          console.log(`❌ Marking as PERMANENT_FAILURE (max retries reached: ${retryCount}/${MAX_RETRIES})`);
        } else {
          // Transient error - schedule retry
          newStatus = 'pending';
          nextRetry = calculateNextRetry(retryCount);
          const delayMinutes = Math.round((nextRetry.getTime() - Date.now()) / 60000);
          console.log(`🔄 Marking as PENDING for retry ${retryCount}/${MAX_RETRIES} (next attempt in ${delayMinutes} min)`);
        }

        // Update document status with exponential backoff
        await supabase
          .from("documents")
          .update({ 
            ocr_status: newStatus,
            ocr_retry_count: retryCount,
            ocr_error_message: errorMessage,
            ocr_next_retry_at: nextRetry?.toISOString() || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", doc.id);

        // Log terminal failures to HAC for manual review
        if (isTerminal) {
          try {
            let actionRecommended = 'Review document and error details';
            
            if (newStatus === 'missing_remote_file') {
              actionRecommended = 'Ask client to re-upload the document or verify Dropbox path';
            } else if (newStatus === 'pdf_corrupt') {
              actionRecommended = 'Ask client to re-upload a clean copy of the PDF document';
            }
            
            await supabase.from('hac_logs').insert({
              case_id: doc.case_id,
              action_type: 'ocr_terminal_failure',
              action_details: `Document OCR failed permanently: ${doc.name}`,
              metadata: {
                scope: 'ocr_worker',
                document_id: doc.id,
                final_status: newStatus,
                last_error_message: errorMessage,
                retry_count: retryCount,
                action_recommended: actionRecommended
              },
              performed_by: 'system'
            });
            console.log(`📝 Logged terminal failure to HAC logs`);
          } catch (logError) {
            console.error('Failed to log terminal failure to HAC:', logError);
          }
        }

        // Log failure to processing logs
        await supabase
          .from("ocr_processing_logs")
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            duration_ms: Date.now() - startTime.getTime(),
            error_message: errorMessage
          })
          .eq("id", logId);

        results.push({
          documentId: doc.id,
          name: doc.name,
          status: 'failed',
          reason: errorMessage
        });
      }
    }

    console.log(`\n📊 Batch complete: ${results.filter(r => r.status === 'success').length}/${results.length} successful`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
        circuit_breaker_status: circuitBreaker.isOpen() ? 'open' : 'closed',
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Fatal error in OCR worker:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        results 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
