/**
 * PDF Field Mappings for Family Tree Template
 * Maps database columns from master_table to PDF form field names
 * 
 * ACTUAL PDF FIELDS (38 total) - Fixed to match reality
 * Removed 86 fields that don't exist in the PDF!
 */

export const FAMILY_TREE_PDF_MAP: Record<string, string> = {
  // Applicant info (ACTUAL)
  'applicant_full_name': 'applicant_first_name',
  'applicant_date_of_birth': 'applicant_dob',
  'applicant_place_of_birth': 'applicant_pob',
  'applicant_date_of_marriage': 'date_of_marriage',
  'applicant_place_of_marriage': 'place_of_marriage',
  
  // Applicant spouse details
  'applicant_spouse_full_name_and_maiden_name': 'spouse_first_name',
  
  // Polish parent info
  'polish_parent_full_name': 'father_first_name',
  'polish_parent_spouse_full_name': 'mother_first_name',
  'polish_parent_date_of_birth': 'father_dob',
  'polish_parent_place_of_birth': 'father_pob',
  'polish_parent_date_of_marriage': 'father_mother_marriage_date',
  'polish_parent_place_of_marriage': 'father_mother_marriage_place',
  'polish_parent_date_of_emigration': 'father_date_of_emigration',
  'polish_parent_date_of_naturalization': 'father_date_of_naturalization',
  
  // Polish grandparent info
  'polish_grandparent_full_name': 'pgf_first_name', 
  'polish_grandparent_spouse_full_name': 'pgm_first_name',
  'polish_grandparent_date_of_birth': 'pgf_dob',
  'polish_grandparent_place_of_birth': 'pgf_pob',
  'polish_grandparent_date_of_marriage': 'pgf_pgm_marriage_date',
  'polish_grandparent_place_of_marriage': 'pgf_pgm_marriage_place',
  'polish_grandparent_date_of_emigration': 'pgf_date_of_emigration',
  'polish_grandparent_date_of_naturalization': 'pgf_date_of_naturalization',
  
  // Great-grandparents
  'great_grandfather_full_name': 'pggf_first_name',
  'great_grandmother_full_name': 'pggm_first_name',
  'great_grandfather_date_of_birth': 'pggf_dob',
  'great_grandfather_place_of_birth': 'pggf_pob',
  'great_grandfather_date_of_marriage': 'pggf_pggm_marriage_date',
  'great_grandfather_place_of_marriage': 'pggf_pggm_marriage_place',
  'great_grandfather_date_of_emigartion': 'pggf_date_of_emigration',
  'great_grandfather_date_of_naturalization': 'pggf_date_of_naturalization',
  
  // Minor children  
  'minor_1_full_name': 'child_1_first_name',
  'minor_1_date_of_birth': 'child_1_dob',
  'minor_1_place_of_birth': 'child_1_pob',
  'minor_2_full_name': 'child_2_first_name',
  'minor_2_date_of_birth': 'child_2_dob',
  'minor_2_place_of_birth': 'child_2_pob',
  'minor_3_full_name': 'child_3_first_name',
  'minor_3_date_of_birth': 'child_3_dob',
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
