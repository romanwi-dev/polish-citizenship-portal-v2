import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VerificationPhaseData {
  id?: string;
  phaseA: {
    completed: boolean;
    issues: Array<{ id: string; title: string; severity: string }>;
    completedAt?: string;
  };
  phaseB: {
    completed: boolean;
    score: number | null;
    allModelsAt100: boolean;
    response?: any;
    completedAt?: string;
  };
  phaseEX: {
    authorized: boolean;
    authorizedAt?: string;
    completed: boolean;
    completedAt?: string;
  };
  workflowType: string;
  focusAreas: string[];
  modelsUsed: string[];
}

export function useVerificationPersistence(workflowType: string = 'documents_workflow') {
  const [verificationData, setVerificationData] = useState<VerificationPhaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load latest verification on mount
  useEffect(() => {
    loadLatestVerification();
  }, [workflowType]);

  const loadLatestVerification = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('verification_phase_results')
        .select('*')
        .eq('workflow_type', workflowType)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setVerificationData({
          id: data.id,
          phaseA: {
            completed: data.phase_a_completed || false,
            issues: (data.phase_a_issues as any) || [],
            completedAt: data.phase_a_completed_at
          },
          phaseB: {
            completed: data.phase_b_completed || false,
            score: data.phase_b_score,
            allModelsAt100: data.phase_b_all_models_100 || false,
            response: data.phase_b_response,
            completedAt: data.phase_b_completed_at
          },
          phaseEX: {
            authorized: data.phase_ex_authorized || false,
            authorizedAt: data.phase_ex_authorized_at,
            completed: data.phase_ex_completed || false,
            completedAt: data.phase_ex_completed_at
          },
          workflowType: data.workflow_type,
          focusAreas: data.focus_areas || [],
          modelsUsed: data.models_used || []
        });
      }
    } catch (error) {
      console.error('Error loading verification:', error);
      toast({
        variant: 'destructive',
        title: 'Load Error',
        description: 'Failed to load previous verification state'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePhaseA = async (
    issues: Array<{ id: string; title: string; severity: string }>,
    filesAnalyzed: any[]
  ) => {
    try {
      const payload = {
        workflow_type: workflowType,
        phase_a_completed: true,
        phase_a_completed_at: new Date().toISOString(),
        phase_a_issues: issues,
        phase_a_files_analyzed: filesAnalyzed,
        focus_areas: verificationData?.focusAreas || [],
        models_used: verificationData?.modelsUsed || ['openai/gpt-5', 'google/gemini-2.5-pro', 'claude-sonnet-4-5']
      };

      if (verificationData?.id) {
        // Update existing
        const { data, error } = await supabase
          .from('verification_phase_results')
          .update(payload)
          .eq('id', verificationData.id)
          .select()
          .single();

        if (error) throw error;
        
        setVerificationData(prev => ({
          ...prev!,
          id: data.id,
          phaseA: {
            completed: true,
            issues,
            completedAt: data.phase_a_completed_at
          }
        }));
      } else {
        // Create new
        const { data, error } = await supabase
          .from('verification_phase_results')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;

        setVerificationData({
          id: data.id,
          phaseA: {
            completed: true,
            issues,
            completedAt: data.phase_a_completed_at
          },
          phaseB: {
            completed: false,
            score: null,
            allModelsAt100: false
          },
          phaseEX: {
            authorized: false,
            completed: false
          },
          workflowType,
          focusAreas: data.focus_areas || [],
          modelsUsed: data.models_used || []
        });
      }

      return true;
    } catch (error) {
      console.error('Error saving Phase A:', error);
      toast({
        variant: 'destructive',
        title: 'Save Error',
        description: 'Failed to save Phase A results'
      });
      return false;
    }
  };

  const savePhaseB = async (
    score: number,
    allModelsAt100: boolean,
    response: any
  ) => {
    if (!verificationData?.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Phase A must be completed first'
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('verification_phase_results')
        .update({
          phase_b_completed: true,
          phase_b_completed_at: new Date().toISOString(),
          phase_b_score: score,
          phase_b_all_models_100: allModelsAt100,
          phase_b_response: response
        })
        .eq('id', verificationData.id)
        .select()
        .single();

      if (error) throw error;

      setVerificationData(prev => ({
        ...prev!,
        phaseB: {
          completed: true,
          score,
          allModelsAt100,
          response,
          completedAt: data.phase_b_completed_at
        }
      }));

      return true;
    } catch (error) {
      console.error('Error saving Phase B:', error);
      toast({
        variant: 'destructive',
        title: 'Save Error',
        description: 'Failed to save Phase B results'
      });
      return false;
    }
  };

  const authorizePhaseEX = async () => {
    if (!verificationData?.id) return false;

    try {
      const { data, error } = await supabase
        .from('verification_phase_results')
        .update({
          phase_ex_authorized: true,
          phase_ex_authorized_at: new Date().toISOString()
        })
        .eq('id', verificationData.id)
        .select()
        .single();

      if (error) throw error;

      setVerificationData(prev => ({
        ...prev!,
        phaseEX: {
          ...prev!.phaseEX,
          authorized: true,
          authorizedAt: data.phase_ex_authorized_at
        }
      }));

      return true;
    } catch (error) {
      console.error('Error authorizing Phase EX:', error);
      return false;
    }
  };

  const completePhaseEX = async () => {
    if (!verificationData?.id) return false;

    try {
      const { data, error } = await supabase
        .from('verification_phase_results')
        .update({
          phase_ex_completed: true,
          phase_ex_completed_at: new Date().toISOString()
        })
        .eq('id', verificationData.id)
        .select()
        .single();

      if (error) throw error;

      setVerificationData(prev => ({
        ...prev!,
        phaseEX: {
          ...prev!.phaseEX,
          completed: true,
          completedAt: data.phase_ex_completed_at
        }
      }));

      return true;
    } catch (error) {
      console.error('Error completing Phase EX:', error);
      return false;
    }
  };

  const resetVerification = async () => {
    setVerificationData(null);
    return true;
  };

  return {
    verificationData,
    isLoading,
    savePhaseA,
    savePhaseB,
    authorizePhaseEX,
    completePhaseEX,
    resetVerification,
    reload: loadLatestVerification
  };
}
