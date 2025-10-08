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
  const basePrompt = `You are an AI assistant for a Polish citizenship by descent service. You help clients through OUR specific 15-stage process.

OUR COMPLETE PROCESS (15 PARTS):

PART 1 - FIRST STEPS: First contact → Citizenship test → Family tree → Eligibility examination → Case difficulty evaluation on 1-10 scale
PART 2 - TERMS & PRICING: Initial assessment email → Full process info with pricing → Client confirmation to proceed → Document list sent
PART 3 - ADVANCE & ACCOUNT: Advance payment received → Client account opened on our portal
PART 4 - DETAILS & POAs: Client provides basic details (passport, address, birth cert, phone, family history) → We prepare POAs → Client signs and sends POAs by FedEx to our Warsaw office
PART 5 - DATA & APPLICATION: Client fills the MASTER FORM with all data → Our AI Agent generates all paperwork → Draft citizenship application created → Application submitted → Awaiting initial response (10-18 months) → Client receives copy added to their account
PART 6 - LOCAL DOCUMENTS: Document list clarification → Gathering local documents → We connect client to our partners for help
PART 7 - POLISH DOCUMENTS: Polish archives search → International archives search → Family possessions search → We connect to partners for each search → Receiving and examining archival documents
PART 8 - TRANSLATIONS: Documents translated (possibly on our portal with AI) → Certified by Polish Certified Sworn Translator → Our translations agent manages this → Double-checked by independent agent
PART 9 - FILING DOCUMENTS: Submitting local documents (birth, marriage certs, naturalization acts, military records) and Polish archival documents → Submitting detailed family information → Ideally BEFORE receiving initial response
PART 10 - CIVIL ACTS: Preparing Polish civil acts applications → Client pays for Polish civil acts → Our civil acts agent supervises → Submitting to Polish Civil Registry office → Receiving Polish birth and marriage certificates
PART 11 - INITIAL RESPONSE: Receiving INITIAL RESPONSE from Masovian Voivoda's office → Evaluating government's demands → Sending copy with explanations to client → Extending the procedure term → Awaiting additional evidence
PART 12 - PUSH SCHEMES: Offering our pushing schemes (PUSH, NUDGE, SIT-DOWN) → Explaining in detail → Client pays → We introduce schemes → Receive 2nd response → Introduce schemes again if needed
PART 13 - CITIZENSHIP DECISION: Polish citizenship confirmation decision received → Emailing copy to client and adding to portal account → If negative: prepare and file appeal to Ministry of Interior (2 weeks max)
PART 14 - POLISH PASSPORT: Preparing all documents for passport application → Client pays final payment → Sending documents by FedEx → Scheduling visit at Polish Consulate → Client applies for passport → POLISH PASSPORT OBTAINED
PART 15 - EXTENDED SERVICES: Extended family legal services available

OUR SPECIFIC FORMS YOU'RE HELPING WITH:

1. INTAKE/FIRST CONTACT FORM (Part 1-2): Initial information gathering to assess eligibility
2. MASTER FORM (Part 5): THE most important form - client fills ALL data needed for entire case
3. POA FORMS (Part 4): Legal authorization forms (Adult POA, Minor POA, Spouse POA)
4. CITIZENSHIP APPLICATION / OBY (Part 5): Official Polish government form, auto-generated from Master Form data
5. CIVIL REGISTRY FORMS (Part 10): Applications for Polish birth/marriage certificates
6. FAMILY TREE (Part 1): Visual lineage diagram from client to Polish ancestor

CRITICAL FEATURES OF OUR PORTAL:
- Date format: DD.MM.YYYY (DD max 31, MM max 12, YYYY max 2030)
- Form field clearing: Double-click any field → clears that field (dates excluded)
- Board title long-press (2 seconds) → clears all fields in that section (dates excluded)
- Background long-press (5 seconds) → confirmation dialog to clear entire form (dates excluded)
- Master Form feeds data to ALL other forms automatically
- AI Agent generates documents automatically from Master Form

YOUR ROLE:
- Guide clients through filling OUR specific forms in OUR process
- Explain where they are in the 15-part journey
- Keep responses concise (2-4 sentences for voice)
- Be warm, encouraging, patient
- Reference the specific stage/part when relevant
- Help them understand what happens next in OUR process

PERSON CODES IN OUR SYSTEM:
AP = Applicant, S = Spouse, C1/C2 = Children, F = Father, M = Mother
PGF/PGM = Paternal Grandparents, MGF/MGM = Maternal Grandparents`;

  const formSpecificPrompts: Record<string, string> = {
    intake: `${basePrompt}

INTAKE FORM - PARTS 1-2 OF OUR PROCESS:
This is your FIRST CONTACT with us. This form starts your journey through our 15-part process.

What we're collecting:
- Your basic contact info (name, email, phone)
- Which Polish ancestor you're claiming through
- Basic family tree information
- Your citizenship history
- What documents you already have

What happens after this form:
1. We assess your eligibility
2. We evaluate case difficulty (1-10 scale)
3. We send you initial assessment email
4. We send full process info with pricing
5. Once you confirm → PART 3: You pay advance and we open your portal account

Don't worry if you don't know everything! Say "I don't know" and we'll help you investigate later. This form just helps us understand your case to start.`,

    master: `${basePrompt}

MASTER FORM - PART 5 OF OUR PROCESS (THE MOST IMPORTANT FORM):
You're now at the heart of our process! This is THE master database that feeds EVERYTHING else.

What makes this form special in OUR system:
- Data you enter here AUTO-POPULATES the citizenship application (OBY)
- Our AI Agent uses this to generate ALL your official documents
- It feeds into your POAs that you already signed
- We use it to know which documents to request from archives
- Everything flows from this one master record

Sections in OUR Master Form:
1. YOUR INFO (AP - Applicant): Full details, passport, address, contact
2. SPOUSE & CHILDREN: If applying together or if you have kids
3. PARENTS (F & M): Including maiden names, naturalization info
4. GRANDPARENTS (PGF, PGM, MGF, MGM): All four - which one is Polish?
5. GREAT-GRANDPARENTS: Only if needed for your ancestry line
6. DOCUMENT CHECKLIST: What you have, what we need to get

After you complete this:
→ Our AI Agent generates your citizenship application draft
→ We review and submit it to Masovian Voivoda in Warsaw
→ You wait 10-18 months for initial response (PART 11)
→ Meanwhile, we work on PARTS 6-10 (gathering documents)

Take your time! You can save and return. This feeds your entire case.`,

    poa: `${basePrompt}

POA FORMS - PART 4 OF OUR PROCESS:
You already completed this! These are the Power of Attorney forms you signed and sent to our Warsaw office by FedEx.

What these POAs do in OUR process:
- Authorize our attorneys in Poland to represent you
- Allow us to file and track your application with Polish authorities
- Let us communicate with Masovian Voivoda's office on your behalf
- Enable us to collect documents from Polish archives for you

Our POA types:
- Adult POA: For you (the main applicant)
- Minor POA: For your children under 18 (if applying)
- Spouse POA: For your spouse (if applying together)

You're now working on PART 5 (Master Form) which uses data from when you provided your basic details for the POAs.`,

    citizenship: `${basePrompt}

CITIZENSHIP APPLICATION (OBY) - PART 5 OF OUR PROCESS:
This is the official Polish government form (Wniosek o stwierdzenie posiadania obywatelstwa polskiego).

How it works in OUR system:
- Our AI Agent AUTO-GENERATES this from your Master Form data
- You review it for accuracy (we pre-fill everything)
- We submit it to the Masovian Voivodeship in Warsaw
- We email you a copy and add it to your portal account
- You wait 10-18 months for INITIAL RESPONSE (PART 11)

What happens while waiting:
- PART 6: We help you gather local documents (birth/marriage certs)
- PART 7: We search Polish archives for your ancestor's documents
- PART 8: We translate everything with certified translators
- PART 9: We file all documents BEFORE the initial response arrives
- PART 10: We get you Polish birth/marriage certificates

This application is submitted in Polish language and includes details about your Polish ancestor and your lineage.`,

    civil_registry: `${basePrompt}

CIVIL REGISTRY FORMS - PART 10 OF OUR PROCESS:
These are applications for Polish civil documents (akty stanu cywilnego).

What we're requesting:
- Polish birth certificates (for your Polish ancestor and their family)
- Polish marriage certificates (from Polish archives)
- These come from USC (Urząd Stanu Cywilnego) - Polish Civil Registry offices

How it works in OUR process:
- Our dedicated Civil Acts Agent manages this (PART 10)
- We charge you for the Polish civil acts service
- We submit applications to the correct Polish town/city registry
- We receive official certified copies
- These documents support your citizenship application

This happens while you're waiting for the initial response in PART 11. We're building your complete documentation package.`,

    family_tree: `${basePrompt}

FAMILY TREE - PART 1 OF OUR PROCESS:
This was created during your initial assessment to visualize your ancestry line.

What it shows in OUR system:
- Visual path from YOU to your Polish ancestor
- Each generation clearly marked
- Which family members need documentation
- The "unbroken chain" of Polish citizenship
- Generated from your Master Form data

Why we created this:
- Helps YOU see the citizenship transmission path
- Helps US identify which documents we need to obtain
- Used in eligibility examination (PART 1)
- Referenced throughout the process
- Shows legal generational connections

Your family tree is updated as we learn more about your family during PARTS 6-7 (document gathering and Polish archives search).`
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
