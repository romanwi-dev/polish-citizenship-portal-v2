/**
 * Universal PDF field filler utility
 * Fills PDF form fields based on a mapping configuration
 */

import { formatFieldValue, getNestedValue } from './fieldFormatter.ts';

export interface FillResult {
  totalFields: number;
  filledFields: number;
  emptyFields: string[];
  errors: Array<{ field: string; error: string }>;
}

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
      // Handle special combined name fields (e.g., 'applicantName' = first + last)
      let rawValue;
      if (pdfFieldName.toLowerCase().includes('name') && 
          !pdfFieldName.toLowerCase().includes('first') && 
          !pdfFieldName.toLowerCase().includes('last') &&
          !pdfFieldName.toLowerCase().includes('maiden')) {
        // This is a combined name field - construct from first and last
        const prefix = dbColumn.replace('_first_name', '');
        const firstName = data[`${prefix}_first_name`] || data[dbColumn] || '';
        const lastName = data[`${prefix}_last_name`] || '';
        rawValue = `${firstName} ${lastName}`.trim();
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

      // Try to get the field from the form
      try {
        const field = form.getTextField(pdfFieldName);
        if (field) {
          field.setText(formattedValue);
          result.filledFields++;
        } else {
          // Try as checkbox
          try {
            const checkboxField = form.getCheckBox(pdfFieldName);
            if (checkboxField) {
              if (rawValue === true || rawValue === 'true' || rawValue === 'Yes') {
                checkboxField.check();
              }
              result.filledFields++;
            } else {
              result.errors.push({
                field: pdfFieldName,
                error: 'Field not found in PDF',
              });
            }
          } catch (e) {
            result.errors.push({
              field: pdfFieldName,
              error: 'Field not found in PDF',
            });
          }
        }
      } catch (error) {
        result.errors.push({
          field: pdfFieldName,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
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
