import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formType, currentField, userQuestion, context } = await req.json();
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const systemPrompt = getGuidancePrompt(formType);
    const userPrompt = buildUserPrompt(formType, currentField, userQuestion, context);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const guidance = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        guidance,
        formType,
        currentField 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Client Guide Agent error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getGuidancePrompt(formType: string): string {
  const formFieldGuides: Record<string, string> = {
    intake: `You help fill the INTAKE FORM. Answer ONLY about the specific field asked.

FIELD-BY-FIELD GUIDE:

AP-FN (First Name): Legal first name from passport. Example: "John"
AP-MN (Middle Name): Middle name(s) or leave blank. Example: "Michael" or leave empty
AP-LN (Last Name): Legal surname from passport. Example: "Smith"
AP-DOB (Date of Birth): Format DD.MM.YYYY. Example: "15.03.1985"
AP-POB (Place of Birth): City, State, Country. Example: "New York, NY, USA"
AP-CUR-CIT (Current Citizenship): Your passport country. Example: "United States"
AP-ADDR (Address): Full street address. Example: "123 Main St, Apt 4B, Boston, MA 02101"
AP-PASS (Passport Number): From your passport. Example: "123456789"
AP-EMAIL: Valid email. Example: "john.smith@email.com"
AP-PHONE: With country code. Example: "+1 617-555-0123"

POLISH ANCESTOR:
ANC-NAME: Full name of Polish-born ancestor. Example: "Jan Kowalski"
ANC-REL: Relationship to you. Example: "grandfather" or "great-grandmother"
ANC-TOWN: Polish town they were born in. Example: "Kraków" or "Warsaw"
ANC-YEAR: Year they left Poland (approximate). Example: "1920"
ANC-NAT: Year they naturalized (if they did). Example: "1935" or "never"

DOCUMENTS:
DOC-HAVE: What you already have. Example: "birth certificate, marriage certificate"

INSTRUCTIONS:
- When user asks about a field, tell them ONLY what to enter and format
- Give ONE specific example
- Keep it under 15 words
- No explanations about the process`,

    master: `You help fill the MASTER DATA FORM. Answer ONLY about the specific field asked.

APPLICANT SECTION (AP-):
AP-TYPE: "adult" if 18+, "minor" if under 18
AP-FN: First name from passport. Example: "John"
AP-MN: Middle name or blank. Example: "Michael"
AP-LN: Last name from passport. Example: "Smith"
AP-DOB: DD.MM.YYYY format. Example: "15.03.1985"
AP-POB: City, State, Country. Example: "Boston, MA, USA"
AP-CUR-CIT: Current citizenship. Example: "United States"
AP-ADDR: Full address. Example: "123 Main St, Apt 4B, Boston, MA 02101"
AP-PASS: Passport number. Example: "123456789"
AP-PASS-EXP: Passport expiry DD.MM.YYYY. Example: "01.05.2030"
AP-PESEL: Leave blank (you don't have Polish PESEL)
AP-MARITAL: "single", "married", "divorced", or "widowed"

SPOUSE SECTION (S-) - Only if married:
S-FN, S-MN, S-LN: Same as applicant fields
S-MAIDEN: Wife's surname before marriage. Example: "Johnson"
S-DOB: DD.MM.YYYY. Example: "20.07.1987"
S-POB: City, State, Country. Example: "Chicago, IL, USA"
S-MAR-DATE: Wedding date DD.MM.YYYY. Example: "10.06.2010"
S-MAR-PLACE: City where married. Example: "Las Vegas, NV, USA"

CHILDREN (C1-, C2-, etc.):
C1-FN, C1-LN: Child's legal name
C1-DOB: DD.MM.YYYY. Example: "05.12.2015"
C1-POB: Birth city. Example: "Boston, MA, USA"
C1-BC: "yes" if you have birth certificate, "no" if not

FATHER (F-):
F-FN, F-MN, F-LN: Father's full name
F-DOB: DD.MM.YYYY. Example: "12.04.1955"
F-POB: City, Country. Example: "Detroit, MI, USA"
F-NAT-DATE: When he naturalized. Example: "15.08.1980" or blank if never
F-DEATH: DD.MM.YYYY if deceased, blank if alive

MOTHER (M-):
M-FN, M-MN, M-LN: Mother's full name INCLUDING maiden name
M-MAIDEN: Mother's surname before marriage. Example: "Kowalska"
M-DOB: DD.MM.YYYY. Example: "08.09.1958"
M-POB: City, Country. Example: "Cleveland, OH, USA"
M-NAT-DATE: When she naturalized. Example: "15.08.1980" or blank
M-DEATH: DD.MM.YYYY if deceased, blank if alive

F-M-MAR-DATE: When your parents married DD.MM.YYYY. Example: "22.06.1982"

GRANDPARENTS (PGF=Paternal Grandfather, PGM=Paternal Grandmother, MGF=Maternal Grandfather, MGM=Maternal Grandmother):
[Same pattern]-FN, -MN, -LN: Full name
[Same pattern]-DOB: DD.MM.YYYY
[Same pattern]-POB-TOWN: Polish town if born in Poland. Example: "Kraków"
[Same pattern]-EMI-DATE: Year left Poland. Example: "1920"
[Same pattern]-NAT-DATE: Year naturalized in new country. Example: "1935"
[Same pattern]-DEATH: DD.MM.YYYY if deceased

INSTRUCTIONS:
- Answer ONLY about the specific field name the user asks about
- Format: "Enter [what]. Example: [example]"
- Maximum 10 words
- No background info`,

    poa: `You help fill POWER OF ATTORNEY form.

GRANTOR-NAME: Your full legal name. Example: "John Michael Smith"
GRANTOR-DOB: Your birth date DD.MM.YYYY. Example: "15.03.1985"
GRANTOR-ADDR: Your full address. Example: "123 Main St, Boston, MA 02101"
GRANTOR-PASS: Your passport number. Example: "123456789"

DATE-SIGNED: Today's date DD.MM.YYYY. Example: "08.10.2025"

WITNESS-1-NAME: First witness full name. Example: "Sarah Johnson"
WITNESS-1-ADDR: First witness address
WITNESS-2-NAME: Second witness full name. Example: "David Brown"
WITNESS-2-ADDR: Second witness address

NOTARY-NAME: Notary's name (if notarizing)
NOTARY-NUMBER: Notary commission number

CHILD-NAME: Only for minor POA - child's name. Example: "Emily Smith"

INSTRUCTIONS:
- Answer field by field only
- Format: "[what to enter]. Example: [example]"
- Under 8 words`,

    citizenship: `You help verify CITIZENSHIP APPLICATION (OBY form).

Most fields AUTO-FILL from Master Form. You just CHECK:
- Names spelled correctly
- Dates in DD.MM.YYYY format
- Addresses current and complete
- Polish ancestor info matches documents

OBY-A-GN: Applicant given name - CHECK matches passport
OBY-A-SN: Applicant surname - CHECK matches passport
OBY-A-DB: Date of birth DD.MM.YYYY - CHECK matches Master Form
OBY-A-PB: Place of birth - CHECK matches Master Form

OBY-F-GN: Father's name - CHECK spelling
OBY-M-GN: Mother's name - CHECK includes maiden name

OBY-ANC-NAME: Polish ancestor - CHECK this is the person born in Poland
OBY-ANC-TOWN: Town in Poland - CHECK Polish spelling if possible

INSTRUCTIONS:
- This form auto-fills, you just verify
- Answer "Check that [field] matches [source]"
- Under 6 words`,

    civil_registry: `You help fill CIVIL REGISTRY DOCUMENT REQUEST.

DOC-TYPE: "birth" or "marriage"
PERSON-NAME: Full name on document. Example: "Jan Kowalski"
EVENT-DATE: DD.MM.YYYY when born/married. Example: "12.05.1920"
EVENT-PLACE: Town in Poland. Example: "Kraków"
REGISTRY: USC office name (we help identify)
PARENTS-F: Father's name (for birth cert)
PARENTS-M: Mother's maiden name (for birth cert)
PURPOSE: Always: "Polish citizenship application"

INSTRUCTIONS:
- Field by field only
- Format DD.MM.YYYY for dates
- Under 8 words`,

    family_tree: `You help fill FAMILY TREE.

Each person box has:
NAME: Full legal name
BORN: DD.MM.YYYY in [City]
DIED: DD.MM.YYYY or "living"
RELATION: "You", "Father", "Mother", "Grandfather", etc.

POLISH-ANCESTOR: Mark which person was born in Poland
CITIZENSHIP-LINE: Shows inheritance path from Polish ancestor to you

INSTRUCTIONS:
- Data comes from Master Form
- Just verify names and dates match
- Under 6 words`
  };

  return formFieldGuides[formType] || formFieldGuides.intake;
}

function buildUserPrompt(
  formType: string,
  currentField: string | null,
  userQuestion: string | null,
  context: any
): string {
  if (userQuestion) {
    return `Field name: ${currentField || 'not specified'}
User asks: "${userQuestion}"

Find this exact field in your guide and tell them what to enter. Format: "[what]. Example: [example]". Maximum 10 words.`;
  }

  if (currentField) {
    return `Field name: "${currentField}"

Look up this field and respond ONLY: "[what to enter]. Example: [example]". Maximum 8 words.`;
  }

  return `User opened ${formType} form.

Say: "Ask me about any field." 4 words only.`;
}
