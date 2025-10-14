/**
 * Data Masking Utilities
 * 
 * Provides secure masking for sensitive data like passport numbers
 * with role-based unmasking capabilities.
 * 
 * Security: Only admin and assistant roles can see full passport numbers.
 * All other users see masked versions (e.g., "****4567")
 */

import { UserRole } from "@/hooks/useUserRole";

/**
 * Masks a passport number, showing only the last 4 digits
 * @param passportNumber - The full passport number
 * @returns Masked string like "****4567"
 */
export const maskPassportNumber = (passportNumber: string | null | undefined): string => {
  if (!passportNumber || passportNumber.length === 0) return "";
  
  // Handle very short passport numbers
  if (passportNumber.length <= 4) {
    return "****";
  }
  
  // Show last 4 digits only
  const lastFour = passportNumber.slice(-4);
  return `****${lastFour}`;
};

/**
 * Conditionally masks passport number based on user role
 * @param passportNumber - The full passport number
 * @param userRole - Current user's role
 * @param forceShow - Override masking (e.g., for PDF generation)
 * @returns Full or masked passport number based on permissions
 */
export const maskPassportByRole = (
  passportNumber: string | null | undefined,
  userRole: UserRole | null | undefined,
  forceShow: boolean = false
): string => {
  if (!passportNumber) return "";
  
  // PDF generation or admin/assistant access
  if (forceShow || userRole === 'admin' || userRole === 'assistant') {
    return passportNumber;
  }
  
  // Regular users and clients see masked version
  return maskPassportNumber(passportNumber);
};

/**
 * Checks if current user can see full passport numbers
 * @param userRole - Current user's role
 * @returns true if user can see unmasked passport numbers
 */
export const canSeeFullPassport = (userRole: UserRole | null | undefined): boolean => {
  return userRole === 'admin' || userRole === 'assistant';
};

/**
 * Masks multiple passport-related fields in an object
 * @param data - Object containing passport fields
 * @param userRole - Current user's role
 * @returns New object with masked passport fields
 */
export const maskPassportFields = <T extends Record<string, any>>(
  data: T,
  userRole: UserRole | null | undefined
): T => {
  if (!data) return data;
  
  const maskedData = { ...data } as Record<string, any>;
  const passportFields = [
    'applicant_passport_number',
    'spouse_passport_number',
    'passport_number',
    // Add children passport fields
    ...Array.from({ length: 10 }, (_, i) => `child_${i + 1}_passport_number`),
    // Add parent/grandparent passport fields
    'father_passport_number',
    'mother_passport_number',
    'paternal_grandfather_passport_number',
    'paternal_grandmother_passport_number',
    'maternal_grandfather_passport_number',
    'maternal_grandmother_passport_number',
  ];
  
  passportFields.forEach(field => {
    if (field in maskedData && maskedData[field]) {
      maskedData[field] = maskPassportByRole(maskedData[field], userRole);
    }
  });
  
  return maskedData as T;
};

/**
 * Sanitizes data for logging - removes all sensitive fields
 * CRITICAL: Use this for ALL console.log/error.log operations
 * @param data - Data object to sanitize
 * @returns Safe object without sensitive data
 */
export const sanitizeForLogging = <T extends Record<string, any>>(data: T): Partial<T> => {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = { ...data } as Record<string, any>;
  const sensitiveFields = [
    // Passport numbers
    'applicant_passport_number',
    'spouse_passport_number', 
    'passport_number',
    ...Array.from({ length: 10 }, (_, i) => `child_${i + 1}_passport_number`),
    'father_passport_number',
    'mother_passport_number',
    'paternal_grandfather_passport_number',
    'paternal_grandmother_passport_number',
    'maternal_grandfather_passport_number',
    'maternal_grandmother_passport_number',
    // Other sensitive data
    'password',
    'access_token',
    'refresh_token',
    'api_key',
    'secret',
    'ssn',
    'tax_id',
  ];
  
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]' as any;
    }
  });
  
  return sanitized as Partial<T>;
};

/**
 * Safe logger that automatically sanitizes sensitive data
 * Use this instead of console.log for any data containing user info
 */
export const safeLog = {
  info: (...args: any[]) => {
    const sanitized = args.map(arg => 
      typeof arg === 'object' ? sanitizeForLogging(arg) : arg
    );
    console.log(...sanitized);
  },
  
  error: (...args: any[]) => {
    const sanitized = args.map(arg => 
      typeof arg === 'object' ? sanitizeForLogging(arg) : arg
    );
    console.error(...sanitized);
  },
  
  warn: (...args: any[]) => {
    const sanitized = args.map(arg => 
      typeof arg === 'object' ? sanitizeForLogging(arg) : arg
    );
    console.warn(...sanitized);
  },
};
