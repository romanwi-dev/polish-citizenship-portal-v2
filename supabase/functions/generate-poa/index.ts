import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Get intake data
    const { data: intakeData, error: intakeError } = await supabase
      .from("intake_data")
      .select("*")
      .eq("case_id", caseId)
      .single();

    if (intakeError || !intakeData) {
      throw new Error("Intake data not found");
    }

    // Generate POA text
    const fullName = `${intakeData.first_name} ${intakeData.last_name}`;
    const documentNumber = intakeData.passport_number || "NOT PROVIDED";
    const poaDate = new Date().toLocaleDateString("pl-PL");
    
    let childName = "";
    if (poaType === "minor") {
      // Get first child from intake data (assuming it's stored in JSONB or related table)
      childName = "CHILD NAME"; // TODO: Get from actual child data
    }

    const poaText = `Pełnomocnictwo (Power of Attorney)

Ja, niżej podpisany/a:
${fullName}

legitymujący/a się dokumentem tożsamości nr:
${documentNumber}

upoważniam Romana WIŚNIEWSKIEGO, legitymującego się polskim dowodem osobistym nr CBU 675382, zamieszkałego w Warszawie 00-195, ul. Słomińskiego Zygmunta 19/134, do reprezentowania mnie w odp. Urzędzie Wojewódzkim/ Ministerstwie Spraw Wewnętrznych i Administracji celem prowadzenia spraw o stwierdzenie posiadania/ przywrócenie obywatelstwa polskiego przeze mnie${poaType === "minor" ? ` oraz moje małoletnie dziecko: ${childName}` : ''}

a także w Urzędach Stanu Cywilnego, Archiwach Państwowych, Instytucie Pamięci Narodowej i wszelkich innych archiwach/ instytucjach/ urzędach celem uzyskania/sprostowania/uzupełnienia/ odtworzenia i uzyskania poświadczonych kopii mojego/ moich krewnych polskiego aktu urodzenia/ małżeństwa/ zgonu oraz innych polskich dokumentów dotyczących mnie i mojej rodziny a także transkrypcji/ umiejscowienia zagranicznych dokumentów w polskich aktach stanu cywilnego oraz w sprawie o nadanie numeru PESEL. Wyrażam również zgodę na sprostowanie/ uzupełnienie aktów stanu cywilnego.

Jednocześnie unieważniam wszelkie inne pełnomocnictwa udzielone przeze mnie lub w moim imieniu w w/w sprawach.

Pełnomocnik może udzielić dalszego pełnomocnictwa.

data / date: ${poaDate}    podpis / signature: __________________
`;

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
