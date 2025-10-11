/**
 * PDF Field Mappings for POA Minor Template
 * Maps database columns from master_table to PDF form field names
 */

export const POA_MINOR_PDF_MAP: Record<string, string> = {
  // Parent/Guardian Information
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'passport_number': 'applicant_passport_number',
  
  // Minor Information
  'minor_given_names': 'child_1_first_name',
  'minor_surname': 'child_1_last_name',
  
  // POA Date
  'poa_date': 'poa_date_filed',
};

export const POA_MINOR_REQUIRED_FIELDS = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_passport_number',
  'child_1_first_name',
  'child_1_last_name',
];
