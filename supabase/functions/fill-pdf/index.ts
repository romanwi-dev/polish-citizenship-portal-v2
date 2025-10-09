import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Create PDF from scratch
    const pdfDoc = await PDFDocument.create();
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();
    
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

    let yPosition = height - 50;
    
    // Generate content based on template type
    if (templateType === 'poa-adult') {
      // Header
      page.drawText('POWER OF ATTORNEY - ADULT', {
        x: 50,
        y: yPosition,
        size: 20,
        font: timesRomanBold,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 50;
      
      // Map form fields to display
      const fullName = `${masterData.applicant_first_name || ''} ${masterData.applicant_last_name || ''}`.trim() || 'N/A';
      const passportNum = masterData.applicant_passport_number || 'N/A';
      
      const fields = [
        { label: 'Full Name:', value: fullName },
        { label: 'ID/Passport Number:', value: passportNum },
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
      // Header
      page.drawText('POWER OF ATTORNEY - MINOR', {
        x: 50,
        y: yPosition,
        size: 20,
        font: timesRomanBold,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 50;
      
      // Map to POA Minor form fields
      const parentName = `${masterData.applicant_first_name || ''} ${masterData.father_last_name || masterData.applicant_last_name || ''}`.trim() || 'N/A';
      const parentPassport = masterData.applicant_passport_number || 'N/A';
      const childName = `${masterData.child_1_first_name || ''} ${masterData.child_1_last_name || ''}`.trim() || 'N/A';
      
      const fields = [
        { label: 'Parent Name:', value: parentName },
        { label: 'Parent ID/Passport:', value: parentPassport },
        { label: 'Child Name:', value: childName },
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
      // Header
      page.drawText('POWER OF ATTORNEY - SPOUSES', {
        x: 50,
        y: yPosition,
        size: 20,
        font: timesRomanBold,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 50;
      
      // Map to POA Spouses form fields
      const husbandName = `${masterData.applicant_first_name || ''} ${masterData.father_last_name || masterData.applicant_last_name || ''}`.trim() || 'N/A';
      const husbandPassport = masterData.applicant_passport_number || 'N/A';
      const wifeName = `${masterData.spouse_first_name || ''} ${masterData.spouse_last_name || ''}`.trim() || 'N/A';
      const wifePassport = masterData.spouse_passport_number || 'N/A';
      const childrenLastName = masterData.child_1_last_name || 'N/A';
      
      const fields = [
        { label: 'Husband Name:', value: husbandName },
        { label: 'Husband ID/Passport:', value: husbandPassport },
        { label: 'Wife Name:', value: wifeName },
        { label: 'Wife ID/Passport:', value: wifePassport },
        { label: "Children's Last Name(s):", value: childrenLastName },
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
