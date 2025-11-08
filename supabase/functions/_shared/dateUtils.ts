/**
 * Date utility functions for POA OCR validation
 * Handles both DD.MM.YYYY (Polish standard) and YYYY-MM-DD (ISO standard)
 */

/**
 * Parse DD.MM.YYYY format to Date
 */
export function parseDDMMYYYY(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  const match = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
  const year = parseInt(match[3], 10);
  
  // Validate ranges
  if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2030) {
    return null;
  }
  
  const date = new Date(year, month, day);
  
  // Verify date is valid (catches things like Feb 31)
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    return null;
  }
  
  return date;
}

/**
 * Parse YYYY-MM-DD format to Date
 */
export function parseYYYYMMDD(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
  const day = parseInt(match[3], 10);
  
  // Validate ranges
  if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2030) {
    return null;
  }
  
  const date = new Date(year, month, day);
  
  // Verify date is valid
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    return null;
  }
  
  return date;
}

/**
 * Parse date in either DD.MM.YYYY or YYYY-MM-DD format
 */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Try DD.MM.YYYY format first
  let date = parseDDMMYYYY(dateStr);
  if (date) return date;
  
  // Try YYYY-MM-DD format
  date = parseYYYYMMDD(dateStr);
  if (date) return date;
  
  return null;
}

export function isPassportValid(expiryDateStr: string): { valid: boolean; expiryDate: Date | null; daysUntilExpiry?: number } {
  const expiryDate = parseDate(expiryDateStr);
  
  if (!expiryDate) {
    return { valid: false, expiryDate: null };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Ignore time
  
  const isValid = expiryDate >= today;
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    valid: isValid,
    expiryDate,
    daysUntilExpiry: isValid ? daysUntilExpiry : undefined
  };
}

export function isPassportExpiringSoon(expiryDateStr: string, daysThreshold: number = 180): boolean {
  const validation = isPassportValid(expiryDateStr);
  
  if (!validation.valid || !validation.daysUntilExpiry) return false;
  
  return validation.daysUntilExpiry <= daysThreshold;
}

export function formatDateValidation(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!date) return "Invalid date format";
  
  return dateStr;
}
