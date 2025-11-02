import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useWorkflowInstances } from "@/hooks/useWorkflowInstances";
import { useWorkflowTransition } from "@/hooks/useWorkflowTransition";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  User,
  Calendar,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface WorkflowDefinition {
  workflow_type: string;
  display_name: string;
  stages: Array<{ stage: string; name: string; order: number }>;
}

interface UnifiedWorkflowDashboardProps {
  workflowType?: string;
  caseId?: string;
  showAnalytics?: boolean;
}

export const UnifiedWorkflowDashboard = ({ 
  workflowType, 
  caseId,
  showAnalytics = true 
}: UnifiedWorkflowDashboardProps) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  
  const { data: workflows, isLoading } = useWorkflowInstances({ 
    workflowType,
    caseId 
  });

  const { data: definitions } = useQuery({
    queryKey: ['workflow-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_definitions')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as any as WorkflowDefinition[];
    },
  });

  const { mutate: transitionStage } = useWorkflowTransition();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-500",
      assigned: "bg-blue-500",
      in_progress: "bg-yellow-500",
      review: "bg-purple-500",
      approved: "bg-green-500",
      completed: "bg-emerald-600",
      blocked: "bg-red-500",
      cancelled: "bg-gray-400"
    };
    return colors[status] || "bg-gray-500";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "border-gray-300",
      medium: "border-blue-400",
      high: "border-orange-400",
      urgent: "border-red-500"
    };
    return colors[priority] || "border-gray-300";
  };

  const isSlaViolated = (workflow: any) => {
    if (!workflow.deadline) return false;
    return new Date(workflow.deadline) < new Date() && workflow.status !== 'completed';
  };

  const isSlaWarning = (workflow: any) => {
    if (!workflow.deadline || workflow.status === 'completed') return false;
    const hoursRemaining = (new Date(workflow.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursRemaining > 0 && hoursRemaining < 48;
  };

  const getNextStage = (currentStage: string, workflowType: string) => {
    const definition = definitions?.find(d => d.workflow_type === workflowType);
    if (!definition) return null;
    
    const currentIndex = definition.stages.findIndex(s => s.stage === currentStage);
    if (currentIndex === -1 || currentIndex === definition.stages.length - 1) return null;
    
    return definition.stages[currentIndex + 1];
  };

  const handleAdvanceStage = (workflow: any) => {
    const nextStage = getNextStage(workflow.current_stage, workflow.workflow_type);
    if (!nextStage) return;

    transitionStage({
      workflowInstanceId: workflow.id,
      toStage: nextStage.stage,
      reason: 'Advanced to next stage'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate analytics
  const totalWorkflows = workflows?.length || 0;
  const completedWorkflows = workflows?.filter(w => w.status === 'completed').length || 0;
  const inProgressWorkflows = workflows?.filter(w => w.status === 'in_progress').length || 0;
  const violatedSLA = workflows?.filter(w => isSlaViolated(w)).length || 0;
  const warningSLA = workflows?.filter(w => isSlaWarning(w)).length || 0;
  const completionRate = totalWorkflows > 0 ? (completedWorkflows / totalWorkflows) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      {showAnalytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Workflows</CardDescription>
              <CardTitle className="text-3xl">{totalWorkflows}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{inProgressWorkflows}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl text-green-600">{completedWorkflows}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>SLA Violations</CardDescription>
              <CardTitle className="text-3xl text-red-600">{violatedSLA}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completion Rate</CardDescription>
              <CardTitle className="text-3xl">{completionRate.toFixed(0)}%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={completionRate} className="h-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* SLA Alerts */}
      {(violatedSLA > 0 || warningSLA > 0) && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">SLA Alerts</CardTitle>
            </div>
            <CardDescription>
              {violatedSLA} workflow{violatedSLA !== 1 ? 's' : ''} past deadline, 
              {warningSLA} approaching deadline
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Workflow List */}
      <div className="grid gap-4">
        {workflows?.map((workflow) => {
          const nextStage = getNextStage(workflow.current_stage, workflow.workflow_type);
          const definition = definitions?.find(d => d.workflow_type === workflow.workflow_type);
          const currentStageInfo = definition?.stages.find(s => s.stage === workflow.current_stage);
          const slaViolated = isSlaViolated(workflow);
          const slaWarning = isSlaWarning(workflow);

          return (
            <Card 
              key={workflow.id} 
              className={`border-2 ${getPriorityColor(workflow.priority)} ${
                slaViolated ? 'bg-red-50 dark:bg-red-950/10' : 
                slaWarning ? 'bg-yellow-50 dark:bg-yellow-950/10' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getStatusColor(workflow.status)} text-white`}>
                        {workflow.status}
                      </Badge>
                      <Badge variant="outline">
                        {definition?.display_name || workflow.workflow_type}
                      </Badge>
                      {workflow.priority !== 'medium' && (
                        <Badge variant="secondary">
                          {workflow.priority}
                        </Badge>
                      )}
                    </div>
                    
                    <CardTitle className="text-lg">
                      {currentStageInfo?.name || workflow.current_stage}
                    </CardTitle>
                    
                    <CardDescription className="flex flex-wrap gap-3 mt-2">
                      {workflow.assigned_to && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Assigned
                        </span>
                      )}
                      
                      {workflow.deadline && (
                        <span className={`flex items-center gap-1 ${
                          slaViolated ? 'text-red-600 font-semibold' :
                          slaWarning ? 'text-yellow-600 font-semibold' : ''
                        }`}>
                          <Calendar className="h-3 w-3" />
                          {slaViolated ? 'OVERDUE: ' : ''}
                          {formatDistanceToNow(new Date(workflow.deadline), { addSuffix: true })}
                        </span>
                      )}
                      
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Started {formatDistanceToNow(new Date(workflow.started_at), { addSuffix: true })}
                      </span>
                    </CardDescription>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {workflow.status === 'completed' && (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    )}
                    
                    {workflow.status !== 'completed' && nextStage && (
                      <Button
                        size="sm"
                        onClick={() => handleAdvanceStage(workflow)}
                        className="gap-2"
                      >
                        Advance to {nextStage.name}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}

        {workflows?.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center p-12">
              <p className="text-muted-foreground">No workflows found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
