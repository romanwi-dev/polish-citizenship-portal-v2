/**
 * PDF Field Mappings for Uzupełnienie (Civil Registry Act Supplement) Template
 * Maps database columns from master_table to PDF form field names
 * 
 * SIMPLIFIED 1:1 MAPPINGS after PDF field renaming
 * PDF fields have been renamed from Polish to English
 */

export const UZUPELNIENIE_PDF_MAP: Record<string, string> = {
  // Applicant info
  'applicant_full_name': 'applicant_full_name',
  'applicant_country': 'applicant_country',
  
  // Representative info
  'representative_full_name': 'representative_full_name',
  'representative_address_line1': 'representative_address_line1',
  'representative_address_line2': 'representative_address_line2',
  'representative_phone': 'representative_phone',
  'representative_email': 'representative_email',
  
  // Submission location and date
  'submission_location': 'submission_location',
  'submission_day': 'submission_date.day',
  'submission_month': 'submission_date.month',
  'submission_year': 'submission_date.year',
  
  // Birth act supplement
  'birth_act_number': 'birth_act_number',
  'birth_act_year': 'birth_act_year',
  'father_last_name': 'father_last_name',
  'mother_maiden_name': 'mother_maiden_name',
  'foreign_act_location': 'foreign_act_location',
  'polish_birth_act_number': 'polish_birth_act_number',
};

export const UZUPELNIENIE_REQUIRED_FIELDS = [
  'applicant_full_name',
  'applicant_country',
  'representative_full_name',
  'representative_address',
  'submission_location',
  'submission_date',
];
