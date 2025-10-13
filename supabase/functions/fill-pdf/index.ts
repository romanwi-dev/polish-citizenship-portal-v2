import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, PDFName, PDFBool } from "https://esm.sh/pdf-lib@1.17.1";

// ============ IN-MEMORY CACHE FOR PDF TEMPLATES ============
const pdfTemplateCache = new Map<string, Uint8Array>();
const CACHE_MAX_AGE = 3600000; // 1 hour in milliseconds
const cacheTimestamps = new Map<string, number>();

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
  'imie_nazwisko_wniosko': 'applicant_first_name', // Full name field  
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
  'imie_nazwisko_dziecka': 'child_1_first_name', // Child full name
  
  // POA date
  'data_pelnomocnictwa': 'poa_date_filed',
  'poa_date': 'poa_date_filed',
};

const CITIZENSHIP_PDF_MAP: Record<string, string> = {
  'miejscowosc_zl': 'applicant_address.city',
  'app_date_dzien': 'application_submission_date.day',
  'app_date_miesia': 'application_submission_date.month',
  'app_date_rok': 'application_submission_date.year',
  'wojewoda_name': 'voivodeship',
  'imie_nazwisko_wniosko': 'applicant_full_name',
  'imie_nazwisko_wniosko_cd': 'applicant_full_name_cont',
  'kraj_zam': 'applicant_address.country',
  'miasto_zam': 'applicant_address.city',
  'nr_domu1': 'applicant_address.house_number',
  'nr_mieszkz': 'applicant_address.apartment_number',
  'kod_pocztowy': 'applicant_address.postal_code',
  'miejscowosc_zamieszkania': 'applicant_address.locality',
  'telefon': 'applicant_phone',
  'imie_nazw_3': 'citizenship_through_name_1',
  'imie_nazw_4': 'citizenship_through_name_2',
  'posiadaniei': 'additional_citizenship_info',
  'cel_ubieganie': 'application_purpose',
  'nazwisko_wniosko': 'applicant_last_name',
  'nazwisko_rodowe_wniosko': 'applicant_maiden_name',
  'imie_wniosko': 'applicant_first_name',
  'imie_nazwisko_ojca': 'applicant_father_full_name',
  'imie_nazwisko_rodowe_matki': 'applicant_mother_full_name_maiden',
  'uzywane_nazwiska': 'applicant_previous_names',
  'uzywane_nazwiska_cd': 'applicant_previous_names_cont',
  'app_dob_dzien': 'applicant_dob.day',
  'app_dob_miesia': 'applicant_dob.month',
  'app_dob_rok': 'applicant_dob.year',
  'app_sex_male': 'applicant_sex_male',
  'app_sex_female': 'applicant_sex_female',
  'miejsce_uro': 'applicant_pob',
  'obce_obywatelstwa': 'applicant_current_citizenships',
  'obce_obywatelstwa_cd1': 'applicant_current_citizenships_cont1',
  'obce_obywatelstwa_cd2': 'applicant_current_citizenships_cont2',
  'stan_cywilny': 'applicant_marital_status',
  'nr_pesel': 'applicant_pesel',
  'nazwisko_matki': 'mother_last_name',
  'nazwisko_rodowe_matki': 'mother_maiden_name',
  'imie_matki': 'mother_first_name',
  'mother_dob_dzien': 'mother_dob.day',
  'mother_dob_miesia': 'mother_dob.month',
  'mother_dob_rok': 'mother_dob.year',
  'miejsce_uro_matki': 'mother_pob',
  'nazwisko_ojca': 'father_last_name',
  'imie_ojca': 'father_first_name',
  'father_dob_dzien': 'father_dob.day',
  'father_dob_miesia': 'father_dob.month',
  'father_dob_rok': 'father_dob.year',
  'miejsce_uro_ojca': 'father_pob',
  'nazwisko_dziadka_m': 'mgf_last_name',
  'imie_dziadka_m': 'mgf_first_name',
  'mgf_dob_dzien': 'mgf_dob.day',
  'mgf_dob_miesia': 'mgf_dob.month',
  'mgf_dob_rok': 'mgf_dob.year',
  'nazwisko_babki_m': 'mgm_last_name',
  'imie_babki_m': 'mgm_first_name',
  'mgm_dob_dzien': 'mgm_dob.day',
  'mgm_dob_miesia': 'mgm_dob.month',
  'mgm_dob_rok': 'mgm_dob.year',
  'nazwisko_dziadka_o': 'pgf_last_name',
  'imie_dziadka_o': 'pgf_first_name',
  'pgf_dob_dzien': 'pgf_dob.day',
  'pgf_dob_miesia': 'pgf_dob.month',
  'pgf_dob_rok': 'pgf_dob.year',
  'nazwisko_babki_o': 'pgm_last_name',
  'imie_babki_o': 'pgm_first_name',
};

