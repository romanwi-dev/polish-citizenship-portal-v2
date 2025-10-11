/**
 * PDF Field Mappings for Uzupełnienie (Civil Registry Act Supplement) Template
 * Maps database columns from master_table to PDF form field names
 * Request to supplement civil registry acts with missing data
 * 
 * ACTUAL PDF FIELDS (16 total) - Added 6 missing fields
 */

export const UZUPELNIENIE_PDF_MAP: Record<string, string> = {
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
  'uzup_date_dzien': 'submission_date.day',
  'uzup_date_miesia': 'submission_date.month',
  'uzup_date_rok': 'submission_date.year',
  
  // NEW FIELDS from PDF inspection
  'dzien_zloz': 'submission_date.day',
  'miesiac_zloz': 'submission_date.month',
  'rok_zloz': 'submission_date.year',
  'miejsce_sporzadzenia_aktu_zagranicznego': 'foreign_act_location',
  'nr_aktu_urodzenia_polskiego': 'polish_birth_act_number',
  'rok_aktu_uro': 'birth_act_year',
  
  // Birth act supplement
  'nr_aktu_urod': 'birth_act_number',
  'nazwisko_rodowe_ojca': 'father_maiden_name',
  'nazwisko_rodowe_matki': 'mother_maiden_name',
};

export const UZUPELNIENIE_REQUIRED_FIELDS = [
  'applicant_full_name',
  'applicant_country',
  'representative_full_name',
  'representative_address',
  'submission_location',
  'submission_date',
];
