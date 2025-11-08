/**
 * PDF Field Mappings for Family Tree Template
 * Maps database columns from master_table to PDF form field names
 * 
 * ACTUAL PDF FIELDS (38 total) - Updated based on real PDF inspection
 */

export const FAMILY_TREE_PDF_MAP: Record<string, string> = {
  // Applicant info
  'applicant_full_name': 'applicant_first_name|applicant_last_name',
  'applicant_date_of_birth': 'applicant_dob',
  'applicant_place_of_birth': 'applicant_pob',
  'applicant_date_of_marriage': 'date_of_marriage',
  'applicant_place_of_marriage': 'place_of_marriage',
  
  // Applicant spouse details
  'applicant_spouse_full_name_and_maiden_name': 'spouse_first_name|spouse_last_name',
  
  // Polish parent info (father or mother, depending on who is Polish)
  'polish_parent_full_name': 'father_first_name|father_last_name',
  'polish_parent_spouse_full_name': 'mother_first_name|mother_maiden_name',
  'polish_parent_date_of_birth': 'father_dob',
  'polish_parent_place_of_birth': 'father_pob',
  'polish_parent_date_of_marriage': 'father_mother_marriage_date',
  'polish_parent_place_of_marriage': 'father_mother_marriage_place',
  'polish_parent_date_of_emigration': 'father_date_of_emigration',
  'polish_parent_date_of_naturalization': 'father_date_of_naturalization',
  
  // Polish grandparent info (PGF or MGF, depending on bloodline)
  'polish_grandparent_full_name': 'pgf_first_name|pgf_last_name', 
  'polish_grandparent_spouse_full_name': 'pgm_first_name|pgm_maiden_name',
  'polish_grandparent_date_of_birth': 'pgf_dob',
  'polish_grandparent_place_of_birth': 'pgf_pob',
  'polish_grandparent_date_of_mariage': 'pgf_pgm_marriage_date', // Note: typo in PDF
  'polish_grandparent_place_of_mariage': 'pgf_pgm_marriage_place', // Note: typo in PDF
  'polish_grandparent_date_of_emigration': 'pgf_date_of_emigration',
  'polish_grandparent_date_of_naturalization': 'pgf_date_of_naturalization',
  
  // Great-grandparents (PGGF & PGGM)
  'great_grandfather_full_name': 'pggf_first_name|pggf_last_name',
  'great_grandmother_full_name': 'pggm_first_name|pggm_maiden_name',
  'great_grandfather_date_of_birth': 'pggf_dob',
  'great_grandfather_place_of_birth': 'pggf_pob',
  'great_grandfather_date_of_marriage': 'pggf_pggm_marriage_date',
  'great_grandfather_place_of_marriage': 'pggf_pggm_marriage_place',
  'great_grandfather_date_of_emigartion': 'pggf_date_of_emigration', // Note: typo in PDF
  'great_grandfather_date_of_naturalization': 'pggf_date_of_naturalization',
  
  // Minor children (1-3)
  'minor_1_full_name': 'child_1_first_name|child_1_last_name',
  'minor_1_date_of_birth': 'child_1_dob',
  'minor_1_place_of_birth': 'child_1_pob',
  'minor_2_full_name': 'child_2_first_name|child_2_last_name',
  'minor_2_date_of_birth': 'child_2_dob',
  'minor_2_place_of_birth': 'child_2_pob',
  'minor_3_full_name': 'child_3_first_name|child_3_last_name',
  'minor_3_date_of_birth': 'child_3_dob',
  'minor_3_place_of_birth': 'child_3_pob',
};

export const FAMILY_TREE_REQUIRED_FIELDS = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_dob',
  'father_first_name',
  'father_last_name',
  'mother_first_name',
  'mother_maiden_name',
];
