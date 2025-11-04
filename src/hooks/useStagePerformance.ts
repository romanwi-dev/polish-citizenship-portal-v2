import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

interface StageMetrics {
  stage: string;
  stageName: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  expectedDuration?: number;
  efficiency?: number;
  bottleneck?: boolean;
}

interface StagePerformanceResult {
  stages: StageMetrics[];
  totalDuration: number;
  estimatedCompletion?: Date;
}

const STAGE_NAMES: Record<string, string> = {
  'upload': 'Document Upload',
  'ai_classify': 'AI Classification',
  'hac_classify': 'HAC Review - Classification',
  'ocr': 'OCR Processing',
  'form_population': 'Form Population',
  'hac_forms': 'HAC Review - Forms',
  'ai_verify': 'Dual AI Verification',
  'hac_verify': 'HAC Review - Verification',
  'pdf_generation': 'PDF Generation',
};

const EXPECTED_DURATIONS: Record<string, number> = {
  'upload': 300, // 5 minutes
  'ai_classify': 120, // 2 minutes
  'hac_classify': 600, // 10 minutes
  'ocr': 180, // 3 minutes
  'form_population': 60, // 1 minute
  'hac_forms': 900, // 15 minutes
  'ai_verify': 90, // 1.5 minutes
  'hac_verify': 600, // 10 minutes
  'pdf_generation': 120, // 2 minutes
};

export function useStagePerformance(caseId: string | undefined, currentStage: string) {
  const { data: workflowRun } = useQuery({
    queryKey: ['workflow-run-performance', caseId],
    queryFn: async () => {
      if (!caseId) return null;
      
      const { data, error } = await supabase
        .from('workflow_runs')
        .select('*')
        .eq('case_id', caseId)
        .eq('workflow_type', 'ai_documents')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
  });

  const performance = useMemo<StagePerformanceResult | null>(() => {
    if (!workflowRun) return null;

    const steps = (workflowRun.steps as any[]) || [];
    const stageHistory = steps.map(step => {
      const startedAt = step.startedAt ? new Date(step.startedAt) : undefined;
      const completedAt = step.completedAt ? new Date(step.completedAt) : undefined;
      
      let duration: number | undefined;
      if (startedAt && completedAt) {
        duration = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000);
      } else if (startedAt && step.status === 'processing') {
        duration = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      }

      const expectedDuration = EXPECTED_DURATIONS[step.id] || 300;
      const efficiency = duration && expectedDuration ? Math.min(100, (expectedDuration / duration) * 100) : undefined;
      const bottleneck = duration ? duration > expectedDuration * 1.5 : false;

      return {
        stage: step.id,
        stageName: STAGE_NAMES[step.id] || step.title,
        status: step.status === 'completed' ? 'completed' : 
                step.status === 'processing' ? 'in_progress' : 
                step.status === 'failed' ? 'failed' : 'pending',
        startedAt: step.startedAt,
        completedAt: step.completedAt,
        duration,
        expectedDuration,
        efficiency,
        bottleneck,
      } as StageMetrics;
    });

    const completedStages = stageHistory.filter(s => s.status === 'completed');
    const totalDuration = completedStages.reduce((sum, s) => sum + (s.duration || 0), 0);
    
    // Calculate ETA
    let estimatedCompletion: Date | undefined;
    if (completedStages.length > 0) {
      const avgDuration = totalDuration / completedStages.length;
      const remainingStages = stageHistory.length - completedStages.length;
      const estimatedRemaining = avgDuration * remainingStages;
      estimatedCompletion = new Date(Date.now() + estimatedRemaining * 1000);
    }

    return {
      stages: stageHistory,
      totalDuration,
      estimatedCompletion,
    };
  }, [workflowRun]);

  return performance;
}
