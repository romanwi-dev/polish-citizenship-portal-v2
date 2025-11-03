import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { PDFDocument, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

// ============ IN-MEMORY CACHE FOR PDF TEMPLATES ============
const pdfTemplateCache = new Map<string, Uint8Array>();
const CACHE_MAX_AGE = 3600000; // 1 hour in milliseconds
const cacheTimestamps = new Map<string, number>();
const MAX_CACHE_SIZE_MB = 50; // 50MB total cache limit
const MAX_CACHE_ENTRIES = 10; // Max 10 templates

function getCacheSizeMB(): number {
  let totalBytes = 0;
  pdfTemplateCache.forEach(bytes => {
    totalBytes += bytes.length;
  });
  return totalBytes / (1024 * 1024);
}

function evictOldestCacheEntry() {
  let oldestKey: string | null = null;
  let oldestTime = Date.now();
  
  cacheTimestamps.forEach((timestamp, key) => {
    if (timestamp < oldestTime) {
      oldestTime = timestamp;
      oldestKey = key;
    }
  });
  
  if (oldestKey) {
    console.log(`🗑️ Evicting cached template: ${oldestKey}`);
    pdfTemplateCache.delete(oldestKey);
    cacheTimestamps.delete(oldestKey);
  }
}

// ============ PDF FIELD MAPPINGS (INLINE) ============

const POA_ADULT_PDF_MAP: Record<string, string> = {
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'passport_number': 'applicant_passport_number',
  'poa_date': 'poa_date_filed',
};

const POA_MINOR_PDF_MAP: Record<string, string> = {
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'passport_number': 'applicant_passport_number',
  'minor_given_names': 'child_1_first_name',
  'minor_surname': 'child_1_last_name',
  'poa_date': 'poa_date_filed',
};

const POA_SPOUSES_PDF_MAP: Record<string, string> = {
  // Applicant fields
  'imie_nazwisko_wniosko': 'applicant_first_name|applicant_last_name', // Full name field  
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'passport_number': 'applicant_passport_number',
  'nr_dok_tozsamosci': 'applicant_passport_number', // ID document number
  
  // Spouse fields
  'spouse_given_names': 'spouse_first_name',
  'spouse_surname': 'spouse_last_name',
  'spouse_passport_number': 'spouse_passport_number',
  
  // Post-marriage surnames - separate independent fields
  'husband_surname': 'husband_last_name_after_marriage',
  'wife_surname': 'wife_last_name_after_marriage',
  
  // Children from marriage
  'minor_surname': 'child_1_last_name',
  'imie_nazwisko_dziecka': 'child_1_first_name|child_1_last_name', // Child full name
  
  // POA date
  'data_pelnomocnictwa': 'poa_date_filed',
  'poa_date': 'poa_date_filed',
};

const CITIZENSHIP_PDF_MAP: Record<string, string> = {
  // ========== HEADER & ADMIN FIELDS ==========
  'wojewoda': 'voivodeship',
  'decyzja': 'decision_type',
  'posiadanie1': 'citizenship_possession_info',
  'cel_ubiegania': 'application_purpose',
  'nazwa_organu': 'authority_name',
  'r_w_obyw_dziec': 'residence_citizenship_info',
  
  // Submission date & location
  'dzien_zloz': 'application_submission_date.day',
  'miesiac_zloz': 'application_submission_date.month',
  'rok_zloz': 'application_submission_date.year',
  'miejscowosc_zl': 'submission_location',
  
  // ========== APPLICANT SECTION ==========
  // Name fields
  'imie_wniosko': 'applicant_first_name',
  'nazwisko_wniosko': 'applicant_last_name',
  'nazwisko_rodowe_wniosko': 'applicant_maiden_name',
  'imie_nazwisko_wniosko': 'applicant_first_name|applicant_last_name',
  'imie_nazwisko_wniosko_cd': 'applicant_first_name|applicant_last_name',
  
  // Birth info
  'dzien_uro': 'applicant_dob.day',
  'miesiac_uro': 'applicant_dob.month',
  'rok_uro': 'applicant_dob.year',
  'miejsce_uro': 'applicant_pob',
  
  // Personal details
  'plec': 'applicant_sex',
  'stan_cywilny': 'applicant_is_married',
  'nr_pesel': 'applicant_pesel',
  
  // Address
  'miasto_zam': 'applicant_address.city',
  'miejscowosc_zamieszkania': 'applicant_address.city',
  'kod_pocztowy': 'applicant_address.postal_code',
  'kraj_zam': 'applicant_address.country',
  'nr_domu': 'applicant_address.house_number',
  'nr_mieszkania': 'applicant_address.apartment_number',
  
  // Contact
  'telefon': 'applicant_phone',
  
  // Citizenship & name history
  'obce_obywatelstwa': 'applicant_other_citizenships',
  'obce_obywatelstwa_cd1': 'applicant_other_citizenships',
  'obce_obywatelstwa_cd2': 'applicant_other_citizenships',
  'uzywane_nazwiska': 'applicant_previous_names',
  'uzywane_nazwiska_cd': 'applicant_previous_names',
  
  // Previous decisions
  'wydana_decyzja': 'previous_decision_info',
  'zezwolenie_na_zmiane_obyw': 'citizenship_change_permission',
  'pozbawienie_obywatelstwa_polskiego': 'polish_citizenship_deprivation',
  'miejsce_zamieszk_pl_granica': 'residence_citizenship_info',
  
  // Additional applicant fields
  'imie_nazw_3': 'applicant_first_name',
  'imie_nazw_4': 'applicant_last_name',
  
  // ========== MOTHER SECTION ==========
  // Name fields
  'nazwisko_matki': 'mother_last_name',
  'nazwisko_rodowe_matki': 'mother_maiden_name',
  'imie_matki': 'mother_first_name',
  'imie_nazwisko_rodowe_matki': 'mother_first_name|mother_maiden_name',
  
  // Mother's parents
  'imie_nazwisko_ojca_matki': 'mgf_first_name|mgf_last_name',
  'imie_nazw_rod_matki_matki': 'mgm_first_name|mgm_maiden_name',
  
  // Birth info
  'dzien_uro_matki': 'mother_dob.day',
  'miesiac_uro_matki': 'mother_dob.month',
  'rok_uro_matki': 'mother_dob.year',
  'miejsce_uro_matki': 'mother_pob',
  
  // Additional mother info
  'stan_cywilny_matki': 'mother_marital_status',
  'pesel_matki': 'mother_pesel',
  'uzywane_nazwiska_matki': 'mother_previous_names',
  
  // Mother's marriage
  'dzien_zaw_zwiazku_matki': 'mother_marriage_date.day',
  'miesiac_zaw_zwiazku_matki': 'mother_marriage_date.month',
  'rok_zaw_zwiazku_matki': 'mother_marriage_date.year',
  'miejsce_zaw_zwiazku_matki': 'father_mother_marriage_place',
  
  // ========== FATHER SECTION ==========
  // Name fields
  'nazwisko_ojca': 'father_last_name',
  'nazwisko_rodowe_ojca': 'father_maiden_name',
  'imie_ojca': 'father_first_name',
  'imie_nazwisko_ojca': 'father_first_name|father_last_name',
  
  // Father's parents
  'imie_nazwisko_ojca_ojca': 'pgf_first_name|pgf_last_name',
  'imie_nazw_rod_matki_ojca': 'pgm_first_name|pgm_maiden_name',
  
  // Birth info
  'dzien_uro_ojca': 'father_dob.day',
  'miesiac_uro_ojca': 'father_dob.month',
  'rok_uro_ojca': 'father_dob.year',
  'miejsce_uro_ojca': 'father_pob',
  
  // Additional father info
  'stan_cywilny_ojca': 'father_marital_status',
  'pesel_ojca': 'father_pesel',
  'uzywane_nazwiska_ojca': 'father_previous_names',
  
  // Father's marriage
  'dzien_zaw_zwiazku_ojca': 'father_marriage_date.day',
  'miesiac_zaw_zwiazku_ojca': 'father_marriage_date.month',
  'rok_zaw_zwiazku_ojca': 'father_marriage_date.year',
  'miejsce_zaw_zwiazku_ojca': 'father_mother_marriage_place',
  
  // ========== MATERNAL GRANDFATHER (MGF) ==========
  'nazwisko_dziadka_m': 'mgf_last_name',
  'nazwisko_rodowe_dziadka_m': 'mgf_maiden_name',
  'imie_dziadka_m': 'mgf_first_name',
  
  // MGF's parents (great-grandparents)
  'imie_nazw_pradziadek_d_m': 'mggf_first_name|mggf_last_name',
  'imie_nazw_prababka_d_m': 'mggm_first_name|mggm_maiden_name',
  
  // MGF birth info
  'dzien_uro_dziadka_m': 'mgf_dob.day',
  'miesiac_uro_dziadka_m': 'mgf_dob.month',
  'rok_uro_dziadka_m': 'mgf_dob.year',
  'miejsce_uro_dziadka_m': 'mgf_pob',
  'pesel_dziadka_m': 'mgf_pesel',
  
  // Citizenship at applicant's birth
  'posiadane_obywatel_matki_uro_wniosko': 'mgf_citizenship_at_birth',
  'posiadane_obywatel_matki_uro_wniosko_cd': 'mgf_citizenship_at_birth',
  
  // ========== MATERNAL GRANDMOTHER (MGM) ==========
  'nazwisko_babki_m': 'mgm_last_name',
  'nazwisko_rodowe_babki_m': 'mgm_maiden_name',
  'imie_babki_m': 'mgm_first_name',
  
  // MGM's parents (great-grandparents)
  'imie_nazw_pradziadek_b_m': 'mggf_first_name|mggf_last_name',
  'imie_nazw_rod_prababka_b_m': 'mggm_first_name|mggm_maiden_name',
  
  // MGM birth info
  'dzien_uro_babki_m': 'mgm_dob.day',
  'miesiac_uro_babki_m': 'mgm_dob.month',
  'rok_uro_babki_m': 'mgm_dob.year',
  'miejsce_uro_babki_m': 'mgm_pob',
  'pesel_babki_m': 'mgm_pesel',
  
  // ========== PATERNAL GRANDFATHER (PGF) ==========
  'nazwisko_dziadka_o': 'pgf_last_name',
  'nazwisko_rodowe_dziadka_o': 'pgf_maiden_name',
  'imie_dziadka_o': 'pgf_first_name',
  
  // PGF's parents (great-grandparents)
  'imie_nazw_pradziadek_d_o': 'pggf_first_name|pggf_last_name',
  'imie_nazw_rod_prababka_d_o': 'pggm_first_name|pggm_maiden_name',
  
  // PGF birth info
  'dzien_uro_dziadka_o': 'pgf_dob.day',
  'miesiac_uro_dziadka_o': 'pgf_dob.month',
  'rok_uro_dziadka_o': 'pgf_dob.year',
  'miejsce_uro_dziadka_o': 'pgf_pob',
  'pesel_dziadka_o': 'pgf_pesel',
  
  // Citizenship at applicant's birth
  'posiadane_obywatel_ojca_uro_wniosko': 'pgf_citizenship_at_birth',
  'posiadane_obywatel_ojca_uro_wniosko_cd': 'pgf_citizenship_at_birth',
  
  // ========== PATERNAL GRANDMOTHER (PGM) ==========
  'nazwisko_babki_o': 'pgm_last_name',
  'nazwisko_rodowe_babki_o': 'pgm_maiden_name',
  'imie_babki_o': 'pgm_first_name',
  
  // PGM's parents (great-grandparents)
  'imie_nazw_pradziadek_b_o': 'pggf_first_name|pggf_last_name',
  'imie_nazw_rod_prababka_b_o': 'pggm_first_name|pggm_maiden_name',
  
  // PGM birth info
  'dzien_uro_babki_o': 'pgm_dob.day',
  'miesiac_uro_babki_o': 'pgm_dob.month',
  'rok_uro_babki_o': 'pgm_dob.year',
  'miejsce_uro_babki_o': 'pgm_pob',
  'pesel_babki_o': 'pgm_pesel',
  
  // ========== BIOGRAPHICAL NOTES (Życiorysy) ==========
  'zyciorys_wniosko': 'applicant_notes',
  'zyciorys_matki': 'mother_notes',
  'zyciorys_ojca': 'father_notes',
  'zyciorys_dziadka_m': 'mgf_notes',
  'zyciorys_babki_m': 'mgm_notes',
  'zyciorys_dziadka_o': 'pgf_notes',
  'zyciorys_babki_o': 'pgm_notes',
  'pradziadkowie': 'pggf_notes|mggf_notes',
  
  // ========== PAGE 11 - ATTACHMENTS (CRITICAL) ==========
  'zal1': 'attachment_1_included',
  'zal2': 'attachment_2_included',
  'zal3': 'attachment_3_included',
  'zal4': 'attachment_4_included',
  'zal5': 'attachment_5_included',
  'zal6': 'attachment_6_included',
  'zal7': 'attachment_7_included',
  'zal8': 'attachment_8_included',
  'zal9': 'attachment_9_included',
  'zal10': 'attachment_10_included',
  
  // Additional page 11 fields
  'polskie_dok_wstepnych': 'polish_preliminary_docs_info',
  'istotne_info': 'important_additional_info',
  'decyzja_rodzenstwo': 'sibling_decision_info',
};

const FAMILY_TREE_PDF_MAP: Record<string, string> = {
  'applicant_full_name': 'applicant_first_name|applicant_last_name',
  'applicant_date_of_birth': 'applicant_dob',
  'applicant_place_of_birth': 'applicant_pob',
  'applicant_date_of_marriage': 'date_of_marriage',
  'applicant_place_of_marriage': 'place_of_marriage',
  
  'applicant_spouse_full_name_and_maiden_name': 'spouse_first_name|spouse_last_name',
  
  'polish_parent_full_name': 'father_first_name|father_last_name',
  'polish_parent_spouse_full_name': 'mother_first_name|mother_last_name',
  'polish_parent_date_of_birth': 'father_dob',
  'polish_parent_place_of_birth': 'father_pob',
  'polish_parent_date_of_marriage': 'father_mother_marriage_date',
  'polish_parent_place_of_marriage': 'father_mother_marriage_place',
  'polish_parent_date_of_emigration': 'father_date_of_emigration',
  'polish_parent_date_of_naturalization': 'father_date_of_naturalization',
  
  'polish_grandparent_full_name': 'pgf_first_name|pgf_last_name',
  'polish_grandparent_spouse_full_name': 'pgm_first_name|pgm_last_name',
  'polish_grandparent_date_of_birth': 'pgf_dob',
  'polish_grandparent_place_of_birth': 'pgf_pob',
  'polish_grandparent_date_of_mariage': 'pgf_pgm_marriage_date',
  'polish_grandparent_place_of_mariage': 'pgf_pgm_marriage_place',
  'polish_grandparent_date_of_emigration': 'pgf_date_of_emigration',
  'polish_grandparent_date_of_naturalization': 'pgf_date_of_naturalization',
  
  'great_grandfather_full_name': 'pggf_first_name|pggf_last_name',
  'great_grandmother_full_name': 'pggm_first_name|pggm_last_name',
  'great_grandfather_date_of_birth': 'pggf_dob',
  'great_grandfather_place_of_birth': 'pggf_pob',
  'great_grandfather_date_of_marriage': 'pggf_pggm_marriage_date',
  'great_grandfather_place_of_marriage': 'pggf_pggm_marriage_place',
  'great_grandfather_date_of_emigartion': 'pggf_date_of_emigration',
  'great_grandfather_date_of_naturalization': 'pggf_date_of_naturalization',
  
  'minor_1_full_name': 'child_1_first_name|child_1_last_name',
  'minor_1_date_of_birth': 'child_1_dob',
  'minor_1_place_of_birth': 'child_1_pob',
  'minor_2_full_name': 'child_2_first_name|child_2_last_name',
  'minor_2_date_of_birth': 'child_2_dob',
  'minor_2_place_of_birth': 'child_2_pob',
  'minor_3_full_name': 'child_3_first_name|child_3_last_name',
  'minor_3_date_of_birth': 'child_3_dob',
};

const UMIEJSCOWIENIE_PDF_MAP: Record<string, string> = {
  // Applicant info
  'imie_nazwisko_wniosko': 'applicant_first_name|applicant_last_name',
  'kraj_wniosko': 'applicant_country',
  
  // Representative info
  'imie_nazwisko_pelnomocnik': 'representative_full_name',
  'miejsce_zamieszkania_pelnomocnik': 'representative_address_line1',
  'miejsce_zamieszkania_pelnomocnik_cd': 'representative_address_line2',
  'telefon_pelnomocnik': 'representative_phone',
  'email_pelnomocnik': 'representative_email',
  
  // Submission details
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

const UZUPELNIENIE_PDF_MAP: Record<string, string> = {
  // Applicant info
  'imie_nazwisko_wniosko': 'applicant_first_name|applicant_last_name',
  'kraj_wniosko': 'applicant_country',
  
  // Representative info
  'imie_nazwisko_pelnomocnik': 'representative_full_name',
  'miejsce_zamieszkania_pelnomocnik': 'representative_address_line1',
  'miejsce_zamieszkania_pelnomocnik_cd': 'representative_address_line2',
  'telefon_pelnomocnik': 'representative_phone',
  'email_pelnomocnik': 'representative_email',
  
  // Submission details
  'miejscowosc_zloz': 'submission_location',
  'dzien_zloz': 'submission_date.day',
  'miesiac_zloz': 'submission_date.month',
  'rok_zloz': 'submission_date.year',
  
  // Birth act supplement fields
  'nazwisko_rodowe_ojca': 'father_last_name',
  'nazwisko_rodowe_matki': 'mother_maiden_name',
  'miejsce_sporządzenia_aktu_zagranicznego': 'foreign_act_location',
  'nr_aktu_urodzenia_polskiego': 'polish_birth_act_number',
  'rok_aktu_urodzenia_polskiego': 'birth_act_year',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============ FIELD FORMATTING UTILITIES ============

const formatDate = (date: string | null | undefined): string => {
  if (!date) return '';
  
  try {
    if (typeof date === 'string' && /^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
      return date;
    }
    
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      const [year, month, day] = date.split('T')[0].split('-');
      return `${day}.${month}.${year}`;
    }
    
    const d = new Date(date);
    
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    if (year < 1800 || year > 2030) return '';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    
    return `${day}.${month}.${year}`;
  } catch {
    return '';
  }
};

const formatAddress = (address: any): string => {
  if (!address) return '';
  if (typeof address === 'string') return address.trim();
  
  if (typeof address === 'object') {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.postal_code || address.zip,
      address.country,
    ].filter(Boolean).map(part => String(part).trim());
    
    return parts.join(', ');
  }
  
  return '';
};

const formatArray = (arr: any[] | null | undefined): string => {
  if (!arr || !Array.isArray(arr)) return '';
  return arr.filter(Boolean).map(item => String(item).trim()).join(', ');
};

const formatBoolean = (value: any): string => {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  
  const stringValue = String(value).toLowerCase().trim();
  if (['true', 'yes', '1', 'y', 'tak', 'checked'].includes(stringValue)) return 'Yes';
  if (['false', 'no', '0', 'n', 'nie', 'unchecked'].includes(stringValue)) return 'No';
  
  return 'No';
};

const getNestedValue = (obj: any, path: string): any => {
  if (!obj || !path) return undefined;
  
  if (!path.includes('.')) {
    return obj[path];
  }
  
  const keys = path.split('.');
  
  if (keys.length === 2 && ['day', 'month', 'year'].includes(keys[1])) {
    const dateValue = obj[keys[0]];
    if (dateValue) {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        switch (keys[1]) {
          case 'day': return date.getDate().toString().padStart(2, '0');
          case 'month': return (date.getMonth() + 1).toString().padStart(2, '0');
          case 'year': return date.getFullYear().toString();
        }
      }
    }
    return undefined;
  }
  
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
};

