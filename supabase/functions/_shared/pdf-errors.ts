/**
 * PDF Generation Error Codes and Utilities
 * Provides granular error handling for PDF generation pipeline
 */

/**
 * Comprehensive error codes for PDF generation
 */
export enum PDFErrorCode {
  // Input validation errors
  INVALID_CASE_ID = 'INVALID_CASE_ID',
  INVALID_TEMPLATE_TYPE = 'INVALID_TEMPLATE_TYPE',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  
  // Data retrieval errors
  CASE_NOT_FOUND = 'CASE_NOT_FOUND',
  DATA_FETCH_FAILED = 'DATA_FETCH_FAILED',
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  
  // Template errors
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  TEMPLATE_LOAD_FAILED = 'TEMPLATE_LOAD_FAILED',
  TEMPLATE_CORRUPTED = 'TEMPLATE_CORRUPTED',
  
  // PDF processing errors
  PDF_PARSE_FAILED = 'PDF_PARSE_FAILED',
  FIELD_MAPPING_ERROR = 'FIELD_MAPPING_ERROR',
  FIELD_FILL_ERROR = 'FIELD_FILL_ERROR',
  PDF_SAVE_FAILED = 'PDF_SAVE_FAILED',
  
  // Storage errors
  STORAGE_UPLOAD_FAILED = 'STORAGE_UPLOAD_FAILED',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  SIGNED_URL_FAILED = 'SIGNED_URL_FAILED',
  
  // Database errors
  DB_UPDATE_FAILED = 'DB_UPDATE_FAILED',
  DB_CONNECTION_FAILED = 'DB_CONNECTION_FAILED',
  
