import { z } from 'zod';

// =====================================================
// POA VALIDATION SCHEMAS
// Security: Comprehensive input validation with Zod
// =====================================================

/**
 * POA Type validation - only allow known types
 */
export const POATypeSchema = z.enum(['adult', 'minor', 'spouses'], {
  errorMap: () => ({ message: 'Invalid POA type. Must be adult, minor, or spouses.' }),
});

export type POAType = z.infer<typeof POATypeSchema>;

/**
 * UUID validation with security checks
 */
const SecureUUIDSchema = z.string().uuid({
  message: 'Invalid UUID format',
});

/**
 * Safe text field - prevents XSS and injection
 * Max 500 chars, alphanumeric + common punctuation only
 */
const SafeTextField = z
  .string()
  .trim()
  .min(1, 'Field cannot be empty')
  .max(500, 'Field exceeds maximum length of 500 characters')
  .regex(
    /^[a-zA-Z0-9\s\-.,()'"]+$/,
    'Field contains invalid characters'
  );

/**
 * Safe path - prevents path traversal attacks
 */
const SafePathSchema = z
  .string()
  .trim()
  .min(1, 'Path cannot be empty')
  .max(255, 'Path exceeds maximum length')
  .regex(
    /^[a-zA-Z0-9\/_\-\.]+$/,
    'Path contains invalid characters'
  )
  .refine(
    (path) => !path.includes('..') && !path.includes('//'),
    'Path traversal detected'
  );

/**
 * POA Generation Request Schema
 * Used by generate-poa edge function
 */
export const POAGenerationRequestSchema = z.object({
  caseId: SecureUUIDSchema,
  poaType: POATypeSchema,
  regenerate: z.boolean().optional().default(false),
});

export type POAGenerationRequest = z.infer<typeof POAGenerationRequestSchema>;

/**
 * POA Lock Request Schema
 * Used by lock-pdf edge function
 */
export const POALockRequestSchema = z.object({
  poaId: SecureUUIDSchema,
  caseId: SecureUUIDSchema,
  isLocked: z.boolean(),
  reason: SafeTextField.optional(),
});

export type POALockRequest = z.infer<typeof POALockRequestSchema>;

/**
 * Multi-POA View Request Schema
 * Used for fetching multiple POAs
 */
export const MultiPOAViewRequestSchema = z.object({
  caseId: SecureUUIDSchema,
  poaIds: z.array(SecureUUIDSchema).min(1).max(10), // Max 10 POAs at once
});

export type MultiPOAViewRequest = z.infer<typeof MultiPOAViewRequestSchema>;

/**
 * POA Download Request Schema
 * Used for downloading POA with watermark
 */
export const POADownloadRequestSchema = z.object({
  poaId: SecureUUIDSchema,
  caseId: SecureUUIDSchema,
  withWatermark: z.boolean().default(true),
  watermarkText: SafeTextField.optional(),
});

export type POADownloadRequest = z.infer<typeof POADownloadRequestSchema>;

/**
 * PDF Field Value Schema
 * Prevents PDF field injection
 */
export const PDFFieldValueSchema = z
  .string()
  .trim()
  .max(1000, 'PDF field value exceeds maximum length')
  .refine(
    (value) => {
      // Prevent PDF operators and control characters
      const dangerousPatterns = [
        /\/JS\s*\(/i,      // JavaScript
        /\/JavaScript\s*\(/i,
        /\/AA\s*</i,       // Auto Action
        /\/OpenAction/i,
        /\/Launch/i,
        /<<\s*\/S\s*\/URI/i, // URI action
        /%PDF-/i,          // PDF header injection
      ];
      return !dangerousPatterns.some(pattern => pattern.test(value));
    },
    'PDF field contains potentially dangerous content'
  );

/**
 * Rate Limit Response Schema
 */
export const RateLimitResponseSchema = z.object({
  allowed: z.boolean(),
  reason: z.string().optional(),
  message: z.string().optional(),
  reset_at: z.string().datetime().optional(),
  current_count: z.number().optional(),
  max_count: z.number().optional(),
});

export type RateLimitResponse = z.infer<typeof RateLimitResponseSchema>;

/**
 * POA Generation Response Schema
 */
export const POAGenerationResponseSchema = z.object({
  success: z.boolean(),
  poaId: SecureUUIDSchema.optional(),
  pdfUrl: z.string().url().optional(),
  error: z.string().optional(),
  rateLimitInfo: RateLimitResponseSchema.optional(),
});

export type POAGenerationResponse = z.infer<typeof POAGenerationResponseSchema>;

/**
 * Sanitize text for safe display
 * Removes potentially dangerous characters
 */
export function sanitizeDisplayText(text: string): string {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .slice(0, 500); // Limit length
}

/**
 * Validate and sanitize PDF field value
 */
export function sanitizePDFFieldValue(value: string): string {
  try {
    PDFFieldValueSchema.parse(value);
    return value
      .trim()
      .replace(/[<>]/g, '')
      .slice(0, 1000);
  } catch {
    throw new Error('Invalid PDF field value');
  }
}

/**
 * Validate and sanitize file path
 */
export function sanitizePath(path: string): string {
  try {
    SafePathSchema.parse(path);
    // Additional normalization
    return path
      .replace(/\\/g, '/')
      .replace(/\/+/g, '/')
      .replace(/^\/+/, '')
      .replace(/\/+$/, '');
  } catch {
    throw new Error('Invalid file path');
  }
}
