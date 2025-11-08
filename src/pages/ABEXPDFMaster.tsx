import { runPhaseA_PDFSystem } from "@/utils/runPhaseA_PDFSystem";
import { runTripleVerification } from "@/utils/tripleVerification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Loader2, Rocket } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

export default function ABEXPDFMasterControl() {
  const [phaseAResult, setPhaseAResult] = useState<any>(null);
  const [phaseBResult, setPhaseBResult] = useState<any>(null);
  const [isRunningA, setIsRunningA] = useState(false);
  const [isRunningB, setIsRunningB] = useState(false);
  const { toast } = useToast();

  const handleRunPhaseA = async () => {
    setIsRunningA(true);
    try {
      const result = await runPhaseA_PDFSystem();
      setPhaseAResult(result);
      
      if (result.success) {
        toast({
          title: "Phase A Complete",
          description: `Found ${result.summary.totalIssues} critical issues. Ready for Phase B verification.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Phase A Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunningA(false);
    }
  };

  const handleRunPhaseB = async () => {
    if (!phaseAResult?.success) {
      toast({
        title: "Cannot Run Phase B",
        description: "Complete Phase A first",
        variant: "destructive",
      });
      return;
    }

    setIsRunningB(true);
    try {
      const result = await runTripleVerification(
        JSON.stringify(phaseAResult.analysis.analysis_result, null, 2),
        JSON.stringify(phaseAResult.analysis.context, null, 2)
      );
      
      setPhaseBResult(result);
      
      toast({
        title: result.verdict === 'PROCEED_TO_EX' ? "Phase B: APPROVED" : "Phase B: NEEDS REVISION",
        description: `GPT-5: ${result.gpt5.overall_score}%, Gemini: ${result.gemini.overall_score}%. ${result.verdict}`,
      });
    } catch (error: any) {
      toast({
        title: "Phase B Failed",  
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunningB(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">A→B→EX Master Control</h1>
          <p className="text-muted-foreground text-lg">
            PDF Generation System - Complete Analysis & Execution
          </p>
        </div>

        {/* Control Panel */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Protocol Control</CardTitle>
            <CardDescription>
              Run the deepest A→B→EX protocol on the entire PDF generation system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={handleRunPhaseA}
                disabled={isRunningA}
                size="lg"
                className="flex-1"
              >
                {isRunningA ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Phase A...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Run Phase A (Analyze)
                  </>
                )}
              </Button>

              <Button
                onClick={handleRunPhaseB}
                disabled={!phaseAResult?.success || isRunningB}
                size="lg"
                variant="secondary"
                className="flex-1"
              >
                {isRunningB ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Phase B...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Run Phase B (Verify)
                  </>
                )}
              </Button>

              <Button
                disabled={phaseBResult?.verdict !== 'PROCEED_TO_EX'}
                size="lg"
                variant="default"
                className="flex-1"
              >
                <Rocket className="mr-2 h-4 w-4" />
                Run Phase EX (Execute)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Phase A Results */}
        {phaseAResult && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Phase A: Analysis Results</CardTitle>
                <Badge variant={phaseAResult.success ? "default" : "destructive"}>
                  {phaseAResult.success ? "SUCCESS" : "FAILED"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {phaseAResult.success ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground">Total Issues</div>
                      <div className="text-3xl font-bold">{phaseAResult.summary.totalIssues}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground">Domain</div>
                      <div className="text-lg font-semibold">{phaseAResult.summary.domain}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground">Ready for Phase B</div>
                      <div className="text-3xl font-bold">
                        {phaseAResult.summary.readyForPhaseB ? "✅" : "❌"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Critical Issues:</h3>
                    <ScrollArea className="h-40 border rounded p-4">
                      <ul className="space-y-2">
                        {phaseAResult.summary.criticalIssues.map((issue: string, idx: number) => (
                          <li key={idx} className="text-sm">
                            <Badge variant="destructive" className="mr-2">{idx + 1}</Badge>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Root Cause:</h3>
                    <div className="border rounded p-4 bg-muted text-sm">
                      {phaseAResult.summary.rootCause}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-destructive">Error: {phaseAResult.error}</div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Phase B Results */}
        {phaseBResult && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Phase B: Triple-Model Verification</CardTitle>
                <Badge variant={phaseBResult.verdict === 'PROCEED_TO_EX' ? "default" : "destructive"}>
                  {phaseBResult.verdict}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">GPT-5 Score</div>
                    <div className="text-3xl font-bold">{phaseBResult.gpt5.overall_score}%</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {phaseBResult.gpt5.recommendation}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">Gemini 2.5 Pro Score</div>
                    <div className="text-3xl font-bold">{phaseBResult.gemini.overall_score}%</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {phaseBResult.gemini.recommendation}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">Consensus</div>
                    <div className="text-3xl font-bold">{phaseBResult.consensus.average_score.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {phaseBResult.consensus.agreement_level} agreement
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Verdict Breakdown:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={phaseBResult.consensus.unanimous_approval ? "default" : "secondary"}>
                        Unanimous Approval: {phaseBResult.consensus.unanimous_approval ? "YES" : "NO"}
                      </Badge>
                      <Badge variant={phaseBResult.consensus.all_scores_above_80 ? "default" : "secondary"}>
                        All Scores ≥80%: {phaseBResult.consensus.all_scores_above_80 ? "YES" : "NO"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
