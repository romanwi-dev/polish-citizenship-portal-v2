import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeRequest {
  functionName: string;
}

interface AnalyzeResponse {
  success: boolean;
  functionName: string;
  code?: string;
  exists?: boolean;
  error?: string;
  lineCount?: number;
  size?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { functionName } = await req.json() as AnalyzeRequest;

    if (!functionName) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'functionName is required' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📄 Reading edge function: ${functionName}`);

    // Construct the path to the edge function
    const functionPath = `./functions/${functionName}/index.ts`;
    
    try {
      // Read the file content
      const code = await Deno.readTextFile(functionPath);
      const lineCount = code.split('\n').length;
      const size = new TextEncoder().encode(code).length;

      console.log(`✅ Successfully read ${functionName}: ${lineCount} lines, ${size} bytes`);

      return new Response(
        JSON.stringify({
          success: true,
          functionName,
          code,
          exists: true,
          lineCount,
          size
        } as AnalyzeResponse),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (fileError) {
      console.error(`❌ Failed to read ${functionName}:`, fileError);
      
      return new Response(
        JSON.stringify({
          success: false,
          functionName,
          exists: false,
          error: fileError instanceof Error ? fileError.message : 'File not found'
        } as AnalyzeResponse),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('❌ Edge function analyzer error:', error);
    
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
