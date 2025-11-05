import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

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

/**
 * Send internal alert for critical PII logging failures
 */
async function alertPIILoggingFailure(
  errorType: PIILogErrorType,
  error: any,
  params: LogPIIProcessingParams
): Promise<void> {
  // Log to security audit system
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
  } catch (alertError) {
    // Last resort: console error
    console.error('[CRITICAL] PII logging failure alert failed:', alertError);
  }
}

/**
 * PRODUCTION FIX: User context passed directly to avoid race conditions
 * Creates audit trail for GDPR/CCPA compliance
 * 
 * CRITICAL: This function MUST be called BEFORE any PII data is sent to AI
 */
export async function logPIIProcessing(params: LogPIIProcessingParams): Promise<void> {
  try {
    // PRODUCTION FIX: User ID passed directly - no auth check needed
    // This eliminates race conditions, network latency, and authentication issues
    
    // Validate required parameters
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
    
    // Re-throw auth and validation errors to block operation
    if (errorType === PIILogErrorType.AUTH_ERROR || 
        errorType === PIILogErrorType.VALIDATION_ERROR) {
      throw error;
    }
    
    // Other errors: alert but don't block workflow (graceful degradation)
    await alertPIILoggingFailure(errorType, error, params);
  }
}

/**
 * PRODUCTION FIX: Check AI consent with user context passed directly
 */
export async function checkAIConsent(caseId: string, userId: string): Promise<boolean> {
  try {
    // PRODUCTION FIX: User ID passed directly - no auth check needed
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
