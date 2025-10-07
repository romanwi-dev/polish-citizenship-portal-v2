import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { password } = await req.json();

    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Password is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash the password using SHA-1
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    // Use k-Anonymity model: send only first 5 chars of hash
    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);

    console.log('Checking password against Have I Been Pwned API...');

    // Query Have I Been Pwned API
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'User-Agent': 'Lovable-Cloud-Password-Check'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to check password breach status');
    }

    const text = await response.text();
    const hashes = text.split('\n');

    // Check if our suffix appears in the results
    let breachCount = 0;
    for (const line of hashes) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix === suffix) {
        breachCount = parseInt(count, 10);
        break;
      }
    }

    const isBreached = breachCount > 0;

    console.log(`Password breach check complete. Breached: ${isBreached}, Count: ${breachCount}`);

    return new Response(
      JSON.stringify({ 
        isBreached,
        breachCount,
        message: isBreached 
          ? `This password has been found in ${breachCount.toLocaleString()} data breaches. Please choose a different password.`
          : 'Password is safe to use.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-password-breach function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
