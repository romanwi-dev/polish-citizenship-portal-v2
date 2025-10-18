/**
 * Passport Number Masking Utility
 * 
 * Masks sensitive passport numbers for UI display while preserving
 * full numbers in PDFs and secure contexts.
 * 
 * Format Examples:
 * - Full: AB1234567
 * - Masked: AB***4567 (shows first 2, last 4)
 * - Full: 123456789
 * - Masked: 12***6789 (shows first 2, last 4)
 */

/**
 * Masks a passport number for UI display
 * @param passportNumber - Full passport number
 * @param showFirst - Number of characters to show at start (default: 2)
 * @param showLast - Number of characters to show at end (default: 4)
 * @returns Masked passport number (e.g., "AB***4567")
 */
export const maskPassportNumber = (
  passportNumber: string | null | undefined,
  showFirst: number = 2,
  showLast: number = 4
): string => {
  if (!passportNumber || passportNumber.trim() === '') {
    return '';
  }

  const cleaned = passportNumber.trim();
  const length = cleaned.length;

  // If passport is too short to mask meaningfully, return as is
  if (length <= showFirst + showLast) {
    return cleaned;
  }

  const firstPart = cleaned.slice(0, showFirst);
  const lastPart = cleaned.slice(-showLast);
  const maskedMiddle = '*'.repeat(Math.min(length - showFirst - showLast, 3));

  return `${firstPart}${maskedMiddle}${lastPart}`;
};

/**
 * Determines if a context requires full passport number display
 * @param context - Context type ('ui', 'pdf', 'poa', 'export', 'log')
 * @returns True if full number should be shown
 */
export const shouldShowFullPassport = (context: 'ui' | 'pdf' | 'poa' | 'export' | 'log'): boolean => {
  switch (context) {
    case 'pdf':
    case 'poa':
    case 'export':
      return true; // Official documents need full numbers
    case 'ui':
    case 'log':
    default:
      return false; // UI and logs show masked
  }
};

/**
 * Gets passport number with context-aware masking
 * @param passportNumber - Full passport number
 * @param context - Display context
 * @returns Appropriate passport display (full or masked)
 */
export const getPassportDisplay = (
  passportNumber: string | null | undefined,
  context: 'ui' | 'pdf' | 'poa' | 'export' | 'log'
): string => {
  if (!passportNumber) return '';
  
  return shouldShowFullPassport(context)
    ? passportNumber
    : maskPassportNumber(passportNumber);
};

/**
 * Creates a tooltip showing that passport is masked
 * @returns Tooltip text
 */
export const getMaskingTooltip = (): string => {
  return 'Passport number is masked for security. Full number available in PDFs and official documents.';
};

/**
 * Validates passport number format (basic check)
 * @param passportNumber - Passport number to validate
 * @returns True if format seems valid
 */
export const isValidPassportFormat = (passportNumber: string | null | undefined): boolean => {
  if (!passportNumber) return false;
  
  const cleaned = passportNumber.trim();
  
  // Basic validation: 6-12 characters, alphanumeric
  const regex = /^[A-Z0-9]{6,12}$/i;
  return regex.test(cleaned);
};

/**
 * Security log sanitizer - removes full passport numbers from logs
 * @param logMessage - Log message potentially containing passport
 * @param passportNumber - Passport number to mask
 * @returns Sanitized log message
 */
export const sanitizeLogMessage = (
  logMessage: string,
  passportNumber: string | null | undefined
): string => {
  if (!passportNumber || !logMessage) return logMessage;
  
  const masked = maskPassportNumber(passportNumber);
  return logMessage.replace(new RegExp(passportNumber, 'gi'), masked);
};

/**
 * Redacts passport numbers from error messages
 * @param error - Error object or message
 * @param passportNumbers - Array of passport numbers to redact
 * @returns Redacted error message
 */
export const redactPassportsFromError = (
  error: any,
  passportNumbers: (string | null | undefined)[]
): string => {
  let message = typeof error === 'string' ? error : error?.message || 'Unknown error';
  
  passportNumbers.forEach(passport => {
    if (passport) {
      const masked = maskPassportNumber(passport);
      message = message.replace(new RegExp(passport, 'gi'), masked);
    }
  });
  
  return message;
};
