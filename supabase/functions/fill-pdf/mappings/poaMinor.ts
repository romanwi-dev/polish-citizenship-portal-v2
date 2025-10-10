/**
 * PDF Field Mappings for POA Minor Template
 */

export const POA_MINOR_PDF_MAP: Record<string, string> = {
  // Parent/Guardian Information
  'parentFirstName': 'applicant_first_name',
  'parentLastName': 'applicant_last_name',
  'parentEmail': 'applicant_email',
  'parentPhone': 'applicant_phone',
  'parentPassport': 'applicant_passport_number',
  
  // Child Information
  'childFirstName': 'child_1_first_name',
  'childLastName': 'child_1_last_name',
  'childDOB': 'child_1_dob',
  'childPOB': 'child_1_pob',
  'childSex': 'child_1_sex',
  
  // Additional Children
  'child2FirstName': 'child_2_first_name',
  'child2LastName': 'child_2_last_name',
  'child2DOB': 'child_2_dob',
  
  'child3FirstName': 'child_3_first_name',
  'child3LastName': 'child_3_last_name',
  'child3DOB': 'child_3_dob',
};
