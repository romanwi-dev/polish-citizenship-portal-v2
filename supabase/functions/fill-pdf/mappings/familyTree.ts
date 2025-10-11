/**
 * PDF Field Mappings for Family Tree Template
 */

export const FAMILY_TREE_PDF_MAP: Record<string, string> = {
  // Applicant
  'applicant_full_name': 'applicant_first_name',
  'applicant_date_of_birth': 'applicant_dob',
  'applicant_place_of_birth': 'applicant_pob',
  'applicant_date_of_marriage': 'date_of_marriage',
  'applicant_place_of_marriage': 'place_of_marriage',
  
  // Applicant's Spouse
  'applicant_spouse_full_name': 'spouse_first_name',
  'spouse_date_of_birth': 'spouse_dob',
  'spouse_place_of_birth': 'spouse_pob',
  
  // Children/Minors (FIXED: added place of birth for minors 1-3)
  'minor_1_full_name': 'child_1_first_name',
  'minor_1_date_of_birth': 'child_1_dob',
  'minor_1_place_of_birth': 'child_1_pob',
  
  'minor_2_full_name': 'child_2_first_name',
  'minor_2_date_of_birth': 'child_2_dob',
  'minor_2_place_of_birth': 'child_2_pob',
  
  'minor_3_full_name': 'child_3_first_name',
  'minor_3_date_of_birth': 'child_3_dob',
  'minor_3_place_of_birth': 'child_3_pob',
  
  // Father (Polish Parent)
  'father_full_name': 'father_first_name',
  'father_date_of_birth': 'father_dob',
  'father_place_of_birth': 'father_pob',
  'father_date_of_marriage': 'father_mother_marriage_date',
  'father_place_of_marriage': 'father_mother_marriage_place',
  'father_date_of_emigration': 'father_date_of_emigration',
  'father_date_of_naturalization': 'father_date_of_naturalization',
  
  // Polish parent aliases
  'polish_parent_place_of_marriage': 'father_mother_marriage_place',
  'polish_parent_spouse_full_name': 'mother_first_name',
  
  // Mother
  'mother_full_name': 'mother_first_name',
  'mother_maiden_name': 'mother_maiden_name',
  'mother_date_of_birth': 'mother_dob',
  'mother_place_of_birth': 'mother_pob',
  'mother_date_of_emigration': 'mother_date_of_emigration',
  'mother_date_of_naturalization': 'mother_date_of_naturalization',
  
  // Paternal Grandfather (PGF) - Polish Grandparent
  'pgf_full_name': 'pgf_first_name',
  'pgf_date_of_birth': 'pgf_dob',
  'pgf_place_of_birth': 'pgf_pob',
  'pgf_date_of_marriage': 'pgf_pgm_marriage_date',
  'pgf_place_of_marriage': 'pgf_pgm_marriage_place',
  'pgf_date_of_emigration': 'pgf_date_of_emigration',
  'pgf_date_of_naturalization': 'pgf_date_of_naturalization',
  
  // Polish grandparent aliases
  'polish_grandparent_date_of_marriage': 'pgf_pgm_marriage_date',
  
  // Paternal Grandmother (PGM)
  'pgm_full_name': 'pgm_first_name',
  'pgm_maiden_name': 'pgm_maiden_name',
  'pgm_date_of_birth': 'pgm_dob',
  'pgm_place_of_birth': 'pgm_pob',
  'pgm_date_of_emigration': 'pgm_date_of_emigration',
  'pgm_date_of_naturalization': 'pgm_date_of_naturalization',
  
  // Maternal Grandfather (MGF)
  'mgf_full_name': 'mgf_first_name',
  'mgf_date_of_birth': 'mgf_dob',
  'mgf_place_of_birth': 'mgf_pob',
  'mgf_date_of_marriage': 'mgf_mgm_marriage_date',
  'mgf_place_of_marriage': 'mgf_mgm_marriage_place',
  'mgf_date_of_emigration': 'mgf_date_of_emigration',
  'mgf_date_of_naturalization': 'mgf_date_of_naturalization',
  
  // Maternal Grandmother (MGM)
  'mgm_full_name': 'mgm_first_name',
  'mgm_maiden_name': 'mgm_maiden_name',
  'mgm_date_of_birth': 'mgm_dob',
  'mgm_place_of_birth': 'mgm_pob',
  'mgm_date_of_emigration': 'mgm_date_of_emigration',
  'mgm_date_of_naturalization': 'mgm_date_of_naturalization',
  
  // Great Grandfathers
  'pggf_full_name': 'pggf_first_name',
  'pggf_date_of_birth': 'pggf_dob',
  'pggf_place_of_birth': 'pggf_pob',
  'pggf_date_of_marriage': 'pggf_pggm_marriage_date',
  'pggf_place_of_marriage': 'pggf_pggm_marriage_place',
  'pggf_date_of_emigration': 'pggf_date_of_emigration',
  'pggf_date_of_naturalization': 'pggf_date_of_naturalization',
  
  'mggf_full_name': 'mggf_first_name',
  'mggf_date_of_birth': 'mggf_dob',
  'mggf_place_of_birth': 'mggf_pob',
  'mggf_date_of_marriage': 'mggf_mggm_marriage_date',
  'mggf_place_of_marriage': 'mggf_mggm_marriage_place',
  'mggf_date_of_emigration': 'mggf_date_of_emigration',
  'mggf_date_of_naturalization': 'mggf_date_of_naturalization',
  
  // Great Grandmothers
  'pggm_full_name': 'pggm_first_name',
  'pggm_maiden_name': 'pggm_maiden_name',
  'pggm_date_of_birth': 'pggm_dob',
  'pggm_place_of_birth': 'pggm_pob',
  'pggm_date_of_emigration': 'pggm_date_of_emigration',
  'pggm_date_of_naturalization': 'pggm_date_of_naturalization',
  
  'mggm_full_name': 'mggm_first_name',
  'mggm_maiden_name': 'mggm_maiden_name',
  'mggm_date_of_birth': 'mggm_dob',
  'mggm_place_of_birth': 'mggm_pob',
  'mggm_date_of_emigration': 'mggm_date_of_emigration',
  'mggm_date_of_naturalization': 'mggm_date_of_naturalization',
};

export const FAMILY_TREE_REQUIRED_FIELDS = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_dob',
  'father_first_name',
  'father_last_name',
  'mother_first_name',
  'mother_last_name',
  'mother_maiden_name',
];
