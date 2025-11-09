import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
}

// Security: Validation schemas
const POATypeSchema = z.string() // Accept any POA type string (adult, minor, spouses, minor-1, minor-2, etc.)
const SecureUUIDSchema = z.string().uuid()
const POAGenerationRequestSchema = z.object({
  caseId: SecureUUIDSchema,
  poaType: POATypeSchema,
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Security: JWT authentication required
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get authenticated user
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestBody = await req.json()
    
    // Security: Input validation with Zod
    const validationResult = POAGenerationRequestSchema.safeParse(requestBody)
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error)
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters', details: validationResult.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { caseId, poaType } = validationResult.data

    console.log(`[generate-poa] Generating ${poaType} POA for case: ${caseId}`);

    // Security: Verify case ownership
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('user_id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return new Response(
        JSON.stringify({ error: 'Case not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user owns case or is admin
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    })

    if (caseData.user_id !== user.id && !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to case' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Generating ${poaType} POA for case:`, caseId)

    // Get master table data
    const { data: masterData, error: masterError } = await supabase
      .from("master_table")
      .select("*")
      .eq("case_id", caseId)
      .single();

    if (masterError || !masterData) {
      throw new Error("Master data not found");
    }

    // Generate POA text based on type
    const fullName = `${masterData.applicant_first_name || ''} ${masterData.applicant_last_name || ''}`.trim();
    const documentNumber = masterData.applicant_passport_number || "NOT PROVIDED";
    const poaDate = new Date().toLocaleDateString("pl-PL");
    
    let poaText = "";
    
    if (poaType === "adult") {
      poaText = `Pełnomocnictwo (Power of Attorney)

Ja, niżej podpisany/a:
${fullName}

legitymujący/a się dokumentem tożsamości nr:
${documentNumber}

upoważniam Romana WIŚNIEWSKIEGO, legitymującego się polskim dowodem osobistym nr CBU 675382, zamieszkałego w Warszawie 00-195, ul. Słomińskiego Zygmunta 19/134, do reprezentowania mnie w odp. Urzędzie Wojewódzkim/ Ministerstwie Spraw Wewnętrznych i Administracji celem prowadzenia spraw o stwierdzenie posiadania/ przywrócenie obywatelstwa polskiego przeze mnie

a także w Urzędach Stanu Cywilnego, Archiwach Państwowych, Instytucie Pamięci Narodowej i wszelkich innych archiwach/ instytucjach/ urzędach celem uzyskania/sprostowania/uzupełnienia/ odtworzenia i uzyskania poświadczonych kopii mojego/ moich krewnych polskiego aktu urodzenia/ małżeństwa/ zgonu oraz innych polskich dokumentów dotyczących mnie i mojej rodziny a także transkrypcji/ umiejscowienia zagranicznych dokumentów w polskich aktach stanu cywilnego oraz w sprawie o nadanie numeru PESEL. Wyrażam również zgodę na sprostowanie/ uzupełnienie aktów stanu cywilnego.

Jednocześnie unieważniam wszelkie inne pełnomocnictwa udzielone przeze mnie lub w moim imieniu w w/w sprawach.

Pełnomocnik może udzielić dalszego pełnomocnictwa.

data / date: ${poaDate}    podpis / signature: __________________`;
    } else if (poaType === "minor") {
      const childrenNames: string[] = [];
      for (let i = 1; i <= (masterData.children_count || 0); i++) {
        const firstName = masterData[`child_${i}_first_name`];
        const lastName = masterData[`child_${i}_last_name`];
        if (firstName && lastName) {
          childrenNames.push(`${firstName} ${lastName}`);
        }
      }
      const childrenList = childrenNames.length > 0 ? childrenNames.join(", ") : "NOT PROVIDED";
      
      poaText = `Pełnomocnictwo (Power of Attorney) - Minor

Ja, niżej podpisany/a:
${fullName}

legitymujący/a się dokumentem tożsamości nr:
${documentNumber}

upoważniam Romana WIŚNIEWSKIEGO, legitymującego się polskim dowodem osobistym nr CBU 675382, zamieszkałego w Warszawie 00-195, ul. Słomińskiego Zygmunta 19/134, do reprezentowania mnie w odp. Urzędzie Wojewódzkim/ Ministerstwie Spraw Wewnętrznych i Administracji celem prowadzenia spraw o stwierdzenie posiadania/ przywrócenie obywatelstwa polskiego przeze mnie oraz moje małoletnie dzieci: ${childrenList}

a także w Urzędach Stanu Cywilnego, Archiwach Państwowych, Instytucie Pamięci Narodowej i wszelkich innych archiwach/ instytucjach/ urzędach celem uzyskania/sprostowania/uzupełnienia/ odtworzenia i uzyskania poświadczonych kopii mojego/ moich krewnych polskiego aktu urodzenia/ małżeństwa/ zgonu oraz innych polskich dokumentów dotyczących mnie i mojej rodziny a także transkrypcji/ umiejscowienia zagranicznych dokumentów w polskich aktach stanu cywilnego oraz w sprawie o nadanie numeru PESEL. Wyrażam również zgodę na sprostowanie/ uzupełnienie aktów stanu cywilnego.

Jednocześnie unieważniam wszelkie inne pełnomocnictwa udzielone przeze mnie lub w moim imieniu w w/w sprawach.

Pełnomocnik może udzielić dalszego pełnomocnictwa.

data / date: ${poaDate}    podpis / signature: __________________`;
    } else if (poaType === "married") {
      const spouseName = `${masterData.spouse_first_name || ''} ${masterData.spouse_last_name || ''}`.trim();
      const spouseDocument = masterData.spouse_passport_number || "NOT PROVIDED";
      
      poaText = `Pełnomocnictwo (Power of Attorney) - Married

My, niżej podpisani:
${fullName}
legitymujący/a się dokumentem tożsamości nr: ${documentNumber}

oraz
${spouseName}
legitymujący/a się dokumentem tożsamości nr: ${spouseDocument}

upoważniamy Romana WIŚNIEWSKIEGO, legitymującego się polskim dowodem osobistym nr CBU 675382, zamieszkałego w Warszawie 00-195, ul. Słomińskiego Zygmunta 19/134, do reprezentowania nas w odp. Urzędzie Wojewódzkim/ Ministerstwie Spraw Wewnętrznych i Administracji celem prowadzenia spraw o stwierdzenie posiadania/ przywrócenie obywatelstwa polskiego przez nas

a także w Urzędach Stanu Cywilnego, Archiwach Państwowych, Instytucie Pamięci Narodowej i wszelkich innych archiwach/ instytucjach/ urzędach celem uzyskania/sprostowania/uzupełnienia/ odtworzenia i uzyskania poświadczonych kopii naszych/ naszych krewnych polskiego aktu urodzenia/ małżeństwa/ zgonu oraz innych polskich dokumentów dotyczących nas i naszej rodziny a także transkrypcji/ umiejscowienia zagranicznych dokumentów w polskich aktach stanu cywilnego oraz w sprawie o nadanie numeru PESEL. Wyrażamy również zgodę na sprostowanie/ uzupełnienie aktów stanu cywilnego.

Jednocześnie unieważniamy wszelkie inne pełnomocnictwa udzielone przez nas lub w naszym imieniu w w/w sprawach.

Pełnomocnik może udzielić dalszego pełnomocnictwa.

data / date: ${poaDate}    podpisy / signatures: __________________  __________________`;
    } else {
      throw new Error("Invalid POA type. Must be 'adult', 'minor', or 'married'");
    }

    // Store POA in database
    const { data: poaRecord, error: poaError } = await supabase
      .from("poa")
      .insert({
        case_id: caseId,
        poa_type: poaType,
        generated_at: new Date().toISOString(),
        status: "draft",
      })
      .select()
      .single();

    if (poaError) {
      throw new Error(`Failed to create POA record: ${poaError.message}`);
    }

    console.log("POA generated successfully:", poaRecord.id);

    // ✅ PHASE EX FIX #1: Generate actual PDF using fill-pdf edge function
    console.log('[generate-poa] Calling fill-pdf to generate PDF...');
    
    const { data: pdfData, error: pdfError } = await supabase.functions.invoke('fill-pdf', {
      body: {
        caseId,
        templateType: `poa-${poaType}`,
        flatten: false
      }
    });

    if (pdfError || !pdfData?.url) {
      console.error('[generate-poa] PDF generation failed:', pdfError);
      throw new Error(`PDF generation failed: ${pdfError?.message || 'Unknown error'}`);
    }

    console.log('[generate-poa] PDF generated successfully:', pdfData.url);

    // ✅ Update POA record with PDF URL
    await supabase
      .from('poa')
      .update({ pdf_url: pdfData.url })
      .eq('id', poaRecord.id);

    console.log('[generate-poa] POA record updated with PDF URL');

    // Return PDF URL instead of text
    return new Response(
      JSON.stringify({
        success: true,
        poaId: poaRecord.id,
        pdfUrl: pdfData.url,
        poaType,
        generatedAt: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating POA:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
