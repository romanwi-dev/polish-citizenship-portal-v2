import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function ABEXOCRMaster() {
  const [phaseAResult, setPhaseAResult] = useState<any>(null);
  const [phaseBResult, setPhaseBResult] = useState<any>(null);
  const [phaseEXResult, setPhaseEXResult] = useState<any>(null);
  const [isRunningA, setIsRunningA] = useState(false);
  const [isRunningB, setIsRunningB] = useState(false);
  const [isRunningEX, setIsRunningEX] = useState(false);

  const handleRunPhaseA = async () => {
    setIsRunningA(true);
    try {
      const { data, error } = await supabase.functions.invoke('run-phase-a-ocr');
      
      if (error) throw error;
      
      if (data.success) {
        setPhaseAResult(data);
        toast.success("Phase A analysis complete");
      } else {
        toast.error("Phase A failed: " + data.error);
      }
    } catch (error: any) {
      toast.error("Phase A error: " + error.message);
      console.error(error);
    } finally {
      setIsRunningA(false);
    }
  };

  const handleRunPhaseB = async () => {
    if (!phaseAResult) {
      toast.error("Run Phase A first");
      return;
    }
    
    setIsRunningB(true);
    try {
      const { data, error } = await supabase.functions.invoke('triple-verify-analysis', {
        body: {
          analysis: phaseAResult.analysis_text,
          context: phaseAResult.context
        }
      });
      
      if (error) throw error;
      
      setPhaseBResult(data);
      if (data.verdict === 'PROCEED_TO_EX') {
        toast.success("Phase B verification passed - ready for execution");
      } else {
        toast.warning("Phase B recommends revision");
      }
    } catch (error: any) {
      toast.error("Phase B error: " + error.message);
      console.error(error);
    } finally {
      setIsRunningB(false);
    }
  };

  const handleRunPhaseEX = async () => {
    if (!phaseBResult || phaseBResult.verdict !== 'PROCEED_TO_EX') {
      toast.error("Phase B must pass before executing");
      return;
    }
    
    setIsRunningEX(true);
    try {
      const { data, error } = await supabase.functions.invoke('run-full-abex-ocr', {
        body: {
          phase_a_id: phaseAResult.phase_a_id,
          skip_verification: true
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        setPhaseEXResult(data);
        toast.success("Phase EX execution complete - OCR system updated");
      } else {
        toast.error("Phase EX failed: " + data.error);
      }
    } catch (error: any) {
      toast.error("Phase EX error: " + error.message);
      console.error(error);
    } finally {
      setIsRunningEX(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">A→B→EX Protocol: OCR System</h1>
          <p className="text-muted-foreground mt-2">
            Analyze, Verify, and Execute improvements to the OCR processing system
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Control</CardTitle>
          <CardDescription>Execute each phase sequentially</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleRunPhaseA}
              disabled={isRunningA}
              className="flex-1"
            >
              {isRunningA && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Run Phase A (Analyze)
            </Button>
            
            <Button 
              onClick={handleRunPhaseB}
              disabled={!phaseAResult || isRunningB}
              variant="secondary"
              className="flex-1"
            >
              {isRunningB && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Run Phase B (Verify)
            </Button>
            
            <Button 
              onClick={handleRunPhaseEX}
              disabled={!phaseBResult || phaseBResult.verdict !== 'PROCEED_TO_EX' || isRunningEX}
              variant="default"
              className="flex-1"
            >
              {isRunningEX && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Run Phase EX (Execute)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Phase A Results */}
      {phaseAResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Phase A: Analysis Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Issues</p>
                <p className="text-2xl font-bold">{phaseAResult.total_issues}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold text-red-500">{phaseAResult.critical_issues?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-yellow-500">{phaseAResult.warnings?.length || 0}</p>
              </div>
            </div>
            
            {phaseAResult.critical_issues?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Critical Issues:</h4>
                <ul className="space-y-1">
                  {phaseAResult.critical_issues.map((issue: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold mb-2">Root Cause:</h4>
              <p className="text-sm text-muted-foreground">{phaseAResult.root_cause}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Proposed Solution:</h4>
              <p className="text-sm text-muted-foreground">{phaseAResult.proposed_solution}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase B Results */}
      {phaseBResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {phaseBResult.verdict === 'PROCEED_TO_EX' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              Phase B: Triple Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant={phaseBResult.verdict === 'PROCEED_TO_EX' ? 'default' : 'secondary'}>
                {phaseBResult.verdict}
              </Badge>
              <div className="flex gap-2">
                <span className="text-sm">GPT-5: {phaseBResult.gpt5?.overall_score || 0}%</span>
                <span className="text-sm">Gemini: {phaseBResult.gemini?.overall_score || 0}%</span>
                <span className="text-sm">Claude: {phaseBResult.claude?.overall_score || 0}%</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Consensus:</h4>
              <p className="text-sm">Average Score: {phaseBResult.consensus?.average_score}%</p>
              <p className="text-sm">Agreement: {phaseBResult.consensus?.agreement_level}</p>
            </div>
            
            {phaseBResult.verdict !== 'PROCEED_TO_EX' && (
              <Alert>
                <AlertDescription>
                  Verification suggests revision. Review the analysis before proceeding.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Phase EX Results */}
      {phaseEXResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Phase EX: Execution Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Changes Applied:</h4>
              <ul className="space-y-1">
                {phaseEXResult.changes_applied?.map((change: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{change}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Alert>
              <AlertDescription className="text-green-600">
                OCR system has been updated. Monitor the system to verify improvements.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
