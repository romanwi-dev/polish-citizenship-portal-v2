// Security monitoring utilities for real-time threat detection
// Provides hooks and utilities to monitor security events

import { supabase } from "@/integrations/supabase/client";

export type SecurityEventType =
  | 'auth_login_success'
  | 'auth_login_failed'
  | 'auth_logout'
  | 'auth_signup'
  | 'auth_password_reset'
  | 'data_access'
  | 'data_modification'
  | 'data_deletion'
  | 'permission_denied'
  | 'rate_limit_exceeded'
  | 'invalid_input'
  | 'suspicious_activity';

export type SecuritySeverity = 'info' | 'warning' | 'critical';

export interface SecurityEvent {
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  action: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  success?: boolean;
  errorCode?: string;
}

/**
 * Log a security event to the audit log
 * Automatically captures user context and sanitizes sensitive data
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    // Get current user if not provided
    if (!event.userId) {
      const { data: { user } } = await supabase.auth.getUser();
      event.userId = user?.id;
    }

    // Capture client info
    const ipAddress = event.ipAddress || getClientIP();
    const userAgent = event.userAgent || navigator.userAgent;

    // Sanitize details to remove PII
    const sanitizedDetails = sanitizeEventDetails(event.details);

    // Call the database function to log the event
    const { error } = await supabase.rpc('log_security_event', {
      p_event_type: event.eventType,
      p_severity: event.severity,
      p_action: event.action,
      p_user_id: event.userId || null,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_resource_type: event.resourceType || null,
      p_resource_id: event.resourceId || null,
      p_details: sanitizedDetails || {},
      p_success: event.success !== false,
      p_error_code: event.errorCode || null
    });

    if (error) {
      console.error('Failed to log security event:', error);
    }
  } catch (error) {
    // Don't throw - logging failures shouldn't break app functionality
    console.error('Security event logging error:', error);
  }
}

/**
 * Log authentication events
 */
export const SecurityMonitor = {
  /**
   * Log successful login
   */
  async logLoginSuccess(userId: string) {
    await logSecurityEvent({
      eventType: 'auth_login_success',
      severity: 'info',
      action: 'User logged in successfully',
      userId,
      success: true
    });
  },

  /**
   * Log failed login attempt
   */
  async logLoginFailed(email?: string, errorCode?: string) {
    await logSecurityEvent({
      eventType: 'auth_login_failed',
      severity: 'warning',
      action: 'Failed login attempt',
      details: { email: email ? maskEmail(email) : undefined },
      success: false,
      errorCode
    });
  },

  /**
   * Log logout
   */
  async logLogout(userId: string) {
    await logSecurityEvent({
      eventType: 'auth_logout',
      severity: 'info',
      action: 'User logged out',
      userId,
      success: true
    });
  },

  /**
   * Log signup
   */
  async logSignup(userId: string) {
    await logSecurityEvent({
      eventType: 'auth_signup',
      severity: 'info',
      action: 'New user signed up',
      userId,
      success: true
    });
  },

  /**
   * Log data access
   */
  async logDataAccess(resourceType: string, resourceId: string, userId?: string) {
    await logSecurityEvent({
      eventType: 'data_access',
      severity: 'info',
      action: `Accessed ${resourceType}`,
      userId,
      resourceType,
      resourceId,
      success: true
    });
  },

  /**
   * Log permission denied
   */
  async logPermissionDenied(resourceType: string, action: string, userId?: string) {
    await logSecurityEvent({
      eventType: 'permission_denied',
      severity: 'warning',
      action: `Permission denied: ${action} on ${resourceType}`,
      userId,
      resourceType,
      success: false
    });
  },

  /**
   * Log rate limit exceeded
   */
  async logRateLimitExceeded(action: string) {
    await logSecurityEvent({
      eventType: 'rate_limit_exceeded',
      severity: 'warning',
      action: `Rate limit exceeded: ${action}`,
      success: false
    });
  },

  /**
   * Log suspicious activity
   */
  async logSuspiciousActivity(description: string, details?: Record<string, any>) {
    await logSecurityEvent({
      eventType: 'suspicious_activity',
      severity: 'critical',
      action: description,
      details,
      success: false
    });
  }
};

/**
 * Get client IP address (best effort)
 * Note: This only works if the server provides the header
 */
function getClientIP(): string {
  // In production, the IP would come from server headers
  // For now, return a placeholder
  return 'client';
}

/**
 * Mask email address for logging (show first char + domain)
 */
function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '[EMAIL]';
  
  const local = parts[0];
  const domain = parts[1];
  
  return `${local[0]}***@${domain}`;
}

/**
 * Sanitize event details to remove sensitive data
 */
function sanitizeEventDetails(details?: Record<string, any>): Record<string, any> | undefined {
  if (!details) return undefined;

  const sanitized: Record<string, any> = {};
  const sensitiveKeys = [
    'password', 'token', 'secret', 'apikey', 'api_key',
    'passport', 'ssn', 'credit_card', 'cvv', 'passport_number'
  ];

  for (const [key, value] of Object.entries(details)) {
    const lowerKey = key.toLowerCase();

    // Redact sensitive keys
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Keep safe values
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (value === null || value === undefined) {
      sanitized[key] = value;
    } else {
      sanitized[key] = '[OBJECT]';
    }
  }

  return sanitized;
}

/**
 * Record security metric
 */
export async function recordSecurityMetric(
  metricType: string,
  metricValue: number,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const { error } = await supabase.rpc('record_security_metric', {
      p_metric_type: metricType,
      p_metric_value: metricValue,
      p_metadata: metadata || {}
    });

    if (error) {
      console.error('Failed to record security metric:', error);
    }
  } catch (error) {
    console.error('Security metric recording error:', error);
  }
}

/**
 * Track failed login attempts and detect brute force
 */
export class LoginAttemptTracker {
  private static attempts = new Map<string, { count: number; lastAttempt: number }>();
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  static recordFailedAttempt(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now - record.lastAttempt > this.WINDOW_MS) {
      // First attempt or window expired
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return false;
    }

    record.count++;
    record.lastAttempt = now;

    if (record.count >= this.MAX_ATTEMPTS) {
      // Potential brute force attack
      SecurityMonitor.logSuspiciousActivity('Potential brute force attack detected', {
        identifier: maskEmail(identifier),
        attempts: record.count
      });
      return true;
    }

    return false;
  }

  static clearAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }
}
