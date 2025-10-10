/**
 * PDF Field Mappings for POA Adult Template
 * Maps database columns from master_table to PDF form field names
 */

export const POA_ADULT_PDF_MAP: Record<string, string> = {
  // Applicant Information
  'firstName': 'applicant_first_name',
  'lastName': 'applicant_last_name',
  'maidenName': 'applicant_maiden_name',
  'dateOfBirth': 'applicant_dob',
  'placeOfBirth': 'applicant_pob',
  'sex': 'applicant_sex',
  'passportNumber': 'applicant_passport_number',
  'email': 'applicant_email',
  'phone': 'applicant_phone',
  
  // Father Information
  'fatherFirstName': 'father_first_name',
  'fatherLastName': 'father_last_name',
  'fatherDOB': 'father_dob',
  'fatherPOB': 'father_pob',
  
  // Mother Information
  'motherFirstName': 'mother_first_name',
  'motherLastName': 'mother_last_name',
  'motherMaidenName': 'mother_maiden_name',
  'motherDOB': 'mother_dob',
  'motherPOB': 'mother_pob',
};
