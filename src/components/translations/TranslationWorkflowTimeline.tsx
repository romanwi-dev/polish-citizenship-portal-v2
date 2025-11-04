import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Eye, 
  UserCheck, 
  FileText,
  Upload,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { TranslationJob, TranslationHistory } from "@/hooks/useTranslationWorkflow";

interface TranslationWorkflowTimelineProps {
  job: TranslationJob;
  history?: TranslationHistory[];
  onAction?: (action: string, data?: any) => void;
  isLoading?: boolean;
}

const stageConfig = {
  pending: {
    icon: Clock,
    label: "Pending",
    color: "text-gray-500",
    bgColor: "bg-gray-100 dark:bg-gray-800",
  },
  ai_translating: {
    icon: Sparkles,
    label: "AI Translating",
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900",
  },
  ai_complete: {
    icon: CheckCircle2,
    label: "AI Complete",
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900",
  },
  human_review: {
    icon: Eye,
    label: "Human Review",
    color: "text-yellow-500",
    bgColor: "bg-yellow-100 dark:bg-yellow-900",
  },
  approved_for_translator: {
    icon: CheckCircle2,
    label: "Approved",
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900",
  },
  assigned_to_translator: {
    icon: UserCheck,
    label: "Assigned to Translator",
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900",
  },
  translator_in_progress: {
    icon: FileText,
    label: "Translator Working",
    color: "text-indigo-500",
    bgColor: "bg-indigo-100 dark:bg-indigo-900",
  },
  translator_complete: {
    icon: CheckCircle2,
    label: "Translator Complete",
    color: "text-teal-500",
    bgColor: "bg-teal-100 dark:bg-teal-900",
  },
  document_uploaded: {
    icon: Upload,
    label: "Document Uploaded",
    color: "text-cyan-500",
    bgColor: "bg-cyan-100 dark:bg-cyan-900",
  },
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    color: "text-green-600",
    bgColor: "bg-green-200 dark:bg-green-800",
  },
};

export function TranslationWorkflowTimeline({ 
  job, 
  history,
  onAction,
  isLoading = false 
}: TranslationWorkflowTimelineProps) {
  const stages = Object.keys(stageConfig);
  const currentStageIndex = stages.indexOf(job.workflow_stage);

  const config = stageConfig[job.workflow_stage as keyof typeof stageConfig];
  const Icon = config?.icon || AlertCircle;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config?.color}`} />
          Translation Workflow
          <Badge className={config?.bgColor}>
            {config?.label || job.workflow_stage}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {job.source_language} → {job.target_language}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Timeline */}
        <div className="space-y-4">
          {stages.map((stage, index) => {
            const stageConf = stageConfig[stage as keyof typeof stageConfig];
            const StageIcon = stageConf.icon;
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isPending = index > currentStageIndex;

            return (
              <div key={stage} className="flex items-start gap-3">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full shrink-0
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${isCurrent ? stageConf.bgColor + ' ' + stageConf.color : ''}
                  ${isPending ? 'bg-gray-200 dark:bg-gray-700 text-gray-400' : ''}
                `}>
                  <StageIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {stageConf.label}
                  </p>
                  {isCompleted && (
                    <p className="text-xs text-muted-foreground">Completed</p>
                  )}
                  {isCurrent && (
                    <p className="text-xs text-muted-foreground">
                      Started {format(new Date(job.stage_entered_at), 'MMM d, HH:mm')}
                    </p>
                  )}
                </div>
                {isCurrent && renderActions(job, onAction, isLoading)}
              </div>
            );
          })}
        </div>

        {/* Quality Metrics */}
        {job.ai_confidence && (
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">AI Confidence</span>
              <span className="font-medium">{(job.ai_confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${job.ai_confidence * 100}%` }}
              />
            </div>
          </div>
        )}

        {job.quality_score && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Human Review Quality</span>
              <span className="font-medium">{job.quality_score}/5</span>
            </div>
          </div>
        )}

        {/* History */}
        {history && history.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Recent Activity</h4>
            <div className="space-y-2">
              {history.slice(0, 5).map((entry) => (
                <div key={entry.id} className="text-xs p-2 bg-muted rounded border-l-2 border-primary">
                  <p className="font-medium">{entry.change_type.replace('_', ' ')}</p>
                  {entry.new_value && (
                    <p className="text-muted-foreground">{entry.new_value}</p>
                  )}
                  <p className="text-muted-foreground mt-1">
                    {format(new Date(entry.created_at), 'MMM d, HH:mm')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function renderActions(
  job: TranslationJob, 
  onAction?: (action: string, data?: any) => void,
  isLoading?: boolean
) {
  if (!onAction) return null;

  switch (job.workflow_stage) {
    case 'pending':
      return (
        <Button 
          size="sm" 
          onClick={() => onAction('start_ai')}
          disabled={isLoading}
        >
          Start AI Translation
        </Button>
      );
    
    case 'ai_complete':
      return (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            onClick={() => onAction('approve_ai')}
            disabled={isLoading}
          >
            Approve
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onAction('reject_ai')}
            disabled={isLoading}
          >
            Needs Review
          </Button>
        </div>
      );
    
    case 'approved_for_translator':
      return (
        <Button 
          size="sm" 
          onClick={() => onAction('assign_translator')}
          disabled={isLoading}
        >
          Assign Translator
        </Button>
      );
    
    case 'translator_complete':
      return (
        <Button 
          size="sm" 
          onClick={() => onAction('upload_final')}
          disabled={isLoading}
        >
          Upload Document
        </Button>
      );
    
    case 'document_uploaded':
      return (
        <Button 
          size="sm" 
          onClick={() => onAction('complete')}
          disabled={isLoading}
        >
          Complete
        </Button>
      );
    
    default:
      return null;
  }
}
