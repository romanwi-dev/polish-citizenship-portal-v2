/**
 * PHASE 4: Workflow State Persistence Hook
 * Saves workflow state to database for recovery and resume capability
 */

import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { WorkflowState, WorkflowStage } from './useWorkflowState';

interface PersistedWorkflowState {
  id: string;
  case_id: string;
  status: string;
  current_stage: string;
  steps: any[];
  selected_document_ids: string[];
  workflow_run_id: string | null;
  retry_count: number;
  last_error: string | null;
  has_consent: boolean;
  created_at: string;
  updated_at: string;
}

export function useWorkflowPersistence(caseId: string) {
  const { toast } = useToast();

  /**
   * Save workflow state to database
   */
  const persistState = useCallback(async (
    state: WorkflowState,
    workflowRunId?: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('workflow_persistence')
        .upsert({
          case_id: caseId,
          workflow_run_id: workflowRunId || state.workflowRunId,
          status: state.status,
          current_stage: state.currentStage,
          steps: state.steps as any,
          selected_document_ids: Array.from(state.selectedDocuments),
          retry_count: state.retryCount,
          last_error: state.lastError,
          has_consent: state.hasConsent,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('[Workflow Persistence] Failed to save state:', error);
        return false;
      }

      console.log('[Workflow Persistence] State saved successfully');
      return true;
    } catch (error) {
      console.error('[Workflow Persistence] Error saving state:', error);
      return false;
    }
  }, [caseId]);

  /**
   * Restore workflow state from database
   */
  const restoreState = useCallback(async (): Promise<Partial<WorkflowState> | null> => {
    try {
      const { data, error } = await supabase
        .from('workflow_persistence')
        .select('*')
        .eq('case_id', caseId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('[Workflow Persistence] Failed to restore state:', error);
        return null;
      }

      if (!data) {
        console.log('[Workflow Persistence] No saved state found');
        return null;
      }

      const persisted = data as PersistedWorkflowState;
      
      console.log('[Workflow Persistence] State restored:', persisted.current_stage);

      return {
        status: persisted.status as any,
        currentStage: persisted.current_stage as WorkflowStage,
        steps: persisted.steps,
        selectedDocuments: new Set(persisted.selected_document_ids),
        workflowRunId: persisted.workflow_run_id,
        retryCount: persisted.retry_count,
        lastError: persisted.last_error,
        hasConsent: persisted.has_consent
      };
    } catch (error) {
      console.error('[Workflow Persistence] Error restoring state:', error);
      return null;
    }
  }, [caseId]);

  /**
   * Clear persisted state (after successful completion)
   */
  const clearPersistedState = useCallback(async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('workflow_persistence')
        .delete()
        .eq('case_id', caseId);

      if (error) {
        console.error('[Workflow Persistence] Failed to clear state:', error);
        return false;
      }

      console.log('[Workflow Persistence] State cleared');
      return true;
    } catch (error) {
      console.error('[Workflow Persistence] Error clearing state:', error);
      return false;
    }
  }, [caseId]);

  /**
   * Check if recoverable state exists
   */
  const hasRecoverableState = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('workflow_persistence')
        .select('id')
        .eq('case_id', caseId)
        .in('status', ['running', 'paused', 'failed'])
        .maybeSingle();

      if (error) {
        console.error('[Workflow Persistence] Error checking state:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('[Workflow Persistence] Error checking state:', error);
      return false;
    }
  }, [caseId]);

  /**
   * Create checkpoint (snapshot of current state)
   */
  const createCheckpoint = useCallback(async (
    state: WorkflowState,
    label?: string
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('workflow_checkpoints')
        .insert({
          case_id: caseId,
          workflow_run_id: state.workflowRunId,
          checkpoint_label: label || `Stage: ${state.currentStage}`,
          status: state.status,
          current_stage: state.currentStage,
          steps: state.steps as any,
          selected_document_ids: Array.from(state.selectedDocuments),
          retry_count: state.retryCount
        })
        .select('id')
        .single();

      if (error) {
        console.error('[Workflow Persistence] Failed to create checkpoint:', error);
        return null;
      }

      console.log('[Workflow Persistence] Checkpoint created:', data.id);
      return data.id as string;
    } catch (error) {
      console.error('[Workflow Persistence] Error creating checkpoint:', error);
      return null;
    }
  }, [caseId]);

  /**
   * List available checkpoints
   */
  const listCheckpoints = useCallback(async (): Promise<Array<{
    id: string;
    label: string;
    stage: string;
    created_at: string;
  }>> => {
    try {
      const { data, error } = await supabase
        .from('workflow_checkpoints')
        .select('id, checkpoint_label, current_stage, created_at')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('[Workflow Persistence] Failed to list checkpoints:', error);
        return [];
      }

      return data.map(cp => ({
        id: cp.id,
        label: cp.checkpoint_label,
        stage: cp.current_stage,
        created_at: cp.created_at
      }));
    } catch (error) {
      console.error('[Workflow Persistence] Error listing checkpoints:', error);
      return [];
    }
  }, [caseId]);

  /**
   * Restore from specific checkpoint
   */
  const restoreFromCheckpoint = useCallback(async (
    checkpointId: string
  ): Promise<Partial<WorkflowState> | null> => {
    try {
      const { data, error } = await supabase
        .from('workflow_checkpoints')
        .select('*')
        .eq('id', checkpointId)
        .single();

      if (error) {
        console.error('[Workflow Persistence] Failed to restore checkpoint:', error);
        return null;
      }

      return {
        status: data.status as any,
        currentStage: data.current_stage as WorkflowStage,
        steps: (data.steps as any) || [],
        selectedDocuments: new Set(data.selected_document_ids || []),
        workflowRunId: data.workflow_run_id,
        retryCount: data.retry_count || 0
      };
    } catch (error) {
      console.error('[Workflow Persistence] Error restoring checkpoint:', error);
      return null;
    }
  }, []);

  return {
    persistState,
    restoreState,
    clearPersistedState,
    hasRecoverableState,
    createCheckpoint,
    listCheckpoints,
    restoreFromCheckpoint
  };
}