const formatFieldValue = (value: any, fieldName: string): string => {
  if (value === null || value === undefined) return '';
  
  const datePatterns = [
    '_date', '_dob', '_at', 'DOB', 'Date', 'birth', 'marriage', 
    'emigration', 'naturalization', 'expiry', 'issue'
  ];
  
  if (datePatterns.some(pattern => fieldName.includes(pattern))) {
    return formatDate(value);
  }
  
  if ((fieldName.includes('address') || fieldName.includes('Address')) && 
      (typeof value === 'object' || typeof value === 'string')) {
    return formatAddress(value);
  }
  
  if (Array.isArray(value)) {
    return formatArray(value);
  }
  
  if (typeof value === 'boolean' || 
      fieldName.includes('is_') || 
      fieldName.includes('has_') ||
      fieldName.includes('checkbox')) {
    return formatBoolean(value);
  }
  
  return String(value).trim();
};

// ============ FIELD FILLING UTILITIES ============

interface FillResult {
  totalFields: number;
  filledFields: number;
  emptyFields: string[];
  errors: Array<{ field: string; error: string }>;
}

const isTruthyForCheckbox = (value: any): boolean => {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'boolean') return value;
  
  const stringValue = String(value).toLowerCase().trim();
  return ['true', 'yes', '1', 'y', 'tak', 'checked', 'on'].includes(stringValue);
};

