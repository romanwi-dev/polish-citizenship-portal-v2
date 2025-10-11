import { PDFDocument } from 'pdf-lib';

export interface FieldInfo {
  name: string;
  type: string;
}

export interface InspectionResult {
  templateType: string;
  totalFields: number;
  fields: FieldInfo[];
}

/**
 * Client-side PDF field inspector - NO EDGE FUNCTIONS NEEDED!
 * Loads PDF directly in browser and extracts field information
 */
export async function inspectPDFFields(templateType: string): Promise<InspectionResult> {
  try {
    // Fetch PDF from public folder
    const response = await fetch(`/templates/${templateType}.pdf`);
    
    if (!response.ok) {
      throw new Error(`Failed to load template: ${templateType}`);
    }
    
    const pdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    const fieldInfo: FieldInfo[] = fields.map(field => ({
      name: field.getName(),
      type: field.constructor.name,
    }));

    return {
      templateType,
      totalFields: fieldInfo.length,
      fields: fieldInfo,
    };
  } catch (error) {
    console.error(`Error inspecting ${templateType}:`, error);
    throw error;
  }
}
