import { useReducer, useCallback } from 'react';

/**
 * Workflow state machine using useReducer
 * Eliminates race conditions from multiple useState calls
 */

export type WorkflowStage = 
  | 'upload' 
  | 'ai_classify' 
  | 'hac_classify' 
  | 'ocr' 
  | 'form_population' 
  | 'hac_forms' 
  | 'ai_verify' 
  | 'hac_verify' 
  | 'pdf_generation';

export type WorkflowStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

export type StepStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface WorkflowStep {
  id: string;
  title: string;
  status: StepStatus;
  error?: string;
  completedAt?: string;
}

export interface WorkflowState {
  status: WorkflowStatus;
  currentStage: WorkflowStage;
  steps: WorkflowStep[];
  selectedDocuments: Set<string>;
  workflowRunId: string | null;
  retryCount: number;
  lastError: string | null;
  hasConsent: boolean;
  isUploading: boolean;
}

type WorkflowAction =
  | { type: 'START_WORKFLOW'; payload: { runId: string } }
  | { type: 'PAUSE_WORKFLOW' }
  | { type: 'RESUME_WORKFLOW' }
  | { type: 'COMPLETE_WORKFLOW' }
  | { type: 'FAIL_WORKFLOW'; payload: { error: string } }
  | { type: 'RETRY_WORKFLOW' }
  | { type: 'SET_STAGE'; payload: { stage: WorkflowStage } }
  | { type: 'UPDATE_STEP'; payload: { stepId: string; status: StepStatus; error?: string } }
  | { type: 'SELECT_DOCUMENT'; payload: { documentId: string } }
  | { type: 'DESELECT_DOCUMENT'; payload: { documentId: string } }
  | { type: 'SELECT_ALL_DOCUMENTS'; payload: { documentIds: string[] } }
  | { type: 'DESELECT_ALL_DOCUMENTS' }
  | { type: 'SET_CONSENT'; payload: { hasConsent: boolean } }
  | { type: 'SET_UPLOADING'; payload: { isUploading: boolean } }
  | { type: 'RESTORE_STATE'; payload: Partial<WorkflowState> };

const initialSteps: WorkflowStep[] = [
  { id: 'upload', title: 'Document Upload & Sync', status: 'pending' },
  { id: 'ai_classify', title: 'AI Classification', status: 'pending' },
  { id: 'hac_classify', title: 'HAC Review (Classification)', status: 'pending' },
  { id: 'ocr', title: 'OCR Processing', status: 'pending' },
  { id: 'form_population', title: 'Form Population', status: 'pending' },
  { id: 'hac_forms', title: 'HAC Review (Forms)', status: 'pending' },
  { id: 'ai_verify', title: 'Dual AI Verification', status: 'pending' },
  { id: 'hac_verify', title: 'HAC Final Review', status: 'pending' },
];

const initialState: WorkflowState = {
  status: 'idle',
  currentStage: 'upload',
  steps: initialSteps,
  selectedDocuments: new Set(),
  workflowRunId: null,
  retryCount: 0,
  lastError: null,
  hasConsent: false,
  isUploading: false,
};

