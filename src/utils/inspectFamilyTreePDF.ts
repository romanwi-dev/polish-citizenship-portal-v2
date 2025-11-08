/**
 * Client-side PDF Field Inspector for Family Tree Template
 * Run this to extract actual field names from the PDF
 */

import { PDFDocument } from 'pdf-lib';

export async function inspectFamilyTreePDF(): Promise<{
  totalFields: number;
  fields: Array<{ name: string; type: string }>;
}> {
  try {
    // Fetch the uploaded PDF from public folder
    const response = await fetch('/templates/family-tree.pdf');
    
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.status}`);
    }
    
    const pdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    const fieldInfo = fields.map(field => ({
      name: field.getName(),
      type: field.constructor.name,
    }));

    console.log('📋 FAMILY TREE PDF FIELDS:', fieldInfo);
    console.log(`Total fields: ${fieldInfo.length}`);
    
    return {
      totalFields: fieldInfo.length,
      fields: fieldInfo,
    };
  } catch (error) {
    console.error('Error inspecting PDF:', error);
    throw error;
  }
}

// Auto-run inspection when imported
if (typeof window !== 'undefined') {
  inspectFamilyTreePDF().then(result => {
    console.log('✅ Inspection complete:', result);
  }).catch(err => {
    console.error('❌ Inspection failed:', err);
  });
}
