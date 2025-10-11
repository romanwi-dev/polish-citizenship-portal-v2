/**
 * PDF Field Mappings for Citizenship (OBY) Template
 * Maps database columns from master_table to PDF form field names
 * 12-page Polish citizenship application form
 */

export const CITIZENSHIP_PDF_MAP: Record<string, string> = {
  // Page 1 - Header & Voivoda
  'miejscowosc_zl': 'applicant_address.city',
  'dzien_': 'application_submission_date.day',
  'miesia': 'application_submission_date.month',
  '2 rok_zloz 7': 'application_submission_date.year',
  'MA wojewoda CKI': 'voivodeship',
  
  // Applicant Section
  'imie_nazwisko_wniosko': 'applicant_full_name',
  'imie_nazwisko_wniosko_cd': 'applicant_full_name_cont',
  
  // Address
  'kraj_zam': 'applicant_address.country',
  'miasto_zam': 'applicant_address.city',
  'nr_domu1': 'applicant_address.house_number',
  'nr_mieszkz': 'applicant_address.apartment_number',
  'kod_pocztowy': 'applicant_address.postal_code',
  'miejscowosc_zamieszkania': 'applicant_address.locality',
  'telefon': 'applicant_phone',
  
  // Decision request names (people through whom citizenship is requested)
  'imie_nazw_3': 'citizenship_through_name_1',
  'imie_nazw_4': 'citizenship_through_name_2',
  
  // Page 2 - Additional Info
  'N posiadaniei Y': 'additional_citizenship_info',
  'cel_ubieganie': 'application_purpose',
  
  // CZĘŚĆ I - Applicant Personal Data
  'nazwisko_wniosko': 'applicant_last_name',
  'nazwisko_rodowe_wniosko': 'applicant_maiden_name',
  'imie_wniosko': 'applicant_first_name',
  'imie_nazwisko_ojca': 'applicant_father_full_name',
  'imie_nazwisko_rodowe_matki': 'applicant_mother_full_name_maiden',
  'uzywane_nazwiska': 'applicant_previous_names',
  'uzywane_nazwiska_cd': 'applicant_previous_names_cont',
  
  // Birth data
  'dzien': 'applicant_dob.day',
  'miesia': 'applicant_dob.month',
  'rok_uro': 'applicant_dob.year',
  'al': 'applicant_sex_male',
  'nl': 'applicant_sex_female',
  'miejsce_uro': 'applicant_pob',
  
  // Citizenship data
  'obce_obywatelstwa': 'applicant_current_citizenships',
  'obce_obywatelstwa_cd1': 'applicant_current_citizenships_cont1',
  'obce_obywatelstwa_cd2': 'applicant_current_citizenships_cont2',
  'stan_cywilny': 'applicant_marital_status',
  'nr_pesel': 'applicant_pesel',
  
  // Page 3 - Decision history
  'wydana_decyzja': 'previous_decision_issued',
  'zezwolenie_na_zmiane_obyw': 'permission_to_renounce_citizenship',
  'miejsce_zamieszk_pl_granica': 'residence_poland_abroad',
  
  // Mother's data
  'nazwisko_matki': 'mother_last_name',
  'nazwisko_rodowe_matki': 'mother_maiden_name',
  'imie_matki': 'mother_first_name',
  'imie_nazwisko_ojca_matki': 'mother_father_full_name',
  'imie_nazw_rod_matki_matki': 'mother_mother_full_name_maiden',
  'uzywane_nazwiska_matki': 'mother_previous_names',
  
  // Mother birth & marriage
  'dzien': 'mother_dob.day',
  'miesia': 'mother_dob.month',
  'rok_uro_matki': 'mother_dob.year',
  'miejsce_uro_matki': 'mother_pob',
  'stan_cywilny_matki': 'mother_marital_status',
  'dzien': 'mother_marriage_date.day',
  'miesia': 'mother_marriage_date.month',
  'rok_zaw_zwiaz': 'mother_marriage_date.year',
  'miejsce_zaw_zwiazku_matki': 'mother_marriage_place',
  
  // Mother citizenship
  'posiadane_obywatel_matki_uro_wniosko': 'mother_citizenship_at_birth',
  'posiadane_obywatel_matki_uro_wniosko_cd': 'mother_citizenship_at_birth_cont',
  'pesel_matki': 'mother_pesel',
  
  // Page 4 - Father's data
  'nazwisko_ojca': 'father_last_name',
  'nazwisko_rodowe_ojca': 'father_maiden_name',
  'imie_ojca': 'father_first_name',
  'imie_nazwisko_ojca_ojca': 'father_father_full_name',
  'imie_nazw_rod_matki_ojca': 'father_mother_full_name_maiden',
  'uzywane_nazwiska_ojca': 'father_previous_names',
  
  // Father birth & marriage - note: some field names repeat, need unique context
  'dzien_': 'father_dob.day',
  'miesia': 'father_dob.month',
  'rok_uro_o': 'father_dob.year',
  'uzywane_nazwiska_ojca': 'father_previous_names',
  'miejsce_uro_ojca': 'father_pob',
  'stan_cywilny_ojca': 'father_marital_status',
  'dzien': 'father_marriage_date.day',
  'miesia': 'father_marriage_date.month',
  'rok_zaw_zwiaz': 'father_marriage_date.year',
  'miejsce_zaw_zwiazku_ojca': 'father_marriage_place',
  
  // Father citizenship
  'posiadane_obywatel_ojca_uro_wniosko': 'father_citizenship_at_birth',
  'posiadane_obywatel_ojca_uro_wniosko_cd': 'father_citizenship_at_birth_cont',
  'pesel_ojca': 'father_pesel',
  
  // Page 5 - Other ancestors
  // Maternal grandfather
  'nazwisko_dziadka_m': 'mgf_last_name',
  'nazwisko_rodowe_dziadka_m': 'mgf_maiden_name',
  'imie_dziadka_m': 'mgf_first_name',
  'imie_nazw_pradziadek_d_m': 'mgf_father_full_name',
  'imie_nazw_prababka_d_m': 'mgf_mother_full_name',
  'dzien_': 'mgf_dob.day',
  'miesia': 'mgf_dob.month',
  'rok_uro_dziad': 'mgf_dob.year',
  'miejsce_uro_dziadka_m': 'mgf_pob',
  'pesel_dziadka_m': 'mgf_pesel',
  
  // Maternal grandmother
  'nazwisko_babki_m': 'mgm_last_name',
  'nazwisko_rodowe_babki_m': 'mgm_maiden_name',
  'imie_babki_m': 'mgm_first_name',
  'imie_nazw_pradziadek_b_m': 'mgm_father_full_name',
  'imie_nazw_rod_prababka_b_m': 'mgm_mother_full_name_maiden',
  'dzien_': 'mgm_dob.day',
  'miesia': 'mgm_dob.month',
  'rok_uro_babki': 'mgm_dob.year',
  'miejsce_uro_babki_m': 'mgm_pob',
  'pesel_babki_m': 'mgm_pesel',
  
  // Page 6 - Paternal grandfather
  'nazwisko_dziadka_o': 'pgf_last_name',
  'nazwisko_rodowe_dziadka_o': 'pgf_maiden_name',
  'imie_dziadka_o': 'pgf_first_name',
  'imie_nazw_pradziadek_d_o': 'pgf_father_full_name',
  'imie_nazw_rod_prababka_d_o': 'pgf_mother_full_name_maiden',
  'dzien_': 'pgf_dob.day',
  'miesia': 'pgf_dob.month',
  'rok_uro_dziad': 'pgf_dob.year',
  'miejsce_uro_dziadka_o': 'pgf_pob',
  'pesel_dziadka_o': 'pgf_pesel',
  
  // Paternal grandmother
  'nazwisko_babki_o': 'pgm_last_name',
  'nazwisko_rodowe_babki_o': 'pgm_maiden_name',
  'imie_babki_o': 'pgm_first_name',
  'imie_nazw_pradziadek_b_o': 'pgm_father_full_name',
  'imie_nazw_rod_prababka_b_o': 'pgm_mother_full_name_maiden',
  
  // Page 7 - CZĘŚĆ II
  'zyciorys_wniosko': 'applicant_biography',
  
  // Page 8 - CZĘŚĆ III - Family history
  'zyciorys_matki': 'mother_biography',
  'zyciorys_ojca': 'father_biography',
  
  // Page 9 - Great-grandparents & ancestors
  'pradziadkowie': 'great_grandparents_biography',
  'decyzja_rodzenstwo': 'siblings_decisions',
  'polskie_dok_wstepnych': 'polish_documents_descendants',
  
  // Page 10 - Additional info for grandparents
  'zyciorys_dziadka_m': 'mgf_biography',
  'zyciorys_babki_m': 'mgm_biography',
  'zyciorys_dziadka_o': 'pgf_biography',
  'zyciorys_babki_o': 'pgm_biography',
  
  // Page 11 - CZĘŚĆ IV
  'pozbawienie_obywatelstwa_polskiego': 'loss_of_polish_citizenship',
  'istotne_info': 'other_relevant_info',
  
  // Attachments checklist
  'zal1': 'attachment_birth_certificate',
  'zal2': 'attachment_passport_copy',
  'zal3': 'attachment_fee_payment',
  'zal4': 'attachment_4',
  'zal5': 'attachment_5',
  'zal6': 'attachment_6',
  'zal7': 'attachment_7',
  'zal8': 'attachment_8',
  'zal9': 'attachment_9',
  'zal10': 'attachment_10',
  
  // Page 12 - Signature
  'podpis_wnioskodawcy': 'applicant_signature',
};

export const CITIZENSHIP_REQUIRED_FIELDS = [
  'applicant_full_name',
  'applicant_first_name',
  'applicant_last_name',
  'applicant_dob',
  'applicant_pob',
  'applicant_sex',
  'father_first_name',
  'father_last_name',
  'mother_first_name',
  'mother_last_name',
  'mother_maiden_name',
  'voivodeship',
];
