// Shared validation utilities for edge functions
// Prevents injection attacks and ensures data integrity

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_TEXT_LENGTH = 50000; // 50k characters
export const MAX_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 255;

// Allowed file types for document uploads
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
];

// Validate UUID format
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Validate email format
export function isValidEmail(email: string): boolean {
  if (email.length > MAX_EMAIL_LENGTH) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize text input (remove potentially dangerous characters)
export function sanitizeText(text: string, maxLength: number = MAX_TEXT_LENGTH): string {
  if (typeof text !== 'string') return '';
  
  // Truncate to max length
  let sanitized = text.slice(0, maxLength);
  
  // Remove null bytes and control characters except newlines/tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

// Sanitize name fields (stricter than general text)
export function sanitizeName(name: string): string {
  if (typeof name !== 'string') return '';
  
  // Truncate to max length
  let sanitized = name.slice(0, MAX_NAME_LENGTH);
  
  // Allow only letters, spaces, hyphens, apostrophes, and common accented characters
  sanitized = sanitized.replace(/[^a-zA-ZÀ-ÿ\s\-'\.]/g, '');
  
  // Trim and normalize spaces
  sanitized = sanitized.trim().replace(/\s+/g, ' ');
  
  return sanitized;
}

// Validate file upload
export function validateFile(
  file: File | Blob,
  allowedTypes: string[] = ALLOWED_DOCUMENT_TYPES
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed` };
  }

  return { valid: true };
}

// Validate and sanitize case data
export interface CaseDataInput {
  caseId?: string;
  clientName?: string;
  email?: string;
  text?: string;
  [key: string]: any;
}

export function validateCaseData(data: any): { 
  valid: boolean; 
  sanitized?: CaseDataInput;
  errors?: string[];
} {
  const errors: string[] = [];
  const sanitized: CaseDataInput = {};

  // Validate caseId if present
  if (data.caseId !== undefined) {
    if (!isValidUUID(data.caseId)) {
      errors.push('Invalid case ID format');
    } else {
      sanitized.caseId = data.caseId;
    }
  }

  // Validate and sanitize clientName if present
  if (data.clientName !== undefined) {
    const name = sanitizeName(data.clientName);
    if (name.length === 0) {
      errors.push('Client name cannot be empty');
    } else if (name.length > MAX_NAME_LENGTH) {
      errors.push(`Client name exceeds maximum length of ${MAX_NAME_LENGTH}`);
    } else {
      sanitized.clientName = name;
    }
  }

  // Validate email if present
  if (data.email !== undefined) {
    if (!isValidEmail(data.email)) {
      errors.push('Invalid email format');
    } else {
      sanitized.email = data.email.toLowerCase().trim();
    }
  }

  // Sanitize text fields if present
  if (data.text !== undefined) {
    sanitized.text = sanitizeText(data.text);
  }

  // Copy other validated fields
  for (const [key, value] of Object.entries(data)) {
    if (!['caseId', 'clientName', 'email', 'text'].includes(key)) {
      // Basic type validation
      if (typeof value === 'string') {
        sanitized[key] = sanitizeText(value, 1000);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      }
    }
  }

  return {
    valid: errors.length === 0,
    sanitized: errors.length === 0 ? sanitized : undefined,
    errors: errors.length > 0 ? errors : undefined
  };
}

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs
    });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetAt - now) / 1000)
    };
  }

  record.count++;
  return { allowed: true };
}
