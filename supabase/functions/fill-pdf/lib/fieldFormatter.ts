/**
 * Utilities for formatting database values for PDF fields
 */

/**
 * Format a date from ISO string to DD.MM.YYYY
 * FIXED: Handles already-formatted dates, invalid formats, and edge cases
 */
export const formatDate = (date: string | null | undefined): string => {
  if (!date) return '';
  
  try {
    // If already in DD.MM.YYYY format, return as-is
    if (typeof date === 'string' && /^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
      return date;
    }
    
    // If in YYYY-MM-DD format, convert
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      const [year, month, day] = date.split('T')[0].split('-');
      return `${day}.${month}.${year}`;
    }
    
    // Try parsing as Date object
    const d = new Date(date);
    
    // Validate date is real
    if (isNaN(d.getTime())) {
      console.warn('Invalid date value:', date);
      return '';
    }
    
    // Validate reasonable date range (1800-2030)
    const year = d.getFullYear();
    if (year < 1800 || year > 2030) {
      console.warn('Date out of reasonable range:', date);
      return '';
    }
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    
    return `${day}.${month}.${year}`;
  } catch (e) {
    console.warn('Error formatting date:', date, e);
    return '';
  }
};

/**
 * Format an address JSONB object to a single-line string
 * FIXED: Better null handling and nested object support
 */
export const formatAddress = (address: any): string => {
  if (!address) return '';
  
  // Handle string addresses (already formatted)
  if (typeof address === 'string') return address.trim();
  
  // Handle JSONB object addresses
  if (typeof address === 'object') {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.postal_code || address.zip,
      address.country,
    ].filter(Boolean).map(part => String(part).trim());
    
    return parts.join(', ');
  }
  
  return '';
};

/**
 * Format an array to a comma-separated string
 */
export const formatArray = (arr: any[] | null | undefined): string => {
  if (!arr || !Array.isArray(arr)) return '';
  return arr.filter(Boolean).map(item => String(item).trim()).join(', ');
};

/**
 * Format a boolean to Yes/No
 * FIXED: Handles all truthy/falsy values including strings
 */
export const formatBoolean = (value: any): string => {
  if (value === null || value === undefined || value === '') return '';
  
  // Handle boolean type
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  
  // Handle truthy string values
  const stringValue = String(value).toLowerCase().trim();
  if (['true', 'yes', '1', 'y', 'tak', 'checked'].includes(stringValue)) return 'Yes';
  if (['false', 'no', '0', 'n', 'nie', 'unchecked'].includes(stringValue)) return 'No';
  
  // Default to No for unknown values
  return 'No';
};

/**
 * Get nested JSONB value using dot notation
 * FIXED: More robust handling of null/undefined intermediate values
 * Example: getNestedValue(data, 'applicant_address.street')
 * 
 * ENHANCED: Special handling for date splits (e.g., 'applicant_dob.day')
 * If the path ends with .day, .month, or .year and the parent is a date,
 * it will extract the appropriate component.
 */
export const getNestedValue = (obj: any, path: string): any => {
  if (!obj || !path) return undefined;
  
  // Direct property access (no dot notation)
  if (!path.includes('.')) {
    return obj[path];
  }
  
  const keys = path.split('.');
  
  // Check if this is a date component request (e.g., 'applicant_dob.day')
  if (keys.length === 2 && ['day', 'month', 'year'].includes(keys[1])) {
    const dateValue = obj[keys[0]];
    if (dateValue) {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        switch (keys[1]) {
          case 'day': return date.getDate().toString().padStart(2, '0');
          case 'month': return (date.getMonth() + 1).toString().padStart(2, '0');
          case 'year': return date.getFullYear().toString();
        }
      }
    }
    return undefined;
  }
  
  // Navigate nested path safely
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
};

/**
 * Determine the appropriate formatter based on the field name and value type
 */
export const formatFieldValue = (value: any, fieldName: string): string => {
  if (value === null || value === undefined) return '';
  
  // Date fields - check for common date field patterns
  const datePatterns = [
    '_date', '_dob', '_at', 'DOB', 'Date', 'birth', 'marriage', 
    'emigration', 'naturalization', 'expiry', 'issue'
  ];
  
  if (datePatterns.some(pattern => fieldName.includes(pattern))) {
    return formatDate(value);
  }
  
  // Address fields
  if ((fieldName.includes('address') || fieldName.includes('Address')) && 
      (typeof value === 'object' || typeof value === 'string')) {
    return formatAddress(value);
  }
  
  // Array fields (citizenship, etc.)
  if (Array.isArray(value)) {
    return formatArray(value);
  }
  
  // Boolean fields
  if (typeof value === 'boolean' || 
      fieldName.includes('is_') || 
      fieldName.includes('has_') ||
      fieldName.includes('checkbox')) {
    return formatBoolean(value);
  }
  
  // Default: convert to string and trim
  return String(value).trim();
};
