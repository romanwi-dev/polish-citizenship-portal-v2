/**
 * PDF Field Mappings for Umiejscowienie (Civil Registry Entry) Template
 * Maps database columns from master_table to PDF form field names
 * Request for entry of foreign civil registry acts into Polish registry
 * 
 * ACTUAL PDF FIELDS (26 total) - Added 12 unmapped fields
 */

export const UMIEJSCOWIENIE_PDF_MAP: Record<string, string> = {
  // Applicant info
  'imie_nazwisko_wniosko': 'applicant_full_name',
  'kraj_wniosko': 'applicant_country',
  
  // Representative info (pełnomocnik)
  'imie_nazwisko_pelnomocnik': 'representative_full_name',
  'miejsce_zamieszkania_pelnomocnik': 'representative_address',
  'miejsce_zamieszkania_pelnomocnik_cd': 'representative_address_cont',
  'telefon_pelnomocnik': 'representative_phone',
  'email_pelnomocnik': 'representative_email',
  
  // Submission location and date
  'miejscowosc_zloz': 'submission_location',
  'sub_date_dzien': 'submission_date.day',
  'sub_date_miesia': 'submission_date.month',
  'sub_date_rok': 'submission_date.year',
  
  // NEW FIELDS from PDF inspection
  'dzien_zloz': 'submission_date.day',
  'miesiac_zloz': 'submission_date.month',
  'rok_zloz': 'submission_date.year',
  'wyslanie': 'sending_method',
  'akt_uro': 'birth_act_checkbox',
  'akt_malz': 'marriage_act_checkbox',
  
  // Civil registry details
  'dzien_malzenstwa_wniosko': 'marriage_date.day',
  'miesiac_malzenstwa_wniosko': 'marriage_date.month',
  'rok_malzenstwa_wniosko': 'marriage_date.year',
  'rok_urodzenia': 'birth_year',
  'miesiac_urodzenia': 'birth_month',
  'dzien_urodzenia': 'birth_day',
  
  // Birth act (akt urodzenia) fields
  'akt_uro_checkbox': 'act_type_birth',
  'miejsce_sporz_aktu_u': 'birth_act_location',
  'imie_nazwisko_u': 'birth_person_full_name',
  'miejsce_urodzenia': 'birth_place',
  'birth_dzien': 'birth_date.day',
  'birth_miesia': 'birth_date.month',
  'birth_rok': 'birth_date.year',
  
  // Marriage act (akt małżeństwa) fields
  'akt_malz_checkbox': 'act_type_marriage',
  'miejsce_sporz_aktu_m': 'marriage_act_location',
  'imie_nazwisko_malzonka': 'spouse_full_name',
  'miejsce_malzenstwa_wniosko': 'marriage_place',
  'marriage_dzien': 'marriage_date.day',
  'marriage_miesia': 'marriage_date.month',
  'marriage_rok': 'marriage_date.year',
};

export const UMIEJSCOWIENIE_REQUIRED_FIELDS = [
  'applicant_full_name',
  'applicant_country',
  'representative_full_name',
  'representative_address',
  'submission_location',
  'submission_date',
];
