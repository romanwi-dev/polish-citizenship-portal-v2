import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

// Import PDF field mappings
try {
  console.log('Loading PDF mappings...');
} catch (e) {
  console.error('Error loading mappings:', e);
}

import { POA_ADULT_PDF_MAP } from './mappings/poaAdult.ts';
import { POA_MINOR_PDF_MAP } from './mappings/poaMinor.ts';
import { POA_SPOUSES_PDF_MAP } from './mappings/poaSpouses.ts';
import { CITIZENSHIP_PDF_MAP } from './mappings/citizenship.ts';
import { FAMILY_TREE_PDF_MAP } from './mappings/familyTree.ts';
import { UMIEJSCOWIENIE_PDF_MAP } from './mappings/umiejscowienie.ts';
import { UZUPELNIENIE_PDF_MAP } from './mappings/uzupelnienie.ts';

console.log('✅ All PDF mappings loaded successfully');

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

const fillPDFFields = async (
  pdfDoc: any,
  form: any,
  data: any,
  fieldMap: Record<string, string>
): Promise<FillResult> => {
  const result: FillResult = {
    totalFields: 0,
    filledFields: 0,
    emptyFields: [],
    errors: [],
  };

  // Fetch and embed Unicode font that supports Polish characters
  let unicodeFont;
  try {
    const fontUrl = 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.ttf';
    const fontResponse = await fetch(fontUrl);
    const fontBytes = await fontResponse.arrayBuffer();
    unicodeFont = await pdfDoc.embedFont(fontBytes);
    console.log('✅ Unicode font embedded (supports Polish characters)');
  } catch (error) {
    console.warn('⚠️ Could not embed Unicode font, falling back to standard font:', error);
    unicodeFont = null;
  }

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
          // Apply Unicode font if embedded successfully
          if (unicodeFont) {
            try {
              textField.updateAppearances(unicodeFont);
            } catch (e) {
              console.warn(`Could not apply Unicode font to ${pdfFieldName}`);
            }
          }
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

// ============ MAIN EDGE FUNCTION ============

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, templateType, preview = false } = await req.json();
    
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
      const fillResult = await fillPDFFields(pdfDoc, form, masterData, fieldMap);
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

    // Only flatten for final downloads, keep editable for preview
    if (!preview) {
      form.flatten();
    }
    
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
