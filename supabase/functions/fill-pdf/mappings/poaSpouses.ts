/**
 * PDF Field Mappings for POA Spouses Template
 */

export const POA_SPOUSES_PDF_MAP: Record<string, string> = {
  // Applicant (Spouse 1)
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'passport_number': 'applicant_passport_number',
  
  // Spouse 2
  'spouse_given_names': 'spouse_first_name',
  'spouse_surname': 'spouse_last_name',
  'spouse_passport_number': 'spouse_passport_number',
  
  // Post-marriage surnames
  'husband_surname': 'applicant_last_name', // Husband's surname after marriage
  'wife_surname': 'spouse_last_name', // Wife's surname after marriage
  
  // Children from marriage
  'minor_surname': 'child_1_last_name',
};
