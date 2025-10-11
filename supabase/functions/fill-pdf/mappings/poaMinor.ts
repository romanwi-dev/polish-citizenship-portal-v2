/**
 * PDF Field Mappings for POA Minor Template
 * Maps database columns from master_table to PDF form field names
 * 
 * ACTUAL PDF FIELDS (6 total only!)
 */

export const POA_MINOR_PDF_MAP: Record<string, string> = {
  // Parent/Guardian - 3 fields
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'passport_number': 'applicant_passport_number',
  
  // Minor - 3 fields
  'minor_given_names': 'child_1_first_name',
  'minor_surname': 'child_1_last_name',
  'minor_date_of_birth': 'child_1_dob',
};

export const POA_MINOR_REQUIRED_FIELDS = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_passport_number',
  'child_1_first_name',
  'child_1_last_name',
  'child_1_dob',
];
