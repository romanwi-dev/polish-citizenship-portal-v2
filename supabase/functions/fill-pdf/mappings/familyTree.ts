/**
 * PDF Field Mappings for Family Tree Template
 */

export const FAMILY_TREE_PDF_MAP: Record<string, string> = {
  // Applicant
  'applicant_full_name': 'applicant_full_name',
  'applicant_date_of_birth': 'applicant_dob',
  'applicant_date_of_marriage': 'date_of_marriage',
  'applicant_place_of_birth': 'applicant_pob',
  'applicant_place_of_marriage': 'place_of_marriage',
  
  // Applicant's Spouse
  'applicant_spouse_full_name': 'spouse_full_name',
  
  // Children/Minors
  'minor_1_full_name': 'child_1_full_name',
  'minor_1_date_of_birth': 'child_1_dob',
  'minor_1_place_of_birth': 'child_1_pob',
  
  'minor_2_full_name': 'child_2_full_name',
  'minor_2_date_of_birth': 'child_2_dob',
  'minor_2_place_of_birth': 'child_2_pob',
  
  'minor_3_full_name': 'child_3_full_name',
  'minor_3_date_of_birth': 'child_3_dob',
  'minor_3_place_of_birth': 'child_3_pob',
  
  // Polish Parent (Father or Mother depending on ancestry line)
  'polish_parent_full_name': 'polish_parent_full_name',
  'polish_parent_date_of_birth': 'polish_parent_dob',
  'polish_parent_date_of_marriage': 'polish_parent_marriage_date',
  'polish_parent_date_of_emigration': 'polish_parent_emigration_date',
  'polish_parent_place_of_birth': 'polish_parent_pob',
  'polish_parent_place_of_marriage': 'polish_parent_marriage_place',
  'polish_parent_date_of_naturalization': 'polish_parent_naturalization_date',
  
  // Polish Parent's Spouse
  'polish_parent_spouse_full_name': 'polish_parent_spouse_full_name',
  
  // Polish Grandparent
  'polish_grandparent_full_name': 'polish_grandparent_full_name',
  'polish_grandparent_date_of_birth': 'polish_grandparent_dob',
  'polish_grandparent_date_of_marriage': 'polish_grandparent_marriage_date',
  'polish_grandparent_date_of_emigration': 'polish_grandparent_emigration_date',
  'polish_grandparent_place_of_birth': 'polish_grandparent_pob',
  'polish_grandparent_place_of_marriage': 'polish_grandparent_marriage_place',
  'polish_grandparent_date_of_naturalization': 'polish_grandparent_naturalization_date',
  
  // Polish Grandparent's Spouse
  'polish_grandparent_spouse_full_name': 'polish_grandparent_spouse_full_name',
  
  // Great Grandfather
  'great_grandfather_full_name': 'great_grandfather_full_name',
  'great_grandfather_date_of_birth': 'great_grandfather_dob',
  'great_grandfather_date_of_marriage': 'great_grandfather_marriage_date',
  'great_grandfather_date_of_emigration': 'great_grandfather_emigration_date',
  'great_grandfather_place_of_birth': 'great_grandfather_pob',
  'great_grandfather_place_of_marriage': 'great_grandfather_marriage_place',
  'great_grandfather_date_of_naturalization': 'great_grandfather_naturalization_date',
  
  // Great Grandmother
  'great_grandmother_full_name': 'great_grandmother_full_name',
  'great_grandmother_date_of_birth': 'great_grandmother_dob',
  'great_grandmother_date_of_marriage': 'great_grandmother_marriage_date',
  'great_grandmother_date_of_emigration': 'great_grandmother_emigration_date',
  'great_grandmother_place_of_birth': 'great_grandmother_pob',
  'great_grandmother_place_of_marriage': 'great_grandmother_marriage_place',
  'great_grandmother_date_of_naturalization': 'great_grandmother_naturalization_date',
};
