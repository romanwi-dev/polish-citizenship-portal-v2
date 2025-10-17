import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, poaType } = await req.json();

    // Input validation
    const { isValidUUID } = await import('../_shared/validation.ts');
    
    if (!isValidUUID(caseId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid case ID format' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const validPoaTypes = ['adult', 'minor', 'spouses'];
    if (!validPoaTypes.includes(poaType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid POA type' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    if (!caseId || !poaType) {
      return new Response(
        JSON.stringify({ error: "Case ID and POA type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating ${poaType} POA for case:`, caseId);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
      // POA Adult
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
      // POA Minor - includes children
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
      // POA Married - includes spouse
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

    return new Response(
      JSON.stringify({
        success: true,
        poaId: poaRecord.id,
        poaText,
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
