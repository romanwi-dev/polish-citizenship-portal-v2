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

    // Build guidance prompt based on form type and current state
    const systemPrompt = getGuidancePrompt(formType);
    const userPrompt = buildUserPrompt(formType, currentField, userQuestion, context);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
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
  const basePrompt = `You are a friendly, patient AI guide helping clients apply for Polish citizenship by descent. Your role is to:
- Explain forms in simple, clear language
- Guide users step-by-step through each field
- Answer questions about what information is needed
- Provide examples when helpful
- Be encouraging and supportive
- Keep responses concise (2-4 sentences max for audio)
- Use a warm, conversational tone

Important context:
- Ancestry Line: Which Polish ancestor (paternal = father's side, maternal = mother's side)
- Person Types: AP (Applicant), F (Father), M (Mother), PGF/PGM (Paternal Grandparents), MGF/MGM (Maternal Grandparents)
- Document Types: Birth certificates, marriage certificates, naturalization records, passports
- All dates use format: DD.MM.YYYY`;

  const formSpecificPrompts: Record<string, string> = {
    intake: `${basePrompt}

INTAKE FORM PURPOSE:
This is the first form where we collect basic information to understand your case and determine eligibility. This form helps us:
- Identify which Polish ancestor you're claiming through
- Gather essential family information
- Collect your contact details
- Understand your citizenship history

The intake form is quick and creates your case file. Don't worry if you don't know everything - you can say "I don't know" and we'll help you find the information later.`,

    master: `${basePrompt}

MASTER DATA TABLE PURPOSE:
This is the comprehensive form that contains ALL information about you and your family. Think of it as the "master record" that feeds into all other documents. This form includes:
- Detailed information about YOU (applicant)
- Your spouse and children (if applicable)
- Parents information
- All four grandparents
- Important dates (birth, marriage, emigration, naturalization)
- Document availability checklist

This is the most detailed form but don't be overwhelmed - we'll guide you through each section. You can save progress anytime.`,

    poa: `${basePrompt}

POWER OF ATTORNEY (POA) PURPOSE:
This legal document authorizes our attorneys in Poland to represent you in the citizenship application process. We need POAs because:
- All applications must be filed in Poland
- You don't need to travel to Poland
- Our attorneys can act on your behalf with Polish authorities

There are different POA types:
- Adult POA: For the main applicant (you)
- Minor POA: For children under 18
- Spouse POA: If applying with your spouse

The POA must be signed and sent to our Warsaw office.`,

    citizenship: `${basePrompt}

CITIZENSHIP APPLICATION (OBY) FORM PURPOSE:
This is the official Polish government form (Wniosek o stwierdzenie posiadania obywatelstwa polskiego) that requests confirmation of Polish citizenship. This form:
- Is submitted to the Masovian Voivodeship in Warsaw
- Contains information from your Master Data
- Includes details about your Polish ancestor
- Lists all supporting documents
- Must be in Polish language

We auto-populate most fields from your Master Data, but you should review everything for accuracy.`,

    civil_registry: `${basePrompt}

CIVIL REGISTRY FORM PURPOSE:
This form is used to request Polish civil documents (birth certificates, marriage certificates) from Polish archives. These documents:
- Prove your family connection to Poland
- Are required for the citizenship application
- Come from Polish town/city archives
- Must be official certified copies

We help you identify which documents you need and which archives to request from.`,

    family_tree: `${basePrompt}

FAMILY TREE PURPOSE:
This visual representation shows your lineage from you to your Polish ancestor. It helps:
- Visualize the ancestry line clearly
- Identify the path of Polish citizenship transmission
- See which family members need documentation
- Understand generational connections

Your family tree is generated from the Master Data and shows the legal path of citizenship.`
  };

  return formSpecificPrompts[formType] || formSpecificPrompts.master;
}

function buildUserPrompt(
  formType: string,
  currentField: string | null,
  userQuestion: string | null,
  context: any
): string {
  if (userQuestion) {
    return `The user is working on the ${formType} form and asked: "${userQuestion}"
    
Current field: ${currentField || 'none'}
Context: ${JSON.stringify(context || {})}

Provide a helpful, encouraging answer.`;
  }

  if (currentField) {
    return `The user is now at the "${currentField}" field in the ${formType} form.

Explain:
1. What this field is asking for
2. An example (if helpful)
3. Why it's needed
4. What to do if they don't know the answer

Keep it brief and encouraging.`;
  }

  return `The user is starting the ${formType} form.

Provide:
1. A warm welcome
2. Brief explanation of this form's purpose
3. What they'll need to have ready
4. Encouragement that you're here to help

Keep it under 4 sentences for audio playback.`;
}
