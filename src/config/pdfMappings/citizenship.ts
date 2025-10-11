/**
 * PDF Field Mappings for Citizenship (OBY) Template
 * Maps database columns from master_table to PDF form field names
 * 12-page Polish citizenship application form
 * 
 * CLEANED UP - Removed 35 mapping fields that don't exist in PDF
 * Added 41 unmapped PDF fields
 */

export const CITIZENSHIP_PDF_MAP: Record<string, string> = {
  // Page 1 - Header & Location Info (ACTUAL PDF FIELDS)
  'wojewoda': 'voivodeship', // Voivodeship field
  'nr_mieszkania': 'applicant_address.apartment_number',
  'decyzja': 'decision_type',
  'posiadanie1': 'citizenship_possession_info',
  'cel_ubieganie': 'application_purpose',
  
  // Address fields (ACTUAL)
  'dzien_uro_matki': 'mother_dob.day',
  'miesiac_uro_matki': 'mother_dob.month',
  'rok_uro_matki': 'mother_dob.year',
  'dzien_zaw_zwiazku_matki': 'mother_marriage_date.day',
  'miesiac_zaw_zwiazku_matki': 'mother_marriage_date.month',
  'rok_zaw_zwiazku_matki': 'mother_marriage_date.year',
  
  // Father fields (ACTUAL)
  'dzien_uro_ojca': 'father_dob.day',
  'miesiac_uro_ojca': 'father_dob.month',
  'rok_uro_ojca': 'father_dob.year',
  'dzien_zaw_zwiazku_ojca': 'father_marriage_date.day',
  'miesiac_zaw_zwiazku_ojca': 'father_marriage_date.month',
  'rok_zaw_zwiazku_ojca': 'father_marriage_date.year',
  
  // Grandparents - Maternal Grandfather (MGF)
  'dzien_uro_dziadka_m': 'mgf_dob.day',
  'miesiac_uro_dziadka_o': 'mgf_dob.month',
  'rok_uro_dziadka_o': 'mgf_dob.year',
  
  // Grandparents - Maternal Grandmother (MGM)
  'dzien_uro_babki_m': 'mgm_dob.day',
  'miesiac_uro_babki_m': 'mgm_dob.month',
  'rok_uro_babki_m': 'mgm_dob.year',
  
  // Grandparents - Paternal Grandfather (PGF)
  'dzien_uro_dziadka_o': 'pgf_dob.day',
  'miesiac_uro_babki_o': 'pgf_dob.month',
  'rok_uro_babki_o': 'pgf_dob.year',
  
  // Birth/submission dates
  'dzien_zloz': 'application_submission_date.day',
  'miesiac_zloz': 'application_submission_date.month',
  'rok_zloz': 'application_submission_date.year',
  'miesiac_uro': 'applicant_dob.month',
  'rok_uro': 'applicant_dob.year',
  'nr_domu': 'applicant_address.house_number',
  
  // Residence info
  'r_w_obyw_dziec': 'residence_citizenship_info',
  'pesel_babki_o': 'pgm_pesel', 
  'nazwa_organu': 'authority_name',
  
  // Additional unmapped fields from PDF inspection
  'nr_mieszkzkania': 'applicant_address.apartment2',
  'dzien_uro': 'applicant_dob.day',
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
  'voivodeship',
];
