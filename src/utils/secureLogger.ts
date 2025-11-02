/**
 * Secure logging utility that only logs in development mode
 * and sanitizes sensitive data in production error tracking
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
  sanitize?: boolean;
  context?: Record<string, any>;
}

const SENSITIVE_KEYS = [
  'password', 'token', 'secret', 'apiKey', 'api_key',
  'passport_number', 'pesel', 'email', 'phone'
];

/**
 * Sanitizes object by removing sensitive keys
 */
function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Development-only logger
 */
class SecureLogger {
  private isDev = import.meta.env.DEV;

  log(message: string, data?: any, options?: LogOptions) {
    if (this.isDev) {
      const logData = options?.sanitize && data ? sanitizeData(data) : data;
      console.log(`[LOG] ${message}`, logData || '');
    }
  }

  info(message: string, data?: any, options?: LogOptions) {
    if (this.isDev) {
      const logData = options?.sanitize && data ? sanitizeData(data) : data;
      console.info(`[INFO] ${message}`, logData || '');
    }
  }

  warn(message: string, data?: any, options?: LogOptions) {
    if (this.isDev) {
      const logData = options?.sanitize && data ? sanitizeData(data) : data;
      console.warn(`[WARN] ${message}`, logData || '');
    }
  }

  error(message: string, error?: any, options?: LogOptions) {
    if (this.isDev) {
      const errorData = options?.sanitize && error ? sanitizeData(error) : error;
      console.error(`[ERROR] ${message}`, errorData || '');
    }
    
    // Production error tracking can be configured with services like Sentry
    // Sentry.captureException(error, { tags: { message } });
  }

  debug(message: string, data?: any) {
    if (this.isDev) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
}

export const logger = new SecureLogger();
