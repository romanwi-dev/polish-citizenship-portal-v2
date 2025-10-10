/**
 * PDF Field Mappings for POA Spouses Template
 */

export const POA_SPOUSES_PDF_MAP: Record<string, string> = {
  // Applicant/Spouse 1
  'spouse1FirstName': 'applicant_first_name',
  'spouse1LastName': 'applicant_last_name',
  'spouse1DOB': 'applicant_dob',
  'spouse1POB': 'applicant_pob',
  'spouse1Passport': 'applicant_passport_number',
  'spouse1Email': 'applicant_email',
  'spouse1Phone': 'applicant_phone',
  
  // Spouse 2
  'spouse2FirstName': 'spouse_first_name',
  'spouse2LastName': 'spouse_last_name',
  'spouse2DOB': 'spouse_dob',
  'spouse2POB': 'spouse_pob',
  'spouse2Email': 'spouse_email',
  'spouse2Phone': 'spouse_phone',
  
  // Marriage Information
  'dateOfMarriage': 'date_of_marriage',
  'placeOfMarriage': 'place_of_marriage',
};
