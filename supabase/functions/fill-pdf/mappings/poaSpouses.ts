/**
 * PDF Field Mappings for POA Spouses Template
 * Maps database columns from master_table to PDF form field names
 * 
 * ACTUAL PDF FIELDS (9 total only!)
 */

export const POA_SPOUSES_PDF_MAP: Record<string, string> = {
  // Spouse 1 (Applicant) - 2 name fields
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  
  // Spouse 2 - 2 name fields
  'spouse_given_names': 'spouse_first_name',
  'spouse_surname': 'spouse_last_name',
  
  // ID documents - 2 fields
  'passport_number': 'applicant_passport_number',
  'spouse_passport_number': 'spouse_passport_number',
  
  // Post-marriage surnames - 3 fields
  'husband_surname': 'applicant_last_name',
  'wife_surname': 'spouse_last_name',
  'minor_surname': 'child_1_last_name',
};

export const POA_SPOUSES_REQUIRED_FIELDS = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_passport_number',
  'spouse_first_name',
  'spouse_last_name',
  'spouse_passport_number',
];
