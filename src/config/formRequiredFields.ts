/**
 * Required fields configuration for each form type
 */

export const INTAKE_FORM_REQUIRED_FIELDS = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_dob',
  'applicant_pob',
  'applicant_email',
  'applicant_phone',
  'applicant_passport_number',
  'father_first_name',
  'father_last_name',
  'mother_first_name',
  'mother_last_name',
  'mother_maiden_name',
];

export const FAMILY_TREE_FORM_REQUIRED_FIELDS = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_dob',
  'applicant_pob',
  'father_first_name',
  'father_last_name',
  'father_dob',
  'father_pob',
  'mother_first_name',
  'mother_last_name',
  'mother_maiden_name',
  'mother_dob',
  'mother_pob',
  'pgf_first_name',
  'pgf_last_name',
  'pgm_first_name',
  'pgm_last_name',
  'mgf_first_name',
  'mgf_last_name',
  'mgm_first_name',
  'mgm_last_name',
];

export const CITIZENSHIP_FORM_REQUIRED_FIELDS = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_dob',
  'applicant_pob',
  'applicant_sex',
  'applicant_current_citizenship',
  'father_first_name',
  'father_last_name',
  'father_dob',
  'father_pob',
  'mother_first_name',
  'mother_last_name',
  'mother_maiden_name',
  'mother_dob',
  'mother_pob',
  'ancestry_line',
];

export const POA_FORM_REQUIRED_FIELDS = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_dob',
  'applicant_pob',
  'applicant_passport_number',
  'applicant_email',
];

export const CIVIL_REGISTRY_FORM_REQUIRED_FIELDS = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_dob',
  'applicant_pob',
  'father_first_name',
  'father_last_name',
  'mother_first_name',
  'mother_last_name',
];

// Date fields for each form
export const INTAKE_DATE_FIELDS = [
  'applicant_dob',
  'applicant_passport_issue_date',
  'applicant_passport_expiry_date',
];

export const FAMILY_TREE_DATE_FIELDS = [
  'applicant_dob',
  'father_dob',
  'mother_dob',
  'pgf_dob',
  'pgm_dob',
  'mgf_dob',
  'mgm_dob',
  'date_of_marriage',
  'applicant_date_of_emigration',
  'father_date_of_emigration',
  'mother_date_of_emigration',
];

export const CITIZENSHIP_DATE_FIELDS = [
  'applicant_dob',
  'father_dob',
  'mother_dob',
  'applicant_passport_issue_date',
  'applicant_passport_expiry_date',
];

export const POA_DATE_FIELDS = [
  'applicant_dob',
  'spouse_dob',
  'poa_date_filed',
];

export const CIVIL_REGISTRY_DATE_FIELDS = [
  'applicant_dob',
  'date_of_marriage',
  'father_dob',
  'mother_dob',
];
