/**
 * PDF Field Mappings for Family Tree Template
 */

export const FAMILY_TREE_PDF_MAP: Record<string, string> = {
  // Applicant
  'applicantName': 'applicant_first_name', // Will be combined with last_name in formatter
  'applicantFirstName': 'applicant_first_name',
  'applicantLastName': 'applicant_last_name',
  'applicantDOB': 'applicant_dob',
  'applicantPOB': 'applicant_pob',
  
  // Father
  'fatherName': 'father_first_name',
  'fatherFirstName': 'father_first_name',
  'fatherLastName': 'father_last_name',
  'fatherDOB': 'father_dob',
  'fatherPOB': 'father_pob',
  
  // Mother
  'motherName': 'mother_first_name',
  'motherFirstName': 'mother_first_name',
  'motherLastName': 'mother_last_name',
  'motherMaidenName': 'mother_maiden_name',
  'motherDOB': 'mother_dob',
  'motherPOB': 'mother_pob',
  
  // Paternal Grandfather
  'pgfName': 'pgf_first_name',
  'pgfFirstName': 'pgf_first_name',
  'pgfLastName': 'pgf_last_name',
  'pgfDOB': 'pgf_dob',
  'pgfPOB': 'pgf_pob',
  
  // Paternal Grandmother
  'pgmName': 'pgm_first_name',
  'pgmFirstName': 'pgm_first_name',
  'pgmLastName': 'pgm_last_name',
  'pgmMaidenName': 'pgm_maiden_name',
  'pgmDOB': 'pgm_dob',
  'pgmPOB': 'pgm_pob',
  
  // Maternal Grandfather
  'mgfName': 'mgf_first_name',
  'mgfFirstName': 'mgf_first_name',
  'mgfLastName': 'mgf_last_name',
  'mgfDOB': 'mgf_dob',
  'mgfPOB': 'mgf_pob',
  
  // Maternal Grandmother
  'mgmName': 'mgm_first_name',
  'mgmFirstName': 'mgm_first_name',
  'mgmLastName': 'mgm_last_name',
  'mgmMaidenName': 'mgm_maiden_name',
  'mgmDOB': 'mgm_dob',
  'mgmPOB': 'mgm_pob',
  
  // Great-Grandparents (Paternal)
  'pggfName': 'pggf_first_name',
  'pggfFirstName': 'pggf_first_name',
  'pggfLastName': 'pggf_last_name',
  
  'pggmName': 'pggm_first_name',
  'pggmFirstName': 'pggm_first_name',
  'pggmLastName': 'pggm_last_name',
  'pggmMaidenName': 'pggm_maiden_name',
  
  // Great-Grandparents (Maternal)
  'mggfName': 'mggf_first_name',
  'mggfFirstName': 'mggf_first_name',
  'mggfLastName': 'mggf_last_name',
  
  'mggmName': 'mggm_first_name',
  'mggmFirstName': 'mggm_first_name',
  'mggmLastName': 'mggm_last_name',
  'mggmMaidenName': 'mggm_maiden_name',
};
