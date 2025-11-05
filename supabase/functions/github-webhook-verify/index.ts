import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-github-event, x-hub-signature-256',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const githubEvent = req.headers.get('x-github-event');
    
    if (githubEvent !== 'push') {
      console.log(`Ignoring GitHub event: ${githubEvent}`);
      return new Response(JSON.stringify({ message: 'Event ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const payload = await req.json();
    
    console.log('📦 GitHub push event received');
    console.log(`Repository: ${payload.repository?.full_name}`);
    console.log(`Branch: ${payload.ref}`);
    console.log(`Commits: ${payload.commits?.length || 0}`);

    const branch = payload.ref?.replace('refs/heads/', '') || 'unknown';
    const commitSha = payload.after || payload.head_commit?.id;
    const author = payload.head_commit?.author?.name || payload.pusher?.name;
    const commitMessage = payload.head_commit?.message;
    
    // Extract changed files
    const changedFiles: string[] = [];
    if (payload.commits) {
      for (const commit of payload.commits) {
        if (commit.added) changedFiles.push(...commit.added);
        if (commit.modified) changedFiles.push(...commit.modified);
        if (commit.removed) changedFiles.push(...commit.removed);
      }
    }

    console.log(`Changed files: ${changedFiles.length}`);

    // Determine verification scope based on changed files
    let verificationScope = 'custom';
    const workflowFiles = changedFiles.filter(f => 
      f.includes('workflow') || 
      f.includes('AIDocumentWorkflow') ||
      f.includes('useWorkflow') ||
      f.includes('DocumentProgress')
    );
    
    const formFiles = changedFiles.filter(f => 
      f.includes('Form.tsx') || 
      f.includes('form/')
    );
    
    const securityFiles = changedFiles.filter(f => 
      f.includes('security') || 
      f.includes('auth') || 
      f.includes('secure') ||
      f.includes('PII')
    );

    if (workflowFiles.length > 0) {
      verificationScope = 'workflow';
    } else if (formFiles.length > 0) {
      verificationScope = 'forms';
    } else if (securityFiles.length > 0) {
      verificationScope = 'security';
    } else if (changedFiles.length > 10) {
      verificationScope = 'full_portal';
    }

    console.log(`📋 Verification scope determined: ${verificationScope}`);

    // Create verification run record
    const { data: verificationRun, error: insertError } = await supabase
      .from('verification_runs')
      .insert({
        trigger_type: 'github_push',
        trigger_metadata: {
          repository: payload.repository?.full_name,
          pusher: payload.pusher?.name,
          compare_url: payload.compare
        },
        commit_sha: commitSha,
        branch,
        author,
        commit_message: commitMessage,
        changed_files: changedFiles,
        verification_scope: verificationScope,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create verification run:', insertError);
      throw insertError;
    }

    console.log(`✅ Verification run created: ${verificationRun.id}`);

    // Trigger async verification (don't wait for it)
    const functionUrl = `${supabaseUrl}/functions/v1/auto-verify-portal`;
    
    // Fire and forget - trigger verification asynchronously
    fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        verification_run_id: verificationRun.id,
        verification_scope: verificationScope,
        changed_files: changedFiles
      })
    }).catch(err => {
      console.error('Failed to trigger auto-verification:', err);
    });

    return new Response(
      JSON.stringify({
        success: true,
        verification_run_id: verificationRun.id,
        scope: verificationScope,
        message: 'Verification triggered successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('GitHub webhook error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
