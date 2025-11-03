import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Play, FileCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VerificationResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  details: any;
  timestamp: string;
}

interface VerificationResponse {
  success: boolean;
  summary: {
    verdict: string;
    totalRuns: number;
    totalTests: number;
    successCount: number;
    errorCount: number;
    warningCount: number;
    successRate: string;
    geminiVerifications: number;
    openaiVerifications: number;
    aiVerdictsPass: number;
  };
  results: VerificationResult[];
  recommendation: string;
}

export function PDFVerificationPanel({ caseId }: { caseId: string }) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<VerificationResponse | null>(null);

  const runVerification = async () => {
    setIsRunning(true);
    setResults(null);
    
    try {
      toast.info('Starting comprehensive PDF verification...');
      
      const { data, error } = await supabase.functions.invoke('verify-pdf-filling', {
        body: {
          caseId,
          templateType: 'poa-adult',
          runCount: 3
        }
      });

      if (error) throw error;

      setResults(data);
      
      if (data.success) {
        toast.success('✅ All PDF verification tests PASSED!');
      } else {
        toast.error('❌ PDF verification found issues');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(`Verification failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          PDF Generation Verification System
        </CardTitle>
        <CardDescription>
          Run comprehensive tests with AI verification (Gemini + OpenAI)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runVerification} 
            disabled={isRunning}
            className="gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running Verification...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Full Verification (3 cycles)
              </>
            )}
          </Button>
        </div>

        {results && (
          <div className="space-y-4">
            {/* Summary Card */}
            <Card className={results.success ? 'border-green-500' : 'border-red-500'}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {results.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  {results.summary.verdict}
                </CardTitle>
                <CardDescription>{results.recommendation}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Tests</div>
                    <div className="text-2xl font-bold">{results.summary.totalTests}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                    <div className="text-2xl font-bold text-green-500">{results.summary.successRate}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Passed</div>
                    <div className="text-2xl font-bold text-green-500">{results.summary.successCount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                    <div className="text-2xl font-bold text-red-500">{results.summary.errorCount}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium">Gemini Verifications</div>
                    <div className="text-lg font-bold">{results.summary.geminiVerifications}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium">OpenAI Verifications</div>
                    <div className="text-lg font-bold">{results.summary.openaiVerifications}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detailed Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full">
                  <div className="space-y-2">
                    {results.results.map((result, idx) => (
                      <div 
                        key={idx}
                        className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span className="font-mono text-sm">{result.step}</span>
                          </div>
                          {getStatusBadge(result.status)}
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {new Date(result.timestamp).toLocaleString()}
                        </div>
                        {result.details && (
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {!results && !isRunning && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Run Full Verification" to test PDF generation</p>
                <p className="text-sm mt-2">This will:</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>✓ Generate PDFs 3 times</li>
                  <li>✓ Verify field filling</li>
                  <li>✓ Analyze with Gemini AI</li>
                  <li>✓ Double-check with OpenAI</li>
                  <li>✓ Provide comprehensive report</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
