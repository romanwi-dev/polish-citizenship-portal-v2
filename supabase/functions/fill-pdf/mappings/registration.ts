/**
 * PDF Field Mappings for Civil Registration Template
 */

export const REGISTRATION_PDF_MAP: Record<string, string> = {
  // Applicant Information
  'applicantFirstName': 'applicant_first_name',
  'applicantLastName': 'applicant_last_name',
  'applicantMaidenName': 'applicant_maiden_name',
  'applicantDOB': 'applicant_dob',
  'applicantPOB': 'applicant_pob',
  'applicantSex': 'applicant_sex',
  
  // Parents
  'fatherFirstName': 'father_first_name',
  'fatherLastName': 'father_last_name',
  'fatherDOB': 'father_dob',
  'fatherPOB': 'father_pob',
  
  'motherFirstName': 'mother_first_name',
  'motherLastName': 'mother_last_name',
  'motherMaidenName': 'mother_maiden_name',
  'motherDOB': 'mother_dob',
  'motherPOB': 'mother_pob',
  
  // Marriage Information (if applicable)
  'dateOfMarriage': 'date_of_marriage',
  'placeOfMarriage': 'place_of_marriage',
  
  // Spouse (if applicable)
  'spouseFirstName': 'spouse_first_name',
  'spouseLastName': 'spouse_last_name',
  'spouseDOB': 'spouse_dob',
  'spousePOB': 'spouse_pob',
};
