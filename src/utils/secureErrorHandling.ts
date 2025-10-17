// Secure error handling utilities
// Prevents sensitive data leakage through error messages

export interface SafeError {
  message: string;
  code?: string;
  field?: string;
}

export interface DetailedError extends SafeError {
  stack?: string;
  context?: Record<string, any>;
  timestamp: string;
}

// Error messages safe to show to users
const SAFE_ERROR_MESSAGES: Record<string, string> = {
  // Authentication
  'invalid_credentials': 'Invalid email or password',
  'email_not_confirmed': 'Please confirm your email address',
  'user_not_found': 'Account not found',
  'session_expired': 'Your session has expired. Please log in again',
  
  // Authorization
  'unauthorized': 'You are not authorized to perform this action',
  'forbidden': 'Access denied',
  'insufficient_permissions': 'You do not have permission to access this resource',
  
  // Input validation
  'invalid_input': 'Invalid input data',
  'invalid_format': 'Invalid data format',
  'field_required': 'Required field is missing',
  'file_too_large': 'File size exceeds maximum allowed',
  'invalid_file_type': 'File type not supported',
  
  // Rate limiting
  'rate_limit_exceeded': 'Too many requests. Please try again later',
  'quota_exceeded': 'Usage quota exceeded',
  
  // Processing
  'processing_failed': 'Processing failed. Please try again',
  'operation_failed': 'Operation failed. Please try again',
  'service_unavailable': 'Service temporarily unavailable',
  
  // Database
  'database_error': 'A database error occurred',
  'duplicate_entry': 'This entry already exists',
  'not_found': 'Resource not found',
  
  // Default
  'unknown_error': 'An unexpected error occurred'
};

/**
 * Convert any error to a safe user-facing message
 * NEVER exposes internal details or stack traces
 */
export function getSafeErrorMessage(error: any, errorCode?: string): string {
  // If we have a specific error code, use that
  if (errorCode && SAFE_ERROR_MESSAGES[errorCode]) {
    return SAFE_ERROR_MESSAGES[errorCode];
  }
  
  // Try to extract a known error code from the error object
  const knownCode = extractErrorCode(error);
  if (knownCode && SAFE_ERROR_MESSAGES[knownCode]) {
    return SAFE_ERROR_MESSAGES[knownCode];
  }
  
  // Check for Supabase auth errors
  if (error?.message?.includes('Invalid login credentials')) {
    return SAFE_ERROR_MESSAGES['invalid_credentials'];
  }
  
  if (error?.message?.includes('Email not confirmed')) {
    return SAFE_ERROR_MESSAGES['email_not_confirmed'];
  }
  
  // Default safe message
  return SAFE_ERROR_MESSAGES['unknown_error'];
}

/**
 * Extract error code from various error formats
 */
function extractErrorCode(error: any): string | null {
  if (typeof error === 'string') return null;
  
  // Check common error code fields
  if (error?.code) return error.code;
  if (error?.error_code) return error.error_code;
  if (error?.errorCode) return error.errorCode;
  if (error?.type) return error.type;
  
  // Check Supabase error format
  if (error?.error?.code) return error.error.code;
  
  return null;
}

/**
 * Log detailed error for debugging (server-side only)
 * Sanitizes sensitive data before logging
 */
export function logDetailedError(
  operation: string,
  error: any,
  context?: Record<string, any>
): void {
  const detailedError: DetailedError = {
    message: error?.message || 'Unknown error',
    code: extractErrorCode(error) || undefined,
    timestamp: new Date().toISOString()
  };
  
  // Add stack trace in development only
  if (import.meta.env.DEV && error?.stack) {
    detailedError.stack = error.stack;
  }
  
  // Add sanitized context
  if (context) {
    detailedError.context = sanitizeContext(context);
  }
  
  console.error(`[${operation}] Error:`, detailedError);
}

/**
 * Sanitize context data to remove sensitive information
 */
function sanitizeContext(context: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  const sensitiveKeys = [
    'password', 'token', 'secret', 'apikey', 'api_key',
    'passport', 'ssn', 'credit_card', 'cvv'
  ];
  
  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    
    // Redact sensitive keys
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }
    
    // Keep safe primitive values
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (value === null || value === undefined) {
      sanitized[key] = value;
    } else {
      // Don't include complex objects to avoid circular references
      sanitized[key] = '[OBJECT]';
    }
  }
  
  return sanitized;
}

/**
 * Create a safe error object for API responses
 */
export function createSafeError(
  error: any,
  errorCode?: string,
  field?: string
): SafeError {
  return {
    message: getSafeErrorMessage(error, errorCode),
    code: errorCode,
    field
  };
}

/**
 * Handle async operations with safe error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  operationName: string,
  context?: Record<string, any>
): Promise<{ data?: T; error?: SafeError }> {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    logDetailedError(operationName, error, context);
    return { error: createSafeError(error) };
  }
}

/**
 * Validate response from edge function and handle errors safely
 */
export function handleEdgeFunctionResponse<T>(
  response: { data?: T; error?: any }
): { data?: T; error?: SafeError } {
  if (response.error) {
    return { error: createSafeError(response.error) };
  }
  return { data: response.data };
}
