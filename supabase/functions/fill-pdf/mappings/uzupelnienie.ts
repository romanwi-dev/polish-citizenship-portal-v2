/**
 * PDF Field Mappings for Uzupełnienie (Supplementary) Template
 */

export const UZUPELNIENIE_PDF_MAP: Record<string, string> = {
  // Applicant Basic Info
  'applicantName': 'applicant_first_name',
  'applicantFirstName': 'applicant_first_name',
  'applicantLastName': 'applicant_last_name',
  'dateOfBirth': 'applicant_dob',
  'placeOfBirth': 'applicant_pob',
  
  // Contact Information
  'email': 'applicant_email',
  'phone': 'applicant_phone',
  
  // Reference Number
  'caseReference': 'case_id',
  
  // Additional Info
  'passportNumber': 'applicant_passport_number',
};
