import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Filling PDF template: ${templateType} for case: ${caseId}`);

    // Get master data
    const { data: masterData, error: masterError } = await supabaseClient
      .from('master_table')
      .select('*')
      .eq('case_id', caseId)
      .maybeSingle();

    if (masterError) throw masterError;
    if (!masterData) throw new Error('Master data not found');

    // Get the request origin to construct the absolute URL
    const origin = req.headers.get('origin') || 'https://98b4e1c7-7682-4f23-9f68-2a61bbec99a9.lovableproject.com';
    
    // Map template type to file name
    const templateFileMap: Record<string, string> = {
      'family-tree': 'family-tree.pdf',
      'poa-adult': 'poa-adult.pdf',
      'poa-minor': 'poa-minor.pdf',
      'poa-spouses': 'poa-spouses.pdf',
      'registration': 'registration.pdf',
      'uzupelnienie': 'uzupelnienie.pdf',
      'citizenship': 'citizenship.pdf',
    };

    const templateFileName = templateFileMap[templateType];
    if (!templateFileName) {
      throw new Error(`Unknown template type: ${templateType}`);
    }

    const templateUrl = `${origin}/templates/${templateFileName}`;
    console.log(`Loading template from: ${templateUrl}`);
    
    // Fetch the template file from public folder
    const templateResponse = await fetch(templateUrl);
    if (!templateResponse.ok) {
      throw new Error(`Failed to fetch template: ${templateResponse.statusText}`);
    }
    
    const templateBytes = await templateResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    // Get the first page
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();

    // Add text overlays based on template type
    await addTextOverlays(pdfDoc, firstPage, templateType, masterData, height);

    // Save the filled PDF
    const pdfBytes = await pdfDoc.save();
    
    console.log(`PDF generated successfully, size: ${pdfBytes.length} bytes`);
    
    // Return the PDF bytes directly
    return new Response(new Uint8Array(pdfBytes), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${templateType}-${caseId}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error filling PDF:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function addTextOverlays(pdfDoc: any, page: any, templateType: string, data: any, pageHeight: number) {
  const formatDate = (date: string | null) => {
    if (!date) return '';
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  };

  // Import font for text overlay
  const font = await pdfDoc.embedFont('Helvetica');
  
  switch (templateType) {
    case 'poa-adult':
      // Name and surname (line starting with "Ja, niżej podpisany/a:")
      const fullName = `${data.applicant_first_name || ''} ${data.applicant_last_name || ''}`.trim().toUpperCase();
      page.drawText(fullName, {
        x: 140,
        y: pageHeight - 160,
        size: 11,
        font,
      });
      
      // ID/Passport number
      const passportNum = (data.applicant_passport_number || '').toUpperCase();
      page.drawText(passportNum, {
        x: 365,
        y: pageHeight - 185,
        size: 11,
        font,
      });
      
      // Date
      const date = formatDate(data.poa_date_filed || new Date().toISOString());
      page.drawText(date, {
        x: 50,
        y: pageHeight - 710,
        size: 11,
        font,
      });
      break;
      
    // Add other template types as needed
  }
}

