/**
 * PDF Field Mappings for Uzupełnienie (Civil Registry Act Supplement) Template
 * Maps database columns from master_table to PDF form field names
 */

export const UZUPELNIENIE_PDF_MAP: Record<string, string> = {
  'imie_nazwisko_wniosko': 'applicant_first_name|applicant_last_name',
  'kraj_wniosko': 'applicant_country',
  'imie_nazwisko_pelnomocnik': 'representative_full_name',
  'miejsce_zamieszkania_pelnomocnik': 'representative_address_line1',
  'miejsce_zamieszkania_pelnomocnik_cd': 'representative_address_line2',
  'telefon_pelnomocnik': 'representative_phone',
  'email_pelnomocnik': 'representative_email',
  'miejscowosc_zloz': 'submission_location',
  'dzien_zloz': 'submission_date.day',
  'miesiac_zloz': 'submission_date.month',
  'rok_zloz': 'submission_date.year',
  'nazwisko_rodowe_ojca': 'father_last_name',
  'nazwisko_rodowe_matki': 'mother_maiden_name',
  'miejsce_sporządzenia_aktu_zagranicznego': 'foreign_act_location',
  'nr_aktu_urodzenia_polskiego': 'polish_birth_act_number',
  'rok_aktu_urodzenia_polskiego': 'birth_act_year',
};

export const UZUPELNIENIE_REQUIRED_FIELDS = [
  'applicant_full_name',
  'applicant_country',
  'representative_full_name',
  'representative_address',
  'submission_location',
  'submission_date',
];
