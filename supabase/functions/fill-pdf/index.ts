import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

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
                         !lower.includes('given') &&
                         !lower.includes('surname') &&
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
      let rawValue;
      
      if (isFullNameField(pdfFieldName)) {
        const { firstName, lastName } = extractNameComponents(data, dbColumn);
        rawValue = `${firstName} ${lastName}`.trim();
      } 
      else if (dbColumn.endsWith('_first_name') || dbColumn.endsWith('_given_names')) {
        const { firstName, lastName } = extractNameComponents(data, dbColumn);
        if (firstName && lastName) {
          rawValue = `${firstName} ${lastName}`.trim();
        } else {
          rawValue = getNestedValue(data, dbColumn);
        }
      }
      else {
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

// ============ PDF FIELD MAPPINGS ============

const POA_ADULT_PDF_MAP: Record<string, string> = {
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'applicant_sex': 'applicant_sex',
  'applicant_date_of_birth': 'applicant_dob',
  'applicant_place_of_birth': 'applicant_pob',
  'passport_number': 'applicant_passport_number',
  'passport_expiry_date': 'applicant_passport_expiry_date',
  'applicant_email': 'applicant_email',
  'applicant_phone': 'applicant_phone',
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
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'spouse_given_names': 'spouse_first_name',
  'spouse_surname': 'spouse_last_name',
  'passport_number': 'applicant_passport_number',
  'spouse_passport_number': 'spouse_passport_number',
  'husband_surname': 'applicant_last_name',
  'wife_surname': 'spouse_last_name',
  'minor_surname': 'child_1_last_name',
};

const CITIZENSHIP_PDF_MAP: Record<string, string> = {
  'applicant_full_name': 'applicant_first_name',
  'applicant_sex': 'applicant_sex',
  'applicant_date_of_birth': 'applicant_dob',
  'applicant_place_of_birth': 'applicant_pob',
  'father_full_name': 'father_first_name',
  'father_date_of_birth': 'father_dob',
  'father_place_of_birth': 'father_pob',
  'mother_full_name': 'mother_first_name',
  'mother_maiden_name': 'mother_maiden_name',
  'mother_date_of_birth': 'mother_dob',
  'mother_place_of_birth': 'mother_pob',
  'submission_date': 'submission_date',
  'submission_location': 'submission_location',
  'representative_full_name': 'representative_full_name',
  'representative_address': 'representative_address',
  'representative_phone': 'representative_phone',
  'representative_email': 'representative_email',
};

const FAMILY_TREE_PDF_MAP: Record<string, string> = {
  'applicant_full_name': 'applicant_first_name',
  'applicant_date_of_birth': 'applicant_dob',
  'applicant_place_of_birth': 'applicant_pob',
  'applicant_date_of_marriage': 'date_of_marriage',
  'applicant_place_of_marriage': 'place_of_marriage',
  'applicant_spouse_full_name': 'spouse_first_name',
  'spouse_date_of_birth': 'spouse_dob',
  'spouse_place_of_birth': 'spouse_pob',
  'minor_1_full_name': 'child_1_first_name',
  'minor_1_date_of_birth': 'child_1_dob',
  'minor_1_place_of_birth': 'child_1_pob',
  'minor_2_full_name': 'child_2_first_name',
  'minor_2_date_of_birth': 'child_2_dob',
  'minor_2_place_of_birth': 'child_2_pob',
  'minor_3_full_name': 'child_3_first_name',
  'minor_3_date_of_birth': 'child_3_dob',
  'minor_3_place_of_birth': 'child_3_pob',
  'father_full_name': 'father_first_name',
  'father_date_of_birth': 'father_dob',
  'father_place_of_birth': 'father_pob',
  'father_date_of_marriage': 'father_mother_marriage_date',
  'father_place_of_marriage': 'father_mother_marriage_place',
  'father_date_of_emigration': 'father_date_of_emigration',
  'father_date_of_naturalization': 'father_date_of_naturalization',
  'polish_parent_place_of_marriage': 'father_mother_marriage_place',
  'polish_parent_spouse_full_name': 'mother_first_name',
  'mother_full_name': 'mother_first_name',
  'mother_maiden_name': 'mother_maiden_name',
  'mother_date_of_birth': 'mother_dob',
  'mother_place_of_birth': 'mother_pob',
  'mother_date_of_emigration': 'mother_date_of_emigration',
  'mother_date_of_naturalization': 'mother_date_of_naturalization',
  'pgf_full_name': 'pgf_first_name',
  'pgf_date_of_birth': 'pgf_dob',
  'pgf_place_of_birth': 'pgf_pob',
  'pgf_date_of_marriage': 'pgf_pgm_marriage_date',
  'pgf_place_of_marriage': 'pgf_pgm_marriage_place',
  'pgf_date_of_emigration': 'pgf_date_of_emigration',
  'pgf_date_of_naturalization': 'pgf_date_of_naturalization',
  'polish_grandparent_date_of_marriage': 'pgf_pgm_marriage_date',
  'pgm_full_name': 'pgm_first_name',
  'pgm_maiden_name': 'pgm_maiden_name',
  'pgm_date_of_birth': 'pgm_dob',
  'pgm_place_of_birth': 'pgm_pob',
  'pgm_date_of_emigration': 'pgm_date_of_emigration',
  'pgm_date_of_naturalization': 'pgm_date_of_naturalization',
  'mgf_full_name': 'mgf_first_name',
  'mgf_date_of_birth': 'mgf_dob',
  'mgf_place_of_birth': 'mgf_pob',
  'mgf_date_of_marriage': 'mgf_mgm_marriage_date',
  'mgf_place_of_marriage': 'mgf_mgm_marriage_place',
  'mgf_date_of_emigration': 'mgf_date_of_emigration',
  'mgf_date_of_naturalization': 'mgf_date_of_naturalization',
  'mgm_full_name': 'mgm_first_name',
  'mgm_maiden_name': 'mgm_maiden_name',
  'mgm_date_of_birth': 'mgm_dob',
  'mgm_place_of_birth': 'mgm_pob',
  'mgm_date_of_emigration': 'mgm_date_of_emigration',
  'mgm_date_of_naturalization': 'mgm_date_of_naturalization',
  'pggf_full_name': 'pggf_first_name',
  'pggf_date_of_birth': 'pggf_dob',
  'pggf_place_of_birth': 'pggf_pob',
  'pggf_date_of_marriage': 'pggf_pggm_marriage_date',
  'pggf_place_of_marriage': 'pggf_pggm_marriage_place',
  'pggf_date_of_emigration': 'pggf_date_of_emigration',
  'pggf_date_of_naturalization': 'pggf_date_of_naturalization',
  'mggf_full_name': 'mggf_first_name',
  'mggf_date_of_birth': 'mggf_dob',
  'mggf_place_of_birth': 'mggf_pob',
  'mggf_date_of_marriage': 'mggf_mggm_marriage_date',
  'mggf_place_of_marriage': 'mggf_mggm_marriage_place',
  'mggf_date_of_emigration': 'mggf_date_of_emigration',
  'mggf_date_of_naturalization': 'mggf_date_of_naturalization',
  'pggm_full_name': 'pggm_first_name',
  'pggm_maiden_name': 'pggm_maiden_name',
  'pggm_date_of_birth': 'pggm_dob',
  'pggm_place_of_birth': 'pggm_pob',
  'pggm_date_of_emigration': 'pggm_date_of_emigration',
  'pggm_date_of_naturalization': 'pggm_date_of_naturalization',
  'mggm_full_name': 'mggm_first_name',
  'mggm_maiden_name': 'mggm_maiden_name',
  'mggm_date_of_birth': 'mggm_dob',
  'mggm_place_of_birth': 'mggm_pob',
  'mggm_date_of_emigration': 'mggm_date_of_emigration',
  'mggm_date_of_naturalization': 'mggm_date_of_naturalization',
};

const UMIEJSCOWIENIE_PDF_MAP: Record<string, string> = {
  'applicant_first_name': 'applicant_first_name',
  'applicant_last_name': 'applicant_last_name',
  'applicant_date_of_birth': 'applicant_dob',
  'applicant_place_of_birth': 'applicant_pob',
  'father_first_name': 'father_first_name',
  'father_last_name': 'father_last_name',
  'mother_first_name': 'mother_first_name',
  'mother_last_name': 'mother_last_name',
  'mother_maiden_name': 'mother_maiden_name',
  'birth_act_location': 'birth_act_location',
  'birth_act_year': 'birth_act_year',
  'birth_act_number': 'birth_act_number',
  'representative_full_name': 'representative_full_name',
  'representative_address': 'representative_address',
  'representative_email': 'representative_email',
  'representative_phone': 'representative_phone',
  'submission_date': 'submission_date',
};

const UZUPELNIENIE_PDF_MAP: Record<string, string> = {
  'applicant_first_name': 'applicant_first_name',
  'applicant_last_name': 'applicant_last_name',
  'applicant_date_of_birth': 'applicant_dob',
  'applicant_place_of_birth': 'applicant_pob',
  'father_first_name': 'father_first_name',
  'father_last_name': 'father_last_name',
  'mother_first_name': 'mother_first_name',
  'mother_last_name': 'mother_last_name',
  'mother_maiden_name': 'mother_maiden_name',
  'polish_birth_act_number': 'polish_birth_act_number',
  'foreign_act_location': 'foreign_act_location',
  'representative_full_name': 'representative_full_name',
  'representative_address': 'representative_address',
  'representative_email': 'representative_email',
  'representative_phone': 'representative_phone',
  'submission_date': 'submission_date',
};

// ============ MAIN EDGE FUNCTION ============

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, templateType } = await req.json();
    
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

    const templatePath = `./templates/${templateType}.pdf`;
    let pdfBytes: Uint8Array;
    
    try {
      pdfBytes = await Deno.readFile(templatePath);
      console.log(`✅ Template loaded: ${templatePath} (${pdfBytes.length} bytes)`);
    } catch (error) {
      console.error(`❌ Template not found: ${templatePath}`, error);
      throw new Error(`Template file not found: ${templateType}.pdf`);
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
      
      console.log(`✅ PDF Complete for ${templateType}`);
      console.log(`   Total: ${fillResult.totalFields} | Filled: ${fillResult.filledFields} | Coverage: ${coverage}%`);
      
      if (fillResult.emptyFields.length > 0 && fillResult.emptyFields.length <= 5) {
        console.log(`   Empty: ${fillResult.emptyFields.join(', ')}`);
      }
      
      if (fillResult.errors.length > 0) {
        console.warn(`   ⚠️ Errors: ${fillResult.errors.length}`);
        fillResult.errors.slice(0, 3).forEach(err => {
          console.warn(`     - ${err.field}: ${err.error}`);
        });
      }
    }

    form.flatten();
    
    const filledPdfBytes = await pdfDoc.save();
    
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
