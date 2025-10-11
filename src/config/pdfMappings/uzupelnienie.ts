/**
 * PDF Field Mappings for Uzupełnienie (Civil Registry Act Supplement) Template
 * Maps database columns from master_table to PDF form field names
 * 
 * SIMPLIFIED 1:1 MAPPINGS after PDF field renaming
 * PDF fields have been renamed from Polish to English
 */

export const UZUPELNIENIE_PDF_MAP: Record<string, string> = {
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
  
  // Birth act supplement fields
  'birth_act_number': 'numer_aktu_urodzenia',
  'birth_act_year': 'rok_aktu_urodzenia',
  'father_last_name': 'nazwisko_ojca',
  'mother_maiden_name': 'nazwisko_rodowe_matki',
  'foreign_act_location': 'miejsce_aktu_zagranicznego',
  'polish_birth_act_number': 'numer_polskiego_aktu_urodzenia',
};

export const UZUPELNIENIE_REQUIRED_FIELDS = [
  'applicant_full_name',
  'applicant_country',
  'representative_full_name',
  'representative_address',
  'submission_location',
  'submission_date',
];
