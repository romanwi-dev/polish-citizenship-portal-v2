import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function RunAuditNow() {
  const [status, setStatus] = useState<'running' | 'complete' | 'error'>('running');
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    runAudit();
  }, []);

  const runAudit = async () => {
    try {
      setStatus('running');
      
      const auditProposal = {
        type: 'mixed',
        description: 'Comprehensive system audit of Polish Citizenship Portal',
        impact: 'System-wide assessment across all edge functions, database tables, and workflows',
        files: [
          { path: 'supabase/functions/fill-pdf/index.ts', action: 'edit', changes: 'Analyze PDF generation' },
          { path: 'supabase/functions/ai-agent/index.ts', action: 'edit', changes: 'Diagnose AI agent failures' },
          { path: 'supabase/functions/ocr-worker/index.ts', action: 'edit', changes: 'Investigate OCR failures' },
        ],
        edgeFunctions: [
          { name: 'fill-pdf', changes: 'Test PDF field mapping and template preservation' },
          { name: 'ai-agent', changes: 'Test Lovable AI Gateway connectivity' },
          { name: 'ocr-worker', changes: 'Diagnose Dropbox path errors' },
          { name: 'verify-changes', changes: 'Confirm OpenAI verification operational' },
          { name: 'dropbox-sync', changes: 'Check Dropbox integration' },
        ],
        reasoning: `Critical Issues:
1. PDF Templates - Loading fields but not content
2. AI Agent - Execution failures
3. OCR Worker - 100% failure rate with Dropbox path errors
4. Edge Functions - Possible deployment issues`,
        risks: [
          'PDF generation may be broken',
          'AI agents not functioning',
          'OCR failing on all documents',
          'Workflow blockage',
        ],
        rollbackPlan: 'READ-ONLY audit - no changes made'
      };

      console.log('Starting audit verification...');
      
      const { data, error } = await supabase.functions.invoke('verify-changes', {
        body: { proposal: auditProposal }
      });

      if (error) {
        console.error('Audit error:', error);
        setStatus('error');
        setResults({ error: error.message });
        return;
      }

      console.log('Audit complete:', data);
      setResults(data);
      setStatus('complete');

    } catch (error) {
      console.error('Audit failed:', error);
      setStatus('error');
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">System Audit Running</h1>
          {status === 'running' && (
            <div className="flex items-center justify-center gap-3 text-lg text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              Analyzing all systems...
            </div>
          )}
        </div>

        {status === 'complete' && results && (
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {results.approved ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                  Audit Result: {results.recommendation?.toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Overall Score</h3>
                  <div className="text-3xl font-bold text-primary">{results.overallScore}/100</div>
                </div>

                {results.scores && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Logic</div>
                      <div className="font-semibold">{results.scores.logic?.score}/100</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Security</div>
                      <div className="font-semibold">{results.scores.security?.score}/100</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Database</div>
                      <div className="font-semibold">{results.scores.database?.score}/100</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Code Quality</div>
                      <div className="font-semibold">{results.scores.codeQuality?.score}/100</div>
                    </div>
                  </div>
                )}

                {results.criticalIssues?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      Critical Issues
                    </h3>
                    <ul className="space-y-1">
                      {results.criticalIssues.map((issue: string, i: number) => (
                        <li key={i} className="text-sm text-red-600">• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.warnings?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Warnings
                    </h3>
                    <ul className="space-y-1">
                      {results.warnings.map((warning: string, i: number) => (
                        <li key={i} className="text-sm text-yellow-600">• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.explanation && (
                  <div>
                    <h3 className="font-semibold mb-2">Explanation</h3>
                    <p className="text-sm text-muted-foreground">{results.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {status === 'error' && results?.error && (
          <Card className="border-2 border-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <XCircle className="h-6 w-6" />
                Audit Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{results.error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
