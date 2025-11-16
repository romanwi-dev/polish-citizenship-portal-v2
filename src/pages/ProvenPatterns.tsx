import { useState } from "react";
import { ProvenPatternsLibrary } from "@/components/workflows/ProvenPatternsLibrary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { runPhaseA_Performance } from "@/utils/runPhaseA_Performance";
import { runTripleVerification } from "@/utils/tripleVerification";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function ProvenPatterns() {
  const [phaseAResult, setPhaseAResult] = useState<any>(null);
  const [phaseBResult, setPhaseBResult] = useState<any>(null);
  const [isRunningA, setIsRunningA] = useState(false);
  const [isRunningB, setIsRunningB] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'A' | 'B' | 'ready-for-EX'>('idle');

  const runPhaseA = async () => {
    setIsRunningA(true);
    setCurrentPhase('A');
    try {
      const result = await runPhaseA_Performance();
      setPhaseAResult(result);
      if (result.success) {
        // Automatically proceed to Phase B
        await runPhaseB(result);
      }
    } catch (error) {
      console.error('Phase A failed:', error);
      setPhaseAResult({ success: false, error: String(error) });
    } finally {
      setIsRunningA(false);
    }
  };

  const runPhaseB = async (phaseAData: any) => {
    setIsRunningB(true);
    setCurrentPhase('B');
    try {
      const result = await runTripleVerification(
        phaseAData.analysisText,
        `Performance Optimization Domain - ${phaseAData.totalIssues} total issues identified`
      );
      setPhaseBResult(result);
      
      if (result.verdict === 'PROCEED_TO_EX') {
        setCurrentPhase('ready-for-EX');
      }
    } catch (error) {
      console.error('Phase B failed:', error);
      setPhaseBResult({ success: false, error: String(error) });
    } finally {
      setIsRunningB(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">A→B→EX Protocol</h1>
          <p className="text-muted-foreground text-lg">
            Performance Optimization Workflow
          </p>
        </div>

        {/* A→B→EX Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle>A→B→EX Protocol Control</CardTitle>
            <CardDescription>
              Run comprehensive analysis and triple-model verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Phase A */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={currentPhase === 'A' ? "default" : phaseAResult?.success ? "outline" : "secondary"}>
                    Phase A
                  </Badge>
                  <span className="font-medium">Deep Analysis</span>
                </div>
                <Button 
                  onClick={runPhaseA} 
                  disabled={isRunningA || isRunningB}
                  size="sm"
                >
                  {isRunningA ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Run Phase A'
                  )}
                </Button>
              </div>
              
              {phaseAResult && (
                <Alert variant={phaseAResult.success ? "default" : "destructive"}>
                  <AlertDescription className="space-y-2">
                    <div className="flex items-center gap-2">
                      {phaseAResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span className="font-medium">
                        {phaseAResult.success ? 'Analysis Complete' : 'Analysis Failed'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <p>Domain: {phaseAResult.domain}</p>
                      <p>Total Issues: {phaseAResult.totalIssues}</p>
                      <p>Critical: {phaseAResult.criticalIssues?.length || 0}</p>
                      <p>Warnings: {phaseAResult.warnings?.length || 0}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Phase B */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={currentPhase === 'B' ? "default" : phaseBResult?.success ? "outline" : "secondary"}>
                    Phase B
                  </Badge>
                  <span className="font-medium">Triple Verification</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {isRunningB && 'Running 3-model verification...'}
                </div>
              </div>

              {phaseBResult && (
                <Alert variant={phaseBResult.verdict === 'PROCEED_TO_EX' ? "default" : "destructive"}>
                  <AlertDescription className="space-y-2">
                    <div className="flex items-center gap-2">
                      {phaseBResult.verdict === 'PROCEED_TO_EX' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                      <span className="font-medium">
                        Verdict: {phaseBResult.verdict}
                      </span>
                    </div>
                    <div className="text-sm grid grid-cols-3 gap-2">
                      <div>
                        <p className="font-medium">GPT-5</p>
                        <p>Score: {phaseBResult.gpt5?.overall_score || 0}%</p>
                      </div>
                      <div>
                        <p className="font-medium">Gemini</p>
                        <p>Score: {phaseBResult.gemini?.overall_score || 0}%</p>
                      </div>
                      <div>
                        <p className="font-medium">Claude</p>
                        <p>Score: {phaseBResult.claude?.overall_score || 0}%</p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p>Consensus: {phaseBResult.consensus?.average_score || 0}% avg</p>
                      <p>Agreement: {phaseBResult.consensus?.agreement_level || 'N/A'}</p>
                      <p>All 100%: {phaseBResult.consensus?.all_scores_at_100 ? 'YES ✅' : 'NO ❌'}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Phase EX */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={currentPhase === 'ready-for-EX' ? "default" : "secondary"}>
                    Phase EX
                  </Badge>
                  <span className="font-medium">Execute Implementation</span>
                </div>
                {currentPhase === 'ready-for-EX' && (
                  <Alert className="flex-1 ml-4">
                    <AlertDescription className="text-sm">
                      ✅ Ready to execute! Type "EX" in chat to implement the performance optimizations.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Details */}
        {phaseAResult?.success && (
          <Card>
            <CardHeader>
              <CardTitle>Phase A Analysis Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Root Cause</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{phaseAResult.rootCause}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Critical Issues</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {phaseAResult.criticalIssues?.map((issue: string, i: number) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Proposed Solution</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{phaseAResult.proposedSolution}</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <ProvenPatternsLibrary />
      </div>
    </div>
  );
}
