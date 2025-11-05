import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkflowInstances } from "./useWorkflowInstances";
import { useWorkflowTransition } from "./useWorkflowTransition";
import { useToast } from "./use-toast";

interface UseDocumentWorkflowStateProps {
  caseId: string;
}

export function useDocumentWorkflowState({ caseId }: UseDocumentWorkflowStateProps) {
  const { toast } = useToast();
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  
  // Fetch workflow instances for this case
  const { data: workflowInstances, refetch: refetchWorkflows } = useWorkflowInstances({
    caseId,
    workflowType: 'ai_documents'
  });

  // Transition hook for stage changes
  const { mutate: transitionStage } = useWorkflowTransition();

  // Compute completed stages from workflow instances
  const completedStages = workflowInstances?.reduce((acc, instance) => {
    if (instance.status === 'completed') {
      acc[instance.current_stage] = true;
    }
    return acc;
  }, {} as Record<string, boolean>) || {};

  const toggleFlip = (stage: string) => {
    setFlippedCards(prev => ({ ...prev, [stage]: !prev[stage] }));
  };

  const toggleComplete = async (stage: string, workflowInstanceId?: string) => {
    if (!workflowInstanceId) {
      toast({
        title: "Workflow not initialized",
        description: "This stage doesn't have a workflow instance yet.",
        variant: "destructive",
      });
      return;
    }

    const isCurrentlyCompleted = completedStages[stage];
    const nextStage = isCurrentlyCompleted ? stage : 'completed';

    transitionStage(
      {
        workflowInstanceId,
        toStage: nextStage,
        reason: isCurrentlyCompleted ? 'Marked as incomplete' : 'Marked as complete',
      },
      {
        onSuccess: () => {
          refetchWorkflows();
        },
      }
    );
  };

  return {
    flippedCards,
    completedStages,
    toggleFlip,
    toggleComplete,
    workflowInstances,
    refetchWorkflows,
  };
}
