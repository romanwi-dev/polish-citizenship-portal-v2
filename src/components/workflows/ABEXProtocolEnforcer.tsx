import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Shield, Lock, Unlock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface ABEXProtocolEnforcerProps {
  phaseA: {
    completed: boolean;
    issues: Array<{ id: string; title: string; severity: string }>;
  };
  phaseB: {
    completed: boolean;
    score: number | null;
    allModelsAt100: boolean;
  };
  onRunPhaseB: () => Promise<void>;
  onProceedToEX: () => void;
}

export function ABEXProtocolEnforcer({ 
  phaseA, 
  phaseB, 
  onRunPhaseB, 
  onProceedToEX 
}: ABEXProtocolEnforcerProps) {
  const [isRunningB, setIsRunningB] = useState(false);

  const handleRunPhaseB = async () => {
    setIsRunningB(true);
    try {
      await onRunPhaseB();
    } finally {
      setIsRunningB(false);
    }
  };

  const canRunPhaseB = phaseA.completed && phaseA.issues.length === 0;
  const canProceedToEX = phaseB.completed && phaseB.allModelsAt100;

  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          A→B→EX Protocol Enforcement
        </CardTitle>
        <CardDescription>
          Non-negotiable triple-model verification (GPT-5, Gemini 2.5 Pro, Claude Sonnet 4.5)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Phase A Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={phaseA.completed ? "default" : "secondary"}>
                PHASE A
              </Badge>
              <span className="font-medium">Analysis & Issue Identification</span>
            </div>
            {phaseA.completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
          </div>
          {phaseA.completed && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                {phaseA.issues.length === 0 
                  ? "✅ Phase A Complete - No critical issues found"
                  : `⚠️ ${phaseA.issues.length} issues identified and must be fixed before Phase B`
                }
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Phase B Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={phaseB.completed ? "default" : canRunPhaseB ? "secondary" : "outline"}>
                PHASE B
              </Badge>
              <span className="font-medium">Triple-Model Verification (Non-Negotiable)</span>
            </div>
            {!canRunPhaseB && <Lock className="h-5 w-5 text-muted-foreground" />}
            {canRunPhaseB && !phaseB.completed && <Unlock className="h-5 w-5 text-blue-600" />}
            {phaseB.completed && phaseB.allModelsAt100 && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            {phaseB.completed && !phaseB.allModelsAt100 && <XCircle className="h-5 w-5 text-destructive" />}
          </div>

          {!canRunPhaseB && (
            <Alert variant="destructive">
              <Lock className="h-4 w-4" />
              <AlertTitle>Phase B Blocked</AlertTitle>
              <AlertDescription>
                All Phase A issues must be resolved before Phase B verification can begin.
              </AlertDescription>
            </Alert>
          )}

          {canRunPhaseB && !phaseB.completed && (
            <Alert>
              <Unlock className="h-4 w-4" />
              <AlertDescription>
                Phase B is ready. Click below to start triple-model verification.
              </AlertDescription>
            </Alert>
          )}

          {phaseB.completed && !phaseB.allModelsAt100 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Phase B Failed - Verification Score: {phaseB.score}/100</AlertTitle>
              <AlertDescription>
                ALL 3 models must score 100/100 to proceed to Phase EX.
                Current result does not meet the ZERO-FAIL protocol requirements.
                Return to Phase A to fix identified issues.
              </AlertDescription>
            </Alert>
          )}

          {phaseB.completed && phaseB.allModelsAt100 && (
            <Alert className="border-green-500">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>✅ Phase B Complete - ALL MODELS AT 100/100</AlertTitle>
              <AlertDescription>
                Triple-consensus achieved. GPT-5, Gemini 2.5 Pro, and Claude Sonnet 4.5 all scored 100/100.
                Phase EX (Implementation) is now authorized.
              </AlertDescription>
            </Alert>
          )}

          {canRunPhaseB && !phaseB.completed && (
            <Button 
              onClick={handleRunPhaseB}
              disabled={isRunningB}
              className="w-full"
              size="lg"
            >
              {isRunningB ? (
                <>Running Phase B Verification...</>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Run Phase B Verification (8-10 min)
                </>
              )}
            </Button>
          )}
        </div>

        {/* Phase EX Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={canProceedToEX ? "default" : "outline"}>
                PHASE EX
              </Badge>
              <span className="font-medium">Implementation (Execute)</span>
            </div>
            {!canProceedToEX && <Lock className="h-5 w-5 text-muted-foreground" />}
            {canProceedToEX && <Unlock className="h-5 w-5 text-green-600" />}
          </div>

          {!phaseB.completed && (
            <Alert variant="destructive">
              <Lock className="h-4 w-4" />
              <AlertTitle>Phase EX Blocked</AlertTitle>
              <AlertDescription>
                Phase B verification must achieve 100/100 from ALL 3 AI models before implementation can proceed.
                This is a non-negotiable requirement of the A→B→EX protocol.
              </AlertDescription>
            </Alert>
          )}

          {phaseB.completed && !phaseB.allModelsAt100 && (
            <Alert variant="destructive">
              <Lock className="h-4 w-4" />
              <AlertTitle>Phase EX Still Blocked</AlertTitle>
              <AlertDescription>
                Phase B verification failed. Score was {phaseB.score}/100.
                ALL 3 models must score 100/100. Return to Phase A to address issues.
              </AlertDescription>
            </Alert>
          )}

          {canProceedToEX && (
            <Button 
              onClick={onProceedToEX}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Proceed to Phase EX (Implementation)
            </Button>
          )}
        </div>

        {/* Protocol Progress */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Protocol Progress</div>
          <Progress 
            value={
              !phaseA.completed ? 0 :
              phaseA.issues.length > 0 ? 20 :
              !phaseB.completed ? 33 :
              !phaseB.allModelsAt100 ? 50 :
              canProceedToEX ? 66 : 0
            } 
            className="h-2"
          />
          <div className="text-xs text-muted-foreground">
            {!phaseA.completed && "Phase A: Analysis pending"}
            {phaseA.completed && phaseA.issues.length > 0 && "Phase A: Issues must be fixed"}
            {phaseA.completed && phaseA.issues.length === 0 && !phaseB.completed && "Phase B: Verification ready"}
            {phaseB.completed && !phaseB.allModelsAt100 && "Phase B: Failed - return to Phase A"}
            {canProceedToEX && "Phase B: Complete - Ready for EX"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
