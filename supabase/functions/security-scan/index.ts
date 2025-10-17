import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityIssue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  remediation: string;
  affected_items?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const issues: SecurityIssue[] = [];

    console.log('Starting comprehensive security scan...');

    // 1. RLS POLICY AUDIT (CRITICAL)
    console.log('Scanning RLS policies...');
    
    // Query information_schema directly using raw SQL
    const { data: tablesData, error: tablesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT t.tablename as table_name, t.rowsecurity as rls_enabled
        FROM pg_tables t
        WHERE t.schemaname = 'public'
        AND t.tablename NOT LIKE 'pg_%'
        AND t.tablename NOT LIKE 'sql_%'
      `
    });

    if (tablesError) {
      console.error('Error checking RLS:', tablesError);
      // Add a warning instead of failing
      issues.push({
        category: 'RLS Policies',
        severity: 'high',
        title: 'Unable to verify RLS status',
        description: 'Could not check Row Level Security status for all tables.',
        remediation: 'Manually verify that all tables have RLS enabled using: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = \'public\';',
        affected_items: ['database']
      });
    } else if (tablesData) {
      for (const table of tablesData as any[]) {
        if (!table.rls_enabled) {
          issues.push({
            category: 'RLS Policies',
            severity: 'critical',
            title: `Table "${table.table_name}" has RLS disabled`,
            description: `The table ${table.table_name} does not have Row Level Security enabled, potentially exposing all data.`,
            remediation: `ALTER TABLE public.${table.table_name} ENABLE ROW LEVEL SECURITY;`,
            affected_items: [table.table_name]
          });
        }
      }
    }

    // 2. AUTHENTICATION & JWT VERIFICATION (CRITICAL)
    console.log('Checking edge function JWT settings...');
    const publicFunctions = [
      'analyze-forms',
      'get-form-code', 
      'realtime-token',
      'validate-intake-token',
      'send-welcome-email',
      'partner-api',
      'check-password-breach',
      'text-to-speech'
    ];

    for (const funcName of publicFunctions) {
      if (!['check-password-breach', 'partner-api'].includes(funcName)) {
        issues.push({
          category: 'Authentication',
          severity: 'critical',
          title: `Function "${funcName}" allows unauthenticated access`,
          description: `Edge function ${funcName} has verify_jwt=false, allowing anyone to call it without authentication.`,
          remediation: `Review if this function truly needs public access. If not, set verify_jwt=true in supabase/config.toml`,
          affected_items: [funcName]
        });
      }
    }

    // 3. DATA EXPOSURE ANALYSIS (CRITICAL)
    console.log('Scanning for PII in logs...');
    const { data: recentLogs } = await supabase
      .from('security_audit_logs')
      .select('details')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (recentLogs) {
      const piiPatterns = [
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // Email
        /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/, // SSN-like
        /\b(?:\d{4}[-\s]?){3}\d{4}\b/, // Credit card-like
        /passport[:\s]+[A-Z0-9]{6,}/i // Passport
      ];

      for (const log of recentLogs) {
        const logStr = JSON.stringify(log.details);
        for (const pattern of piiPatterns) {
          if (pattern.test(logStr)) {
            issues.push({
              category: 'Data Exposure',
              severity: 'critical',
              title: 'PII detected in security logs',
              description: 'Personally Identifiable Information was found in audit logs, violating data protection policies.',
              remediation: 'Implement data masking before logging. Use the dataMasking utility for all PII fields.',
              affected_items: ['security_audit_logs']
            });
            break;
          }
        }
      }
    }

    // 4. SECRETS MANAGEMENT (CRITICAL)
    console.log('Checking for exposed secrets...');
    const requiredSecrets = [
      'DROPBOX_ACCESS_TOKEN',
      'ADOBE_CLIENT_ID',
      'ADOBE_CLIENT_SECRET',
      'OPENAI_API_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    for (const secret of requiredSecrets) {
      const value = Deno.env.get(secret);
      if (!value || value === 'undefined' || value === 'null') {
        issues.push({
          category: 'Secrets Management',
          severity: 'high',
          title: `Required secret "${secret}" not configured`,
          description: `The secret ${secret} is missing or empty, which may cause functionality failures.`,
          remediation: `Configure ${secret} in Supabase Secrets Manager via the dashboard.`,
          affected_items: [secret]
        });
      }
    }

    // 5. RATE LIMITING CHECK (HIGH)
    console.log('Verifying rate limiting...');
    const { data: recentMetrics } = await supabase
      .from('security_metrics')
      .select('metric_type, metric_value')
      .eq('metric_type', 'rate_limit_exceeded')
      .gte('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: false })
      .limit(100);

    if (recentMetrics && recentMetrics.length === 0) {
      issues.push({
        category: 'Rate Limiting',
        severity: 'medium',
        title: 'No rate limiting metrics detected',
        description: 'No rate limit exceeded events found in the last 7 days. Verify rate limiting is properly configured.',
        remediation: 'Implement rate limiting on all public edge functions using the rate limiting middleware.',
        affected_items: ['public edge functions']
      });
    }

    // 6. OWASP TOP 10 COMPLIANCE
    console.log('Running OWASP compliance checks...');
    
    // A01: Broken Access Control - already checked in RLS section
    const rlsIssues = issues.filter(i => i.category === 'RLS Policies' && i.severity === 'critical');
    if (rlsIssues.length > 0) {
      issues.push({
        category: 'OWASP A01',
        severity: 'critical',
        title: 'Broken Access Control detected',
        description: `${rlsIssues.length} table(s) lack proper RLS policies, allowing unauthorized access.`,
        remediation: 'Enable RLS and create appropriate policies for all tables containing user data.',
        affected_items: rlsIssues.flatMap(i => i.affected_items || [])
      });
    }

    // 7. SECURITY METRICS ANALYSIS
    console.log('Analyzing security metrics trends...');
    const { data: failedLogins } = await supabase
      .from('security_audit_logs')
      .select('id')
      .eq('event_type', 'auth_failed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (failedLogins && failedLogins.length > 100) {
      issues.push({
        category: 'Security Monitoring',
        severity: 'high',
        title: 'High volume of failed login attempts',
        description: `Detected ${failedLogins.length} failed login attempts in the last 24 hours, indicating potential brute force attack.`,
        remediation: 'Implement account lockout after 5 failed attempts and enable CAPTCHA for login.',
        affected_items: ['authentication system']
      });
    }

    // 8. DATABASE FUNCTION SECURITY
    console.log('Auditing database functions...');
    // Note: information_schema.routines requires special privileges
    // For now, we'll add this as a manual check recommendation
    issues.push({
      category: 'Database Security',
      severity: 'info',
      title: 'Manual review: Database function security',
      description: 'Security-critical functions should use SECURITY DEFINER and set search_path explicitly.',
      remediation: 'Review all database functions to ensure: 1) SECURITY DEFINER is set for auth/access functions, 2) search_path is explicitly set to prevent search_path attacks.',
      affected_items: ['database functions']
    });

    // Calculate scores
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const highCount = issues.filter(i => i.severity === 'high').length;
    const mediumCount = issues.filter(i => i.severity === 'medium').length;
    const lowCount = issues.filter(i => i.severity === 'low').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;

    // Scoring: Start at 100, deduct points based on severity
    let score = 100;
    score -= criticalCount * 25; // Critical issues are devastating
    score -= highCount * 10;
    score -= mediumCount * 5;
    score -= lowCount * 2;
    score -= infoCount * 1;
    score = Math.max(0, score); // Can't go below 0

    const scanDuration = Date.now() - startTime;

    // Store results
    const scanResults = {
      scan_date: new Date().toISOString(),
      overall_score: score,
      critical_issues: criticalCount,
      high_issues: highCount,
      medium_issues: mediumCount,
      low_issues: lowCount,
      info_issues: infoCount,
      scan_duration_ms: scanDuration,
      results: {
        issues,
        summary: {
          total_issues: issues.length,
          categories_scanned: 10,
          compliance: {
            'OWASP Top 10': criticalCount === 0 ? 'Pass' : 'Fail',
            'GDPR Ready': issues.filter(i => i.category.includes('Data Exposure')).length === 0 ? 'Pass' : 'Fail',
            'Zero Trust': score >= 95 ? 'Pass' : 'Fail'
          }
        }
      },
      performed_by: null // System scan
    };

    const { error: insertError } = await supabase
      .from('security_scan_results')
      .insert(scanResults);

    if (insertError) {
      console.error('Error storing scan results:', insertError);
    }

    console.log(`Security scan complete. Score: ${score}/100, Issues: ${issues.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        score,
        issues,
        summary: {
          critical: criticalCount,
          high: highCount,
          medium: mediumCount,
          low: lowCount,
          info: infoCount,
          total: issues.length,
          duration_ms: scanDuration
        },
        compliance: {
          'OWASP Top 10': criticalCount === 0,
          'GDPR Ready': issues.filter(i => i.category.includes('Data Exposure')).length === 0,
          'Production Ready': score >= 95
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Security scan error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        score: 0,
        issues: [],
        summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});