// FIX #5: Explicit Security Validation - Server-side document access with ownership verification
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { caseId, verifyOwnership = true } = await req.json();

    if (!caseId) {
      return new Response(
        JSON.stringify({ error: 'Case ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('[get-case-documents] Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[get-case-documents] User ${user.id} requesting documents for case ${caseId}`);

    // FIX #5: Explicit ownership verification (not just RLS)
    if (verifyOwnership) {
      // Check if user is admin
      const { data: roles, error: rolesError } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      const isAdmin = !rolesError && roles && roles.length > 0;

      // If not admin, verify user owns the case or has portal access
      if (!isAdmin) {
        const { data: caseAccess, error: accessError } = await supabaseClient
          .from('cases')
          .select('id, user_id')
          .eq('id', caseId)
          .single();

        if (accessError || !caseAccess) {
          // Check client portal access
          const { data: portalAccess, error: portalError } = await supabaseClient
            .from('client_portal_access')
            .select('case_id')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single();

          if (portalError || !portalAccess) {
            console.error('[get-case-documents] Access denied:', { userId: user.id, caseId });
            return new Response(
              JSON.stringify({ 
                error: 'Access denied to this case',
                details: 'You do not have permission to view documents for this case'
              }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else if (caseAccess.user_id !== user.id) {
          console.error('[get-case-documents] Case ownership mismatch:', { 
            userId: user.id, 
            caseOwnerId: caseAccess.user_id 
          });
          return new Response(
            JSON.stringify({ 
              error: 'Access denied',
              details: 'You do not own this case'
            }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      console.log(`[get-case-documents] Access verified for user ${user.id} on case ${caseId}`);
    }

    // Fetch documents with explicit server-side filtering
    const { data: documents, error: docsError } = await supabaseClient
      .from('documents')
      .select(`
        *,
        ocr_documents(
          id,
          ocr_text,
          confidence_score,
          status,
          extracted_data
        )
      `)
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (docsError) {
      console.error('[get-case-documents] Database error:', docsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch documents', details: docsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // FIX #5: Double-check all documents belong to requested case (defense in depth)
    const invalidDocs = documents?.filter(d => d.case_id !== caseId) || [];
    if (invalidDocs.length > 0) {
      console.error('[get-case-documents] SECURITY ALERT: Documents from other cases detected!', {
        caseId,
        invalidDocIds: invalidDocs.map(d => d.id)
      });
      
      // Filter out invalid documents
      const validDocuments = documents?.filter(d => d.case_id === caseId) || [];
      
      return new Response(
        JSON.stringify({ 
          success: true,
          documents: validDocuments,
          warning: 'Some documents were filtered due to security validation'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[get-case-documents] Returning ${documents?.length || 0} documents for case ${caseId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        documents: documents || [],
        caseId,
        count: documents?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[get-case-documents] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
