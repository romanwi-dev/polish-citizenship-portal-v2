/**
 * PDF Field Mappings for POA Adult Template
 * Maps database columns from master_table to PDF form field names
 */

export const POA_ADULT_PDF_MAP: Record<string, string> = {
  // Applicant Information - mapped to your actual PDF field names
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'passport_number': 'applicant_passport_number',
  'poa_date': 'poa_date_filed',
};

export const POA_ADULT_REQUIRED_FIELDS = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_dob',
  'applicant_pob',
  'applicant_sex',
  'applicant_passport_number',
  'applicant_email',
];
