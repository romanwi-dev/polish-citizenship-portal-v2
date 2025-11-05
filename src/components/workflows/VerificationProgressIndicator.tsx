import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle2, Loader2, FileText, Shield, Zap } from "lucide-react";

interface ProgressStage {
  stage: string;
  progress: number;
  message: string;
  timestamp: string;
}

interface VerificationProgressIndicatorProps {
  isVerifying: boolean;
  stages?: ProgressStage[];
  elapsedSeconds?: number;
  filesCount?: number;
}

export function VerificationProgressIndicator({ 
  isVerifying, 
  stages = [],
  elapsedSeconds = 0,
  filesCount = 0 
}: VerificationProgressIndicatorProps) {
  const [localElapsed, setLocalElapsed] = useState(elapsedSeconds);

  useEffect(() => {
    if (!isVerifying) {
      setLocalElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setLocalElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isVerifying]);

  const currentStage = stages[stages.length - 1];
  const overallProgress = currentStage?.progress || 0;
  const estimatedTotal = 480; // 8 minutes in seconds
  const progressPercent = Math.min((localElapsed / estimatedTotal) * 100, 95);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStageIcon = (stage: string) => {
    if (stage.includes('files')) return FileText;
    if (stage.includes('security')) return Shield;
    if (stage.includes('performance')) return Zap;
    if (stage.includes('AI')) return Brain;
    return Loader2;
  };

  if (!isVerifying && stages.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          AI Verification in Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">
              {formatTime(localElapsed)} / ~{formatTime(estimatedTotal)}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {Math.round(progressPercent)}% complete
          </p>
        </div>

        {/* Current Stage */}
        {currentStage && (
          <div className="space-y-2 p-3 rounded-lg bg-background/50 border border-primary/10">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = getStageIcon(currentStage.stage);
                return <Icon className="h-4 w-4 text-primary animate-pulse" />;
              })()}
              <Badge variant="secondary" className="text-xs">
                Current Stage
              </Badge>
            </div>
            <p className="text-sm font-medium">{currentStage.stage}</p>
            <p className="text-xs text-muted-foreground">{currentStage.message}</p>
          </div>
        )}

        {/* Stage Timeline */}
        {stages.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-2">Analysis Timeline</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {stages.map((stage, idx) => {
                const Icon = idx === stages.length - 1 ? Loader2 : CheckCircle2;
                const isActive = idx === stages.length - 1;
                
                return (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-2 text-xs p-2 rounded ${
                      isActive ? 'bg-primary/5' : 'opacity-60'
                    }`}
                  >
                    <Icon className={`h-3 w-3 mt-0.5 shrink-0 ${
                      isActive ? 'animate-spin text-primary' : 'text-green-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{stage.stage}</p>
                      <p className="text-muted-foreground truncate">{stage.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div>
            <span className="font-medium">{filesCount}</span> files analyzed
          </div>
          <div>
            <span className="font-medium">{stages.length}</span> stages completed
          </div>
        </div>

        {/* Helpful Tips */}
        <div className="text-xs text-muted-foreground bg-secondary/20 p-2 rounded">
          💡 <span className="font-medium">Tip:</span> Large verifications can take 5-8 minutes. 
          The analysis is comprehensive and worth the wait.
        </div>
      </CardContent>
    </Card>
  );
}
