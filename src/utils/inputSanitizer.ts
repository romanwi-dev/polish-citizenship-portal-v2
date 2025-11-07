/**
 * Input Sanitization Utility
 * Sanitizes user input to prevent XSS and injection attacks
 */

/**
 * Sanitize a string input
 * - Trims whitespace
 * - Removes potentially dangerous characters
 * - Limits length
 * @param input - Raw user input
 * @param maxLength - Maximum allowed length (default: 255)
 * @returns Sanitized string
 */
export function sanitizeString(input: string | null | undefined, maxLength: number = 255): string {
  if (!input) return '';
  
  let sanitized = input
    .trim()
    .slice(0, maxLength);
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  return sanitized;
}

/**
 * Sanitize a name field (letters, spaces, hyphens, apostrophes only)
 * @param input - Raw name input
 * @param maxLength - Maximum allowed length (default: 100)
 * @returns Sanitized name
 */
export function sanitizeName(input: string | null | undefined, maxLength: number = 100): string {
  if (!input) return '';
  
  const sanitized = sanitizeString(input, maxLength);
  
  // Allow letters (including accented), spaces, hyphens, apostrophes
  return sanitized.replace(/[^a-zA-ZÀ-ÿ\s\-']/g, '');
}

/**
 * Sanitize a text area input
 * @param input - Raw text input
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized text
 */
export function sanitizeText(input: string | null | undefined, maxLength: number = 1000): string {
  if (!input) return '';
  
  return sanitizeString(input, maxLength);
}

/**
 * Sanitize an email address
 * @param input - Raw email input
 * @returns Sanitized email (lowercase, trimmed)
 */
export function sanitizeEmail(input: string | null | undefined): string {
  if (!input) return '';
  
  return sanitizeString(input, 255)
    .toLowerCase()
    .replace(/[^a-z0-9@._\-+]/g, '');
}

/**
 * Sanitize a phone number
 * @param input - Raw phone input
 * @returns Sanitized phone (numbers, +, -, spaces, parentheses only)
 */
export function sanitizePhone(input: string | null | undefined): string {
  if (!input) return '';
  
  return sanitizeString(input, 20)
    .replace(/[^0-9+\-\s()]/g, '');
}

/**
 * Sanitize a date string (DD.MM.YYYY format)
 * @param input - Raw date input
 * @returns Sanitized date or empty string if invalid
 */
export function sanitizeDate(input: string | null | undefined): string {
  if (!input) return '';
  
  const sanitized = sanitizeString(input, 10);
  
  // Must match DD.MM.YYYY format
  const datePattern = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const match = sanitized.match(datePattern);
  
  if (!match) return '';
  
  const [, day, month, year] = match;
  const dayNum = parseInt(day);
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  
  // Validate ranges
  if (dayNum < 1 || dayNum > 31) return '';
  if (monthNum < 1 || monthNum > 12) return '';
  if (yearNum < 1900 || yearNum > 2030) return '';
  
  return sanitized;
}

/**
 * Sanitize a passport number
 * @param input - Raw passport input
 * @returns Sanitized passport (alphanumeric only)
 */
export function sanitizePassport(input: string | null | undefined): string {
  if (!input) return '';
  
  return sanitizeString(input, 20)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Sanitize all fields in a form data object
 * @param formData - Raw form data
 * @returns Sanitized form data
 */
export function sanitizeFormData(formData: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value !== 'string') {
      sanitized[key] = value;
      continue;
    }
    
    // Determine field type and apply appropriate sanitization
    if (key.includes('email')) {
      sanitized[key] = sanitizeEmail(value);
    } else if (key.includes('phone')) {
      sanitized[key] = sanitizePhone(value);
    } else if (key.includes('passport')) {
      sanitized[key] = sanitizePassport(value);
    } else if (key.includes('dob') || key.includes('date')) {
      sanitized[key] = sanitizeDate(value);
    } else if (key.includes('name') || key.includes('pob')) {
      sanitized[key] = sanitizeName(value);
    } else if (key.includes('notes')) {
      sanitized[key] = sanitizeText(value, 2000);
    } else {
      sanitized[key] = sanitizeString(value);
    }
  }
  
  return sanitized;
}
