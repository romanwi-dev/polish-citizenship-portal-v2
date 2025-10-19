import { useMemo } from 'react';

export interface ValidationError {
  field: string;
  message: string;
}

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates date format DD.MM.YYYY
 * DD <= 31, MM <= 12, YYYY <= 2030
 */
export function validateDateFormat(value: string): DateValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: true }; // Empty is valid (optional field)
  }

  const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const match = value.match(dateRegex);

  if (!match) {
    return {
      isValid: false,
      error: 'Use DD.MM.YYYY format (e.g., 15.03.1985). Year must be ≤ 2030',
    };
  }

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (day < 1 || day > 31) {
    return {
      isValid: false,
      error: 'Day must be 01-31 (e.g., 15.03.1985)',
    };
  }

  if (month < 1 || month > 12) {
    return {
      isValid: false,
      error: 'Month must be 01-12 (e.g., 15.03.1985)',
    };
  }

  if (year > 2030) {
    return {
      isValid: false,
      error: 'Year must be ≤ 2030 (e.g., 15.03.1985)',
    };
  }

  return { isValid: true };
}

/**
 * Hook to validate form fields
 */
export function useFieldValidation(
  formData: Record<string, any>,
  requiredFields: string[],
  dateFields: string[] = []
) {
  const validateField = (field: string, value: any): ValidationError | null => {
    // Check if required
    if (requiredFields.includes(field)) {
      if (value === null || value === undefined || value === '') {
        return { field, message: 'This field is required' };
      }
    }

    // Check if date field
    if (dateFields.includes(field) && value && typeof value === 'string') {
      const result = validateDateFormat(value);
      if (!result.isValid) {
        return { field, message: result.error || 'Invalid date format' };
      }
    }

    return null;
  };

  const errors = useMemo(() => {
    const validationErrors: ValidationError[] = [];

    // Validate required fields
    requiredFields.forEach((field) => {
      const value = formData[field];
      if (value === null || value === undefined || value === '') {
        validationErrors.push({
          field,
          message: 'This field is required',
        });
      }
    });

    // Validate date fields
    dateFields.forEach((field) => {
      const value = formData[field];
      if (value && typeof value === 'string') {
        const result = validateDateFormat(value);
        if (!result.isValid) {
          validationErrors.push({
            field,
            message: result.error || 'Invalid date format',
          });
        }
      }
    });

    return validationErrors;
  }, [formData, requiredFields, dateFields]);

  const isValid = errors.length === 0;
  const getFieldError = (field: string) => errors.find((e) => e.field === field);

  return {
    errors,
    isValid,
    getFieldError,
    validateField,
  };
}
