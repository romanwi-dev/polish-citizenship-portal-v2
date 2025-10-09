import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// CENTRALIZED FIELD MAPPING FOR PDF GENERATION
// Maps master_table DB columns to PDF form field names
const PDF_FIELD_MAP: Record<string, Record<string, string>> = {
  'poa-adult': {
    // Applicant
    'applicant_first_name': 'firstName',
    'applicant_last_name': 'lastName',
    'applicant_dob': 'dateOfBirth',
    'applicant_pob': 'placeOfBirth',
    'applicant_passport_number': 'passportNumber',
    'applicant_passport_issuing_country': 'passportIssuingCountry',
    // Parents
    'father_first_name': 'fatherFirstName',
    'father_last_name': 'fatherLastName',
    'mother_first_name': 'motherFirstName',
    'mother_last_name': 'motherLastName',
    'mother_maiden_name': 'motherMaidenName',
  },
  'poa-minor': {
    // Parent (applicant)
    'applicant_first_name': 'parentFirstName',
    'father_last_name': 'parentLastName',
    'applicant_passport_number': 'parentPassportNumber',
    // Child
    'child_1_first_name': 'childFirstName',
    'child_1_last_name': 'childLastName',
    'child_1_dob': 'childDateOfBirth',
  },
  'poa-spouses': {
    // Husband (applicant)
    'applicant_first_name': 'husbandFirstName',
    'father_last_name': 'husbandLastName',
    'applicant_passport_number': 'husbandPassportNumber',
    // Wife (spouse)
    'spouse_first_name': 'wifeFirstName',
    'spouse_last_name': 'wifeLastName',
    'spouse_passport_number': 'wifePassportNumber',
    // Children
    'child_1_last_name': 'childrenLastName',
  },
};

const formatDate = (date: string | null) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return date;
  }
};

const mapDataToPDF = (masterData: any, templateType: string): Record<string, string> => {
  const fieldMap = PDF_FIELD_MAP[templateType] || {};
  const pdfData: Record<string, string> = {};
  
  Object.entries(fieldMap).forEach(([dbColumn, pdfField]) => {
    let value = masterData[dbColumn];
    
    // Format dates
    if (dbColumn.includes('_dob') || dbColumn.includes('_date')) {
      value = formatDate(value);
    }
    
    pdfData[pdfField] = value || 'N/A';
  });
  
  return pdfData;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, templateType } = await req.json();
    
    if (!caseId || !templateType) {
      throw new Error('caseId and templateType are required');
    }

    console.log(`Generating PDF: ${templateType} for case: ${caseId}`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get master data
    const { data: masterData, error: masterError } = await supabaseClient
      .from('master_table')
      .select('*')
      .eq('case_id', caseId)
      .maybeSingle();

    if (masterError) throw masterError;
    if (!masterData) throw new Error('Master data not found');

    // Map data using centralized field mapping
    const pdfData = mapDataToPDF(masterData, templateType);
    console.log('PDF Data:', JSON.stringify(pdfData, null, 2));

    // Create PDF from scratch
    const pdfDoc = await PDFDocument.create();
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    let yPosition = height - 50;
    
    // Generate content based on template type
    if (templateType === 'poa-adult') {
      page.drawText('POWER OF ATTORNEY - ADULT', {
        x: 50,
        y: yPosition,
        size: 20,
        font: timesRomanBold,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 50;
      
      const fields = [
        { label: 'Full Name:', value: `${pdfData.firstName || ''} ${pdfData.lastName || ''}`.trim() || 'N/A' },
        { label: 'Date of Birth:', value: pdfData.dateOfBirth },
        { label: 'Place of Birth:', value: pdfData.placeOfBirth },
        { label: 'ID/Passport Number:', value: pdfData.passportNumber },
        { label: 'Passport Issuing Country:', value: pdfData.passportIssuingCountry },
        { label: 'Father Name:', value: `${pdfData.fatherFirstName || ''} ${pdfData.fatherLastName || ''}`.trim() || 'N/A' },
        { label: 'Mother Name:', value: `${pdfData.motherFirstName || ''} ${pdfData.motherLastName || ''}`.trim() || 'N/A' },
        { label: 'Mother Maiden Name:', value: pdfData.motherMaidenName },
      ];
      
      for (const field of fields) {
        page.drawText(field.label, {
          x: 50,
          y: yPosition,
          size: 12,
          font: timesRomanBold,
          color: rgb(0, 0, 0),
        });
        
        page.drawText(field.value, {
          x: 250,
          y: yPosition,
          size: 12,
          font: timesRoman,
          color: rgb(0, 0, 0),
        });
        
        yPosition -= 25;
      }
      
      yPosition -= 20;
      page.drawText('I hereby authorize the representative to act on my behalf...', {
        x: 50,
        y: yPosition,
        size: 11,
        font: timesRoman,
        color: rgb(0, 0, 0),
      });
      
    } else if (templateType === 'poa-minor') {
      page.drawText('POWER OF ATTORNEY - MINOR', {
        x: 50,
        y: yPosition,
        size: 20,
        font: timesRomanBold,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 50;
      
      const fields = [
        { label: 'Parent Name:', value: `${pdfData.parentFirstName || ''} ${pdfData.parentLastName || ''}`.trim() || 'N/A' },
        { label: 'Parent ID/Passport:', value: pdfData.parentPassportNumber },
        { label: 'Child Name:', value: `${pdfData.childFirstName || ''} ${pdfData.childLastName || ''}`.trim() || 'N/A' },
        { label: 'Child Date of Birth:', value: pdfData.childDateOfBirth },
      ];
      
      for (const field of fields) {
        page.drawText(field.label, {
          x: 50,
          y: yPosition,
          size: 12,
          font: timesRomanBold,
          color: rgb(0, 0, 0),
        });
        
        page.drawText(field.value, {
          x: 250,
          y: yPosition,
          size: 12,
          font: timesRoman,
          color: rgb(0, 0, 0),
        });
        
        yPosition -= 25;
      }
      
    } else if (templateType === 'poa-spouses') {
      page.drawText('POWER OF ATTORNEY - SPOUSES', {
        x: 50,
        y: yPosition,
        size: 20,
        font: timesRomanBold,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 50;
      
      const fields = [
        { label: 'Husband Name:', value: `${pdfData.husbandFirstName || ''} ${pdfData.husbandLastName || ''}`.trim() || 'N/A' },
        { label: 'Husband ID/Passport:', value: pdfData.husbandPassportNumber },
        { label: 'Wife Name:', value: `${pdfData.wifeFirstName || ''} ${pdfData.wifeLastName || ''}`.trim() || 'N/A' },
        { label: 'Wife ID/Passport:', value: pdfData.wifePassportNumber },
        { label: "Children's Last Name(s):", value: pdfData.childrenLastName },
      ];
      
      for (const field of fields) {
        page.drawText(field.label, {
          x: 50,
          y: yPosition,
          size: 12,
          font: timesRomanBold,
          color: rgb(0, 0, 0),
        });
        
        page.drawText(field.value, {
          x: 250,
          y: yPosition,
          size: 12,
          font: timesRoman,
          color: rgb(0, 0, 0),
        });
        
        yPosition -= 25;
      }
    } else {
      throw new Error(`Unsupported template type: ${templateType}`);
    }
    
    const pdfBytes = await pdfDoc.save();
    
    console.log(`Successfully generated PDF: ${pdfBytes.length} bytes`);
    
    return new Response(new Uint8Array(pdfBytes), {
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
