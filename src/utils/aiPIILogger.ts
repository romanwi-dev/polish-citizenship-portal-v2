import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * PRODUCTION-CRITICAL: Out-of-band alerting for system failures
 * This is the final fallback when Supabase is completely unavailable
 */
async function triggerOutOfBandAlert(alertType: string, data: any): Promise<void> {
  try {
    // PRODUCTION FIX: Use a separate, highly resilient monitoring webhook
    // This should be a third-party service like PagerDuty, Sentry, or a dedicated monitoring endpoint
    const monitoringEndpoint = import.meta.env.VITE_MONITORING_WEBHOOK_URL;
    
    if (!monitoringEndpoint) {
      console.error('[Out-of-Band Alert] No monitoring endpoint configured');
      return;
    }
    
    await fetch(monitoringEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alert_type: alertType,
        severity: 'critical',
        timestamp: new Date().toISOString(),
        data
      })
    });
    
    console.log('[Out-of-Band Alert] Successfully sent to external monitoring');
  } catch (error) {
    console.error('[Out-of-Band Alert] Failed to send external alert:', error);
    // This is the absolute last line of defense - nothing more can be done
  }
}


/**
 * PRODUCTION-READY: PII logging with direct user context passing
 * Eliminates race conditions and network latency from auth checks
 */

interface LogPIIProcessingParams {
  caseId: string;
  documentId?: string;
  operationType: 'ocr' | 'classification' | 'verification' | 'form_population';
  piiFieldsSent: string[];
  aiProvider: 'openai' | 'gemini' | 'lovable-ai';
  userId: string; // CRITICAL FIX: User context passed directly
}

/**
 * Error types for granular handling
 */
