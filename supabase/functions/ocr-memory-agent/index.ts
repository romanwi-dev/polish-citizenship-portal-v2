import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getErrorMessage } from "../_shared/error-utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PatternData {
  avgConfidence?: number;
  commonFields?: string[];
  errorPatterns?: string[];
  successfulExtractions?: number;
  lastUpdated?: string;
  [key: string]: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, patternKey, patternData } = await req.json();

    if (action === 'get') {
      const { data, error } = await supabase
        .from('ocr_patterns_memory')
        .select('*')
        .eq('pattern_key', patternKey)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return new Response(JSON.stringify({ 
        success: true, 
        data: data?.pattern_data || null 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update') {
      const { data: existing } = await supabase
        .from('ocr_patterns_memory')
        .select('*')
        .eq('pattern_key', patternKey)
        .single();

      if (existing) {
        const { error: updateError } = await supabase
          .from('ocr_patterns_memory')
          .update({
            pattern_data: patternData,
            success_count: (existing.success_count || 0) + 1,
            last_updated: new Date().toISOString(),
          })
          .eq('pattern_key', patternKey);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('ocr_patterns_memory')
          .insert({
            pattern_key: patternKey,
            pattern_data: patternData,
            success_count: 1,
          });

        if (insertError) throw insertError;
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'store_batch_patterns') {
      const batchResults = patternData.batchResults || [];
      
      // Calculate aggregate metrics
      const totalProcessed = batchResults.length;
      const successfulScans = batchResults.filter((r: any) => r.success).length;
      const avgConfidence = batchResults.reduce((sum: number, r: any) => 
        sum + (r.confidence || 0), 0
      ) / totalProcessed;

      // Store batch learning
      const batchKey = `poa_batch_${new Date().toISOString().split('T')[0]}`;
      
      const { error } = await supabase
        .from('ocr_patterns_memory')
        .upsert({
          pattern_key: batchKey,
          pattern_data: {
            avgConfidence,
            totalProcessed,
            successRate: successfulScans / totalProcessed,
            documentTypes: batchResults.map((r: any) => r.documentType),
            timestamp: new Date().toISOString(),
          },
          success_count: successfulScans,
        });

      if (error) throw error;

      return new Response(JSON.stringify({ 
        success: true,
        metrics: {
          avgConfidence,
          successRate: successfulScans / totalProcessed,
          totalProcessed,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('OCR Memory Agent error:', error);
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});