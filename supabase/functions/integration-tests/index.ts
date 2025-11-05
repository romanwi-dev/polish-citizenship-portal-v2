/**
 * Integration Test Suite for Edge Functions
 * PHASE C - TASK 8: Automated testing
 */

import { corsHeaders } from '../_shared/cors.ts';

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  details?: any;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passed: number;
  failed: number;
  duration: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(req.headers.get('origin')) });
  }

  try {
    const { suite } = await req.json();
    const suiteStartTime = Date.now();
    const results: TestResult[] = [];

    // Test Suite 1: PDF Generation
    if (!suite || suite === 'pdf-generation') {
      // Test 1: fill-pdf endpoint responds
      const test1Start = Date.now();
      try {
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/fill-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          },
          body: JSON.stringify({
            mode: 'diagnose',
          }),
        });

        const data = await response.json();
        results.push({
          name: 'fill-pdf diagnostic',
          success: response.status === 200 || response.status === 401, // 401 is expected without admin token
          duration: Date.now() - test1Start,
          details: { status: response.status },
        });
      } catch (error) {
        results.push({
          name: 'fill-pdf diagnostic',
          success: false,
          duration: Date.now() - test1Start,
          error: String(error),
        });
      }

      // Test 2: get-performance-stats responds
      const test2Start = Date.now();
      try {
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/get-performance-stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          },
        });

        results.push({
          name: 'get-performance-stats',
          success: response.status === 200,
          duration: Date.now() - test2Start,
        });
      } catch (error) {
        results.push({
          name: 'get-performance-stats',
          success: false,
          duration: Date.now() - test2Start,
          error: String(error),
        });
      }
    }

    // Test Suite 2: Document Workflow
    if (!suite || suite === 'document-workflow') {
      // Test 3: OCR endpoint availability
      const test3Start = Date.now();
      try {
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ocr-universal`, {
          method: 'OPTIONS',
        });

        results.push({
          name: 'ocr-universal OPTIONS',
          success: response.status === 200,
          duration: Date.now() - test3Start,
        });
      } catch (error) {
        results.push({
          name: 'ocr-universal OPTIONS',
          success: false,
          duration: Date.now() - test3Start,
          error: String(error),
        });
      }

      // Test 4: Download endpoint availability
      const test4Start = Date.now();
      try {
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/download-and-encode`, {
          method: 'OPTIONS',
        });

        results.push({
          name: 'download-and-encode OPTIONS',
          success: response.status === 200,
          duration: Date.now() - test4Start,
        });
      } catch (error) {
        results.push({
          name: 'download-and-encode OPTIONS',
          success: false,
          duration: Date.now() - test4Start,
          error: String(error),
        });
      }
    }

    // Test Suite 3: Connection Pool
    if (!suite || suite === 'connection-pool') {
      // Test 5: Connection pool stats
      const test5Start = Date.now();
      try {
        // Import connection pool
        const { connectionPool } = await import('../_shared/connection-pool.ts');
        const stats = connectionPool.getStats();

        results.push({
          name: 'connection-pool stats',
          success: true,
          duration: Date.now() - test5Start,
          details: stats,
        });
      } catch (error) {
        results.push({
          name: 'connection-pool stats',
          success: false,
          duration: Date.now() - test5Start,
          error: String(error),
        });
      }

      // Test 6: Template cache stats
      const test6Start = Date.now();
      try {
        const { templateCache } = await import('../_shared/template-cache-v2.ts');
        const stats = templateCache.getStats();

        results.push({
          name: 'template-cache stats',
          success: true,
          duration: Date.now() - test6Start,
          details: stats,
        });
      } catch (error) {
        results.push({
          name: 'template-cache stats',
          success: false,
          duration: Date.now() - test6Start,
          error: String(error),
        });
      }
    }

    // Compile results
    const totalDuration = Date.now() - suiteStartTime;
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    const testSuite: TestSuite = {
      name: suite || 'all',
      tests: results,
      totalTests: results.length,
      passed,
      failed,
      duration: totalDuration,
    };

    return new Response(
      JSON.stringify(testSuite),
      {
        headers: { ...corsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
      }
    );
  }
});