enum PIILogErrorType {
  AUTH_ERROR = 'auth_error',
  NETWORK_ERROR = 'network_error',
  DATABASE_ERROR_TRANSIENT = 'database_error_transient', // Connection lost, timeout
  DATABASE_ERROR_PERSISTENT = 'database_error_persistent', // Schema, permissions
  VALIDATION_ERROR = 'validation_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Classify error for appropriate handling
 */
function classifyPIIError(error: any): PIILogErrorType {
  if (!error) return PIILogErrorType.UNKNOWN_ERROR;
  
  const errorMsg = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';
  
  // Auth errors
  if (errorMsg.includes('auth') || errorMsg.includes('unauthorized') || 
      errorMsg.includes('token') || errorCode === 'pgrst301') {
    return PIILogErrorType.AUTH_ERROR;
  }
  
  // Network errors
  if (errorMsg.includes('network') || errorMsg.includes('fetch') || 
      errorMsg.includes('timeout') || errorCode === 'econnrefused') {
    return PIILogErrorType.NETWORK_ERROR;
  }
  
  // Database errors - distinguish transient vs persistent
  if (errorMsg.includes('database') || errorMsg.includes('postgres')) {
    // Transient errors: connection issues
    if (errorMsg.includes('connection') || errorMsg.includes('timeout') || 
        errorMsg.includes('network') || errorCode === 'pgrst001') {
      return PIILogErrorType.DATABASE_ERROR_TRANSIENT;
    }
    // Persistent errors: schema violations, permissions
    if (errorCode.startsWith('23') || errorCode.startsWith('42') || 
        errorMsg.includes('permission') || errorMsg.includes('denied') ||
        errorMsg.includes('schema') || errorMsg.includes('violat')) {
      return PIILogErrorType.DATABASE_ERROR_PERSISTENT;
    }
    return PIILogErrorType.DATABASE_ERROR_PERSISTENT; // Default to persistent
  }
  
  // Validation errors
  if (errorMsg.includes('validation') || errorMsg.includes('invalid') ||
      errorMsg.includes('required')) {
    return PIILogErrorType.VALIDATION_ERROR;
  }
  
  return PIILogErrorType.UNKNOWN_ERROR;
}

// PRODUCTION-CRITICAL FIX: Rate limiting for BOTH transient AND persistent errors
const transientErrorTracker = new Map<string, { count: number; lastAlert: number }>();
const persistentErrorTracker = new Map<string, { count: number; lastAlert: number; escalated: boolean }>();
const ALERT_RATE_LIMIT_MS = 60000; // 1 minute between alerts for same error type
const MAX_ALERTS_PER_MINUTE = 3;
const MAX_PERSISTENT_ALERTS = 5; // After 5 persistent errors, escalate and pause

/**
 * Send internal alert for critical PII logging failures
 * PHASE 1 FIX: Multi-layer fallback error handling with rate limiting
 */
async function alertPIILoggingFailure(
  errorType: PIILogErrorType,
  error: any,
  params: LogPIIProcessingParams
): Promise<void> {
  // PRODUCTION-CRITICAL FIX: Rate limit PERSISTENT errors to prevent log overload
  if (errorType === PIILogErrorType.DATABASE_ERROR_PERSISTENT) {
    const key = `${errorType}-${params.caseId}`;
    const now = Date.now();
    const tracker = persistentErrorTracker.get(key);
    
    if (tracker) {
      if (tracker.escalated) {
        // Already escalated - stop further alerts until manual intervention
        console.error(`[PII Logger] ESCALATED: Persistent error - manual intervention required`);
        return;
      }
      
      tracker.count++;
      
      if (tracker.count >= MAX_PERSISTENT_ALERTS) {
        // Escalate and pause further alerts
        tracker.escalated = true;
        console.error(`[PII Logger] ESCALATING: ${MAX_PERSISTENT_ALERTS} persistent errors detected. Pausing alerts.`);
        // PRODUCTION FIX: Trigger out-of-band alert (email/SMS)
        await triggerOutOfBandAlert('persistent_pii_log_failure', {
          errorType,
          caseId: params.caseId,
          errorCount: tracker.count,
          errorMessage: error?.message
        });
        return;
      }
    } else {
      persistentErrorTracker.set(key, { count: 1, lastAlert: now, escalated: false });
    }
  }
  
  // Check rate limiting for transient errors
  if (errorType === PIILogErrorType.NETWORK_ERROR || errorType === PIILogErrorType.DATABASE_ERROR_TRANSIENT) {
    const key = `${errorType}-${params.caseId}`;
    const now = Date.now();
    const tracker = transientErrorTracker.get(key);
    
    if (tracker) {
      if (now - tracker.lastAlert < ALERT_RATE_LIMIT_MS) {
        tracker.count++;
        if (tracker.count > MAX_ALERTS_PER_MINUTE) {
          console.warn(`[PII Logger] Rate limit: Suppressing alert for ${errorType}`);
          return; // Suppress alert
        }
      } else {
        // Reset counter after time window
        tracker.count = 1;
        tracker.lastAlert = now;
      }
    } else {
      transientErrorTracker.set(key, { count: 1, lastAlert: now });
    }
  }
  
  // Layer 1: Try to log to security audit system
  try {
    await supabase.rpc('log_security_event', {
      p_event_type: 'pii_logging_failure',
      p_severity: errorType === PIILogErrorType.AUTH_ERROR ? 'critical' : 'high',
      p_action: 'log_pii_processing_failed',
      p_details: {
        error_type: errorType,
        error_message: error?.message || 'Unknown error',
        case_id: params.caseId,
        operation_type: params.operationType,
        ai_provider: params.aiProvider
      },
      p_success: false
    });
    return; // Success, exit
  } catch (alertError) {
    // Layer 2: Try to log to security metrics as fallback
    try {
      await supabase.rpc('record_security_metric', {
        p_metric_type: 'pii_logging_failure',
        p_metric_value: 1,
        p_metadata: {
          error_type: errorType,
          case_id: params.caseId,
          operation_type: params.operationType,
          timestamp: new Date().toISOString()
        }
      });
      console.warn('[PII Logger] Alert logged to metrics (primary logging failed)');
      return; // Fallback success, exit
    } catch (metricsError) {
      // PRODUCTION-CRITICAL FIX: Out-of-band alerting when all Supabase layers fail
      console.error('[CRITICAL] All Supabase alerting failed - triggering out-of-band alert');
      
      try {
        await triggerOutOfBandAlert('supabase_complete_failure', {
          errorType,
          caseId: params.caseId,
          primaryError: alertError,
          fallbackError: metricsError
        });
      } catch (outOfBandError) {
        // Absolute last resort - console with structured data
        console.error('[ABSOLUTE CRITICAL] ALL ALERTING MECHANISMS FAILED:', {
          primaryError: alertError,
          fallbackError: metricsError,
          outOfBandError,
          errorType,
          caseId: params.caseId,
          operationType: params.operationType
        });
      }
    }
  }
}

/**
 * PRODUCTION FIX: User context passed directly to avoid race conditions
 * Creates audit trail for GDPR/CCPA compliance
 * 
 * CRITICAL: This function MUST be called BEFORE any PII data is sent to AI
 */
/**
 * PRODUCTION-CRITICAL FIX: Validate UUID format to prevent injection attacks
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function logPIIProcessing(params: LogPIIProcessingParams): Promise<void> {
  try {
    // PRODUCTION FIX: User ID passed directly - no auth check needed
    // This eliminates race conditions, network latency, and authentication issues
    
    // CRITICAL FIX: Validate required parameters AND format
    if (!params.userId || !params.caseId || !params.operationType || !params.piiFieldsSent?.length) {
      const validationError = new Error('Missing required PII logging parameters');
      console.error('[PII Logger] Validation failed:', params);
      await alertPIILoggingFailure(
        PIILogErrorType.VALIDATION_ERROR,
        validationError,
        params
      );
      throw validationError;
    }
    
    // PRODUCTION-CRITICAL: Validate UUID formats to prevent injection
    if (!isValidUUID(params.userId)) {
      const validationError = new Error('Invalid userId format: Must be valid UUID');
      console.error('[PII Logger] Invalid userId format:', params.userId);
      await alertPIILoggingFailure(
        PIILogErrorType.VALIDATION_ERROR,
        validationError,
        params
      );
      throw validationError;
    }
    
    if (!isValidUUID(params.caseId)) {
      const validationError = new Error('Invalid caseId format: Must be valid UUID');
      console.error('[PII Logger] Invalid caseId format:', params.caseId);
      await alertPIILoggingFailure(
        PIILogErrorType.VALIDATION_ERROR,
        validationError,
        params
      );
      throw validationError;
    }
    
    if (params.documentId && !isValidUUID(params.documentId)) {
      const validationError = new Error('Invalid documentId format: Must be valid UUID');
      console.error('[PII Logger] Invalid documentId format:', params.documentId);
      await alertPIILoggingFailure(
        PIILogErrorType.VALIDATION_ERROR,
        validationError,
        params
      );
      throw validationError;
    }
    
    // Attempt to log PII processing
    const { error: insertError } = await supabase
      .from('ai_pii_processing_logs')
      .insert({
        case_id: params.caseId,
        document_id: params.documentId,
        operation_type: params.operationType,
        pii_fields_sent: params.piiFieldsSent,
        ai_provider: params.aiProvider,
        user_id: params.userId,
      });

    if (insertError) {
      const errorType = classifyPIIError(insertError);
      console.error('[PII Logger] Database insert failed:', errorType, insertError);
      
      // Handle different error types with specific actions
      switch (errorType) {
        case PIILogErrorType.NETWORK_ERROR:
        case PIILogErrorType.DATABASE_ERROR_TRANSIENT:
          // Transient errors - log but allow operation (can retry later)
          console.warn('[PII Logger] Transient error - operation may need retry');
          await alertPIILoggingFailure(errorType, insertError, params);
          break;
          
        case PIILogErrorType.DATABASE_ERROR_PERSISTENT:
          // Persistent error - alert and BLOCK operation
          console.error('[PII Logger] Persistent database error - blocking operation');
          await alertPIILoggingFailure(errorType, insertError, params);
          throw new Error(`PII logging failed: Database error (${insertError.message})`);
          
        case PIILogErrorType.AUTH_ERROR:
          // Auth issue - block immediately
          await alertPIILoggingFailure(errorType, insertError, params);
          throw new Error('PII logging blocked: Authentication/authorization error');
          
        default:
          // Unknown error - alert and continue (graceful degradation)
          console.error('[PII Logger] Unknown error:', insertError);
          await alertPIILoggingFailure(errorType, insertError, params);
      }
    } else {
      // Success - log for debugging
      console.log(`[PII Logger] Logged ${params.operationType} for case ${params.caseId}`);
    }
    
  } catch (error) {
    const errorType = classifyPIIError(error);
    console.error('[PII Logger] Critical error in logPIIProcessing:', errorType, error);
    
    // PHASE 1 FIX: Ensure all errors are properly classified and alerted
    try {
      await alertPIILoggingFailure(errorType, error, params);
    } catch (alertFailure) {
      // Even alert failed - log to console as absolute last resort
      console.error('[CRITICAL] Failed to alert PII logging failure:', alertFailure);
    }
    
    // Re-throw auth and validation errors to block operation
    if (errorType === PIILogErrorType.AUTH_ERROR || 
        errorType === PIILogErrorType.VALIDATION_ERROR) {
      throw error;
    }
    
    // Other errors: already alerted, don't block workflow (graceful degradation)
  }
}

/**
 * PRODUCTION FIX: Check AI consent with user context passed directly
 */
export async function checkAIConsent(caseId: string, userId: string): Promise<boolean> {
  try {
    // PRODUCTION-CRITICAL FIX: Validate user ID format
    if (!userId) {
      console.error('[AI Consent] User ID required for consent check');
      
      // CRITICAL: Log security event for missing user context
      await supabase.rpc('log_security_event', {
        p_event_type: 'consent_check_no_user',
        p_severity: 'critical',
        p_action: 'check_ai_consent',
        p_details: { case_id: caseId, error: 'missing_user_id' },
        p_success: false
      });
      
      return false;
    }
    
    // PRODUCTION-CRITICAL: Validate UUID format to prevent injection
    if (!isValidUUID(userId)) {
      console.error('[AI Consent] Invalid userId format:', userId);
      await supabase.rpc('log_security_event', {
        p_event_type: 'consent_check_invalid_user',
        p_severity: 'critical',
        p_action: 'check_ai_consent',
        p_details: { case_id: caseId, error: 'invalid_user_id_format' },
        p_success: false
      });
      return false;
    }
    
    if (!isValidUUID(caseId)) {
      console.error('[AI Consent] Invalid caseId format:', caseId);
      await supabase.rpc('log_security_event', {
        p_event_type: 'consent_check_invalid_case',
        p_severity: 'critical',
        p_action: 'check_ai_consent',
        p_user_id: userId,
        p_details: { case_id: caseId, error: 'invalid_case_id_format' },
        p_success: false
      });
      return false;
    }
    
    const { data, error } = await supabase
      .from('cases')
      .select('ai_processing_consent')
      .eq('id', caseId)
      .single();

    if (error) {
      const errorType = classifyPIIError(error);
      console.error('[AI Consent] Database error:', errorType, error);
      
      // PRODUCTION FIX: Explicit error handling with severity-based actions
      if (errorType === PIILogErrorType.NETWORK_ERROR || 
          errorType === PIILogErrorType.DATABASE_ERROR_TRANSIENT) {
        // Transient issue - log warning and default to no consent
        console.warn('[AI Consent] Transient error checking consent - defaulting to no consent');
        await supabase.rpc('log_security_event', {
          p_event_type: 'consent_check_transient_error',
          p_severity: 'warning',
          p_action: 'check_ai_consent',
          p_user_id: userId,
          p_details: { case_id: caseId, error: error.message, error_type: errorType },
          p_success: false
        });
      } else if (errorType === PIILogErrorType.DATABASE_ERROR_PERSISTENT) {
        // CRITICAL: Persistent DB error - security event required
        console.error('[AI Consent] CRITICAL: Persistent DB error checking consent');
        await supabase.rpc('log_security_event', {
          p_event_type: 'consent_check_db_error',
          p_severity: 'critical',
          p_action: 'check_ai_consent',
          p_user_id: userId,
          p_details: { case_id: caseId, error: error.message, error_type: errorType },
          p_success: false
        });
      }
      
      return false;
    }

    return data?.ai_processing_consent === true;
  } catch (error) {
    const errorType = classifyPIIError(error);
    console.error('[AI Consent] Error in checkAIConsent:', errorType, error);
    return false;
  }
}

/**
 * Data minimization: extract only required fields for AI
 * Prevents sending unnecessary PII
 */
export function minimizePIIForAI<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): Partial<T> {
  const minimized: Partial<T> = {};
  
  for (const field of requiredFields) {
    if (data[field] !== undefined && data[field] !== null) {
      minimized[field] = data[field];
    }
  }
  
  return minimized;
}
