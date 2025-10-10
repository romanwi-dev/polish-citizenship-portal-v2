/**
 * PDF Field Mappings for Citizenship (OBY) Template
 * Maps database columns from master_table to PDF form field names
 * This form has 156+ fields
 */

export const CITIZENSHIP_PDF_MAP: Record<string, string> = {
  // Applicant Section (Section 1)
  'firstNameApplicant': 'applicant_first_name',
  'lastNameApplicant': 'applicant_last_name',
  'maidenNameApplicant': 'applicant_maiden_name',
  'sexApplicant': 'applicant_sex',
  'dobApplicant': 'applicant_dob',
  'pobApplicant': 'applicant_pob',
  'currentCitizenshipApplicant': 'applicant_current_citizenship',
  'passportNumberApplicant': 'applicant_passport_number',
  'passportIssuingCountryApplicant': 'applicant_passport_issuing_country',
  'passportIssueDateApplicant': 'applicant_passport_issue_date',
  'passportExpiryDateApplicant': 'applicant_passport_expiry_date',
  'emailApplicant': 'applicant_email',
  'phoneApplicant': 'applicant_phone',
  
  // Address
  'streetApplicant': 'applicant_address.street',
  'cityApplicant': 'applicant_address.city',
  'stateApplicant': 'applicant_address.state',
  'zipApplicant': 'applicant_address.zip',
  'countryApplicant': 'applicant_address.country',
  
  // Spouse Section (if married)
  'firstNameSpouse': 'spouse_first_name',
  'lastNameSpouse': 'spouse_last_name',
  'maidenNameSpouse': 'spouse_maiden_name',
  'sexSpouse': 'spouse_sex',
  'dobSpouse': 'spouse_dob',
  'pobSpouse': 'spouse_pob',
  'dateOfMarriage': 'date_of_marriage',
  'placeOfMarriage': 'place_of_marriage',
  
  // Father Section
  'firstNameFather': 'father_first_name',
  'lastNameFather': 'father_last_name',
  'dobFather': 'father_dob',
  'pobFather': 'father_pob',
  'dateOfEmigrationFather': 'father_date_of_emigration',
  'dateOfNaturalizationFather': 'father_date_of_naturalization',
  
  // Mother Section
  'firstNameMother': 'mother_first_name',
  'lastNameMother': 'mother_last_name',
  'maidenNameMother': 'mother_maiden_name',
  'dobMother': 'mother_dob',
  'pobMother': 'mother_pob',
  'dateOfEmigrationMother': 'mother_date_of_emigration',
  'dateOfNaturalizationMother': 'mother_date_of_naturalization',
  'parentsMarriageDate': 'father_mother_marriage_date',
  'parentsMarriagePlace': 'father_mother_marriage_place',
  
  // Paternal Grandfather
  'firstNamePGF': 'pgf_first_name',
  'lastNamePGF': 'pgf_last_name',
  'dobPGF': 'pgf_dob',
  'pobPGF': 'pgf_pob',
  'dateOfEmigrationPGF': 'pgf_date_of_emigration',
  'dateOfNaturalizationPGF': 'pgf_date_of_naturalization',
  
  // Paternal Grandmother
  'firstNamePGM': 'pgm_first_name',
  'lastNamePGM': 'pgm_last_name',
  'maidenNamePGM': 'pgm_maiden_name',
  'dobPGM': 'pgm_dob',
  'pobPGM': 'pgm_pob',
  'dateOfEmigrationPGM': 'pgm_date_of_emigration',
  'dateOfNaturalizationPGM': 'pgm_date_of_naturalization',
  'pgParentsMarriageDate': 'pgf_pgm_marriage_date',
  'pgParentsMarriagePlace': 'pgf_pgm_marriage_place',
  
  // Maternal Grandfather
  'firstNameMGF': 'mgf_first_name',
  'lastNameMGF': 'mgf_last_name',
  'dobMGF': 'mgf_dob',
  'pobMGF': 'mgf_pob',
  'dateOfEmigrationMGF': 'mgf_date_of_emigration',
  'dateOfNaturalizationMGF': 'mgf_date_of_naturalization',
  
  // Maternal Grandmother
  'firstNameMGM': 'mgm_first_name',
  'lastNameMGM': 'mgm_last_name',
  'maidenNameMGM': 'mgm_maiden_name',
  'dobMGM': 'mgm_dob',
  'pobMGM': 'mgm_pob',
  'dateOfEmigrationMGM': 'mgm_date_of_emigration',
  'dateOfNaturalizationMGM': 'mgm_date_of_naturalization',
  'mgParentsMarriageDate': 'mgf_mgm_marriage_date',
  'mgParentsMarriagePlace': 'mgf_mgm_marriage_place',
  
  // Children (up to 10)
  'child1FirstName': 'child_1_first_name',
  'child1LastName': 'child_1_last_name',
  'child1Sex': 'child_1_sex',
  'child1DOB': 'child_1_dob',
  'child1POB': 'child_1_pob',
  
  'child2FirstName': 'child_2_first_name',
  'child2LastName': 'child_2_last_name',
  'child2Sex': 'child_2_sex',
  'child2DOB': 'child_2_dob',
  'child2POB': 'child_2_pob',
  
  'child3FirstName': 'child_3_first_name',
  'child3LastName': 'child_3_last_name',
  'child3Sex': 'child_3_sex',
  'child3DOB': 'child_3_dob',
  'child3POB': 'child_3_pob',
  
  'child4FirstName': 'child_4_first_name',
  'child4LastName': 'child_4_last_name',
  'child4Sex': 'child_4_sex',
  'child4DOB': 'child_4_dob',
  'child4POB': 'child_4_pob',
  
  'child5FirstName': 'child_5_first_name',
  'child5LastName': 'child_5_last_name',
  'child5Sex': 'child_5_sex',
  'child5DOB': 'child_5_dob',
  'child5POB': 'child_5_pob',
  
  'ancestryLine': 'ancestry_line',
};

export const CITIZENSHIP_REQUIRED_FIELDS = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_dob',
  'applicant_pob',
  'applicant_sex',
  'father_first_name',
  'father_last_name',
  'mother_first_name',
  'mother_last_name',
  'mother_maiden_name',
  'ancestry_line',
];
