import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// DEPLOYMENT VERSION: 2024-11-03-V3-FINAL
// Template paths: LOWERCASE with hyphens (poa-adult.pdf, family-tree.pdf, etc.)

// ===== CORS & Security Utilities =====
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-admin-token',
};

function j(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function log(event: string, extra: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, deployment: 'v2-fixed-paths', ...extra }));
}

// ===== Input Validation =====
function sanitizeCaseId(raw: unknown): string | null {
  const s = String(raw ?? '');
  return /^[A-Za-z0-9_-]{1,64}$/.test(s) ? s : null;
}

const VALID_TEMPLATES = new Set([
  'citizenship', 'family-tree', 'transcription', 'registration',
  'poa-adult', 'poa-minor', 'poa-spouses'
]);

const TTL = Number(Deno.env.get('SIGNED_URL_TTL_SECONDS') ?? '2700');

// ===== PDF Template Cache =====
const pdfTemplateCache = new Map<string, Uint8Array>();
const cacheTimestamps = new Map<string, number>();
const MAX_CACHE_SIZE = 10;

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
    pdfTemplateCache.delete(oldestKey);
    cacheTimestamps.delete(oldestKey);
  }
}

// ===== PDF Field Mappings =====
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

const CITIZENSHIP_PDF_MAP: Record<string, string> = {
  'wojewoda': 'voivodeship',
  'decyzja': 'decision_type',
  'posiadanie1': 'citizenship_possession_info',
  'cel_ubiegania': 'application_purpose',
  'nazwa_organu': 'authority_name',
  'r_w_obyw_dziec': 'residence_citizenship_info',
  'dzien_zloz': 'application_submission_date.day',
  'miesiac_zloz': 'application_submission_date.month',
  'rok_zloz': 'application_submission_date.year',
  'miejscowosc_zl': 'submission_location',
  'imie_wniosko': 'applicant_first_name',
  'nazwisko_wniosko': 'applicant_last_name',
  'nazwisko_rodowe_wniosko': 'applicant_maiden_name',
  'imie_nazwisko_wniosko': 'applicant_first_name|applicant_last_name',
  'imie_nazwisko_wniosko_cd': 'applicant_first_name|applicant_last_name',
  'dzien_uro': 'applicant_dob.day',
  'miesiac_uro': 'applicant_dob.month',
  'rok_uro': 'applicant_dob.year',
  'miejsce_uro': 'applicant_pob',
  'plec': 'applicant_sex',
  'stan_cywilny': 'applicant_is_married',
  'nr_pesel': 'applicant_pesel',
  'miasto_zam': 'applicant_address.city',
  'miejscowosc_zamieszkania': 'applicant_address.city',
  'kod_pocztowy': 'applicant_address.postal_code',
  'kraj_zam': 'applicant_address.country',
  'nr_domu': 'applicant_address.house_number',
  'nr_mieszkania': 'applicant_address.apartment_number',
  'telefon': 'applicant_phone',
  'obce_obywatelstwa': 'applicant_other_citizenships',
  'obce_obywatelstwa_cd1': 'applicant_other_citizenships',
  'obce_obywatelstwa_cd2': 'applicant_other_citizenships',
  'uzywane_nazwiska': 'applicant_previous_names',
  'uzywane_nazwiska_cd': 'applicant_previous_names',
  'wydana_decyzja': 'previous_decision_info',
  'zezwolenie_na_zmiane_obyw': 'citizenship_change_permission',
  'pozbawienie_obywatelstwa_polskiego': 'polish_citizenship_deprivation',
  'miejsce_zamieszk_pl_granica': 'residence_citizenship_info',
  'imie_nazw_3': 'applicant_first_name',
  'imie_nazw_4': 'applicant_last_name',
  'nazwisko_matki': 'mother_last_name',
  'nazwisko_rodowe_matki': 'mother_maiden_name',
  'imie_matki': 'mother_first_name',
  'imie_nazwisko_rodowe_matki': 'mother_first_name|mother_maiden_name',
  'imie_nazwisko_ojca_matki': 'mgf_first_name|mgf_last_name',
  'imie_nazw_rod_matki_matki': 'mgm_first_name|mgm_maiden_name',
  'dzien_uro_matki': 'mother_dob.day',
  'miesiac_uro_matki': 'mother_dob.month',
  'rok_uro_matki': 'mother_dob.year',
  'miejsce_uro_matki': 'mother_pob',
  'stan_cywilny_matki': 'mother_marital_status',
  'pesel_matki': 'mother_pesel',
  'uzywane_nazwiska_matki': 'mother_previous_names',
  'dzien_zaw_zwiazku_matki': 'mother_marriage_date.day',
  'miesiac_zaw_zwiazku_matki': 'mother_marriage_date.month',
  'rok_zaw_zwiazku_matki': 'mother_marriage_date.year',
  'miejsce_zaw_zwiazku_matki': 'father_mother_marriage_place',
  'nazwisko_ojca': 'father_last_name',
  'nazwisko_rodowe_ojca': 'father_maiden_name',
  'imie_ojca': 'father_first_name',
  'imie_nazwisko_ojca': 'father_first_name|father_last_name',
  'imie_nazwisko_ojca_ojca': 'pgf_first_name|pgf_last_name',
  'imie_nazw_rod_matki_ojca': 'pgm_first_name|pgm_maiden_name',
  'dzien_uro_ojca': 'father_dob.day',
  'miesiac_uro_ojca': 'father_dob.month',
  'rok_uro_ojca': 'father_dob.year',
  'miejsce_uro_ojca': 'father_pob',
  'stan_cywilny_ojca': 'father_marital_status',
  'pesel_ojca': 'father_pesel',
  'uzywane_nazwiska_ojca': 'father_previous_names',
  'dzien_zaw_zwiazku_ojca': 'father_marriage_date.day',
  'miesiac_zaw_zwiazku_ojca': 'father_marriage_date.month',
  'rok_zaw_zwiazku_ojca': 'father_marriage_date.year',
  'miejsce_zaw_zwiazku_ojca': 'father_mother_marriage_place',
  'nazwisko_dziadka_m': 'mgf_last_name',
  'nazwisko_rodowe_dziadka_m': 'mgf_maiden_name',
  'imie_dziadka_m': 'mgf_first_name',
  'imie_nazw_pradziadek_d_m': 'mggf_first_name|mggf_last_name',
  'imie_nazw_prababka_d_m': 'mggm_first_name|mggm_maiden_name',
  'dzien_uro_dziadka_m': 'mgf_dob.day',
  'miesiac_uro_dziadka_m': 'mgf_dob.month',
  'rok_uro_dziadka_m': 'mgf_dob.year',
  'miejsce_uro_dziadka_m': 'mgf_pob',
  'pesel_dziadka_m': 'mgf_pesel',
  'posiadane_obywatel_matki_uro_wniosko': 'mgf_citizenship_at_birth',
  'posiadane_obywatel_matki_uro_wniosko_cd': 'mgf_citizenship_at_birth',
  'nazwisko_babki_m': 'mgm_last_name',
  'nazwisko_rodowe_babki_m': 'mgm_maiden_name',
  'imie_babki_m': 'mgm_first_name',
  'imie_nazw_pradziadek_b_m': 'mggf_first_name|mggf_last_name',
  'imie_nazw_rod_prababka_b_m': 'mggm_first_name|mggm_maiden_name',
  'dzien_uro_babki_m': 'mgm_dob.day',
  'miesiac_uro_babki_m': 'mgm_dob.month',
  'rok_uro_babki_m': 'mgm_dob.year',
  'miejsce_uro_babki_m': 'mgm_pob',
  'pesel_babki_m': 'mgm_pesel',
  'nazwisko_dziadka_o': 'pgf_last_name',
  'nazwisko_rodowe_dziadka_o': 'pgf_maiden_name',
  'imie_dziadka_o': 'pgf_first_name',
  'imie_nazw_pradziadek_d_o': 'pggf_first_name|pggf_last_name',
  'imie_nazw_rod_prababka_d_o': 'pggm_first_name|pggm_maiden_name',
  'dzien_uro_dziadka_o': 'pgf_dob.day',
  'miesiac_uro_dziadka_o': 'pgf_dob.month',
  'rok_uro_dziadka_o': 'pgf_dob.year',
  'miejsce_uro_dziadka_o': 'pgf_pob',
  'pesel_dziadka_o': 'pgf_pesel',
  'posiadane_obywatel_ojca_uro_wniosko': 'pgf_citizenship_at_birth',
  'posiadane_obywatel_ojca_uro_wniosko_cd': 'pgf_citizenship_at_birth',
  'nazwisko_babki_o': 'pgm_last_name',
  'nazwisko_rodowe_babki_o': 'pgm_maiden_name',
  'imie_babki_o': 'pgm_first_name',
  'imie_nazw_pradziadek_b_o': 'pggf_first_name|pggf_last_name',
  'imie_nazw_rod_prababka_b_o': 'pggm_first_name|pggm_maiden_name',
  'dzien_uro_babki_o': 'pgm_dob.day',
  'miesiac_uro_babki_o': 'pgm_dob.month',
  'rok_uro_babki_o': 'pgm_dob.year',
  'miejsce_uro_babki_o': 'pgm_pob',
  'pesel_babki_o': 'pgm_pesel',
  'zyciorys_wniosko': 'applicant_notes',
  'zyciorys_matki': 'mother_notes',
  'zyciorys_ojca': 'father_notes',
  'zyciorys_dziadka_m': 'mgf_notes',
  'zyciorys_babki_m': 'mgm_notes',
  'zyciorys_dziadka_o': 'pgf_notes',
  'zyciorys_babki_o': 'pgm_notes',
  'pradziadkowie': 'pggf_notes|mggf_notes',
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

const TRANSCRIPTION_PDF_MAP: Record<string, string> = {
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
  'wyslanie': 'sending_method',
  'akt_uro': 'act_type_birth',
  'akt_malz': 'act_type_marriage',
  'miejsce_sporz_aktu_u': 'birth_act_location',
  'imie_nazwisko_u': 'birth_person_full_name',
  'miejsce_urodzenia': 'birth_place',
  'dzien_urodzenia': 'birth_date.day',
  'miesiac_urodzenia': 'birth_date.month',
  'rok_urodzenia': 'birth_date.year',
  'miejsce_sporz_aktu_m': 'marriage_act_location',
  'imie_nazwisko_malzonka': 'spouse_full_name',
  'miejsce_malzenstwa_wniosko': 'place_of_marriage',
  'dzien_malzenstwa_wniosko': 'date_of_marriage.day',
  'miesiac_malzenstwa_wniosko': 'date_of_marriage.month',
  'rok_malzenstwa_wniosko': 'date_of_marriage.year',
};

const REGISTRATION_PDF_MAP: Record<string, string> = {
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

// ===== Formatting Utilities =====
const formatDate = (date: string | null | undefined): string => {
  if (!date) return '';
  try {
    if (typeof date === 'string' && /^\d{2}\.\d{2}\.\d{4}$/.test(date)) return date;
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
    const parts = [address.street, address.city, address.state, address.postal_code || address.zip, address.country]
      .filter(Boolean).map(part => String(part).trim());
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
  if (!path.includes('.')) return obj[path];
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
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }
  return current;
};

const formatFieldValue = (value: any, fieldName: string): string => {
  if (value === null || value === undefined) return '';
  const datePatterns = ['_date', '_dob', '_at', 'DOB', 'Date', 'birth', 'marriage', 'emigration', 'naturalization'];
  const addressPatterns = ['address', 'miejsce_zamieszkania'];
  const arrayPatterns = ['citizenships', 'names', 'languages'];
  const boolPatterns = ['is_', 'has_', 'included', 'zal'];
  const isDateField = datePatterns.some(pattern => fieldName.toLowerCase().includes(pattern.toLowerCase()));
  if (isDateField) return formatDate(value);
  const isAddressField = addressPatterns.some(pattern => fieldName.toLowerCase().includes(pattern.toLowerCase()));
  if (isAddressField) return formatAddress(value);
  const isArrayField = arrayPatterns.some(pattern => fieldName.toLowerCase().includes(pattern.toLowerCase()));
  if (isArrayField && Array.isArray(value)) return formatArray(value);
  const isBoolField = boolPatterns.some(pattern => fieldName.toLowerCase().startsWith(pattern.toLowerCase()));
  if (isBoolField) return formatBoolean(value);
  return String(value);
};

interface FillResult {
  totalFields: number;
  filledCount: number;
  emptyFields: string[];
  errors: Array<{ field: string; error: string }>;
}

function fillPDFFields(form: any, data: any, fieldMap: Record<string, string>): FillResult {
  const allFields = form.getFields();
  const result: FillResult = { totalFields: allFields.length, filledCount: 0, emptyFields: [], errors: [] };
  
  Object.entries(fieldMap).forEach(([pdfFieldName, dataPath]) => {
    try {
      let value: any;
      if (dataPath.includes('|')) {
        const parts = dataPath.split('|').map(p => getNestedValue(data, p) || '').filter(Boolean);
        value = parts.join(' ');
      } else {
        value = getNestedValue(data, dataPath);
      }
      
      if (value === undefined || value === null || value === '') {
        result.emptyFields.push(pdfFieldName);
        return;
      }
      
      const formattedValue = formatFieldValue(value, pdfFieldName);
      if (!formattedValue) {
        result.emptyFields.push(pdfFieldName);
        return;
      }
      
      const field = form.getField(pdfFieldName);
      if (!field) {
        result.errors.push({ field: pdfFieldName, error: 'Field not found in PDF' });
        return;
      }
      
      // Detect field type using multiple methods
      const fieldType = field.constructor.name;
      const acroFieldType = field.acroField?.dict?.get('FT')?.encodedName || '';
      
      // PDFTextField or text field indicator
      if (fieldType === 'PDFTextField' || acroFieldType === '/Tx' || acroFieldType === 't') {
        try {
          field.setText(formattedValue);
          result.filledCount++;
        } catch (e) {
          const errMsg = (e as Error)?.message || String(e);
          result.errors.push({ field: pdfFieldName, error: `Text field set failed: ${errMsg}` });
        }
      } else if (fieldType === 'PDFCheckBox' || acroFieldType === '/Btn') {
        const isChecked = formatBoolean(value) === 'Yes';
        if (isChecked) {
          field.check();
        } else {
          field.uncheck();
        }
        result.filledCount++;
      } else if (fieldType === 'PDFDropdown' || acroFieldType === '/Ch') {
        try {
          field.select(formattedValue);
          result.filledCount++;
        } catch (e) {
          const errMsg = (e as Error)?.message || String(e);
          result.errors.push({ field: pdfFieldName, error: `Dropdown select failed: ${errMsg}` });
        }
      } else {
        result.errors.push({ field: pdfFieldName, error: `Unsupported field type: ${fieldType} (acro: ${acroFieldType})` });
      }
    } catch (error) {
      result.errors.push({ field: pdfFieldName, error: String((error as Error)?.message ?? error) });
    }
  });
  
  return result;
}

// ===== Main Handler =====
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { caseId: rawCaseId, templateType, flatten = true, mode } = body ?? {};

    // Secure diagnostics
    if (mode === 'diagnose') {
      const token = req.headers.get('x-admin-token');
      if (token !== Deno.env.get('INTERNAL_ADMIN_TOKEN')) {
        return j(req, { ok: false, error: 'unauthorized' }, 401);
      }
      
      const diagnostics: any = {
        ok: true,
        hasSecrets: true,
        uploadOk: false,
        signOk: false,
        timestamp: new Date().toISOString()
      };
      
      try {
        // Check secrets
        const url = Deno.env.get('SUPABASE_URL');
        const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const anon = Deno.env.get('SUPABASE_ANON_KEY');
        diagnostics.hasSecrets = !!(url && key && anon);
        
        if (!diagnostics.hasSecrets) {
          diagnostics.ok = false;
          diagnostics.diagError = 'Missing required environment variables';
          return j(req, diagnostics, 200);
        }
        
        // Test storage upload
        const admin = createClient(url!, key!);
        const path = `diagnostics/${Date.now()}.txt`;
        const up = await admin.storage.from('generated-pdfs')
          .upload(path, new TextEncoder().encode('ok'), { contentType: 'text/plain', upsert: true });
        
        if (up.error) {
          log('diag_upload_fail', { err: up.error.message });
          diagnostics.ok = false;
          diagnostics.uploadOk = false;
          diagnostics.diagError = `Upload failed: ${up.error.message}`;
          return j(req, diagnostics, 200);
        }
        
        diagnostics.uploadOk = true;
        
        // Test signed URL generation
        const sign = await admin.storage.from('generated-pdfs').createSignedUrl(path, 60);
        
        if (sign.error) {
          log('diag_sign_fail', { err: sign.error.message });
          diagnostics.ok = false;
          diagnostics.signOk = false;
          diagnostics.diagError = `Signing failed: ${sign.error.message}`;
          return j(req, diagnostics, 200);
        }
        
        diagnostics.signOk = true;
        log('diagnostics_pass', { timestamp: diagnostics.timestamp });
        return j(req, diagnostics, 200);
        
      } catch (e) {
        const errMsg = String((e as Error)?.message ?? e);
        log('diag_exception', { err: errMsg });
        diagnostics.ok = false;
        diagnostics.diagError = `Exception: ${errMsg}`;
        return j(req, diagnostics, 200);
      }
    }

    // Validate inputs
    const caseId = sanitizeCaseId(rawCaseId);
    if (!caseId) return j(req, { code: 'INVALID_CASE_ID', message: 'Invalid caseId' }, 400);
    if (!VALID_TEMPLATES.has(String(templateType))) return j(req, { code: 'INVALID_TEMPLATE', message: 'Invalid templateType' }, 400);

    // Initialize clients
    const URL = Deno.env.get('SUPABASE_URL')!;
    const SRK = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
    const admin = createClient(URL, SRK, { global: { headers: { 'X-Client-Info': 'fill-pdf' } } });

    log('fill_pdf_request', { caseId, templateType });
    
    // Simple case existence check with service role (bypasses RLS)
    const { data: c, error: caseErr } = await admin.from('cases').select('id').eq('id', caseId).maybeSingle();
    if (caseErr || !c) {
      log('case_not_found', { caseId, err: caseErr?.message });
      return j(req, { code: 'CASE_NOT_FOUND', message: 'Case not found' }, 404);
    }

    // Check for recent artifact (within 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recent } = await admin.from('generated_documents')
      .select('path, created_at')
      .eq('case_id', caseId)
      .eq('template_type', templateType)
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let path: string;
    let shouldGenerateNew = !recent?.path;

    if (shouldGenerateNew) {
      log('gen_start', { caseId, templateType });

      // Fetch case data with service role
      const { data: masterData, error: fetchError } = await admin.from('master_table').select('*').eq('case_id', caseId).single();
      if (fetchError || !masterData) {
        log('data_fetch_fail', { caseId, err: fetchError?.message });
        return j(req, { code: 'DATA_FETCH_FAIL', message: 'Failed to fetch case data' }, 500);
      }

      log('data_retrieved', { caseId });

      // Template mapping - DEPLOYMENT FIX v3
      const templateMap: Record<string, { path: string; map: Record<string, string> }> = {
        'citizenship': { path: 'citizenship.pdf', map: CITIZENSHIP_PDF_MAP },
        'family-tree': { path: 'family-tree.pdf', map: FAMILY_TREE_PDF_MAP },
        'transcription': { path: 'umiejscowienie.pdf', map: TRANSCRIPTION_PDF_MAP },
        'registration': { path: 'uzupelnienie.pdf', map: REGISTRATION_PDF_MAP },
        'poa-adult': { path: 'poa-adult.pdf', map: POA_ADULT_PDF_MAP },
        'poa-minor': { path: 'poa-minor.pdf', map: POA_MINOR_PDF_MAP },
        'poa-spouses': { path: 'poa-spouses.pdf', map: POA_SPOUSES_PDF_MAP },
      };
      log('template_map_loaded', { version: 'v3-lowercase-paths', templateType });

      const config = templateMap[templateType];
      if (!config) {
        log('template_config_missing', { templateType });
        return j(req, { code: 'TEMPLATE_CONFIG_MISSING', message: 'Template configuration not found' }, 500);
      }

      const templatePath = config.path;
      log('template_load_v3', { templatePath, deployment: 'V3-FINAL', timestamp: Date.now() });

      // Template cache
      let templateBytes: Uint8Array;
      const cached = pdfTemplateCache.get(templatePath);
      if (cached) {
        templateBytes = cached;
        cacheTimestamps.set(templatePath, Date.now());
        log('template_cache_hit', { templatePath });
      } else {
        const { data: templateData, error: downloadError } = await admin.storage.from('pdf-templates').download(templatePath);
        if (downloadError || !templateData) {
          log('template_download_fail', { templatePath, err: downloadError?.message });
          return j(req, { code: 'TEMPLATE_DOWNLOAD_FAIL', message: 'Failed to download template' }, 500);
        }
        const arrayBuffer = await templateData.arrayBuffer();
        templateBytes = new Uint8Array(arrayBuffer);
        if (pdfTemplateCache.size >= MAX_CACHE_SIZE) evictOldestCacheEntry();
        pdfTemplateCache.set(templatePath, templateBytes);
        cacheTimestamps.set(templatePath, Date.now());
        log('template_cached', { templatePath });
      }

      // Load PDF
      const PDFDocument = (await import('https://esm.sh/pdf-lib@1.17.1')).PDFDocument;
      const pdfDoc = await PDFDocument.load(templateBytes);
      const form = pdfDoc.getForm();
      log('pdf_loaded', { caseId, templateType });

      // Fill fields
      const result = fillPDFFields(form, masterData, config.map);
      log('fields_filled', { caseId, templateType, filled: result.filledCount, total: result.totalFields, errors: result.errors.length });
      if (result.errors.length > 0) console.warn('[fill-pdf] Field filling errors:', result.errors);

      // Flatten and save
      form.updateFieldAppearances();
      if (flatten) form.flatten();
      const filledPdfBytes = await pdfDoc.save();

      // Upload
      const filename = `${templateType}-${Date.now()}.pdf`;
      path = `${caseId}/${filename}`;
      log('upload_start', { caseId, path });
      const { error: uploadError } = await admin.storage.from('generated-pdfs')
        .upload(path, filledPdfBytes, { contentType: 'application/pdf', upsert: true });
      if (uploadError) {
        log('upload_fail', { caseId, templateType, err: uploadError.message });
        return j(req, { code: 'UPLOAD_FAIL', message: 'Upload failed' }, 500);
      }

      // Audit (no user ID since this is a public endpoint)
      await admin.from('generated_documents').insert({ 
        case_id: caseId, 
        template_type: templateType, 
        path, 
        created_by: null 
      });
      log('gen_ok', { caseId, templateType, path, bytes: filledPdfBytes.byteLength, filled: result.filledCount, total: result.totalFields });
    } else {
      path = recent!.path;
      log('reuse_artifact', { caseId, templateType, path });
    }

    // Signed URL
    const sign = await admin.storage.from('generated-pdfs')
      .createSignedUrl(path, TTL, { download: path.split('/').pop() ?? 'document.pdf' });
    if (sign.error || !sign.data?.signedUrl) {
      log('sign_fail', { caseId, templateType, err: sign.error?.message });
      return j(req, { code: 'SIGN_FAIL', message: 'Signing failed' }, 500);
    }

    return j(req, { url: sign.data.signedUrl, filename: path.split('/').pop(), templateType, caseId }, 200);
  } catch (e) {
    log('exception', { err: String((e as Error)?.message ?? e) });
    return j(req, { code: 'INTERNAL', message: 'Internal error' }, 500);
  }
});
