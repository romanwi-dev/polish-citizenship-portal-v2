import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Shield,
  PlayCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface PreFlightCheck {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  required: boolean;
  errorMessage?: string;
  details?: string;
}

interface PreFlightChecksProps {
  targetStage: string;
  stageName: string;
  checks: PreFlightCheck[];
  onRunChecks: () => Promise<void>;
  onProceed?: () => void;
  onCancel?: () => void;
  autoRun?: boolean;
}

export function PreFlightChecks({
  targetStage,
  stageName,
  checks,
  onRunChecks,
  onProceed,
  onCancel,
  autoRun = false
}: PreFlightChecksProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const allPassed = checks.every(c => c.status === 'passed');
  const hasCriticalFailures = checks.some(c => c.required && c.status === 'failed');
  const hasWarnings = checks.some(c => c.status === 'warning');
  
  const passedCount = checks.filter(c => c.status === 'passed').length;
  const failedCount = checks.filter(c => c.status === 'failed').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;

  useEffect(() => {
    if (autoRun && !hasRun) {
      handleRunChecks();
    }
  }, [autoRun, hasRun]);

  const handleRunChecks = async () => {
    setIsRunning(true);
    try {
      await onRunChecks();
      setHasRun(true);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-50 border-green-200';
      case 'failed': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'running': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">Pre-Flight Checks</h3>
            <p className="text-sm text-muted-foreground">
              Preparing to transition to: <span className="font-semibold">{stageName}</span>
            </p>
          </div>
        </div>

        {hasRun && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{passedCount}</div>
              <div className="text-xs text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{warningCount}</div>
              <div className="text-xs text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{failedCount}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
          </div>
        )}
      </Card>

      {/* Checks List */}
      <Card className="p-6">
        <div className="space-y-3">
          {checks.map((check, index) => (
            <motion.div
              key={check.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{check.name}</span>
                    {check.required && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{check.description}</p>
                  
                  {check.errorMessage && (
                    <div className="mt-2 text-sm text-red-600">
                      <strong>Error:</strong> {check.errorMessage}
                    </div>
                  )}
                  
                  {check.details && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {check.details}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            {hasCriticalFailures && (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">Cannot proceed - critical checks failed</span>
              </div>
            )}
            {!hasCriticalFailures && hasWarnings && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Warnings detected - review before proceeding</span>
              </div>
            )}
            {allPassed && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">All checks passed - ready to proceed</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={isRunning}>
                Cancel
              </Button>
            )}
            
            {!hasRun && (
              <Button onClick={handleRunChecks} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Checks...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Run Pre-Flight Checks
                  </>
                )}
              </Button>
            )}

            {hasRun && onProceed && (
              <Button 
                onClick={onProceed} 
                disabled={hasCriticalFailures || isRunning}
                variant={hasWarnings ? 'outline' : 'default'}
              >
                {hasWarnings ? 'Proceed Anyway' : 'Proceed to Next Stage'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
