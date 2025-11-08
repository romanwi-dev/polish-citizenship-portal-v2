/**
 * PDF Field Mappings for POA Combined Template
 * Combines Adult, Minor, and Spouses POA sections into one 3-page template
 * 
 * ACTUAL PDF STRUCTURE:
 * - Page 1: Adult POA (4 fields)
 * - Page 2: Minor POA (6 fields)
 * - Page 3: Spouses POA (14 fields)
 */

export const POA_COMBINED_PDF_MAP: Record<string, string> = {
  // PAGE 1: Adult POA fields
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'passport_number': 'applicant_passport_number',
  'poa_date': 'poa_date_filed',
  
  // PAGE 2: Minor POA fields (parent/guardian + child)
  'minor_applicant_given_names': 'applicant_first_name',
  'minor_applicant_surname': 'applicant_last_name',
  'minor_passport_number': 'applicant_passport_number',
  'minor_given_names': 'child_1_first_name',
  'minor_surname': 'child_1_last_name',
  'minor_poa_date': 'poa_date_filed',
  
  // PAGE 3: Spouses POA fields
  'imie_nazwisko_wniosko': 'applicant_first_name|applicant_last_name',
  'spouse_applicant_given_names': 'applicant_first_name',
  'spouse_applicant_surname': 'applicant_last_name',
  'nr_dok_tozsamosci': 'applicant_passport_number',
  'spouse_passport_number_field': 'applicant_passport_number',
  'spouse_given_names': 'spouse_first_name',
  'spouse_surname': 'spouse_last_name',
  'spouse_passport_number': 'spouse_passport_number',
  'husband_surname': 'husband_last_name_after_marriage',
  'wife_surname': 'wife_last_name_after_marriage',
  'minor_surname_spouses': 'child_1_last_name',
  'imie_nazwisko_dziecka': 'child_1_first_name|child_1_last_name',
  'data_pelnomocnictwa': 'poa_date_filed',
  'spouse_poa_date': 'poa_date_filed',
};

export const POA_COMBINED_REQUIRED_FIELDS = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_passport_number',
];
