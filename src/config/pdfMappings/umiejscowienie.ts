/**
 * PDF Field Mappings for Umiejscowienie (Civil Registry Entry) Template
 * Maps database columns from master_table to PDF form field names
 * 
 * SIMPLIFIED 1:1 MAPPINGS after PDF field renaming
 * PDF fields have been renamed from Polish to English
 */

export const UMIEJSCOWIENIE_PDF_MAP: Record<string, string> = {
  // Map English DB columns → Polish PDF field names
  
  // Applicant info
  'applicant_full_name': 'imie_nazwisko_wnioskodawcy',
  'applicant_country': 'kraj_wnioskodawcy',
  
  // Representative info
  'representative_full_name': 'imie_nazwisko_pelnomocnika',
  'representative_address_line1': 'adres_pelnomocnika_linia1',
  'representative_address_line2': 'adres_pelnomocnika_linia2',
  'representative_phone': 'telefon_pelnomocnika',
  'representative_email': 'email_pelnomocnika',
  
  // Submission location and date (pipe-delimited for date split)
  'submission_location': 'miejscowosc_zlozenia',
  'submission_date': 'dzien_zlozenia|miesiac_zlozenia|rok_zlozenia',
  'sending_method': 'sposob_przeslania',
  
  // Act type checkboxes
  'act_type_birth': 'checkbox_akt_urodzenia',
  'act_type_marriage': 'checkbox_akt_malzenstwa',
  
  // Birth act fields
  'birth_act_location': 'miejsce_sporz_aktu_urodzenia',
  'birth_person_full_name': 'imie_nazwisko_osoby_urodzenia',
  'birth_place': 'miejsce_urodzenia',
  'birth_date': 'dzien_urodzenia|miesiac_urodzenia|rok_urodzenia',
  
  // Marriage act fields
  'marriage_act_location': 'miejsce_sporz_aktu_malzenstwa',
  'spouse_full_name': 'imie_nazwisko_malzonka',
  'place_of_marriage': 'miejsce_zawarcia_malzenstwa',
  'date_of_marriage': 'dzien_malzenstwa|miesiac_malzenstwa|rok_malzenstwa',
};

export const UMIEJSCOWIENIE_REQUIRED_FIELDS = [
  'applicant_full_name',
  'applicant_country',
  'representative_full_name',
  'representative_address',
  'submission_location',
  'submission_date',
];