  // Resource errors
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  TIMEOUT_EXCEEDED = 'TIMEOUT_EXCEEDED',
  
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Structured PDF error
 */
export interface PDFError {
  code: PDFErrorCode;
  message: string;
  severity: ErrorSeverity;
  details?: Record<string, unknown>;
  timestamp: string;
  retryable: boolean;
}

/**
 * Create a structured PDF error
 */
export function createPDFError(
  code: PDFErrorCode,
  message: string,
  details?: Record<string, unknown>
): PDFError {
  const errorConfig = ERROR_METADATA[code];
  
  return {
    code,
    message,
    severity: errorConfig.severity,
    retryable: errorConfig.retryable,
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Error metadata for each error code
 */
const ERROR_METADATA: Record<PDFErrorCode, {
  severity: ErrorSeverity;
  retryable: boolean;
  userMessage: string;
}> = {
  [PDFErrorCode.INVALID_CASE_ID]: {
    severity: ErrorSeverity.ERROR,
    retryable: false,
    userMessage: 'Invalid case ID format',
  },
  [PDFErrorCode.INVALID_TEMPLATE_TYPE]: {
    severity: ErrorSeverity.ERROR,
    retryable: false,
    userMessage: 'Unknown document template type',
  },
  [PDFErrorCode.MISSING_REQUIRED_FIELD]: {
    severity: ErrorSeverity.WARNING,
    retryable: false,
    userMessage: 'Some required fields are missing',
  },
  [PDFErrorCode.VALIDATION_FAILED]: {
    severity: ErrorSeverity.ERROR,
    retryable: false,
    userMessage: 'Data validation failed',
  },
  [PDFErrorCode.CASE_NOT_FOUND]: {
    severity: ErrorSeverity.ERROR,
    retryable: false,
    userMessage: 'Case not found in database',
  },
  [PDFErrorCode.DATA_FETCH_FAILED]: {
    severity: ErrorSeverity.ERROR,
    retryable: true,
    userMessage: 'Failed to retrieve case data',
  },
  [PDFErrorCode.INSUFFICIENT_DATA]: {
    severity: ErrorSeverity.WARNING,
    retryable: false,
    userMessage: 'Insufficient data to generate PDF',
  },
  [PDFErrorCode.TEMPLATE_NOT_FOUND]: {
    severity: ErrorSeverity.CRITICAL,
    retryable: false,
    userMessage: 'PDF template file not found',
  },
  [PDFErrorCode.TEMPLATE_LOAD_FAILED]: {
    severity: ErrorSeverity.ERROR,
    retryable: true,
    userMessage: 'Failed to load PDF template',
  },
  [PDFErrorCode.TEMPLATE_CORRUPTED]: {
    severity: ErrorSeverity.CRITICAL,
    retryable: false,
    userMessage: 'PDF template file is corrupted',
  },
  [PDFErrorCode.PDF_PARSE_FAILED]: {
    severity: ErrorSeverity.ERROR,
    retryable: false,
    userMessage: 'Failed to parse PDF template',
  },
  [PDFErrorCode.FIELD_MAPPING_ERROR]: {
    severity: ErrorSeverity.WARNING,
    retryable: false,
    userMessage: 'Error mapping data to PDF fields',
  },
  [PDFErrorCode.FIELD_FILL_ERROR]: {
    severity: ErrorSeverity.ERROR,
    retryable: false,
    userMessage: 'Error filling PDF fields',
  },
  [PDFErrorCode.PDF_SAVE_FAILED]: {
    severity: ErrorSeverity.ERROR,
    retryable: true,
    userMessage: 'Failed to save PDF',
  },
  [PDFErrorCode.STORAGE_UPLOAD_FAILED]: {
    severity: ErrorSeverity.ERROR,
    retryable: true,
    userMessage: 'Failed to upload PDF to storage',
  },
  [PDFErrorCode.STORAGE_QUOTA_EXCEEDED]: {
    severity: ErrorSeverity.CRITICAL,
    retryable: false,
    userMessage: 'Storage quota exceeded',
  },
  [PDFErrorCode.SIGNED_URL_FAILED]: {
    severity: ErrorSeverity.ERROR,
    retryable: true,
    userMessage: 'Failed to generate download link',
  },
  [PDFErrorCode.DB_UPDATE_FAILED]: {
    severity: ErrorSeverity.WARNING,
    retryable: true,
    userMessage: 'Failed to update database record',
  },
  [PDFErrorCode.DB_CONNECTION_FAILED]: {
    severity: ErrorSeverity.CRITICAL,
    retryable: true,
    userMessage: 'Database connection failed',
  },
  [PDFErrorCode.MEMORY_LIMIT_EXCEEDED]: {
    severity: ErrorSeverity.CRITICAL,
    retryable: false,
    userMessage: 'PDF too large to process',
  },
  [PDFErrorCode.TIMEOUT_EXCEEDED]: {
    severity: ErrorSeverity.ERROR,
    retryable: true,
    userMessage: 'PDF generation timed out',
  },
  [PDFErrorCode.UNAUTHORIZED]: {
    severity: ErrorSeverity.ERROR,
    retryable: false,
    userMessage: 'Authentication required',
  },
  [PDFErrorCode.PERMISSION_DENIED]: {
    severity: ErrorSeverity.ERROR,
    retryable: false,
    userMessage: 'Permission denied',
  },
  [PDFErrorCode.UNKNOWN_ERROR]: {
    severity: ErrorSeverity.ERROR,
    retryable: true,
    userMessage: 'An unknown error occurred',
  },
};

/**
 * Get user-friendly error message
 */
export function getUserMessage(code: PDFErrorCode): string {
  return ERROR_METADATA[code]?.userMessage || 'An error occurred';
}

/**
 * Check if error is retryable
 */
export function isRetryable(code: PDFErrorCode): boolean {
  return ERROR_METADATA[code]?.retryable || false;
}

/**
 * Log PDF error with context
 */
export function logPDFError(error: PDFError, context?: Record<string, unknown>): void {
  console.error(JSON.stringify({
    ...error,
    context,
    logType: 'pdf_error',
  }));
}
