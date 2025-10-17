/**
 * Shared input validation utilities
 * Provides common validation schemas and sanitization functions
 */

/**
 * Sanitize string input to prevent XSS and injection attacks
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input) return '';
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Enforce maximum length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Polish PESEL number (11 digits)
 */
export function isValidPesel(pesel: string): boolean {
  const peselRegex = /^[0-9]{11}$/;
  return peselRegex.test(pesel);
}

/**
 * Validate date string (YYYY-MM-DD format)
 */
export function isValidDate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate and sanitize object keys to prevent prototype pollution
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const sanitized: any = {};
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  
  for (const key in obj) {
    if (dangerousKeys.includes(key)) {
      continue; // Skip dangerous keys
    }
    
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  
  return sanitized;
}

/**
 * Validate request body structure
 */
export function validateRequestBody(
  body: any,
  requiredFields: string[]
): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }
  
  for (const field of requiredFields) {
    if (!(field in body)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }
  
  return { valid: true };
}

/**
 * Limit string length with custom error message
 */
export function enforceMaxLength(
  value: string,
  maxLength: number,
  fieldName: string
): { valid: boolean; error?: string; value: string } {
  if (value.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must not exceed ${maxLength} characters`,
      value: value.substring(0, maxLength)
    };
  }
  
  return { valid: true, value };
}

/**
 * Validate array length
 */
export function validateArrayLength(
  arr: any[],
  min: number = 0,
  max: number = 100
): { valid: boolean; error?: string } {
  if (!Array.isArray(arr)) {
    return { valid: false, error: 'Expected an array' };
  }
  
  if (arr.length < min) {
    return { valid: false, error: `Array must have at least ${min} items` };
  }
  
  if (arr.length > max) {
    return { valid: false, error: `Array must not exceed ${max} items` };
  }
  
  return { valid: true };
}
