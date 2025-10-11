/**
 * PDF Field Mappings for POA Spouses Template
 * Maps database columns from master_table to PDF form field names
 * 
 * ACTUAL PDF FIELDS (14 total):
 * - imie_nazwisko_wniosko
 * - nr_dok_tozsamosci
 * - imie_nazwisko_dziecka
 * - data_pelnomocnictwa
 * - poa_date
 * + 9 fields already mapped
 */

export const POA_SPOUSES_PDF_MAP: Record<string, string> = {
  // Applicant (Spouse 1)
  'imie_nazwisko_wniosko': 'applicant_first_name', // Full name field
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'passport_number': 'applicant_passport_number',
  'nr_dok_tozsamosci': 'applicant_passport_number', // ID document number
  
  // Spouse 2
  'spouse_given_names': 'spouse_first_name',
  'spouse_surname': 'spouse_last_name',
  'spouse_passport_number': 'spouse_passport_number',
  
  // Post-marriage surnames
  'husband_surname': 'applicant_last_name',
  'wife_surname': 'spouse_last_name',
  
  // Children from marriage
  'minor_surname': 'child_1_last_name',
  'imie_nazwisko_dziecka': 'child_1_first_name', // Child full name
  
  // POA date
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
