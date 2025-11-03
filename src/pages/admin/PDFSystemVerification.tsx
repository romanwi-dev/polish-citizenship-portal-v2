import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Sparkles, FileCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function PDFSystemVerification() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [diagnosticsResult, setDiagnosticsResult] = useState<any>(null);

  const runDiagnostics = async () => {
    try {
      toast.loading('Running diagnostics...');
      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { mode: 'diagnose' }
      });

      if (error) throw error;

      setDiagnosticsResult(data);
      toast.dismiss();
      
      if (data.ok) {
        toast.success('✅ All diagnostics passed!');
      } else {
        toast.error('❌ Diagnostics failed - see details');
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Diagnostics failed: ${error.message}`);
      console.error(error);
    }
  };

  const runAIVerification = async (analysisType: string) => {
    setIsAnalyzing(true);
    try {
      toast.loading('Running AI verification with OpenAI GPT-5...');
      
      const { data, error } = await supabase.functions.invoke('verify-pdf-system', {
        body: { analysisType }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast.dismiss();
      toast.success('✅ AI verification complete!');
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Verification failed: ${error.message}`);
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            PDF System Verification
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            NO-RUSH Protocol: Comprehensive Analysis & Testing
          </p>
        </motion.div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Quick Diagnostics
            </CardTitle>
            <CardDescription>
              Run system health checks and environment validation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={runDiagnostics}
              className="w-full"
              size="lg"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Run Diagnostics
            </Button>

            {diagnosticsResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800 space-y-2"
              >
                <div className="flex items-center gap-2">
                  {diagnosticsResult.ok ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-semibold">
                    {diagnosticsResult.ok ? 'All Systems Operational' : 'Issues Detected'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={diagnosticsResult.hasSecrets ? "default" : "destructive"}>
                      Secrets
                    </Badge>
                    <span>{diagnosticsResult.hasSecrets ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={diagnosticsResult.uploadOk ? "default" : "destructive"}>
                      Storage Upload
                    </Badge>
                    <span>{diagnosticsResult.uploadOk ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={diagnosticsResult.signOk ? "default" : "destructive"}>
                      Signed URLs
                    </Badge>
                    <span>{diagnosticsResult.signOk ? '✓' : '✗'}</span>
                  </div>
                </div>

                {diagnosticsResult.diagError && (
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-400">
                    Error: {diagnosticsResult.diagError}
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* AI Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI-Powered Analysis
            </CardTitle>
            <CardDescription>
              Deep analysis using OpenAI GPT-5 for production readiness assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => runAIVerification('security')}
                disabled={isAnalyzing}
                variant="outline"
              >
                {isAnalyzing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <AlertTriangle className="mr-2 h-4 w-4" />
                )}
                Security Analysis
              </Button>
              <Button
                onClick={() => runAIVerification('reliability')}
                disabled={isAnalyzing}
                variant="outline"
              >
                {isAnalyzing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Reliability Check
              </Button>
              <Button
                onClick={() => runAIVerification('comprehensive')}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {isAnalyzing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Full Analysis
              </Button>
            </div>

            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-lg bg-slate-100 dark:bg-slate-800 max-w-none whitespace-pre-wrap"
              >
                <div className="prose dark:prose-invert max-w-none">
                  {analysis}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Template Coverage */}
        <Card>
          <CardHeader>
            <CardTitle>Template Type Coverage</CardTitle>
            <CardDescription>
              Verify all 7 template types are properly supported
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'POA Adult', type: 'poa-adult', form: 'POAForm' },
                { name: 'POA Minor', type: 'poa-minor', form: 'POAForm' },
                { name: 'POA Spouses', type: 'poa-spouses', form: 'POAForm' },
                { name: 'Citizenship', type: 'citizenship', form: 'CitizenshipForm' },
                { name: 'Family Tree', type: 'family-tree', form: 'FamilyTreeForm' },
                { name: 'Registration', type: 'registration', form: 'CivilRegistryForm' },
                { name: 'Transcription', type: 'transcription', form: 'CivilRegistryForm' },
              ].map((template) => (
                <div
                  key={template.type}
                  className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-800"
                >
                  <div className="font-semibold text-sm">{template.name}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {template.type}
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {template.form}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Testing Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>ZERO-FAIL Testing Checklist</CardTitle>
            <CardDescription>
              Manual verification steps for production deployment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                'Run diagnostics with mode="diagnose" → expect ok:true',
                'Generate PDF for each template type on respective forms',
                'Verify downloads work on iOS Safari (signed URLs)',
                'Check files appear in generated-pdfs/{caseId}/ bucket',
                'Test with demo case ID → should show error message',
                'Verify error handling shows user-friendly messages',
                'Test concurrent PDF generation (multiple users)',
                'Confirm 10-minute signed URL expiry works correctly',
                'Verify base64 fallback if signed URL fails',
                'Check CORS headers allow cross-origin requests',
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50"
                >
                  <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-700" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
