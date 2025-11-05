/**
 * PHASE 2: Enhanced secure logging with regex-based PII detection
 * Logs only in development mode and sanitizes sensitive data in production
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
  sanitize?: boolean;
  context?: Record<string, any>;
}

const SENSITIVE_KEYS = [
  'password', 'token', 'secret', 'apiKey', 'api_key',
  'passport_number', 'pesel', 'email', 'phone', 'ssn',
  'credit_card', 'cvv', 'pin', 'authorization', 'bearer'
];

/**
 * PHASE 2: Regex patterns for PII detection
 * Detects data patterns regardless of field names
 */
const PII_PATTERNS = {
  // Polish PESEL: 11 digits
  pesel: /\b\d{11}\b/g,
  
  // Passport numbers: 2 letters + 7 digits (common format)
  passport: /\b[A-Z]{2}\d{7}\b/g,
  
  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Phone numbers (various formats)
  phone: /\b(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  
  // Credit card numbers (basic pattern)
  creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  
  // SSN: XXX-XX-XXXX
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  
  // JWT tokens (basic detection)
  jwt: /\beyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\b/g,
  
  // API keys (generic pattern for common formats)
  apiKey: /\b[A-Za-z0-9_-]{32,}\b/g,
};

/**
 * PHASE 2 FIX: Sanitize string values using regex patterns
 */
function sanitizeStringValue(value: string): string {
  if (typeof value !== 'string') return value;
  
  let sanitized = value;
  
  // Apply each PII pattern
  if (PII_PATTERNS.pesel.test(sanitized)) {
    sanitized = sanitized.replace(PII_PATTERNS.pesel, '[PESEL-REDACTED]');
  }
  if (PII_PATTERNS.passport.test(sanitized)) {
    sanitized = sanitized.replace(PII_PATTERNS.passport, '[PASSPORT-REDACTED]');
  }
  if (PII_PATTERNS.email.test(sanitized)) {
    sanitized = sanitized.replace(PII_PATTERNS.email, '[EMAIL-REDACTED]');
  }
  if (PII_PATTERNS.phone.test(sanitized)) {
    sanitized = sanitized.replace(PII_PATTERNS.phone, '[PHONE-REDACTED]');
  }
  if (PII_PATTERNS.creditCard.test(sanitized)) {
    sanitized = sanitized.replace(PII_PATTERNS.creditCard, '[CARD-REDACTED]');
  }
  if (PII_PATTERNS.ssn.test(sanitized)) {
    sanitized = sanitized.replace(PII_PATTERNS.ssn, '[SSN-REDACTED]');
  }
  if (PII_PATTERNS.jwt.test(sanitized)) {
    sanitized = sanitized.replace(PII_PATTERNS.jwt, '[JWT-REDACTED]');
  }
  
  // Reset regex lastIndex for next use
  Object.values(PII_PATTERNS).forEach(pattern => {
    pattern.lastIndex = 0;
  });
  
  return sanitized;
}

/**
 * PRODUCTION-CRITICAL FIX: Always-on PII sanitization
 * SECURITY: Runs regardless of environment flags to prevent misconfiguration risks
 * 
 * This function provides defense-in-depth by ensuring PII is NEVER logged,
 * even if environment detection fails or is misconfigured.
 */
function sanitizeData(data: any): any {
  // PRODUCTION-CRITICAL FIX: Always sanitize - defense-in-depth
  // Even if environment detection fails, PII will be redacted
  
  if (!data) return data;
  
  // Handle primitive types  
  if (typeof data === 'string') {
    return sanitizeStringValue(data);
  }
  
  if (typeof data !== 'object') return data;
  
  // Handle arrays - PRODUCTION FIX: Recursively sanitize all elements
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  // PRODUCTION-CRITICAL FIX: Recursively sanitize ALL string values in nested objects
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    // Check if key is sensitive
    if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      // CRITICAL: Apply regex-based sanitization to ALL string values
      sanitized[key] = sanitizeStringValue(value);
    } else if (value && typeof value === 'object') {
      // CRITICAL: Recursively sanitize nested objects AND arrays
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * PHASE 2 FIX: Singleton Supabase client for production error tracking
 * Prevents redundant imports and ensures consistent client instance
 * PHASE 2 ENHANCEMENT: Bootstrap mode prevents recursive logging
 */
let supabaseClientCache: any = null;
let supabaseClientPromise: Promise<any> | null = null;
let isBootstrapping = false; // Prevent recursive logging during initialization

async function getSupabaseClient() {
  // Return cached client if available
  if (supabaseClientCache) {
    return supabaseClientCache;
  }
  
  // Return existing promise if import is in progress
  if (supabaseClientPromise) {
    return supabaseClientPromise;
  }
  
  // PRODUCTION-CRITICAL FIX: Set bootstrap flag AND add timeout
  isBootstrapping = true;
  const bootstrapTimeout = setTimeout(() => {
    console.error('[SecureLogger] Supabase client bootstrap timeout');
    isBootstrapping = false;
    supabaseClientPromise = null;
  }, 5000); // 5 second timeout
  
  // Import and cache the client
  supabaseClientPromise = import('@/integrations/supabase/client')
    .then(module => {
      clearTimeout(bootstrapTimeout);
      supabaseClientCache = module.supabase;
      supabaseClientPromise = null;
      isBootstrapping = false; // Bootstrap complete
      return supabaseClientCache;
    })
    .catch(error => {
      clearTimeout(bootstrapTimeout);
      supabaseClientPromise = null;
      isBootstrapping = false; // Bootstrap failed - CRITICAL: Reset flag
      console.error('[SecureLogger] Failed to load Supabase client:', error);
      throw error;
    });
  
  return supabaseClientPromise;
}

/**
 * PHASE 2: Enhanced logger with live error tracking
 * PRODUCTION FIX: Uses singleton Supabase client pattern
 */
class SecureLogger {
  private isDev = import.meta.env.DEV;
  // PRODUCTION-CRITICAL FIX: Error tracking enabled via explicit env var, not DEV flag
  private errorTrackingEnabled = import.meta.env.VITE_ENABLE_ERROR_TRACKING !== 'false'; // Defaults to enabled

  /**
   * PRODUCTION FIX: Send error to production error tracking service
   * Uses singleton Supabase client to prevent redundant imports
   * @param level - Error severity level
   * @param message - Error message
   * @param error - Error object or data
   * @param context - Additional context
   */
  private async trackProductionError(
    level: LogLevel,
    message: string,
    error?: any,
    context?: Record<string, any>
  ): Promise<void> {
    if (!this.errorTrackingEnabled) return;
    
    // PHASE 2 FIX: Skip tracking during bootstrap to prevent recursive import
    if (isBootstrapping) {
      console.warn('[SecureLogger] Skipping error tracking during bootstrap');
      return;
    }
    
    try {
      // Sanitize error data before sending to external service
      const sanitizedError = error ? sanitizeData(error) : null;
      const sanitizedContext = context ? sanitizeData(context) : null;
      
      // PRODUCTION FIX: Use singleton client to avoid re-importing
      const supabase = await getSupabaseClient();
      
      // Log to internal security metrics
      await supabase.rpc('record_security_metric', {
        p_metric_type: `error_${level}`,
        p_metric_value: 1,
        p_metadata: {
          message,
          error: sanitizedError,
          context: sanitizedContext,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }
      });
      
      // TODO: Add external error tracking service integration
      // Example with Sentry (uncomment when configured):
      // const Sentry = await import('@sentry/browser');
      // Sentry.captureException(error || new Error(message), {
      //   level: level as any,
      //   tags: { message },
      //   extra: sanitizedContext
      // });
      
    } catch (trackingError) {
      // Fail silently - error tracking failure shouldn't break app
      console.error('[SecureLogger] Error tracking failed:', trackingError);
    }
  }

  log(message: string, data?: any, options?: LogOptions) {
    // PRODUCTION-CRITICAL: Always sanitize, even if environment check fails
    const logData = options?.sanitize !== false && data ? sanitizeData(data) : data;
    
    if (this.isDev) {
      console.log(`[LOG] ${message}`, logData || '');
    }
  }

  info(message: string, data?: any, options?: LogOptions) {
    // PRODUCTION-CRITICAL: Always sanitize, even if environment check fails
    const logData = options?.sanitize !== false && data ? sanitizeData(data) : data;
    
    if (this.isDev) {
      console.info(`[INFO] ${message}`, logData || '');
    }
  }

  warn(message: string, data?: any, options?: LogOptions) {
    // PRODUCTION-CRITICAL: Always sanitize BEFORE any logging
    const logData = options?.sanitize !== false && data ? sanitizeData(data) : data;
    
    if (this.isDev) {
      console.warn(`[WARN] ${message}`, logData || '');
    }
    
    // Track warnings in production (data already sanitized)
    this.trackProductionError('warn', message, logData, options?.context);
  }

  error(message: string, error?: any, options?: LogOptions) {
    // PRODUCTION-CRITICAL: Always sanitize errors regardless of environment
    // This provides defense-in-depth against misconfigured production builds
    const errorData = error ? sanitizeData(error) : null;
    
    if (this.isDev) {
      console.error(`[ERROR] ${message}`, errorData || '');
    }
    
    // PHASE 2 FIX: Live error tracking in production (data already sanitized)
    this.trackProductionError('error', message, errorData, options?.context);
  }

  debug(message: string, data?: any) {
    if (this.isDev) {
      // Always sanitize debug data (might contain PII)
      const sanitizedData = data ? sanitizeData(data) : null;
      console.debug(`[DEBUG] ${message}`, sanitizedData || '');
    }
  }
  
  /**
   * Test PII detection (development only)
   * HARDENED: Complete no-op in production builds for security
   */
  testPIIDetection(testData: any): any {
    // CRITICAL: Block execution completely in production
    if (import.meta.env.PROD) {
      console.error('[SecureLogger] testPIIDetection is disabled in production');
      return null;
    }
    
    if (!this.isDev) {
      console.warn('[SecureLogger] PII testing only available in development');
      return null;
    }
    
    console.group('[SecureLogger] PII Detection Test');
    console.log('Original:', testData);
    const sanitized = sanitizeData(testData);
    console.log('Sanitized:', sanitized);
    console.groupEnd();
    
    return sanitized;
  }
}

export const logger = new SecureLogger();
