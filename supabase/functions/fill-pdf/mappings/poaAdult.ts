/**
 * PDF Field Mappings for POA Adult Template
 * Maps database columns from master_table to PDF form field names
 * 
 * ACTUAL PDF FIELDS (4 total):
 * - applicant_given_names
 * - applicant_surname  
 * - passport_number
 * - poa_date
 */

export const POA_ADULT_PDF_MAP: Record<string, string> = {
  // Applicant basic info (THESE ARE THE ONLY 4 FIELDS IN THE PDF!)
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'passport_number': 'applicant_passport_number',
  'poa_date': 'poa_date_filed',
};

export const POA_ADULT_REQUIRED_FIELDS = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_passport_number',
];
