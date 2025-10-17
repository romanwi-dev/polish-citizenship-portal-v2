// Client-side input validation utilities
// First line of defense against malicious input

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Constants
export const MAX_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 255;
export const MAX_TEXT_LENGTH = 5000;
export const MAX_NOTES_LENGTH = 2000;

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  
  if (email.length > MAX_EMAIL_LENGTH) {
    return { valid: false, error: `Email must be less than ${MAX_EMAIL_LENGTH} characters` };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true };
}

/**
 * Validate name fields (first name, last name)
 */
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }
  
  if (trimmed.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `${fieldName} must be less than ${MAX_NAME_LENGTH} characters` };
  }
  
  // Allow only letters, spaces, hyphens, apostrophes, and common accented characters
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-'\.]+$/;
  if (!nameRegex.test(trimmed)) {
    return { valid: false, error: `${fieldName} contains invalid characters` };
  }
  
  return { valid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  
  if (password.length > 100) {
    return { valid: false, error: 'Password must be less than 100 characters' };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  
  // Check for at least one letter
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one letter' };
  }
  
  return { valid: true };
}

/**
 * Validate date in DD.MM.YYYY format
 */
export function validateDate(date: string, fieldName: string = 'Date'): ValidationResult {
  if (!date || typeof date !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  // Check format DD.MM.YYYY
  const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const match = date.match(dateRegex);
  
  if (!match) {
    return { valid: false, error: `${fieldName} must be in format DD.MM.YYYY` };
  }
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  
  // Validate day (1-31)
  if (day < 1 || day > 31) {
    return { valid: false, error: 'Day must be between 1 and 31' };
  }
  
  // Validate month (1-12)
  if (month < 1 || month > 12) {
    return { valid: false, error: 'Month must be between 1 and 12' };
  }
  
  // Validate year (not in future, reasonable past)
  const currentYear = new Date().getFullYear();
  if (year > 2030) {
    return { valid: false, error: 'Year cannot be after 2030' };
  }
  
  if (year < 1900) {
    return { valid: false, error: 'Year must be after 1900' };
  }
  
  return { valid: true };
}

/**
 * Validate passport number
 */
export function validatePassportNumber(passport: string): ValidationResult {
  if (!passport || typeof passport !== 'string') {
    return { valid: false, error: 'Passport number is required' };
  }
  
  const trimmed = passport.trim().toUpperCase();
  
  if (trimmed.length < 6 || trimmed.length > 15) {
    return { valid: false, error: 'Passport number must be 6-15 characters' };
  }
  
  // Allow only alphanumeric characters
  if (!/^[A-Z0-9]+$/.test(trimmed)) {
    return { valid: false, error: 'Passport number can only contain letters and numbers' };
  }
  
  return { valid: true };
}

/**
 * Validate text field with max length
 */
export function validateTextField(
  text: string,
  fieldName: string,
  maxLength: number = MAX_TEXT_LENGTH
): ValidationResult {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  const trimmed = text.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }
  
  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} must be less than ${maxLength} characters` };
  }
  
  // Check for potential XSS attempts
  if (/<script|javascript:|onerror=/i.test(text)) {
    return { valid: false, error: 'Invalid content detected' };
  }
  
  return { valid: true };
}

/**
 * Validate phone number (international format)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }
  
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Allow + at start for international
  const phoneRegex = /^\+?[1-9]\d{7,14}$/;
  
  if (!phoneRegex.test(cleaned)) {
    return { valid: false, error: 'Invalid phone number format' };
  }
  
  return { valid: true };
}

/**
 * Validate file upload
 */
export function validateFile(
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
  maxSizeMB: number = 10
): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed` };
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }
  
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }
  
  return { valid: true };
}

/**
 * Sanitize text input to prevent XSS
 * NOTE: This is a basic sanitizer. For HTML content, use a library like DOMPurify
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Check if input contains potential SQL injection patterns
 */
export function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\;|\/\*|\*\/|xp_|sp_)/i,
    /(\bOR\b.*=.*|1=1|'=')/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate multiple fields at once
 */
export function validateFields(
  fields: Array<{ value: any; validator: (value: any) => ValidationResult }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const field of fields) {
    const result = field.validator(field.value);
    if (!result.valid && result.error) {
      errors.push(result.error);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
