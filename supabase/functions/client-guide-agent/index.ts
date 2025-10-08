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
  const basePrompt = `You are a helpful form-filling assistant. Your job is to explain SPECIFIC FORM FIELDS in simple language.

RESPONSE RULES:
- Keep answers SHORT (1-2 sentences max)
- Tell them WHAT to enter, not why
- Give an EXAMPLE if helpful
- Be conversational and friendly
- For voice: speak slowly and clearly

FORM FEATURES:
- Date format: DD.MM.YYYY (day.month.year)
- Double-click any field = clear it
- Long-press section title (2 sec) = clear that section
- Long-press background (5 sec) = clear entire form`;

  const formSpecificPrompts: Record<string, string> = {
    intake: `${basePrompt}

INTAKE FORM FIELDS YOU'LL HELP WITH:
- Name fields: Enter full legal name as it appears on ID
- Date fields: Use DD.MM.YYYY format (e.g., 15.03.1985)
- Email: Valid email address
- Phone: Include country code (e.g., +1 555-123-4567)
- Polish ancestor: Name of grandparent/great-grandparent who was born in Poland
- Relationship: How you're related (grandfather, great-grandmother, etc.)
- Town in Poland: City or town where ancestor was born
- Year left Poland: Approximate year they emigrated (e.g., 1920)
- Naturalization: Did they become a citizen of another country? When?
- Documents you have: Birth certificates, marriage certificates, etc.`,

    master: `${basePrompt}

MASTER FORM FIELDS YOU'LL HELP WITH:

APPLICANT (AP) SECTION:
- Adult/Minor: Select "adult" if 18+, "minor" if under 18
- First name: Your legal first name from passport
- Middle name: Middle name(s) if any, leave blank if none
- Last name: Your legal surname from passport
- Date of birth: DD.MM.YYYY format
- Place of birth: City, State/Province, Country (e.g., "New York, NY, USA")
- Current citizenship: Country of your current passport(s)
- Address: Full current residential address
- Passport number: From your valid passport
- PESEL: Leave blank (Polish national ID - you won't have one)
- Marital status: Single, Married, Divorced, Widowed

SPOUSE (S) SECTION (if married):
- Same fields as applicant
- Maiden name: Wife's surname before marriage (critical!)
- Marriage date: DD.MM.YYYY when you got married
- Marriage place: City where marriage occurred

CHILDREN (C1, C2, etc.) SECTIONS (if you have kids):
- Same basic fields
- Birth certificate: Do you have it? Yes/No

PARENTS (F = Father, M = Mother):
- Full name: Including mother's maiden name
- Date of birth: DD.MM.YYYY
- Place of birth: City, Country
- Date of marriage: When your parents married
- Naturalization date: CRITICAL - when did they become US/other citizen?
- Death date: DD.MM.YYYY if deceased, leave blank if alive

GRANDPARENTS (PGF, PGM, MGF, MGM):
- Which one was born in Poland? That's your Polish ancestor
- Town in Poland: Polish spelling if you know it
- Emigration date: When they left Poland (approximate OK)
- Naturalization date: When they became citizen of new country

GREAT-GRANDPARENTS (if going back further):
- Same fields as grandparents`,

    poa: `${basePrompt}

POA FORM FIELDS YOU'LL HELP WITH:
- Grantor: Person giving power of attorney (you or your child)
- Attorney: Our firm's name (pre-filled)
- Date signed: DD.MM.YYYY when you sign the form
- Witness 1 & 2: Names of two witnesses to your signature
- Notary: Notary public information (if notarizing)
- Scope: What attorney can do (pre-filled by us)`,

    citizenship: `${basePrompt}

CITIZENSHIP APPLICATION (OBY) FIELDS:
Most fields are AUTO-FILLED from your Master Form. You just verify:
- Names are spelled correctly
- Dates are accurate (DD.MM.YYYY format)
- Addresses are current
- Polish ancestor information is correct
- Document list matches what you have`,

    civil_registry: `${basePrompt}

CIVIL REGISTRY FORM FIELDS:
- Type of document: Birth certificate or Marriage certificate
- Person's name: Full name of person whose document you need
- Date of event: DD.MM.YYYY (birth date or marriage date)
- Place of event: Town/city in Poland
- Registry office: USC office name (we help you identify correct one)
- Parents' names: For birth certificates
- Purpose: "For citizenship application"`,

    family_tree: `${basePrompt}

FAMILY TREE FIELDS:
- Each person's box shows: Name, birth/death dates, relationship
- Polish ancestor: Highlighted in the tree
- Citizenship line: Shown with connecting lines
- You can edit if information changes from your Master Form`
  };

  return formSpecificPrompts[formType] || formSpecificPrompts.intake;
}

function buildUserPrompt(
  formType: string,
  currentField: string | null,
  userQuestion: string | null,
  context: any
): string {
  if (userQuestion) {
    return `Field: ${currentField || 'none'}
Question: "${userQuestion}"

Give a SHORT, direct answer about what to enter in this field. 1-2 sentences max.`;
  }

  if (currentField) {
    return `The user is filling out: "${currentField}"

Explain in 1-2 sentences:
- What to enter in this field
- Format if relevant (e.g., DD.MM.YYYY for dates)
- Quick example if helpful

Be brief and direct.`;
  }

  return `User just opened the ${formType} form.

In 1 sentence: Welcome them and tell them what this form is for.`;
}
