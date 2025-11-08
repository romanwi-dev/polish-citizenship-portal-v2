/**
 * Date utility functions for POA OCR validation
 * Handles DD.MM.YYYY format (Polish standard)
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

export function isPassportValid(expiryDateStr: string): { valid: boolean; expiryDate: Date | null; daysUntilExpiry?: number } {
  const expiryDate = parseDDMMYYYY(expiryDateStr);
  
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
  const date = parseDDMMYYYY(dateStr);
  if (!date) return "Invalid date format";
  
  return dateStr;
}