const FAMILY_TREE_PDF_MAP: Record<string, string> = {
  'applicant_full_name': 'applicant_first_name',
  'applicant_date_of_birth': 'applicant_dob',
  'applicant_place_of_birth': 'applicant_pob',
  'father_full_name': 'father_first_name',
  'father_date_of_birth': 'father_dob',
  'father_place_of_birth': 'father_pob',
  'mother_full_name': 'mother_first_name',
  'mother_maiden_name': 'mother_maiden_name',
  'mother_date_of_birth': 'mother_dob',
  'mother_place_of_birth': 'mother_pob',
  'pgf_full_name': 'pgf_first_name',
  'pgf_date_of_birth': 'pgf_dob',
  'pgf_place_of_birth': 'pgf_pob',
  'pgm_full_name': 'pgm_first_name',
  'pgm_maiden_name': 'pgm_maiden_name',
  'pgm_date_of_birth': 'pgm_dob',
  'pgm_place_of_birth': 'pgm_pob',
  'mgf_full_name': 'mgf_first_name',
  'mgf_date_of_birth': 'mgf_dob',
  'mgf_place_of_birth': 'mgf_pob',
  'mgm_full_name': 'mgm_first_name',
  'mgm_maiden_name': 'mgm_maiden_name',
  'mgm_date_of_birth': 'mgm_dob',
  'mgm_place_of_birth': 'mgm_pob',
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
      // Check if this is a pipe-delimited mapping (for date splitting)
      if (dbColumn.includes('|')) {
        const pdfFields = pdfFieldName.split('|');
        const dbField = dbColumn;
        
        let rawValue = getNestedValue(data, dbField);
        
        // Handle date splitting into day|month|year
        if (rawValue && pdfFields.length === 3) {
          const date = new Date(rawValue);
          if (!isNaN(date.getTime())) {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear().toString();
            
            // Fill each pipe-delimited field
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
    const { caseId, templateType, flatten = false } = await req.json();
    
    const validTemplates = ['poa-adult', 'poa-minor', 'poa-spouses', 'citizenship', 'family-tree', 'umiejscowienie', 'uzupelnienie'];
    
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
    
    let pdfBytes: Uint8Array;
    
    if (isCacheValid && pdfTemplateCache.has(cacheKey)) {
      console.log(`✅ Using cached template: ${cacheKey}`);
      pdfBytes = pdfTemplateCache.get(cacheKey)!;
    } else {
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
      
      // Store in cache
      pdfTemplateCache.set(cacheKey, pdfBytes);
      cacheTimestamps.set(cacheKey, Date.now());
      console.log(`✅ Template loaded and cached: ${templateType}.pdf (${pdfBytes.length} bytes)`);
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
    
    if (!fieldMap || Object.keys(fieldMap).length === 0) {
      console.warn(`⚠️ No field mapping for: ${templateType}`);
    } else {
      const fillResult = fillPDFFields(form, masterData, fieldMap);
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

    // Preserve Adobe's AUTO font sizing by using needAppearances
    pdfDoc.getForm().acroForm.dict.set(
      PDFName.of('NeedAppearances'), 
      PDFBool.True
    );

    // Only flatten for final locked PDFs, keep editable otherwise
    if (flatten) {
      form.flatten();
      console.log('🔒 PDF flattened - fields are now static text (not editable)');
    } else {
      console.log('✏️ PDF kept editable - can be filled in PDF viewer software');
    }
    
    const filledPdfBytes = await pdfDoc.save({
      useObjectStreams: false,
      updateFieldAppearances: false  // Don't force font changes!
    });
    
    console.log(`PDF generated: ${filledPdfBytes.length} bytes`);
    
    return new Response(filledPdfBytes as any, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${templateType}-${caseId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
