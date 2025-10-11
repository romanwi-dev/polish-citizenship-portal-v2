/**
 * PDF Field Mappings for Umiejscowienie (Civil Registry Entry) Template
 * Maps database columns from master_table to PDF form field names
 * 
 * SIMPLIFIED 1:1 MAPPINGS after PDF field renaming
 * PDF fields have been renamed from Polish to English
 */

export const UMIEJSCOWIENIE_PDF_MAP: Record<string, string> = {
  // Map PDF field names → Database columns
  
  // Applicant info
  'imie_nazwisko_wniosko': 'applicant_first_name|applicant_last_name',
  'kraj_wniosko': 'applicant_country',
  
  // Representative info
  'imie_nazwisko_pelnomocnik': 'representative_full_name',
  'miejsce_zamieszkania_pelnomocnik': 'representative_address_line1',
  'miejsce_zamieszkania_pelnomocnik_cd': 'representative_address_line2',
  'telefon_pelnomocnik': 'representative_phone',
  'email_pelnomocnik': 'representative_email',
  
  // Submission details (date split)
  'miejscowosc_zloz': 'submission_location',
  'dzien_zloz': 'submission_date.day',
  'miesiac_zloz': 'submission_date.month',
  'rok_zloz': 'submission_date.year',
  'wyslanie': 'sending_method',
  
  // Act type checkboxes
  'akt_uro': 'act_type_birth',
  'akt_malz': 'act_type_marriage',
  
  // Birth act fields
  'miejsce_sporz_aktu_u': 'birth_act_location',
  'imie_nazwisko_u': 'birth_person_full_name',
  'miejsce_urodzenia': 'birth_place',
  'dzien_urodzenia': 'birth_date.day',
  'miesiac_urodzenia': 'birth_date.month',
  'rok_urodzenia': 'birth_date.year',
  
  // Marriage act fields
  'miejsce_sporz_aktu_m': 'marriage_act_location',
  'imie_nazwisko_malzonka': 'spouse_full_name',
  'miejsce_malzenstwa_wniosko': 'place_of_marriage',
  'dzien_malzenstwa_wniosko': 'date_of_marriage.day',
  'miesiac_malzenstwa_wniosko': 'date_of_marriage.month',
  'rok_malzenstwa_wniosko': 'date_of_marriage.year',
};

export const UMIEJSCOWIENIE_REQUIRED_FIELDS = [
  'applicant_full_name',
  'applicant_country',
  'representative_full_name',
  'representative_address',
  'submission_location',
  'submission_date',
];
