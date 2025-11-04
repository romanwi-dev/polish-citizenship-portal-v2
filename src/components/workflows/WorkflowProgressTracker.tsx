import { CheckCircle2, Circle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface WorkflowStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

interface WorkflowProgressTrackerProps {
  steps: WorkflowStep[];
  currentStepIndex: number;
  overallProgress: number;
}

export const WorkflowProgressTracker = ({ 
  steps, 
  currentStepIndex, 
  overallProgress 
}: WorkflowProgressTrackerProps) => {
  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline" className="bg-muted">Pending</Badge>;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Workflow Progress</h3>
            <span className="text-sm text-muted-foreground">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Step List */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                index === currentStepIndex 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border'
              }`}
            >
              <div className="mt-0.5">
                {getStatusIcon(step.status)}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{step.title}</h4>
                  {getStatusBadge(step.status)}
                </div>
                
                {step.error && (
                  <p className="text-sm text-destructive">{step.error}</p>
                )}
                
                {step.status === 'processing' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Processing...</span>
                  </div>
                )}
                
                {step.completedAt && (
                  <p className="text-xs text-muted-foreground">
                    Completed at {new Date(step.completedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};