const extractNameComponents = (data: any, dbColumn: string): { firstName: string; lastName: string } => {
  let prefix = dbColumn
    .replace(/_first_name$/, '')
    .replace(/_last_name$/, '')
    .replace(/_given_names$/, '')
    .replace(/_surname$/, '')
    .replace(/_full_name$/, '');
  
  let firstName = 
    data[`${prefix}_first_name`] || 
    data[`${prefix}_given_names`] || 
    data[dbColumn] || 
    '';
  
  let lastName = 
    data[`${prefix}_last_name`] || 
    data[`${prefix}_surname`] || 
    '';
  
  if (!firstName && !lastName) {
    const columnParts = dbColumn.split('_');
    const possiblePrefix = columnParts.length >= 2 && !isNaN(Number(columnParts[1]))
      ? `${columnParts[0]}_${columnParts[1]}`
      : columnParts[0];
    
    firstName = data[`${possiblePrefix}_first_name`] || '';
    lastName = data[`${possiblePrefix}_last_name`] || '';
  }
  
  return { 
    firstName: String(firstName || '').trim(), 
    lastName: String(lastName || '').trim() 
  };
};

const isFullNameField = (pdfFieldName: string): boolean => {
  const lower = pdfFieldName.toLowerCase();
  
  // IMPORTANT: Exclude these - they are SEPARATE fields, not full names!
  const excludeIndicators = ['given_names', 'surname', 'last_name', 'first_name'];
  if (excludeIndicators.some(ex => lower.includes(ex))) {
    return false;
  }
  
  const fullNameIndicators = [
    'full_name',
    'imie_nazwisko',
    'imie_nazw',
  ];
  
  if (fullNameIndicators.some(indicator => lower.includes(indicator))) {
    return true;
  }
  
  const hasName = lower.includes('name');
  const isNotComponent = !lower.includes('first') && 
                         !lower.includes('last') && 
                         !lower.includes('maiden') && 
                         !lower.includes('middle') &&
                         !lower.includes('rodowe');
  
  return hasName && isNotComponent;
};

