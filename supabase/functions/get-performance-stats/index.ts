/**
 * Get Performance Statistics Edge Function
 * PHASE B - TASK 6: Performance monitoring endpoint
 */

import { corsHeaders } from '../_shared/cors.ts';
import { performanceTracker } from '../_shared/performance-tracker.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(req.headers.get('origin')) });
  }

  try {
    const stats = performanceTracker.getAllStats();
    const report = performanceTracker.getReport();

    return new Response(
      JSON.stringify({
        stats,
        report,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[get-performance-stats] Error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
      }
    );
  }
});
