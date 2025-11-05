/**
 * PDF Field Mappings for Family Tree Template
 * Maps database columns from master_table to PDF form field names
 */

export const FAMILY_TREE_PDF_MAP: Record<string, string> = {
  // Applicant
  'applicant_full_name': 'applicant_first_name|applicant_last_name',
  'applicant_dob': 'applicant_dob',
  'applicant_pob': 'applicant_pob',
  
  // Spouse
  'spouse_full_name': 'spouse_first_name|spouse_last_name',
  'spouse_dob': 'spouse_dob',
  'spouse_pob': 'spouse_pob',
  
  // Parents
  'father_full_name': 'father_first_name|father_last_name',
  'father_dob': 'father_dob',
  'father_pob': 'father_pob',
  'mother_full_name': 'mother_first_name|mother_maiden_name',
  'mother_dob': 'mother_dob',
  'mother_pob': 'mother_pob',
  
  // Paternal Grandparents
  'pgf_full_name': 'pgf_first_name|pgf_last_name',
  'pgf_dob': 'pgf_dob',
  'pgf_pob': 'pgf_pob',
  'pgm_full_name': 'pgm_first_name|pgm_maiden_name',
  'pgm_dob': 'pgm_dob',
  'pgm_pob': 'pgm_pob',
  
  // Maternal Grandparents
  'mgf_full_name': 'mgf_first_name|mgf_last_name',
  'mgf_dob': 'mgf_dob',
  'mgf_pob': 'mgf_pob',
  'mgm_full_name': 'mgm_first_name|mgm_maiden_name',
  'mgm_dob': 'mgm_dob',
  'mgm_pob': 'mgm_pob',
  
  // Paternal Great-Grandparents
  'pggf_full_name': 'pggf_first_name|pggf_last_name',
  'pggm_full_name': 'pggm_first_name|pggm_maiden_name',
  
  // Maternal Great-Grandparents
  'mggf_full_name': 'mggf_first_name|mggf_last_name',
  'mggm_full_name': 'mggm_first_name|mggm_maiden_name',
  
  // Minor children
  'child_1_full_name': 'child_1_first_name|child_1_last_name',
  'child_1_dob': 'child_1_dob',
  'child_2_full_name': 'child_2_first_name|child_2_last_name',
  'child_2_dob': 'child_2_dob',
  'child_3_full_name': 'child_3_first_name|child_3_last_name',
  'child_3_dob': 'child_3_dob',
};

export const FAMILY_TREE_REQUIRED_FIELDS = [
  'applicant_full_name',
  'applicant_dob',
  'father_full_name',
  'mother_full_name',
  'pgf_full_name',
  'pgm_full_name',
  'mgf_full_name',
  'mgm_full_name',
];
