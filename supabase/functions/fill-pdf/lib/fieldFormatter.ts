/**
 * Utilities for formatting database values for PDF fields
 */

/**
 * Format a date from ISO string to DD.MM.YYYY
 */
export const formatDate = (date: string | null | undefined): string => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}.${month}.${year}`;
  } catch (e) {
    console.warn('Error formatting date:', date, e);
    return '';
  }
};

/**
 * Format an address JSONB object to a single-line string
 */
export const formatAddress = (address: any): string => {
  if (!address || typeof address !== 'object') return '';
  
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zip,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Format an array to a comma-separated string
 */
export const formatArray = (arr: any[] | null | undefined): string => {
  if (!arr || !Array.isArray(arr)) return '';
  return arr.filter(Boolean).join(', ');
};

/**
 * Format a boolean to Yes/No
 */
export const formatBoolean = (value: boolean | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return value ? 'Yes' : 'No';
};

/**
 * Get nested JSONB value using dot notation
 * Example: getNestedValue(data, 'applicant_address.street')
 */
export const getNestedValue = (obj: any, path: string): any => {
  if (!path.includes('.')) return obj[path];
  
  return path.split('.').reduce((current, key) => {
    return current?.[key];
  }, obj);
};

/**
 * Determine the appropriate formatter based on the field name and value type
 */
export const formatFieldValue = (value: any, fieldName: string): string => {
  if (value === null || value === undefined) return '';
  
  // Special case: combined name fields
  if (fieldName.includes('Name') && !fieldName.includes('First') && !fieldName.includes('Last') && !fieldName.includes('Maiden')) {
    // For fields like 'applicantName', 'fatherName', etc., we need to handle this specially
    // This will be handled by the field filler to combine first + last names
    return String(value);
  }
  
  // Date fields
  if (fieldName.includes('_date') || fieldName.includes('_dob') || 
      fieldName.includes('DOB') || fieldName.includes('Date') ||
      fieldName.includes('_at') && value instanceof Date) {
    return formatDate(value);
  }
  
  // Address fields
  if (fieldName.includes('address') && typeof value === 'object') {
    return formatAddress(value);
  }
  
  // Array fields (citizenship, etc.)
  if (Array.isArray(value)) {
    return formatArray(value);
  }
  
  // Boolean fields
  if (typeof value === 'boolean') {
    return formatBoolean(value);
  }
  
  // Default: convert to string and trim
  return String(value).trim();
};
