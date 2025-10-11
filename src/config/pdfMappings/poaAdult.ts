/**
 * PDF Field Mappings for POA Adult Template
 * Maps database columns from master_table to PDF form field names
 */

export const POA_ADULT_PDF_MAP: Record<string, string> = {
  // Applicant Information
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'applicant_sex': 'applicant_sex',
  'applicant_date_of_birth': 'applicant_dob',
  'applicant_place_of_birth': 'applicant_pob',
  'passport_number': 'applicant_passport_number',
  'passport_issue_date': 'applicant_passport_issue_date',
  'passport_expiry_date': 'applicant_passport_expiry_date',
  'passport_issuing_country': 'applicant_passport_issuing_country',
  'applicant_email': 'applicant_email',
  'applicant_phone': 'applicant_phone',
  
  // Address
  'applicant_street': 'applicant_address.street',
  'applicant_city': 'applicant_address.city',
  'applicant_postal_code': 'applicant_address.postal_code',
  'applicant_country': 'applicant_address.country',
  
  // Parents
  'father_given_names': 'father_first_name',
  'father_surname': 'father_last_name',
  'father_date_of_birth': 'father_dob',
  'father_place_of_birth': 'father_pob',
  
  'mother_given_names': 'mother_first_name',
  'mother_surname': 'mother_last_name',
  'mother_maiden_name': 'mother_maiden_name',
  'mother_date_of_birth': 'mother_dob',
  'mother_place_of_birth': 'mother_pob',
  
  // POA specific
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
  'father_first_name',
  'father_last_name',
  'mother_first_name',
  'mother_last_name',
  'mother_maiden_name',
];
