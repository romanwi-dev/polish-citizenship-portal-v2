/**
 * PDF Field Mappings for POA Adult Template
 * Maps database columns from master_table to PDF form field names
 */

export const POA_ADULT_PDF_MAP: Record<string, string> = {
  // Applicant Information
  'applicantFirstName': 'applicant_first_name',
  'applicantLastName': 'applicant_last_name',
  'applicantMaidenName': 'applicant_maiden_name',
  'applicantDOB': 'applicant_dob',
  'applicantPOB': 'applicant_pob',
  'applicantSex': 'applicant_sex',
  'applicantCurrentCitizenship': 'applicant_current_citizenship',
  'applicantPassportNumber': 'applicant_passport_number',
  'applicantPassportIssuing': 'applicant_passport_issuing_country',
  'applicantEmail': 'applicant_email',
  'applicantPhone': 'applicant_phone',
  
  // Address fields (JSONB)
  'applicantStreet': 'applicant_address.street',
  'applicantCity': 'applicant_address.city',
  'applicantState': 'applicant_address.state',
  'applicantZip': 'applicant_address.zip',
  'applicantCountry': 'applicant_address.country',
  
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
  
  // Date fields
  'poaDate': 'poa_date_filed',
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
