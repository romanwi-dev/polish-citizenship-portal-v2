/**
 * PDF Field Mappings for Umiejscowienie (Civil Registry Entry) Template
 * Maps database columns from master_table to PDF form field names
 * 
 * SIMPLIFIED 1:1 MAPPINGS after PDF field renaming
 * PDF fields have been renamed from Polish to English
 */

export const UMIEJSCOWIENIE_PDF_MAP: Record<string, string> = {
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
  'sending_method': 'sending_method',
  
  // Act type checkboxes
  'birth_act_checkbox': 'birth_act_checkbox',
  'marriage_act_checkbox': 'marriage_act_checkbox',
  
  // Birth act fields
  'birth_act_location': 'birth_act_location',
  'birth_person_full_name': 'birth_person_full_name',
  'birth_place': 'birth_place',
  'birth_day': 'birth_date.day',
  'birth_month': 'birth_date.month',
  'birth_year': 'birth_date.year',
  'birth_year_alt': 'birth_year',
  'birth_month_alt': 'birth_month',
  'birth_day_alt': 'birth_day',
  
  // Marriage act fields
  'marriage_act_location': 'marriage_act_location',
  'spouse_full_name': 'spouse_full_name',
  'marriage_place': 'marriage_place',
  'marriage_day': 'marriage_date.day',
  'marriage_month': 'marriage_date.month',
  'marriage_year': 'marriage_date.year',
  'marriage_day_alt': 'marriage_day',
  'marriage_month_alt': 'marriage_month',
  'marriage_year_alt': 'marriage_year',
};

export const UMIEJSCOWIENIE_REQUIRED_FIELDS = [
  'applicant_full_name',
  'applicant_country',
  'representative_full_name',
  'representative_address',
  'submission_location',
  'submission_date',
];
