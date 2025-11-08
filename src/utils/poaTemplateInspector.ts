import { PDFDocument } from 'pdf-lib';

export interface POAFieldInfo {
  name: string;
  type: string;
  value?: string;
}

export interface POAInspectionResult {
  templateType: string;
  totalFields: number;
  fields: POAFieldInfo[];
  timestamp: string;
}

/**
 * POA PDF Template Inspector
 * Extracts all form fields from POA PDF templates
 */
export async function inspectPOATemplate(
  templateType: 'poa-adult' | 'poa-minor' | 'poa-spouses'
): Promise<POAInspectionResult> {
  try {
    console.log(`[POA Inspector] Loading ${templateType}.pdf from /templates/`);
    
    // Fetch PDF from public folder
    const response = await fetch(`/templates/${templateType}.pdf`);
    
    if (!response.ok) {
      throw new Error(`Failed to load ${templateType}.pdf: ${response.statusText}`);
    }
    
    const pdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    const fieldInfo: POAFieldInfo[] = fields.map(field => {
      const name = field.getName();
      const type = field.constructor.name;
      
      // Try to get current value
      let value: string | undefined;
      try {
        if (type === 'PDFTextField') {
          value = (field as any).getText?.() || '';
        } else if (type === 'PDFCheckBox') {
          value = (field as any).isChecked?.() ? 'checked' : 'unchecked';
        } else if (type === 'PDFRadioGroup') {
          value = (field as any).getSelected?.() || '';
        }
      } catch (e) {
        value = undefined;
      }
      
      return { name, type, value };
    });

    const result: POAInspectionResult = {
      templateType,
      totalFields: fieldInfo.length,
      fields: fieldInfo,
      timestamp: new Date().toISOString(),
    };
    
    console.log(`[POA Inspector] ${templateType}: Found ${fieldInfo.length} fields`);
    console.log(`[POA Inspector] Field names:`, fieldInfo.map(f => f.name));
    
    return result;
  } catch (error) {
    console.error(`[POA Inspector] Error inspecting ${templateType}:`, error);
    throw error;
  }
}

/**
 * Inspect all three POA templates
 */
export async function inspectAllPOATemplates(): Promise<{
  adult: POAInspectionResult;
  minor: POAInspectionResult;
  spouses: POAInspectionResult;
}> {
  console.log('[POA Inspector] Starting full POA template inspection...');
  
  const [adult, minor, spouses] = await Promise.all([
    inspectPOATemplate('poa-adult'),
    inspectPOATemplate('poa-minor'),
    inspectPOATemplate('poa-spouses'),
  ]);
  
  return { adult, minor, spouses };
}

/**
 * Compare template fields with current mappings
 */
export function compareFieldMappings(
  templateFields: string[],
  currentMapping: Record<string, string>
): {
  mapped: string[];
  unmapped: string[];
  extraMappings: string[];
} {
  const mappedPDFFields = Object.keys(currentMapping);
  
  const mapped = templateFields.filter(field => mappedPDFFields.includes(field));
  const unmapped = templateFields.filter(field => !mappedPDFFields.includes(field));
  const extraMappings = mappedPDFFields.filter(field => !templateFields.includes(field));
  
  return { mapped, unmapped, extraMappings };
}
