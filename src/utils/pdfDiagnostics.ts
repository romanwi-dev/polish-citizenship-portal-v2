/**
 * PDF Template Diagnostics
 * Checks if PDF templates have actual content or are just empty forms
 */

export async function diagnosePDFTemplate(templateName: string): Promise<{
  hasContent: boolean;
  pageCount: number;
  fieldCount: number;
  fileSize: number;
  estimatedContentSize: number;
  diagnosis: string;
}> {
  try {
    const { PDFDocument } = await import('pdf-lib');
    
    // Download from Supabase storage
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase.storage
      .from('pdf-templates')
      .download(`${templateName}.pdf`);
    
    if (error) throw error;
    
    const arrayBuffer = await data.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    const pages = pdfDoc.getPages();
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    // Estimate content size (rough heuristic)
    const fileSize = arrayBuffer.byteLength;
    const estimatedFieldOverhead = fields.length * 500; // ~500 bytes per field
    const estimatedContentSize = fileSize - estimatedFieldOverhead;
    
    // A PDF with just fields is ~50KB, with content is usually 500KB+
    const hasContent = fileSize > 200000; // 200KB threshold
    
    let diagnosis = '';
    if (!hasContent) {
      diagnosis = `⚠️ BLANK TEMPLATE DETECTED! This PDF only has form fields (${fields.length} fields) but NO LEGAL TEXT CONTENT. You need to upload the actual Polish POA template with all the legal text printed on it.`;
    } else {
      diagnosis = `✅ Template appears to have content. File size (${(fileSize / 1024).toFixed(0)}KB) suggests it contains the legal text.`;
    }
    
    return {
      hasContent,
      pageCount: pages.length,
      fieldCount: fields.length,
      fileSize,
      estimatedContentSize,
      diagnosis,
    };
  } catch (error) {
    throw new Error(`Failed to diagnose template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
