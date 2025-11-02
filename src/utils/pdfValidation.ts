/**
 * PDF Pre-Generation Validation Utilities
 */

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
  coverage: number;
  threshold: number;
  meetsThreshold: boolean;
}

/**
 * Template-specific coverage thresholds for optimal UX
 * - POA templates: 100% (simple forms with few required fields)
 * - Family Tree: 95% (comprehensive genealogy data)
 * - Citizenship: 60% (many fields are N/A in practice, only core family needed)
 * - USC forms: 90% (official registry documents)
 */
export const TEMPLATE_COVERAGE_THRESHOLDS: Record<string, number> = {
  'poa-adult': 100,        // 3 fields - must be perfect
  'poa-minor': 100,        // 6 fields - must be perfect
  'poa-spouses': 100,      // 6 fields - must be perfect
  'family-tree': 95,       // 38 fields - comprehensive genealogy
  'citizenship': 60,       // 140 fields - most are N/A, only core family needed
  'umiejscowienie': 90,    // 6 fields - official registry
  'uzupelnienie': 90,      // 6 fields - official supplementation
};

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
 * Validate data before PDF generation with template-specific thresholds
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

  // Get template-specific threshold (default to 80% if not defined)
  const threshold = TEMPLATE_COVERAGE_THRESHOLDS[templateType] || 80;
  const meetsThreshold = coverage >= threshold;

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings,
    coverage,
    threshold,
    meetsThreshold,
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
