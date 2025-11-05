/**
 * PDF Field Mappings for POA Spouses Template
 * Maps database columns from master_table to PDF form field names
 */

export const POA_SPOUSES_PDF_MAP: Record<string, string> = {
  'imie_nazwisko_wniosko': 'applicant_first_name|applicant_last_name',
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'passport_number': 'applicant_passport_number',
  'nr_dok_tozsamosci': 'applicant_passport_number',
  'spouse_given_names': 'spouse_first_name',
  'spouse_surname': 'spouse_last_name',
  'spouse_passport_number': 'spouse_passport_number',
  'husband_surname': 'husband_last_name_after_marriage',
  'wife_surname': 'wife_last_name_after_marriage',
  'minor_surname': 'child_1_last_name',
  'imie_nazwisko_dziecka': 'child_1_first_name|child_1_last_name',
  'data_pelnomocnictwa': 'poa_date_filed',
  'poa_date': 'poa_date_filed',
};

export const POA_SPOUSES_REQUIRED_FIELDS = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_passport_number',
  'spouse_first_name',
  'spouse_last_name',
  'spouse_passport_number',
];
