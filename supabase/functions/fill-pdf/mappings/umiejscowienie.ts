/**
 * PDF Field Mappings for Umiejscowienie (Civil Registry Entry) Template
 * Maps database columns from master_table to PDF form field names
 * Request for entry of foreign civil registry acts into Polish registry
 * 
 * ACTUAL PDF FIELDS (18 total) - Added 3 missing fields
 */

export const UMIEJSCOWIENIE_PDF_MAP: Record<string, string> = {
  // ACTUAL PDF FIELDS (26 total) - removed 11 phantom fields
  // Applicant info
  'imie_nazwisko_wniosko': 'applicant_first_name', // Full name - will be concatenated
  
  // Representative info (pełnomocnik)
  'imie_nazwisko_pelnomocnik': 'representative_full_name',
  'miejsce_zamieszkania_pelnomocnik': 'representative_address',
  
  // Submission location and date
  'miejscowosc_zloz': 'submission_location',
  'dzien_zloz': 'submission_date.day',
  'miesiac_zloz': 'submission_date.month',
  'rok_zloz': 'submission_date.year',
  
  // Birth act (akt urodzenia) fields
  'akt_uro_checkbox': 'act_type_birth',
  'miejsce_sporz_aktu_u': 'birth_act_location',
  'imie_nazwisko_u': 'applicant_first_name', // Birth person full name
  'miejsce_urodzenia': 'applicant_pob',
  'birth_dzien': 'applicant_dob.day',
  'birth_miesia': 'applicant_dob.month',
  'birth_rok': 'applicant_dob.year',
  
  // Marriage act (akt małżeństwa) fields
  'akt_malz_checkbox': 'act_type_marriage',
  'miejsce_sporz_aktu_m': 'marriage_act_location',
  'imie_nazwisko_malzonka': 'spouse_first_name', // Spouse full name
  'miejsce_malzenstwa_wniosko': 'place_of_marriage',
  'marriage_dzien': 'date_of_marriage.day',
  'marriage_miesia': 'date_of_marriage.month',
  'marriage_rok': 'date_of_marriage.year',
};

export const UMIEJSCOWIENIE_REQUIRED_FIELDS = [
  'applicant_first_name',
  'applicant_country',
  'representative_full_name',
  'representative_address',
  'submission_location',
  'submission_date',
];