function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'START_WORKFLOW':
      return {
        ...state,
        status: 'running',
        workflowRunId: action.payload.runId,
        currentStage: 'ai_classify',
        lastError: null,
      };

    case 'PAUSE_WORKFLOW':
      return {
        ...state,
        status: 'paused',
      };

    case 'RESUME_WORKFLOW':
      return {
        ...state,
        status: 'running',
      };

    case 'COMPLETE_WORKFLOW':
      return {
        ...state,
        status: 'completed',
        lastError: null,
      };

    case 'FAIL_WORKFLOW':
      return {
        ...state,
        status: 'failed',
        lastError: action.payload.error,
      };

    case 'RETRY_WORKFLOW':
      return {
        ...state,
        status: 'running',
        retryCount: state.retryCount + 1,
        lastError: null,
      };

    case 'SET_STAGE':
      return {
        ...state,
        currentStage: action.payload.stage,
      };

    case 'UPDATE_STEP': {
      const updatedSteps = state.steps.map(step =>
        step.id === action.payload.stepId
          ? {
              ...step,
              status: action.payload.status,
              error: action.payload.error,
              completedAt: action.payload.status === 'completed' ? new Date().toISOString() : undefined,
            }
          : step
      );
      return {
        ...state,
        steps: updatedSteps,
      };
    }

    case 'SELECT_DOCUMENT': {
      const newSelected = new Set(state.selectedDocuments);
      newSelected.add(action.payload.documentId);
      return {
        ...state,
        selectedDocuments: newSelected,
      };
    }

    case 'DESELECT_DOCUMENT': {
      const newSelected = new Set(state.selectedDocuments);
      newSelected.delete(action.payload.documentId);
      return {
        ...state,
        selectedDocuments: newSelected,
      };
    }

    case 'SELECT_ALL_DOCUMENTS':
      return {
        ...state,
        selectedDocuments: new Set(action.payload.documentIds),
      };

    case 'DESELECT_ALL_DOCUMENTS':
      return {
        ...state,
        selectedDocuments: new Set(),
      };

    case 'SET_CONSENT':
      return {
        ...state,
        hasConsent: action.payload.hasConsent,
      };

    case 'SET_UPLOADING':
      return {
        ...state,
        isUploading: action.payload.isUploading,
      };

    case 'RESTORE_STATE':
      return {
        ...state,
        ...action.payload,
        selectedDocuments: action.payload.selectedDocuments 
          ? new Set(action.payload.selectedDocuments)
          : state.selectedDocuments,
      };

    default:
      return state;
  }
}

export function useWorkflowState(initialConsent = false) {
  const [state, dispatch] = useReducer(workflowReducer, {
    ...initialState,
    hasConsent: initialConsent,
  });

  // Action creators
  const startWorkflow = useCallback((runId: string) => {
    dispatch({ type: 'START_WORKFLOW', payload: { runId } });
  }, []);

  const pauseWorkflow = useCallback(() => {
    dispatch({ type: 'PAUSE_WORKFLOW' });
  }, []);

  const resumeWorkflow = useCallback(() => {
    dispatch({ type: 'RESUME_WORKFLOW' });
  }, []);

  const completeWorkflow = useCallback(() => {
    dispatch({ type: 'COMPLETE_WORKFLOW' });
  }, []);

  const failWorkflow = useCallback((error: string) => {
    dispatch({ type: 'FAIL_WORKFLOW', payload: { error } });
  }, []);

  const retryWorkflow = useCallback(() => {
    dispatch({ type: 'RETRY_WORKFLOW' });
  }, []);

  const setStage = useCallback((stage: WorkflowStage) => {
    dispatch({ type: 'SET_STAGE', payload: { stage } });
  }, []);

  const updateStep = useCallback((stepId: string, status: StepStatus, error?: string) => {
    dispatch({ type: 'UPDATE_STEP', payload: { stepId, status, error } });
  }, []);

  const selectDocument = useCallback((documentId: string) => {
    dispatch({ type: 'SELECT_DOCUMENT', payload: { documentId } });
  }, []);

  const deselectDocument = useCallback((documentId: string) => {
    dispatch({ type: 'DESELECT_DOCUMENT', payload: { documentId } });
  }, []);

  const selectAllDocuments = useCallback((documentIds: string[]) => {
    dispatch({ type: 'SELECT_ALL_DOCUMENTS', payload: { documentIds } });
  }, []);

  const deselectAllDocuments = useCallback(() => {
    dispatch({ type: 'DESELECT_ALL_DOCUMENTS' });
  }, []);

  const setConsent = useCallback((hasConsent: boolean) => {
    dispatch({ type: 'SET_CONSENT', payload: { hasConsent } });
  }, []);

  const setUploading = useCallback((isUploading: boolean) => {
    dispatch({ type: 'SET_UPLOADING', payload: { isUploading } });
  }, []);

  const restoreState = useCallback((partialState: Partial<WorkflowState>) => {
    dispatch({ type: 'RESTORE_STATE', payload: partialState });
  }, []);

  return {
    state,
    actions: {
      startWorkflow,
      pauseWorkflow,
      resumeWorkflow,
      completeWorkflow,
      failWorkflow,
      retryWorkflow,
      setStage,
      updateStep,
      selectDocument,
      deselectDocument,
      selectAllDocuments,
      deselectAllDocuments,
      setConsent,
      setUploading,
      restoreState,
    },
  };
}
