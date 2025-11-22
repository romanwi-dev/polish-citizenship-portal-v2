/**
 * SIMPLE PDF GENERATION - NO QUEUES, NO WORKERS, JUST WORKS
 * Generates PDFs synchronously in one request (<10 seconds)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Template mappings - exact filenames from storage
const TEMPLATE_PATHS: Record<string, string> = {
  'poa-combined': 'poa-combined.pdf',
  'poa-adult': 'poa-adult.pdf',
  'poa-minor': 'poa-minor.pdf',
  'poa-spouses': 'poa-spouses.pdf',
  'family-tree': 'family-tree.pdf',
  'citizenship': 'citizenship.pdf',
  'transcription': 'transcription.pdf',
  // 'registration': 'registration.pdf', // Template not yet uploaded to storage
};

// Field mappings: PDF field name → database column name
const FIELD_MAPS: Record<string, Record<string, string>> = {
  'poa-adult': {
    'applicant_given_names': 'applicant_first_name',
    'applicant_surname': 'applicant_last_name',
    'passport_number': 'applicant_passport_number',
    'poa_date': 'poa_date_filed',
  },
  'poa-minor': {
    'applicant_given_names': 'applicant_first_name',
    'applicant_surname': 'applicant_last_name',
    'passport_number': 'applicant_passport_number',
    'minor_given_names': '__CHILD_FIRST_NAME__',
    'minor_surname': '__CHILD_LAST_NAME__',
    'poa_date': 'poa_date_filed',
  },
  'poa-spouses': {
    'applicant_given_names': 'applicant_first_name',
    'applicant_surname': 'applicant_last_name',
    'passport_number': 'applicant_passport_number',
    'spouse_given_names': 'spouse_first_name',
    'spouse_surname': 'spouse_last_name',
    'spouse_passport_number': 'spouse_passport_number',
    'husband_surname': 'husband_last_name_after_marriage',
    'wife_surname': 'wife_last_name_after_marriage',
    'poa_date': 'poa_date_filed',
  },
  'poa-combined': {
    // Legacy support - now uses dynamic assembly
  },
  'citizenship': {
    // Applicant (using actual PDF field names from citizenship.pdf)
    'imie_wniosko': 'applicant_first_name',
    'nazwisko_wniosko': 'applicant_last_name',
    'nazwisko_rodowe_wniosko': 'applicant_maiden_name',
    'dzien_uro': 'applicant_dob.day',
    'miesiac_uro': 'applicant_dob.month',
    'rok_uro': 'applicant_dob.year',
    'miejsce_uro': 'applicant_pob',
    'plec': 'applicant_sex',
    'obecne_obywatelstwo': 'applicant_current_citizenship',
    'pesel_wniosko': 'applicant_pesel',
    
    // Applicant marriage
    'dzien_malz_wniosko': 'date_of_marriage.day',
    'miesiac_malz_wniosko': 'date_of_marriage.month',
    'rok_malz_wniosko': 'date_of_marriage.year',
    'miejsce_malz_wniosko': 'place_of_marriage',
    
    // Mother
    'imie_matki': 'mother_first_name',
    'nazwisko_matki': 'mother_last_name',
    'nazwisko_rodowe_matki': 'mother_maiden_name',
    'dzien_uro_matki': 'mother_dob.day',
    'miesiac_uro_matki': 'mother_dob.month',
    'rok_uro_matki': 'mother_dob.year',
    'miejsce_uro_matki': 'mother_pob',
    'pesel_matki': 'mother_pesel',
    'zyciorys_matki': 'mother_notes',
    
    // Father
    'imie_ojca': 'father_first_name',
    'nazwisko_ojca': 'father_last_name',
    'dzien_uro_ojca': 'father_dob.day',
    'miesiac_uro_ojca': 'father_dob.month',
    'rok_uro_ojca': 'father_dob.year',
    'miejsce_uro_ojca': 'father_pob',
    'pesel_ojca': 'father_pesel',
    'zyciorys_ojca': 'father_notes',
    
    // Parents marriage
    'dzien_malz_rodzicow': 'father_mother_marriage_date.day',
    'miesiac_malz_rodzicow': 'father_mother_marriage_date.month',
    'rok_malz_rodzicow': 'father_mother_marriage_date.year',
    'miejsce_malz_rodzicow': 'father_mother_marriage_place',
    
    // Maternal Grandfather (MGF)
    'imie_dziadka_m': 'mgf_first_name',
    'nazwisko_dziadka_m': 'mgf_last_name',
    'dzien_uro_dziadka_m': 'mgf_dob.day',
    'miesiac_uro_dziadka_m': 'mgf_dob.month',
    'rok_uro_dziadka_m': 'mgf_dob.year',
    'miejsce_uro_dziadka_m': 'mgf_pob',
    'pesel_dziadka_m': 'mgf_pesel',
    'zyciorys_dziadka_m': 'mgf_notes',
    
    // Maternal Grandmother (MGM)
    'imie_babki_m': 'mgm_first_name',
    'nazwisko_babki_m': 'mgm_last_name',
    'nazwisko_rodowe_babki_m': 'mgm_maiden_name',
    'dzien_uro_babki_m': 'mgm_dob.day',
    'miesiac_uro_babki_m': 'mgm_dob.month',
    'rok_uro_babki_m': 'mgm_dob.year',
    'miejsce_uro_babki_m': 'mgm_pob',
    'pesel_babki_m': 'mgm_pesel',
    'zyciorys_babki_m': 'mgm_notes',
    
    // Maternal grandparents marriage
    'dzien_malz_dziadkow_m': 'mgf_mgm_marriage_date.day',
    'miesiac_malz_dziadkow_m': 'mgf_mgm_marriage_date.month',
    'rok_malz_dziadkow_m': 'mgf_mgm_marriage_date.year',
    'miejsce_malz_dziadkow_m': 'mgf_mgm_marriage_place',
    
    // Paternal Grandfather (PGF)
    'imie_dziadka_o': 'pgf_first_name',
    'nazwisko_dziadka_o': 'pgf_last_name',
    'dzien_uro_dziadka_o': 'pgf_dob.day',
    'miesiac_uro_dziadka_o': 'pgf_dob.month',
    'rok_uro_dziadka_o': 'pgf_dob.year',
    'miejsce_uro_dziadka_o': 'pgf_pob',
    'pesel_dziadka_o': 'pgf_pesel',
    'zyciorys_dziadka_o': 'pgf_notes',
    
    // Paternal Grandmother (PGM)
    'imie_babki_o': 'pgm_first_name',
    'nazwisko_babki_o': 'pgm_last_name',
    'nazwisko_rodowe_babki_o': 'pgm_maiden_name',
    'dzien_uro_babki_o': 'pgm_dob.day',
    'miesiac_uro_babki_o': 'pgm_dob.month',
    'rok_uro_babki_o': 'pgm_dob.year',
    'miejsce_uro_babki_o': 'pgm_pob',
    'pesel_babki_o': 'pgm_pesel',
    'zyciorys_babki_o': 'pgm_notes',
    
    // Paternal grandparents marriage
    'dzien_malz_dziadkow_o': 'pgf_pgm_marriage_date.day',
    'miesiac_malz_dziadkow_o': 'pgf_pgm_marriage_date.month',
    'rok_malz_dziadkow_o': 'pgf_pgm_marriage_date.year',
    'miejsce_malz_dziadkow_o': 'pgf_pgm_marriage_place',
    
    // Applicant biographical notes
    'zyciorys_wniosko': 'applicant_notes',
  },
  // 'registration': { // Template not yet uploaded to storage
  //   'applicant_given_names': 'applicant_first_name',
  //   'applicant_surname': 'applicant_last_name',
  //   'applicant_date_of_birth': 'applicant_dob',
  //   'applicant_place_of_birth': 'applicant_pob',
  //   'applicant_email': 'applicant_email',
  //   'applicant_phone': 'applicant_phone',
  //   'applicant_passport_number': 'applicant_passport_number',
  //   'document_type': 'document_type',
  //   'document_issue_place': 'document_issue_place',
  //   'document_issue_date': 'document_issue_date',
  //   'usc_office_name': 'usc_office_name',
  //   'usc_office_address': 'usc_office_address',
  // },
  'transcription': {
    // Pages 1-2: Transcription request (ACTUAL PDF field names)
    'foreign_act_place': 'foreign_country',
    'name_on_act': 'applicant_first_name|applicant_last_name',
    'event_place': 'birth_city|birth_country',
    'event_date': 'birth_date',
    
    // Checkboxes for attachments
    'original_with_translation': '__CHECKBOX_TRUE__',
    'tax_payment_proof': '__CHECKBOX_TRUE__',
    'power_of_attorney': '__CHECKBOX_POA__',
    'passport_copy': '__CHECKBOX_PASSPORT__',
    
    // Delivery method
    'send_to_attorney': '__CHECKBOX_TRUE__',
    
    // Signature
    'applicant_signature': 'applicant_signature',
    
    // Pickup date
    'pickup_date': 'document_pickup_date',
    
    // Page 3: Supplementation request
    'birth_act_office': '__USC_DEFAULT__',
    'birth_act_number': 'birth_certificate_number',
    'birth_act_year': 'birth_year',
    'father_maiden_name': 'father_last_name',
    'mother_maiden_name': 'mother_maiden_name',
    'supplementation_source_office': 'source_registry',
  },
  'family-tree': {
    // Applicant info
    'applicant_full_name': 'applicant_first_name|applicant_last_name',
    'applicant_date_of_birth': 'applicant_dob',
    'applicant_place_of_birth': 'applicant_pob',
    'applicant_date_of_marriage': 'date_of_marriage',
    'applicant_place_of_marriage': 'place_of_marriage',
    
    // Applicant spouse
    'applicant_spouse_full_name_and_maiden_name': 'spouse_first_name|spouse_last_name',
    
    // Polish parent
    'polish_parent_full_name': 'father_first_name|father_last_name',
    'polish_parent_spouse_full_name': 'mother_first_name|mother_maiden_name',
    'polish_parent_date_of_birth': 'father_dob',
    'polish_parent_place_of_birth': 'father_pob',
    'polish_parent_date_of_marriage': 'father_mother_marriage_date',
    'polish_parent_place_of_marriage': 'father_mother_marriage_place',
    'polish_parent_date_of_emigration': 'father_date_of_emigration',
    'polish_parent_date_of_naturalization': 'father_date_of_naturalization',
    
    // Polish grandparent
    'polish_grandparent_full_name': 'pgf_first_name|pgf_last_name',
    'polish_grandparent_spouse_full_name': 'pgm_first_name|pgm_maiden_name',
    'polish_grandparent_date_of_birth': 'pgf_dob',
    'polish_grandparent_place_of_birth': 'pgf_pob',
    'polish_grandparent_date_of_mariage': 'pgf_pgm_marriage_date',
    'polish_grandparent_place_of_mariage': 'pgf_pgm_marriage_place',
    'polish_grandparent_date_of_emigration': 'pgf_date_of_emigration',
    'polish_grandparent_date_of_naturalization': 'pgf_date_of_naturalization',
    
    // Great-grandparents
    'great_grandfather_full_name': 'pggf_first_name|pggf_last_name',
    'great_grandmother_full_name': 'pggm_first_name|pggm_maiden_name',
    'great_grandfather_date_of_birth': 'pggf_dob',
    'great_grandfather_place_of_birth': 'pggf_pob',
    'great_grandfather_date_of_marriage': 'pggf_pggm_marriage_date',
    'great_grandfather_place_of_marriage': 'pggf_pggm_marriage_place',
    'great_grandfather_date_of_emigartion': 'pggf_date_of_emigration',
    'great_grandfather_date_of_naturalization': 'pggf_date_of_naturalization',
    
    // Minor children
    'minor_1_full_name': 'child_1_first_name|child_1_last_name',
    'minor_1_date_of_birth': 'child_1_dob',
    'minor_1_place_of_birth': 'child_1_pob',
    'minor_2_full_name': 'child_2_first_name|child_2_last_name',
    'minor_2_date_of_birth': 'child_2_dob',
    'minor_2_place_of_birth': 'child_2_pob',
    'minor_3_full_name': 'child_3_first_name|child_3_last_name',
    'minor_3_date_of_birth': 'child_3_dob',
    'minor_3_place_of_birth': 'child_3_pob',
  }
};

// Helper: Smart field value resolver
function resolveFieldValue(dbColumnName: string, masterData: any): string | null {
  // Special checkbox values
  if (dbColumnName === '__CHECKBOX_TRUE__') return '✓';
  if (dbColumnName === '__CHECKBOX_POA__') return masterData?.poa_signed_at ? '✓' : '';
  if (dbColumnName === '__CHECKBOX_PASSPORT__') return masterData?.passport_number ? '✓' : '';
  if (dbColumnName === '__USC_DEFAULT__') return 'Urząd Stanu Cywilnego m.st Warszawa';
  
  // Date splitting (e.g., "applicant_dob.day")
  if (dbColumnName.includes('.') && ['day', 'month', 'year'].some(p => dbColumnName.endsWith('.' + p))) {
    const [fieldName, datePart] = dbColumnName.split('.');
    const dateValue = masterData?.[fieldName];
    if (!dateValue) return null;
    
    try {
      // Handle both ISO (YYYY-MM-DD) and DD.MM.YYYY formats
      let date: Date;
      if (dateValue.includes('.')) {
        const [day, month, year] = dateValue.split('.');
        date = new Date(`${year}-${month}-${day}`);
      } else {
        date = new Date(dateValue);
      }
      
      if (isNaN(date.getTime())) return null;
      
      if (datePart === 'day') return String(date.getDate()).padStart(2, '0');
      if (datePart === 'month') return String(date.getMonth() + 1).padStart(2, '0');
      if (datePart === 'year') return String(date.getFullYear());
    } catch {
      return null;
    }
  }
  
  // Concatenation (e.g., "first_name|last_name")
  if (dbColumnName.includes('|')) {
    const parts = dbColumnName.split('|');
    const values = parts
      .map(part => masterData?.[part?.trim()])
      .filter(v => v != null && v !== '');
    return values.length > 0 ? values.join(' ') : null;
  }
  
  // Nested objects (e.g., "applicant_address.city")
  if (dbColumnName.includes('.') && !['day','month','year'].some(p => dbColumnName.endsWith('.' + p))) {
    const parts = dbColumnName.split('.');
    let value: any = masterData;
    for (const part of parts) {
      value = value?.[part];
      if (value == null) return null;
    }
    return String(value);
  }
  
  // Direct lookup
  const value = masterData?.[dbColumnName];
  return value != null && value !== '' ? String(value) : null;
}

// Helper: Count children in master data
function countChildren(data: any): number {
  let count = 0;
  for (let i = 1; i <= 10; i++) {
    if (data[`child_${i}_first_name`] || data[`child_${i}_last_name`]) {
      count++;
    }
  }
  return count;
}

// Helper: Fill non-Polish family fields with "NIE DOTYCZY"
function fillNonPolishFieldsWithNieDotczyca(form: any, masterData: any): void {
  const NIE_DOTYCZY = 'NIE DOTYCZY';
  const fatherIsPolish = masterData.father_is_polish === true;
  const motherIsPolish = masterData.mother_is_polish === true;

  console.log('[pdf-simple] NIE DOTYCZY mode:', { fatherIsPolish, motherIsPolish });

  // If father is Polish → fill mother's side with NIE DOTYCZY
  if (fatherIsPolish && !motherIsPolish) {
    console.log('[pdf-simple] Father Polish → Filling maternal side with NIE DOTYCZY');
    const maternalFields = [
      'dzien_uro_matki', 'miesiac_uro_matki', 'rok_uro_matki', 'miejsce_uro_matki',
      'pesel_matki', 'zyciorys_matki', 'uzywane_nazwiska_matki',
      'dzien_uro_dziadka_m', 'miesiac_uro_dziadka_m', 'rok_uro_dziadka_m', 'miejsce_uro_dziadka_m',
      'pesel_dziadka_m', 'zyciorys_dziadka_m', 'posiadane_obywatel_matki_uro_wniosko',
      'dzien_uro_babki_m', 'miesiac_uro_babki_m', 'rok_uro_babki_m', 'miejsce_uro_babki_m',
      'pesel_babki_m', 'zyciorys_babki_m',
    ];
    fillFieldsWithValue(form, maternalFields, NIE_DOTYCZY);
  }

  // If mother is Polish → fill father's side with NIE DOTYCZY
  if (motherIsPolish && !fatherIsPolish) {
    console.log('[pdf-simple] Mother Polish → Filling paternal side with NIE DOTYCZY');
    const paternalFields = [
      'dzien_uro_ojca', 'miesiac_uro_ojca', 'rok_uro_ojca', 'miejsce_uro_ojca',
      'pesel_ojca', 'zyciorys_ojca', 'uzywane_nazwiska_ojca',
      'dzien_uro_dziadka_o', 'miesiac_uro_dziadka_o', 'rok_uro_dziadka_o', 'miejsce_uro_dziadka_o',
      'pesel_dziadka_o', 'zyciorys_dziadka_o', 'posiadane_obywatel_ojca_uro_wniosko',
      'dzien_uro_babki_o', 'miesiac_uro_babki_o', 'rok_uro_babki_o', 'miejsce_uro_babki_o',
      'pesel_babki_o', 'zyciorys_babki_o',
    ];
    fillFieldsWithValue(form, paternalFields, NIE_DOTYCZY);
  }
}

// Helper: Fill multiple fields with the same value
function fillFieldsWithValue(form: any, fieldNames: string[], value: string): void {
  for (const fieldName of fieldNames) {
    try {
      const field = form.getTextField(fieldName);
      field.setText(value);
    } catch (e) {
      // Field doesn't exist or can't be filled - skip
    }
  }
}

// Helper: Fill PDF template with data
async function fillTemplate(
  templatePath: string,
  fieldMap: Record<string, string>,
  data: any,
  supabase: any,
  childIndex?: number
): Promise<Uint8Array> {
  const { data: templateBlob, error } = await supabase.storage
    .from('pdf-templates')
    .download(templatePath);
  
  if (error || !templateBlob) throw new Error(`Failed to load ${templatePath}`);
  
  const templateBytes = new Uint8Array(await templateBlob.arrayBuffer());
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();
  
  // PDF FONT STANDARD: Only for POA templates
  const isPOA = templatePath.includes('poa-');
  let boldFont: any;
  let regularFont: any;
  
  if (isPOA) {
    boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  }
  
    for (const field of form.getFields()) {
      try {
        const fieldName = field.getName();
        let dbColumnName = fieldMap[fieldName] || fieldName;
      
        // Handle child-specific fields
        if (childIndex !== undefined) {
          if (dbColumnName === '__CHILD_FIRST_NAME__') {
            dbColumnName = `child_${childIndex}_first_name`;
          } else if (dbColumnName === '__CHILD_LAST_NAME__') {
            dbColumnName = `child_${childIndex}_last_name`;
          }
        }
      
        // Handle pipe-separated field concatenation (e.g., "first_name|last_name")
        let value;
        if (dbColumnName.includes('|')) {
          const parts = dbColumnName.split('|');
          const values = parts
            .map(part => data[part])
            .filter(v => v != null && v !== '');
          value = values.length > 0 ? values.join(' ') : null;
        } else {
          value = data[dbColumnName];
        }
      
        // Auto-fill POA date with current date if not set
        const isDateField = fieldName === 'poa_date' || fieldName.includes('date');
        
        if (fieldName === 'poa_date' && (value == null || value === '')) {
          const today = new Date();
          value = today.toLocaleDateString('en-GB'); // DD/MM/YYYY format
        }
      
        if (value != null && value !== '') {
          const textField = form.getTextField(fieldName);
          textField.setText(String(value));
          
          // Apply PDF FONT standard for ALL templates (not just POA)
          if (isDateField && regularFont) {
            // Date fields: regular (non-bold) font, same size as other fields
            textField.updateAppearances(regularFont);
            textField.setFontSize(0); // Auto-size to fit field (same as other fields)
            textField.defaultUpdateAppearances(regularFont);
          } else if (boldFont && isPOA) {
            // Non-date fields in POA: bold font, auto-size
            textField.updateAppearances(boldFont);
            textField.setFontSize(0); // 0 = auto-size to fit field
            textField.defaultUpdateAppearances(boldFont);
          }
        }
      } catch (e) {
        // Skip fields we can't fill
      }
    }
  
  return await pdfDoc.save();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const { caseId, templateType } = await req.json();
    console.log(`[pdf-simple] START: ${templateType} for case ${caseId}`);

    // Validate inputs
    if (!templateType) {
      throw new Error('Missing templateType');
    }

    // Initialize Supabase (single initialization for entire function)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get master data
    console.log('[pdf-simple] Fetching master data...');
    const { data: masterData } = await supabase
      .from('master_table')
      .select('*')
      .eq('case_id', caseId)
      .maybeSingle();

    const dataToUse = masterData || {};
    console.log('[pdf-simple] Data status:', 
      masterData 
        ? `Found data with ${Object.keys(masterData).filter(k => masterData[k] != null).length} filled fields` 
        : 'No data - generating blank PDF'
    );

    // AUTO-POPULATE: For male applicants, auto-fill husband_last_name_after_marriage
    if (dataToUse.applicant_sex === 'Male' && dataToUse.applicant_last_name) {
      if (!dataToUse.husband_last_name_after_marriage) {
        dataToUse.husband_last_name_after_marriage = dataToUse.applicant_last_name;
        console.log('[pdf-simple] Auto-populated husband_last_name_after_marriage:', dataToUse.applicant_last_name);
      }
    }

    // Handle POA-COMBINED special case: dynamic assembly
    if (templateType === 'poa-combined') {
      console.log('[pdf-simple] Dynamic assembly mode: POA-COMBINED');
      
      // Use actual minor_children_count from database instead of counting all children
      const childCount = dataToUse.minor_children_count || 0;
      console.log(`[pdf-simple] Minor children count: ${childCount}`);
      
      // Create final PDF
      const finalPdf = await PDFDocument.create();
      let totalFilled = 0;
      let totalFields = 0;
      
      // 1. Add Adult POA
      const adultBytes = await fillTemplate('poa-adult.pdf', FIELD_MAPS['poa-adult'], dataToUse, supabase);
      const adultPdf = await PDFDocument.load(adultBytes);
      const adultPages = await finalPdf.copyPages(adultPdf, adultPdf.getPageIndices());
      adultPages.forEach(page => finalPdf.addPage(page));
      totalFields += adultPdf.getForm().getFields().length;
      
      // 2. Add Minor POA for each child
      for (let i = 1; i <= childCount; i++) {
        console.log(`[pdf-simple] Adding Minor POA for child ${i}`);
        const minorBytes = await fillTemplate('poa-minor.pdf', FIELD_MAPS['poa-minor'], dataToUse, supabase, i);
        const minorPdf = await PDFDocument.load(minorBytes);
        const minorPages = await finalPdf.copyPages(minorPdf, minorPdf.getPageIndices());
        minorPages.forEach(page => finalPdf.addPage(page));
        totalFields += minorPdf.getForm().getFields().length;
      }
      
      // 3. Add Spouses POA (if spouse data exists)
      if (dataToUse.spouse_first_name || dataToUse.spouse_last_name) {
        console.log('[pdf-simple] Adding Spouses POA');
        const spousesBytes = await fillTemplate('poa-spouses.pdf', FIELD_MAPS['poa-spouses'], dataToUse, supabase);
        const spousesPdf = await PDFDocument.load(spousesBytes);
        const spousesPages = await finalPdf.copyPages(spousesPdf, spousesPdf.getPageIndices());
        spousesPages.forEach(page => finalPdf.addPage(page));
        totalFields += spousesPdf.getForm().getFields().length;
      }
      
      const pdfBytes = await finalPdf.save();
      
      // Upload
      const filename = `poa-combined-${caseId}-${Date.now()}.pdf`;
      const uploadPath = `generated/${filename}`;
      
      console.log('[pdf-simple] Uploading assembled PDF:', uploadPath);
      const { error: uploadError } = await supabase.storage
        .from('pdf-outputs')
        .upload(uploadPath, pdfBytes, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: signedData, error: signError } = await supabase.storage
        .from('pdf-outputs')
        .createSignedUrl(uploadPath, 3600);

      if (signError) throw signError;

      const duration = Date.now() - startTime;
      console.log(`[pdf-simple] SUCCESS in ${duration}ms: ${signedData.signedUrl}`);

      return new Response(
        JSON.stringify({
          success: true,
          url: signedData.signedUrl,
          fieldsFilledCount: totalFilled,
          totalFields: totalFields,
          fillRate: totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0,
          duration,
          filename,
          pages: 1 + childCount + (dataToUse.spouse_first_name ? 1 : 0)
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Standard single-template generation
    const templatePath = TEMPLATE_PATHS[templateType];
    if (!templatePath) {
      throw new Error(`Unknown template type: ${templateType}`);
    }

    // Step 2: Download template
    console.log('[pdf-simple] Downloading template:', templatePath);
    const { data: templateBlob, error: downloadError } = await supabase.storage
      .from('pdf-templates')
      .download(templatePath);

    if (downloadError) {
      console.error('[pdf-simple] Template download failed:', {
        templatePath,
        error: downloadError,
        message: downloadError.message,
        statusCode: (downloadError as any).statusCode
      });
      throw new Error(`Template "${templatePath}" not found in storage. Please upload the template file.`);
    }
    if (!templateBlob) {
      throw new Error(`Template "${templatePath}" not found in storage`);
    }

    // Step 3: Load and fill PDF
    console.log('[pdf-simple] Loading PDF...');
    const templateBytes = new Uint8Array(await templateBlob.arrayBuffer());
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`[pdf-simple] Found ${fields.length} fields in template`);

    // Get field mapping for this template
    const fieldMap = FIELD_MAPS[templateType] || {};
    let filledCount = 0;

    // Apply NIE DOTYCZY strategy for citizenship PDFs
    if (templateType === 'citizenship' && masterData) {
      fillNonPolishFieldsWithNieDotczyca(form, masterData);
    }

    // PDF FONT STANDARD: Only for POA templates
    const isPOA = templateType.startsWith('poa-');
    let font;
    if (isPOA) {
      font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }

    // Fill fields using smart resolver
    for (const field of fields) {
      try {
        const fieldName = field.getName();
        
        // Get database column name from mapping (PDF field → DB column)
        const dbColumnName = fieldMap[fieldName] || fieldName;
        
        // Use smart resolver for complex mappings
        let value = resolveFieldValue(dbColumnName, masterData);

        // Auto-fill POA date with current date if not set
        if (fieldName === 'poa_date' && (value == null || value === '')) {
          const today = new Date();
          value = today.toLocaleDateString('en-GB'); // DD/MM/YYYY format
          console.log(`[pdf-simple] Auto-filled poa_date with: ${value}`);
        }

        if (value != null && value !== '') {
          const textField = form.getTextField(fieldName);
          textField.setText(String(value));
          
          // Apply PDF FONT standard ONLY for POA templates
          if (isPOA && font) {
            textField.updateAppearances(font);
            textField.setFontSize(0); // 0 = auto-size to fit field
            textField.defaultUpdateAppearances(font);
          }
          
          filledCount++;
        }
      } catch (e) {
        // Skip fields we can't fill (might be checkbox or other non-text field)
        console.log(`[pdf-simple] Skipped field: ${field.getName()}`);
      }
    }

    console.log(`[pdf-simple] Filled ${filledCount}/${fields.length} fields`);

    // Step 4: Save PDF
    const pdfBytes = await pdfDoc.save();
    
    // Step 5: Upload to storage
    const filename = `${templateType}-${caseId}-${Date.now()}.pdf`;
    const uploadPath = `generated/${filename}`;
    
    console.log('[pdf-simple] Uploading PDF:', uploadPath);
    const { error: uploadError } = await supabase.storage
      .from('pdf-outputs')
      .upload(uploadPath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Step 6: Get signed URL (valid for 1 hour)
    const { data: signedData, error: signError } = await supabase.storage
      .from('pdf-outputs')
      .createSignedUrl(uploadPath, 3600);

    if (signError) throw signError;

    const duration = Date.now() - startTime;
    console.log(`[pdf-simple] SUCCESS in ${duration}ms: ${signedData.signedUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        url: signedData.signedUrl,
        fieldsFilledCount: filledCount,
        totalFields: fields.length,
        fillRate: Math.round((filledCount / fields.length) * 100),
        duration,
        filename
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[pdf-simple] ERROR after', duration, 'ms:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        duration
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
