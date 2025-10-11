/**
 * Universal PDF field filler utility
 * Fills PDF form fields based on a mapping configuration
 */

import { formatFieldValue, getNestedValue, formatBoolean } from './fieldFormatter.ts';

export interface FillResult {
  totalFields: number;
  filledFields: number;
  emptyFields: string[];
  errors: Array<{ field: string; error: string }>;
}

/**
 * Check if a value is truthy for checkbox purposes
 * FIXED: Comprehensive truthy value detection
 */
const isTruthyForCheckbox = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'boolean') return value;
  
  const stringValue = String(value).toLowerCase().trim();
  return ['true', 'yes', '1', 'y', 'tak', 'checked', 'on'].includes(stringValue);
};

/**
 * Extract name components from database column prefix
 * FIXED: More robust name extraction with fallback strategies
 */
const extractNameComponents = (data: any, dbColumn: string): { firstName: string; lastName: string } => {
  // Strategy 1: Try the direct mapping pattern (e.g., 'applicant_first_name' -> 'applicant')
  let prefix = dbColumn.replace(/_first_name$/, '').replace(/_last_name$/, '');
  
  let firstName = data[`${prefix}_first_name`] || data[dbColumn] || '';
  let lastName = data[`${prefix}_last_name`] || '';
  
  // Strategy 2: If no match, try extracting from the dbColumn directly
  if (!firstName && !lastName) {
    // Try to find any related first/last name in the data
    const columnParts = dbColumn.split('_');
    const possiblePrefix = columnParts[0]; // e.g., 'applicant', 'father', 'mother'
    
    firstName = data[`${possiblePrefix}_first_name`] || '';
    lastName = data[`${possiblePrefix}_last_name`] || '';
  }
  
  return { 
    firstName: String(firstName).trim(), 
    lastName: String(lastName).trim() 
  };
};

/**
 * Determine if a PDF field should be treated as a full name field
 * FIXED: Better pattern detection for combined name fields
 */
const isFullNameField = (pdfFieldName: string): boolean => {
  const lower = pdfFieldName.toLowerCase();
  
  // It's a full name if it contains 'name' but NOT 'first', 'last', 'maiden', or 'middle'
  const hasName = lower.includes('name') || lower.includes('full');
  const isNotComponent = !lower.includes('first') && 
                         !lower.includes('last') && 
                         !lower.includes('maiden') && 
                         !lower.includes('middle') &&
                         !lower.includes('given') &&
                         !lower.includes('surname');
  
  return hasName && isNotComponent;
};

/**
 * Fill PDF form fields using a field mapping configuration
 * 
 * @param form - PDFForm instance from pdf-lib
 * @param data - Master table data
 * @param fieldMap - Mapping of PDF field names to database columns
 * @returns FillResult with statistics about the fill operation
 */
export const fillPDFFields = (
  form: any,
  data: any,
  fieldMap: Record<string, string>
): FillResult => {
  const result: FillResult = {
    totalFields: 0,
    filledFields: 0,
    emptyFields: [],
    errors: [],
  };

  for (const [pdfFieldName, dbColumn] of Object.entries(fieldMap)) {
    result.totalFields++;

    try {
      // Determine raw value based on field type
      let rawValue;
      
      if (isFullNameField(pdfFieldName)) {
        // This is a combined name field - construct from first and last
        const { firstName, lastName } = extractNameComponents(data, dbColumn);
        rawValue = `${firstName} ${lastName}`.trim();
        
        // Log if we couldn't construct a name
        if (!rawValue) {
          console.log(`⚠️ Could not construct full name for ${pdfFieldName} from ${dbColumn}`);
        }
      } else {
        // Get value from database (supports nested JSONB with dot notation)
        rawValue = getNestedValue(data, dbColumn);
      }
      
      if (rawValue === null || rawValue === undefined || rawValue === '') {
        result.emptyFields.push(pdfFieldName);
        continue;
      }

      // Format the value appropriately
      const formattedValue = formatFieldValue(rawValue, dbColumn);
      
      if (!formattedValue) {
        result.emptyFields.push(pdfFieldName);
        continue;
      }

      // Try to fill the field in the PDF
      try {
        // Try text field first
        const textField = form.getTextField(pdfFieldName);
        if (textField) {
          textField.setText(formattedValue);
          result.filledFields++;
          continue;
        }
      } catch (e) {
        // Not a text field, try checkbox
      }
      
      // Try checkbox field
      try {
        const checkboxField = form.getCheckBox(pdfFieldName);
        if (checkboxField) {
          if (isTruthyForCheckbox(rawValue)) {
            checkboxField.check();
          } else {
            checkboxField.uncheck();
          }
          result.filledFields++;
          continue;
        }
      } catch (e) {
        // Not a checkbox either
      }
      
      // Field not found in PDF template
      result.errors.push({
        field: pdfFieldName,
        error: `Field "${pdfFieldName}" not found in PDF template`,
      });
      
    } catch (error) {
      result.errors.push({
        field: pdfFieldName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return result;
};

/**
 * Calculate field coverage percentage
 */
export const calculateCoverage = (result: FillResult): number => {
  if (result.totalFields === 0) return 0;
  return Math.round((result.filledFields / result.totalFields) * 100);
};