const fillPDFFields = (
  form: any,
  data: any,
  fieldMap: Record<string, string>
): FillResult => {
  const result: FillResult = {
    totalFields: 0,
    filledFields: 0,
    emptyFields: [],
    errors: [],
  };

  for (const [pdfFieldName, dbColumn] of Object.entries(fieldMap)) {
    result.totalFields++;

    try {
      // Check if this is a pipe-delimited mapping
      if (dbColumn.includes('|')) {
        const dbFields = dbColumn.split('|');
        
        // CASE 1: Name concatenation (2 fields: firstName|lastName)
        if (dbFields.length === 2 && 
            (dbFields[0].includes('first_name') || 
             dbFields[0].includes('given') ||
             dbFields[0].includes('maiden'))) {
          const firstName = getNestedValue(data, dbFields[0]) || '';
          const lastName = getNestedValue(data, dbFields[1]) || '';
          const fullName = `${firstName} ${lastName}`.trim();
          
          if (fullName) {
            try {
              const textField = form.getTextField(pdfFieldName);
              if (textField) {
                textField.setText(fullName);
                result.filledFields++;
                continue;
              }
            } catch {
              result.emptyFields.push(pdfFieldName);
              continue;
            }
          } else {
            result.emptyFields.push(pdfFieldName);
            continue;
          }
        }
        
        // CASE 2: Date splitting (single date field → day|month|year PDF fields)
        else if (pdfFieldName.includes('|')) {
          const pdfFields = pdfFieldName.split('|');
          const rawValue = getNestedValue(data, dbColumn);
          
          if (rawValue && pdfFields.length === 3) {
            const date = new Date(rawValue);
            if (!isNaN(date.getTime())) {
              const day = date.getDate().toString().padStart(2, '0');
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              const year = date.getFullYear().toString();
              
              const values = [day, month, year];
              for (let i = 0; i < pdfFields.length && i < values.length; i++) {
                try {
                  const textField = form.getTextField(pdfFields[i]);
                  if (textField) {
                    textField.setText(values[i]);
                    result.filledFields++;
                  }
                } catch {
                  result.emptyFields.push(pdfFields[i]);
                }
              }
              continue;
            }
          }
        }
        
        // CASE 3: Concatenate multiple text fields (e.g., biographical notes)
        else {
          const values = dbFields.map(field => getNestedValue(data, field) || '').filter(Boolean);
          const concatenated = values.join(' ').trim();
          
          if (concatenated) {
            try {
              const textField = form.getTextField(pdfFieldName);
              if (textField) {
                textField.setText(concatenated);
                result.filledFields++;
                continue;
              }
            } catch {
              result.emptyFields.push(pdfFieldName);
              continue;
            }
          }
        }
        
        result.emptyFields.push(pdfFieldName);
        continue;
      }
      
      let rawValue;
      
      if (isFullNameField(pdfFieldName)) {
        const { firstName, lastName } = extractNameComponents(data, dbColumn);
        rawValue = `${firstName} ${lastName}`.trim();
      } 
      else {
        // Direct mapping - no name concatenation for single fields
        rawValue = getNestedValue(data, dbColumn);
      }
      
      if (rawValue === null || rawValue === undefined || rawValue === '') {
        result.emptyFields.push(pdfFieldName);
        continue;
      }

      const formattedValue = formatFieldValue(rawValue, dbColumn);
      
      if (!formattedValue) {
        result.emptyFields.push(pdfFieldName);
        continue;
      }

      try {
        const textField = form.getTextField(pdfFieldName);
        if (textField) {
          textField.setText(formattedValue);
          result.filledFields++;
          continue;
        }
      } catch {
        // Not a text field
      }
      
      try {
        const checkboxField = form.getCheckBox(pdfFieldName);
        if (checkboxField) {
          if (isTruthyForCheckbox(rawValue)) {
            checkboxField.check();
          } else {
            checkboxField.uncheck();
          }
          result.filledFields++;
          continue;
        }
      } catch {
        // Not a checkbox
      }
      
      result.errors.push({
        field: pdfFieldName,
        error: `Field "${pdfFieldName}" not found in PDF template`,
      });
      
    } catch (error) {
      result.errors.push({
        field: pdfFieldName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return result;
};

const calculateCoverage = (result: FillResult): number => {
  if (result.totalFields === 0) return 0;
  return Math.round((result.filledFields / result.totalFields) * 100);
};

// ============ MAIN EDGE FUNCTION ============

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, templateType, flatten = false, mode } = await req.json();
    
    // DIAGNOSTICS MODE
    if (mode === 'diagnose') {
      const url = Deno.env.get('SUPABASE_URL');
      const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      const hasSecrets = Boolean(url && key);
      let uploadOk = false, signOk = false, diagError = null;
      
      try {
        if (hasSecrets) {
          const sb = createClient(url!, key!);
          const path = `diagnostics/${Date.now()}.txt`;
          const bytes = new TextEncoder().encode('diagnostic test');
          
          const { error: upErr } = await sb.storage
            .from('generated-pdfs')
            .upload(path, bytes, { contentType: 'text/plain', upsert: true });
          uploadOk = !upErr;
          
          const { data: signed, error: sErr } = await sb.storage
            .from('generated-pdfs')
            .createSignedUrl(path, 60);
          signOk = Boolean(signed?.signedUrl && !sErr);
        }
      } catch (e) {
        diagError = String((e as Error)?.message ?? e);
      }
      
      return new Response(
        JSON.stringify({ 
          ok: hasSecrets && uploadOk && signOk, 
          hasSecrets, 
          uploadOk, 
          signOk, 
          diagError 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    // Whitelist valid template types
    const validTemplates = [
      'citizenship',
      'family-tree',
      'transcription',   // Civil Registry transcription (wpis)
      'registration',    // Civil Registry registration (umiejscowienie)
      'poa-adult',
      'poa-minor',
      'poa-spouses',
      'umiejscowienie',  // Legacy
      'uzupelnienie',    // Legacy
    ];
    
    if (!templateType || !validTemplates.includes(templateType)) {
      return new Response(
        JSON.stringify({ error: 'Valid templateType is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!caseId) {
      return new Response(
        JSON.stringify({ error: 'caseId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating PDF: ${templateType} for case: ${caseId}`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: masterData, error: masterError } = await supabaseClient
      .from('master_table')
      .select('*')
      .eq('case_id', caseId)
      .maybeSingle();

    if (masterError) throw masterError;
    if (!masterData) throw new Error('Master data not found');

    console.log('[fill-pdf] Master data retrieved');

    // Check cache first
    const cacheKey = `${templateType}.pdf`;
    const cachedTime = cacheTimestamps.get(cacheKey);
    const isCacheValid = cachedTime && (Date.now() - cachedTime < CACHE_MAX_AGE);
    
    let pdfBytes: Uint8Array | undefined;
    
    if (isCacheValid && pdfTemplateCache.has(cacheKey)) {
      console.log(`✅ Using cached template: ${cacheKey}`);
      const cached = pdfTemplateCache.get(cacheKey)!;
      
      // Validate cached template
      if (!cached || cached.length === 0) {
        console.warn(`⚠️ Cached template corrupted: ${cacheKey}. Refetching...`);
        pdfTemplateCache.delete(cacheKey);
        cacheTimestamps.delete(cacheKey);
        pdfBytes = undefined; // Force refetch
      } else {
        pdfBytes = cached;
      }
    }
    
    if (!pdfBytes) {
      // Fetch PDF template from Supabase Storage
      console.log(`Fetching template from storage: ${templateType}.pdf`);
      
      const { data: pdfBlob, error: storageError } = await supabaseClient.storage
        .from('pdf-templates')
        .download(`${templateType}.pdf`);
      
      if (storageError || !pdfBlob) {
        console.error(`❌ Storage error for ${templateType}.pdf:`, storageError);
        throw new Error(`Failed to load PDF template: ${templateType}`);
      }
      
      pdfBytes = new Uint8Array(await pdfBlob.arrayBuffer());
      
      // Check cache limits before storing
      if (pdfTemplateCache.size >= MAX_CACHE_ENTRIES) {
        evictOldestCacheEntry();
      }
      
      if (getCacheSizeMB() + (pdfBytes.length / (1024 * 1024)) > MAX_CACHE_SIZE_MB) {
        evictOldestCacheEntry();
      }
      
      // Store in cache
      pdfTemplateCache.set(cacheKey, pdfBytes);
      cacheTimestamps.set(cacheKey, Date.now());
      console.log(`✅ Template loaded and cached: ${templateType}.pdf (${pdfBytes.length} bytes)`);
      console.log(`📊 Cache status: ${pdfTemplateCache.size} entries, ${getCacheSizeMB().toFixed(2)} MB`);
    }

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`PDF has ${fields.length} form fields`);

    const fieldMappings: Record<string, Record<string, string>> = {
      'poa-adult': POA_ADULT_PDF_MAP,
      'poa-minor': POA_MINOR_PDF_MAP,
      'poa-spouses': POA_SPOUSES_PDF_MAP,
      'citizenship': CITIZENSHIP_PDF_MAP,
      'family-tree': FAMILY_TREE_PDF_MAP,
      'umiejscowienie': UMIEJSCOWIENIE_PDF_MAP,
      'uzupelnienie': UZUPELNIENIE_PDF_MAP,
    };
    
    const fieldMap = fieldMappings[templateType];
    
    let fillResult: FillResult = {
      totalFields: 0,
      filledFields: 0,
      emptyFields: [],
      errors: [],
    };
    
    if (!fieldMap || Object.keys(fieldMap).length === 0) {
      console.warn(`⚠️ No field mapping for: ${templateType}`);
    } else {
      fillResult = fillPDFFields(form, masterData, fieldMap);
      const coverage = calculateCoverage(fillResult);
      
      console.log(`📄 PDF Generation Results for ${templateType}:`);
      console.log(`   ✅ Filled: ${fillResult.filledFields}/${fillResult.totalFields} fields (${coverage}%)`);
      
      if (fillResult.emptyFields.length > 0) {
        console.log(`   ⚠️  Empty fields (${fillResult.emptyFields.length}):`);
        const emptyToShow = fillResult.emptyFields.slice(0, 10);
        console.log(`       ${emptyToShow.join(', ')}`);
        if (fillResult.emptyFields.length > 10) {
          console.log(`       ... and ${fillResult.emptyFields.length - 10} more`);
        }
      }
      
      if (fillResult.errors.length > 0) {
        console.log(`   ❌ Errors (${fillResult.errors.length}):`);
        fillResult.errors.slice(0, 5).forEach(err => {
          console.log(`       ${err.field}: ${err.error}`);
        });
        if (fillResult.errors.length > 5) {
          console.log(`       ... and ${fillResult.errors.length - 5} more errors`);
        }
      }
    }

    // ALWAYS generate appearance streams for ALL PDFs (editable and flattened)
    // This makes fields visible in PDF viewers
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    form.updateFieldAppearances(helveticaFont);
    console.log('✅ Generated appearance streams for all fields');

    // Only flatten if explicitly requested
    if (flatten) {
      form.flatten();
      console.log('🔒 PDF flattened (locked, not editable)');
    } else {
      console.log('✏️ PDF kept editable');
    }
    
    const filledPdfBytes = await pdfDoc.save({
      useObjectStreams: false,
      updateFieldAppearances: false  // Already generated manually above
    });
    
    console.log(`✅ PDF generated: ${filledPdfBytes.length} bytes`);
    
    // Upload to Supabase Storage
    const filename = `${caseId}/${templateType}-${Date.now()}.pdf`;
    
    const { error: uploadErr } = await supabaseClient
      .storage
      .from('generated-pdfs')
      .upload(filename, filledPdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });
    
    if (uploadErr) {
      console.error('❌ Storage upload error:', uploadErr);
      return new Response(
        JSON.stringify({ error: `Storage upload failed: ${uploadErr.message}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
    console.log(`📦 Uploaded to: ${filename}`);
    
    // Generate signed URL (10 minutes expiry)
    const { data: signed, error: signedErr } = await supabaseClient
      .storage
      .from('generated-pdfs')
      .createSignedUrl(filename, 60 * 10);
    
    if (signedErr) {
      console.error('❌ Signed URL error:', signedErr);
      return new Response(
        JSON.stringify({ error: `Failed to create signed URL: ${signedErr.message}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
    
    console.log(`🔗 Signed URL created (expires in 10 min)`);
    
    // Record in audit table
    const { error: auditErr } = await supabaseClient
      .from('generated_documents')
      .insert({
        case_id: caseId,
        template_type: templateType,
        path: filename,
      });
    
    if (auditErr) {
      console.warn('⚠️ Audit log failed (non-critical):', auditErr.message);
    }
    
    return new Response(
      JSON.stringify({ 
        url: signed.signedUrl,
        filename: filename.split('/').pop(),
        stats: { 
          filled: fillResult.filledFields, 
          total: fillResult.totalFields, 
          percentage: calculateCoverage(fillResult) 
        },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
