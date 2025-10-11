/**
 * PDF Pre-Generation Validation Utilities
 */

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
  coverage: number;
}

// POA Adult - Only 4 fields in actual PDF
export const POA_ADULT_REQUIRED = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_passport_number',
];

// Citizenship - Core fields (most fields can be N/A in practice)
export const CITIZENSHIP_REQUIRED = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_dob',
  'applicant_pob',
  'applicant_sex',
  'father_first_name',
  'father_last_name',
  'mother_first_name',
  'mother_last_name',
  'mother_maiden_name',
];

export const TEMPLATE_REQUIRED_FIELDS: Record<string, string[]> = {
  'poa-adult': POA_ADULT_REQUIRED,
  'poa-minor': [
    'applicant_first_name',
    'applicant_last_name',
    'applicant_passport_number',
    'child_1_first_name',
    'child_1_last_name',
    'child_1_dob'
  ],
  'poa-spouses': [
    'applicant_first_name',
    'applicant_last_name',
    'applicant_passport_number',
    'spouse_first_name',
    'spouse_last_name',
    'spouse_passport_number'
  ],
  'citizenship': CITIZENSHIP_REQUIRED,
  'family-tree': [
    'applicant_first_name',
    'applicant_last_name',
    'applicant_dob',
    'father_first_name',
    'father_last_name',
    'mother_first_name',
    'mother_last_name',
    'mother_maiden_name'
  ],
  'umiejscowienie': [
    'applicant_first_name',
    'applicant_last_name',
    'representative_full_name',
    'representative_address',
    'submission_location',
    'submission_date'
  ],
  'uzupelnienie': [
    'applicant_first_name',
    'applicant_last_name',
    'representative_full_name',
    'representative_address',
    'submission_location',
    'submission_date'
  ],
};

/**
 * Validate data before PDF generation
 */
export const validatePDFGeneration = (
  data: Record<string, any>,
  templateType: string
): ValidationResult => {
  const requiredFields = TEMPLATE_REQUIRED_FIELDS[templateType] || [];
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  for (const field of requiredFields) {
    const value = data[field];
    if (value === null || value === undefined || value === '') {
      missingFields.push(field);
    }
  }

  // Add warnings for common issues
  if (data.applicant_email && !data.applicant_email.includes('@')) {
    warnings.push('Email address may be invalid');
  }

  if (data.applicant_dob) {
    const dob = new Date(data.applicant_dob);
    if (dob > new Date()) {
      warnings.push('Date of birth is in the future');
    }
  }

  // Calculate coverage
  const filledCount = requiredFields.length - missingFields.length;
  const coverage = requiredFields.length > 0
    ? Math.round((filledCount / requiredFields.length) * 100)
    : 100;

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings,
    coverage,
  };
};

/**
 * Format field name for display
 */
export const formatFieldName = (fieldName: string): string => {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .replace(/Applicant/g, '')
    .replace(/Dob/g, 'Date of Birth')
    .replace(/Pob/g, 'Place of Birth')
    .trim();
};
