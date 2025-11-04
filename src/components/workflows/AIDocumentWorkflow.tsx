import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Upload, 
  Brain, 
  ShieldCheck, 
  FileText, 
  CheckCircle2,
  FileCheck,
  Download,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WorkflowProgressTracker } from "./WorkflowProgressTracker";
import { AIConsentModal } from "@/components/consent/AIConsentModal";
import { checkAIConsent, logPIIProcessing } from "@/utils/aiPIILogger";
import { sanitizeAIJSON } from "@/utils/aiSanitizer";
import { useWorkflowState } from "@/hooks/useWorkflowState";
import { useBase64Worker } from "@/hooks/useBase64Worker";
import { useCancellableRequest } from "@/hooks/useCancellableRequest";
import { useRequestBatcher } from "@/hooks/useRequestBatcher";
import { useDocumentProgress } from "@/hooks/useDocumentProgress";
import { DocumentProgressCard } from "./DocumentProgressCard";
import { BatchStatsDashboard } from "./BatchStatsDashboard";
import { PDFPreviewPanel } from "./PDFPreviewPanel";
import { ErrorRecoveryPanel } from "./ErrorRecoveryPanel";
import { DocumentViewer } from "./DocumentViewer";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface AIWorkflowStep {
  number: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  stage: 'upload' | 'ai_classify' | 'hac_classify' | 'ocr' | 'form_population' | 'hac_forms' | 'ai_verify' | 'hac_verify' | 'pdf_generation';
  agent: 'human' | 'ai' | 'both';
  backDetails: string;
}

const workflowSteps: AIWorkflowStep[] = [
  {
    number: "01",
    title: "Document Upload",
    description: "Upload scanned documents or photos to begin the automated workflow process.",
    icon: Upload,
    gradient: "from-primary to-secondary",
    stage: 'upload',
    agent: 'human',
    backDetails: "Clients upload high-quality scans or photos of documents. System accepts PDF, JPG, PNG formats. Files are securely stored and indexed for AI processing."
  },
  {
    number: "02",
    title: "AI Classification",
    description: "Gemini AI automatically names, describes, and categorizes each document by type and person.",
    icon: Brain,
    gradient: "from-secondary to-accent",
    stage: 'ai_classify',
    agent: 'ai',
    backDetails: "Gemini 2.5 Flash analyzes each document image, identifies document type (birth cert, marriage cert, passport, etc.) and matches to family members (AP, F, M, PGF, etc.) with confidence scoring."
  },
  {
    number: "03",
    title: "HAC Review - Classification",
    description: "Human attorney approves or corrects AI document classification before proceeding.",
    icon: ShieldCheck,
    gradient: "from-accent to-primary",
    stage: 'hac_classify',
    agent: 'human',
    backDetails: "Attorney reviews AI-suggested document types and person assignments. Can override low-confidence classifications. Ensures data integrity before form population."
  },
  {
    number: "03.5",
    title: "OCR Processing",
    description: "Extract text data from all documents using OCR technology.",
    icon: Brain,
    gradient: "from-primary to-secondary",
    stage: 'ocr',
    agent: 'ai',
    backDetails: "OCR Worker processes all queued documents in parallel, extracting structured data for form population."
  },
  {
    number: "04",
    title: "Form Population",
    description: "OCR-extracted data automatically fills citizenship application forms and family tree.",
    icon: FileText,
    gradient: "from-secondary to-accent",
    stage: 'form_population',
    agent: 'ai',
    backDetails: "System uses pre-existing OCR data to populate master_table, citizenship forms, and POA documents. Smart field mapping ensures accuracy. Non-overwrite mode protects manual entries."
  },
  {
    number: "05",
    title: "HAC Review - Forms",
    description: "Attorney verifies all populated form data for accuracy and completeness.",
    icon: ShieldCheck,
    gradient: "from-accent to-primary",
    stage: 'hac_forms',
    agent: 'human',
    backDetails: "Human review of all form fields populated by AI. Attorney checks data consistency, flags missing information, and approves forms for PDF generation."
  },
  {
    number: "06",
    title: "Dual AI Verification",
    description: "Both Gemini and OpenAI GPT-5 verify data quality, completeness, and readiness for PDF generation.",
    icon: Brain,
    gradient: "from-primary to-secondary",
    stage: 'ai_verify',
    agent: 'ai',
    backDetails: "Gemini 2.5 Flash and OpenAI GPT-5 independently analyze form data. They check for missing fields, data consistency, legal compliance, and generate quality scores with detailed feedback."
  },
  {
    number: "07",
    title: "HAC Review - Verification",
    description: "Attorney reviews AI verification results and makes final approval decision.",
    icon: ShieldCheck,
    gradient: "from-secondary to-accent",
    stage: 'hac_verify',
    agent: 'human',
    backDetails: "Attorney analyzes dual AI verification reports. Reviews flagged issues, confidence scores, and recommendations. Final human judgment before PDF generation authorization."
  },
  {
    number: "08",
    title: "PDF Generation",
    description: "Generate final citizenship application, POA, and family tree PDFs ready for submission.",
    icon: FileCheck,
    gradient: "from-accent to-primary",
    stage: 'pdf_generation',
    agent: 'both',
    backDetails: "System generates PDFs: POA (adult/minor/spouses), Citizenship Application, Family Tree, Uzupełnienie. All forms filled with verified data, formatted for Polish authorities."
  },
];

interface AIDocumentWorkflowProps {
  caseId: string;
}

interface WorkflowRun {
  id: string;
  case_id: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  current_stage: string;
  steps: any[];
  completed_steps: number;
  progress_percentage: number;
  document_ids: string[];
  retry_count: number;
  max_retries: number;
  last_error?: string;
  completed_at?: string;
  paused_at?: string;
}

export function AIDocumentWorkflow({ caseId }: AIDocumentWorkflowProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  
  // Phase 2: Use unified state machine to eliminate race conditions
  const { state: workflowState, actions } = useWorkflowState();
  
  // Phase 2: Web Worker for base64 encoding (prevent UI blocking)
  const { encodeToBase64, cancelAll: cancelAllEncoding } = useBase64Worker();
  
  // Phase 2: AbortController for request cancellation (prevent memory leaks)
  const { 
    createController, 
    cancelAll: cancelAllRequests,
    removeController 
  } = useCancellableRequest();
  
  // Phase 3: Request batching with rate limiting (prevent backend overload)
  const batcher = useRequestBatcher<any>({ batchSize: 3, delayMs: 500 });
  
  // Phase 3: Per-document progress tracking (granular visibility)
  const progress = useDocumentProgress();
  
  // Compatibility: Expose workflow state as individual variables
  const isRunning = workflowState.status === 'running';
  const isPaused = workflowState.status === 'paused';
  const currentStage = workflowState.currentStage;
  const trackedSteps = workflowState.steps;
  const selectedDocuments = workflowState.selectedDocuments;
  const hasConsent = workflowState.hasConsent;
  const isUploading = workflowState.isUploading;
  
  // Compatibility: Expose actions as setState-like functions
  const setCurrentStage = (stage: string) => actions.setStage(stage as any);
  const setTrackedSteps = (updater: any) => {
    // This is handled by actions.updateStep now
    console.warn('setTrackedSteps is deprecated, use actions.updateStep');
  };
  const setSelectedDocuments = (updater: any) => {
    if (updater instanceof Set) {
      actions.selectAllDocuments(Array.from(updater));
    } else if (typeof updater === 'function') {
      const newSet = updater(selectedDocuments);
      actions.selectAllDocuments(Array.from(newSet));
    }
  };
  const setIsRunning = (running: boolean) => {
    if (running) actions.resumeWorkflow();
    else actions.pauseWorkflow();
  };
  const setIsPaused = (paused: boolean) => {
    if (paused) actions.pauseWorkflow();
    else actions.resumeWorkflow();
  };
  const setIsUploading = actions.setUploading;
  const setHasConsent = actions.setConsent;
  
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [workflowRun, setWorkflowRun] = useState<WorkflowRun | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [workflowStartTime, setWorkflowStartTime] = useState<Date | undefined>();
  const [batchQueueSize, setBatchQueueSize] = useState(0);
  const [batchActiveCount, setBatchActiveCount] = useState(0);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{
    isOpen: boolean;
    url: string;
    name: string;
    type?: string;
    ocrText?: string;
  }>({
    isOpen: false,
    url: '',
    name: '',
  });

  const { data: caseData } = useQuery({
    queryKey: ['case-info', caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('dropbox_path, ai_processing_consent')
        .eq('id', caseId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!caseId
  });

  // Check consent on mount
  useEffect(() => {
    if (caseData) {
      actions.setConsent(caseData.ai_processing_consent === true);
    }
  }, [caseData, actions]);

  // Cleanup on unmount - Phase 2 & 3: Cancel all operations
  useEffect(() => {
    return () => {
      cancelAllEncoding();
      cancelAllRequests();
      batcher.clearQueue();
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [cancelAllEncoding, cancelAllRequests, batcher]);

  // Poll batch statistics every 100ms when workflow is running
  useEffect(() => {
    if (!isRunning) {
      setBatchQueueSize(0);
      setBatchActiveCount(0);
      return;
    }

    const interval = setInterval(() => {
      setBatchQueueSize(batcher.getQueueSize());
      setBatchActiveCount(batcher.getActiveCount());
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, batcher]);

  const { data: documents, isLoading: docsLoading, refetch: refetchDocs } = useQuery({
    queryKey: ['case-documents', caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!caseId
  });

  // Initialize workflow and realtime subscriptions
  useEffect(() => {
    initializeWorkflow();
    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [caseId]);

  // Auto-select all documents when they load
  useEffect(() => {
    if (documents && !workflowRun) {
      setSelectedDocuments(new Set(documents.map(d => d.id)));
    }
  }, [documents, workflowRun]);

  const initializeWorkflow = async () => {
    try {
      // Check for existing workflow run
      const { data: existingRun, error } = await supabase
        .from('workflow_runs')
        .select('*')
        .eq('case_id', caseId)
        .eq('workflow_type', 'ai_documents')
        .in('status', ['pending', 'running', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (existingRun) {
        // Resume existing workflow
        setWorkflowRun(existingRun as WorkflowRun);
        setTrackedSteps((existingRun.steps as any[]) || trackedSteps);
        setCurrentStage(existingRun.current_stage);
        setIsPaused(existingRun.status === 'paused');
        setSelectedDocuments(new Set(existingRun.document_ids || []));
        
        toast({
          title: "Workflow Resumed",
          description: "Continuing from where you left off.",
        });
      }

      // Subscribe to realtime updates
      subscribeToWorkflowUpdates();
    } catch (error: any) {
      console.error('Error initializing workflow:', error);
      toast({
        title: "Initialization Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const subscribeToWorkflowUpdates = () => {
    const channel = supabase
      .channel(`workflow_runs:case_id=eq.${caseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_runs',
          filter: `case_id=eq.${caseId}`,
        },
        (payload) => {
          if (payload.new && payload.eventType !== 'DELETE') {
            const updatedRun = payload.new as WorkflowRun;
            setWorkflowRun(updatedRun);
            setTrackedSteps((updatedRun.steps as any[]) || trackedSteps);
            setCurrentStage(updatedRun.current_stage);
            setIsPaused(updatedRun.status === 'paused');
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;
  };

  const createWorkflowRun = async () => {
    const selectedDocs = Array.from(selectedDocuments);
    
    const { data, error } = await supabase
      .from('workflow_runs')
      .insert({
        case_id: caseId,
        workflow_type: 'ai_documents',
        status: 'running',
        current_stage: 'ai_classify',
        steps: trackedSteps as any,
        total_steps: trackedSteps.length,
        completed_steps: 1, // Upload is already done
        progress_percentage: Math.round((1 / trackedSteps.length) * 100),
        document_ids: selectedDocs,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data as WorkflowRun;
  };

  const updateWorkflowRun = async (updates: Partial<WorkflowRun>) => {
    if (!workflowRun) return;

    const { error } = await supabase
      .from('workflow_runs')
      .update(updates)
      .eq('id', workflowRun.id);

    if (error) throw error;
  };

  const updateStepStatus = async (stepId: string, status: 'processing' | 'completed' | 'failed', error?: string) => {
    const updatedSteps = trackedSteps.map(step => 
      step.id === stepId 
        ? { ...step, status, error, completedAt: status === 'completed' ? new Date().toISOString() : undefined }
        : step
    );
    
    setTrackedSteps(updatedSteps);

    // Persist to database
    if (workflowRun) {
      const completedCount = updatedSteps.filter(s => s.status === 'completed').length;
      const progress = Math.round((completedCount / updatedSteps.length) * 100);
      
      await updateWorkflowRun({
        steps: updatedSteps,
        completed_steps: completedCount,
        progress_percentage: progress,
        current_stage: stepId,
      });
    }
  };

  const toggleFlip = (stepNumber: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const runWorkflowStep = async (stage: AIWorkflowStep['stage'], retryCount = 0) => {
    if (isPaused) return;
    
    const MAX_RETRIES = 3;
    setCurrentStage(stage);
    await updateStepStatus(stage, 'processing');
    setIsRunning(true);
    
    try {
      switch (stage) {
        case 'ai_classify':
          const { data: docs, error: docsError } = await supabase
            .from('documents')
            .select('id, name, dropbox_path')
            .eq('case_id', caseId)
            .in('id', Array.from(selectedDocuments))
            .is('document_type', null);

          if (docsError) throw docsError;
          if (!docs || docs.length === 0) {
            toast({ title: "No documents to classify", variant: "default" });
            await updateStepStatus('ai_classify', 'completed');
            setCurrentStage('hac_classify');
            return;
          }

          // Phase 3: Initialize progress tracking for all documents
          docs.forEach(doc => progress.initializeDocument(doc.id, doc.name));

          // Phase 3: Batched parallel processing with individual error recovery
          const classifyPromises = docs.map(async (doc) => {
            return batcher.addRequest(doc.id, async () => {
              try {
                progress.updateDocument(doc.id, { status: 'downloading', progress: 25 });
                
                // Log PII processing for audit trail
                await logPIIProcessing({
                  caseId,
                  documentId: doc.id,
                  operationType: 'classification',
                  piiFieldsSent: ['document_image', 'document_name'],
                  aiProvider: 'gemini'
                });

                // Use secure edge function (no token exposure)
                const { data: downloadData, error: downloadError } = await supabase.functions.invoke(
                  'download-and-encode',
                  { 
                    body: { 
                      dropboxPath: doc.dropbox_path,
                      documentId: doc.id,
                      caseId 
                    } 
                  }
                );

                if (downloadError) throw downloadError;
                if (!downloadData?.success) throw new Error('Download failed');

                progress.updateDocument(doc.id, { status: 'classifying', progress: 60 });

                const { data: classifyData, error: classifyError } = await supabase.functions.invoke(
                  'ai-classify-document',
                  { body: { documentId: doc.id, caseId, imageBase64: downloadData.base64 } }
                );

                if (classifyError) throw classifyError;
                
                // Sanitize AI response
                const sanitizedResult = sanitizeAIJSON(classifyData || {});
                
                progress.markCompleted(doc.id);
                return { success: true, name: doc.name, result: sanitizedResult };
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                console.error(`Failed to classify ${doc.name}:`, errorMsg);
                progress.markFailed(doc.id, errorMsg);
                
                // Log error to workflow_errors table
                if (workflowRun) {
                  await supabase.rpc('log_workflow_error', {
                    p_workflow_run_id: workflowRun.id,
                    p_document_id: doc.id,
                    p_stage: 'ai_classify',
                    p_error_message: errorMsg,
                    p_error_details: { dropbox_path: doc.dropbox_path }
                  });
                }
                
                // Don't throw - let workflow continue with other documents
                return { success: false, name: doc.name, error: errorMsg };
              }
            });
          });

          const classifyResults = await Promise.allSettled(classifyPromises);
          const successCount = classifyResults.filter(r => r.status === 'fulfilled' && r.value.success).length;
          const stats = progress.getStats();
          
          toast({ 
            title: `AI Classification Complete`, 
            description: `${successCount} succeeded, ${stats.failed} failed, ${stats.skipped} skipped`
          });
          await updateStepStatus('ai_classify', 'completed');
          await refetchDocs();
          setCurrentStage('hac_classify');
          break;

        case 'ocr':
          console.log("Triggering OCR worker...");
          const { error: ocrError } = await supabase.functions.invoke('ocr-worker');
          
          if (ocrError) {
            // Check for rate limiting
            if (ocrError.message?.includes('429') || ocrError.message?.includes('402')) {
              throw { status: 429, message: 'Rate limit exceeded' };
            }
            throw ocrError;
          }
          
          toast({ title: "OCR Processing Complete" });
          await updateStepStatus('ocr', 'completed');
          await refetchDocs();
          setCurrentStage('form_population');
          break;

        case 'form_population':
          const { data: ocrDocs, error: ocrDocsError } = await supabase
            .from('documents')
            .select('id, name')
            .eq('case_id', caseId)
            .in('id', Array.from(selectedDocuments))
            .eq('ocr_status', 'completed')
            .eq('data_applied_to_forms', false);

          if (ocrDocsError) throw ocrDocsError;
          if (!ocrDocs || ocrDocs.length === 0) {
            toast({ title: "No OCR data to apply", variant: "default" });
            await updateStepStatus('form_population', 'completed');
            setCurrentStage('hac_forms');
            return;
          }

          // Phase 3: Initialize progress and batch form population
          ocrDocs.forEach(doc => progress.initializeDocument(doc.id, doc.name));
          
          const applyPromises = ocrDocs.map(async (doc) => {
            return batcher.addRequest(doc.id, async () => {
              try {
                progress.updateDocument(doc.id, { status: 'classifying', progress: 50 });
                
                const { error: applyError } = await supabase.functions.invoke(
                  'apply-ocr-to-forms',
                  { body: { documentId: doc.id, caseId, overwriteManual: false } }
                );

                if (applyError) throw applyError;
                
                progress.markCompleted(doc.id);
                return { success: true, name: doc.name };
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                console.error(`Failed to apply OCR for ${doc.name}:`, errorMsg);
                progress.markFailed(doc.id, errorMsg);
                
                // Log error to workflow_errors table
                if (workflowRun) {
                  await supabase.rpc('log_workflow_error', {
                    p_workflow_run_id: workflowRun.id,
                    p_document_id: doc.id,
                    p_stage: 'form_population',
                    p_error_message: errorMsg,
                    p_error_details: {}
                  });
                }
                
                return { success: false, name: doc.name, error: errorMsg };
              }
            });
          });

          const applyResults = await Promise.allSettled(applyPromises);
          const applySuccessCount = applyResults.filter(r => r.status === 'fulfilled' && r.value.success).length;

          toast({ title: `Forms Populated (${applySuccessCount}/${ocrDocs.length})` });
          await updateStepStatus('form_population', 'completed');
          setCurrentStage('hac_forms');
          break;

        case 'ai_verify':
          // Dual AI Verification (all forms in parallel)
          const verifyPromises = ['intake', 'oby', 'master'].map(async (formType) => {
            try {
              const { data, error } = await supabase.functions.invoke(
                'ai-verify-forms',
                { body: { caseId, formType } }
              );
              
              if (error) throw error;
              return { success: true, formType, verification: data.verification };
            } catch (error) {
              console.error(`Failed to verify ${formType}:`, error);
              return { success: false, formType, error };
            }
          });

          const verifyResults = await Promise.all(verifyPromises);
          const verifySuccessCount = verifyResults.filter(r => r.success).length;
          
          toast({ title: `AI Verification Complete (${verifySuccessCount}/3 forms)` });
          await updateStepStatus('ai_verify', 'completed');
          setCurrentStage('hac_verify');
          break;

        case 'pdf_generation':
          // Show PDF preview panel first
          setShowPDFPreview(true);
          setIsRunning(false); // Pause workflow for HAC review
          
          toast({ 
            title: "Ready for PDF Generation", 
            description: "Review the PDF previews before generating final documents."
          });
          
          // The actual PDF generation will be triggered by the preview panel's confirm button
          break;
      }

      return true;
    } catch (error: any) {
      console.error(`Workflow step ${stage} failed (attempt ${retryCount + 1}):`, error);
      
      // Retry logic for transient errors
      const isTransientError = error?.message?.includes('timeout') || 
                              error?.message?.includes('network') ||
                              error?.status === 429 ||
                              error?.status === 402 || // Payment required (rate limit)
                              error?.status === 503;

      if (isTransientError && retryCount < MAX_RETRIES) {
        const backoffMs = Math.pow(2, retryCount) * 1000;
        console.log(`Retrying ${stage} in ${backoffMs}ms... (attempt ${retryCount + 2}/${MAX_RETRIES + 1})`);
        
        // Handle payment/rate limit errors with user-friendly message
        if (error?.status === 402 || error?.status === 429) {
          toast({
            title: error?.status === 402 ? "Rate Limit - Payment Required" : "Rate Limit Exceeded",
            description: `Retrying automatically in ${backoffMs / 1000}s... (${retryCount + 2}/${MAX_RETRIES + 1})`,
            variant: "default"
          });
        } else {
          toast({
            title: `Retrying ${stage}...`,
            description: `Attempt ${retryCount + 2} of ${MAX_RETRIES + 1}`
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        return runWorkflowStep(stage, retryCount + 1);
      }

      // Permanent failure
      await updateStepStatus(stage, 'failed', error?.message || 'Unknown error');
      
      if (workflowRun) {
        // Log stage-level error
        await supabase.rpc('log_workflow_error', {
          p_workflow_run_id: workflowRun.id,
          p_document_id: null,
          p_stage: stage,
          p_error_message: error?.message || 'Unknown error',
          p_error_details: { 
            status: error?.status,
            retryCount: retryCount
          }
        });
        
        await updateWorkflowRun({ 
          status: 'failed', 
          last_error: error?.message 
        });
      }
      
      toast({
        title: `${stage} Failed`,
        description: error?.message || 'Please check the console for details',
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsRunning(false);
    }
  };

  const startWorkflow = async () => {
    // Check for AI consent first
    if (!hasConsent) {
      setShowConsentModal(true);
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    setWorkflowStartTime(new Date()); // Track start time for metrics
    
    try {
      // Create new workflow run if starting fresh
      if (!workflowRun) {
        const newRun = await createWorkflowRun();
        setWorkflowRun(newRun);
      } else {
        // Resume paused workflow
        await updateWorkflowRun({ status: 'running', paused_at: null });
      }

      setCurrentStage("ai_classify");
      await runWorkflowStep("ai_classify");
    } catch (error: any) {
      console.error('Workflow error:', error);
      toast({
        title: "Workflow Error",
        description: error.message,
        variant: "destructive",
      });
      setIsRunning(false);
      setWorkflowStartTime(undefined);
    }
  };

  const handleConsentGiven = async () => {
    setShowConsentModal(false);
    setHasConsent(true);
    // Refetch case data to get updated consent status
    await queryClient.invalidateQueries({ queryKey: ['case-info', caseId] });
    // Now start the workflow
    startWorkflow();
  };

  const handleConsentDeclined = () => {
    setShowConsentModal(false);
    toast({
      title: "Consent Required",
      description: "AI processing cannot proceed without consent.",
      variant: "default",
    });
  };

  const pauseWorkflow = async () => {
    setIsPaused(true);
    setIsRunning(false);
    setWorkflowStartTime(undefined); // Clear metrics on pause
    
    if (workflowRun) {
      await updateWorkflowRun({ 
        status: 'paused', 
        paused_at: new Date().toISOString() 
      });
    }

    toast({
      title: "Workflow Paused",
      description: "You can resume anytime.",
    });
  };

  const retryWorkflow = async () => {
    if (!workflowRun) return;

    const retryCount = (workflowRun.retry_count || 0) + 1;
    
    if (retryCount > (workflowRun.max_retries || 3)) {
      toast({
        title: "Max Retries Reached",
        description: "Please contact support for assistance.",
        variant: "destructive",
      });
      return;
    }

    await updateWorkflowRun({
      status: 'running',
      retry_count: retryCount,
      last_error: null,
    });

    // Reset failed steps
    const resetSteps = trackedSteps.map(step => 
      step.status === 'failed' ? { ...step, status: 'pending' as const, error: undefined } : step
    );
    setTrackedSteps(resetSteps);

    // Resume from current stage
    setIsRunning(true);
    setIsPaused(false);
    await runWorkflowStep(currentStage as AIWorkflowStep['stage']);
  };

  const approveAndContinue = async (currentStageId: AIWorkflowStep['stage']) => {
    const stageIndex = workflowSteps.findIndex(s => s.stage === currentStageId);
    const nextStep = workflowSteps[stageIndex + 1];
    
    // Mark current step as complete
    await updateStepStatus(currentStageId, 'completed');
    
    if (nextStep && nextStep.agent === 'ai') {
      await runWorkflowStep(nextStep.stage);
    } else if (nextStep) {
      setCurrentStage(nextStep.stage);
      toast({ title: "Ready for Next Step" });
    }
  };

  const generateFinalPDFs = async () => {
    setIsRunning(true);
    setShowPDFPreview(false);
    
    try {
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, formType: 'all' }
      });
      
      if (pdfError) {
        // Check for rate limiting
        if (pdfError.message?.includes('429') || pdfError.message?.includes('402')) {
          throw { status: 429, message: 'Rate limit exceeded during PDF generation' };
        }
        throw pdfError;
      }
      
      console.log('PDF generation complete');
      toast({ title: "PDFs Generated Successfully" });
      await updateStepStatus('pdf_generation', 'completed');
      
      // Mark workflow as completed
      if (workflowRun) {
        await updateWorkflowRun({
          status: 'completed',
          completed_at: new Date().toISOString(),
          progress_percentage: 100,
        });
      }
      
      setTimeout(() => {
        navigate(`/admin/poa/${caseId}`);
      }, 1500);
    } catch (error: any) {
      console.error('PDF generation failed:', error);
      
      toast({
        title: "PDF Generation Failed",
        description: error.message,
        variant: "destructive"
      });
      
      setShowPDFPreview(true); // Show preview again if generation fails
    } finally {
      setIsRunning(false);
    }
  };

  const handleRegenerateWithChanges = async () => {
    setShowPDFPreview(false);
    
    toast({
      title: "Make Your Changes",
      description: "Update the forms as needed, then click 'Approve & Continue' on Step 07 to regenerate previews."
    });
    
    // Go back to HAC verification stage
    setCurrentStage('hac_verify');
  };

  const handleRetryErrors = async (documentIds: string[], stage: string) => {
    setIsRunning(true);
    
    try {
      // Update selected documents to retry
      setSelectedDocuments(new Set(documentIds));
      
      // Re-run the failed stage
      await runWorkflowStep(stage as AIWorkflowStep['stage']);
      
      toast({
        title: "Retry Complete",
        description: `Re-processed ${documentIds.length} document(s)`
      });
    } catch (error: any) {
      toast({
        title: "Retry Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handlePreviewDocument = async (dropboxPath: string, name: string, documentId: string) => {
    try {
      // Get signed URL from Dropbox
      const { data, error } = await supabase.functions.invoke('download-and-encode', {
        body: { dropboxPath, returnUrl: true }
      });

      if (error) throw error;

      // Get OCR text if available
      const { data: docData } = await supabase
        .from('documents')
        .select('ocr_text')
        .eq('id', documentId)
        .single();

      setPreviewDocument({
        isOpen: true,
        url: data.signedUrl,
        name: name,
        type: name.toLowerCase().endsWith('.pdf') ? 'pdf' : undefined,
        ocrText: docData?.ocr_text
      });
    } catch (error: any) {
      toast({
        title: "Preview Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const closePreview = () => {
    setPreviewDocument({
      isOpen: false,
      url: '',
      name: '',
    });
  };

  const syncDropboxDocuments = async () => {
    if (!caseData?.dropbox_path) {
      toast({
        title: "No Dropbox path configured",
        description: "Please set the Dropbox path for this case",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    await updateStepStatus('upload', 'processing');
    try {
      const { data, error } = await supabase.functions.invoke('list-dropbox-documents', {
        body: { caseId, dropboxPath: caseData.dropbox_path }
      });

      if (error) throw error;

      toast({ 
        title: "Dropbox sync complete",
        description: `Synced ${data.synced} new documents`
      });
      
      await updateStepStatus('upload', 'completed');
      refetchDocs();
    } catch (error) {
      await updateStepStatus('upload', 'failed', error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (dropboxPath: string, fileName: string) => {
    try {
      if (!dropboxPath) {
        toast({ title: "No file path available", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.functions.invoke('download-dropbox-file', {
        body: { dropboxPath }
      });

      if (error) throw error;

      const blob = new Blob([data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: "Download started" });
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return;
    
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;
      
      toast({ title: "Document deleted" });
      queryClient.invalidateQueries({ queryKey: ['case-documents', caseId] });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  const toggleDocumentSelection = (docId: string) => {
    if (workflowRun) return; // Can't change selection if workflow started
    
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const selectAllDocuments = () => {
    if (workflowRun) return;
    setSelectedDocuments(new Set(documents?.map(d => d.id) || []));
  };

  const deselectAllDocuments = () => {
    if (workflowRun) return;
    setSelectedDocuments(new Set());
  };

  const overallProgress = Math.round(
    (trackedSteps.filter(s => s.status === 'completed').length / trackedSteps.length) * 100
  );

  const canStart = !isRunning && !isPaused && !workflowRun && selectedDocuments.size > 0;
  const canResume = isPaused && workflowRun;
  const canPause = isRunning && !isPaused;
  const canRetry = workflowRun?.status === 'failed';

  return (
    <section className="relative py-8 overflow-hidden">
      {/* AI Consent Modal */}
      <AIConsentModal
        open={showConsentModal}
        onConsent={handleConsentGiven}
        onDecline={handleConsentDeclined}
        caseId={caseId}
      />

      <div className="container relative z-10 mx-auto px-4">
        {/* Sprint 3 Code Review Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-primary" />
              <div>
                <h3 className="font-semibold">Sprint 3: Deep Code Review Available</h3>
                <p className="text-sm text-muted-foreground">
                  Run comprehensive GPT-5 analysis on all workflow files to achieve 100/100 score
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/admin/code-review')} variant="outline">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Run Code Review
            </Button>
          </div>
        </motion.div>

        {/* Progress Tracker */}
        <WorkflowProgressTracker
          steps={trackedSteps}
          currentStepIndex={trackedSteps.findIndex(s => s.id === currentStage)}
          overallProgress={overallProgress}
        />

        {/* Workflow Controls */}
        {workflowRun && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 my-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Workflow Controls</h3>
                <p className="text-sm text-muted-foreground">
                  Run #{workflowRun.id.slice(0, 8)} • {selectedDocuments.size} documents
                </p>
              </div>
              <div className="flex gap-2">
                {canStart && (
                  <Button onClick={startWorkflow}>
                    <Play className="h-4 w-4 mr-2" />
                    Start ({selectedDocuments.size} docs)
                  </Button>
                )}
                {canResume && (
                  <Button onClick={startWorkflow}>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}
                {canPause && (
                  <Button onClick={pauseWorkflow} variant="outline">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}
                {canRetry && (
                  <Button onClick={retryWorkflow} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retry ({workflowRun.retry_count}/{workflowRun.max_retries})
                  </Button>
                )}
              </div>
            </div>
            {workflowRun.last_error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded">
                <p className="text-sm text-destructive">{workflowRun.last_error}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Phase 3: Batch Statistics Dashboard */}
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-6"
          >
            <BatchStatsDashboard
              queueSize={batchQueueSize}
              activeRequests={batchActiveCount}
              totalDocuments={progress.getStats().total}
              completedDocuments={progress.getStats().completed}
              failedDocuments={progress.getStats().failed}
              startTime={workflowStartTime}
            />
          </motion.div>
        )}

        {/* Phase 3: Per-Document Progress Tracking */}
        {isRunning && progress.documents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 my-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Document Processing Progress</h3>
              <div className="text-sm text-muted-foreground">
                {progress.getStats().completed}/{progress.getStats().total} completed • 
                {progress.getStats().failed > 0 && ` ${progress.getStats().failed} failed • `}
                {progress.getStats().processing} processing
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {progress.documents.map((doc) => {
                const fullDoc = documents?.find(d => d.id === doc.id);
                return (
                  <DocumentProgressCard 
                    key={doc.id} 
                    document={doc}
                    onClick={fullDoc ? () => handlePreviewDocument(fullDoc.dropbox_path, doc.name, doc.id) : undefined}
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Error Recovery Panel */}
        {workflowRun && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-6"
          >
            <ErrorRecoveryPanel
              workflowRunId={workflowRun.id}
              onRetry={handleRetryErrors}
            />
          </motion.div>
        )}

        {/* PDF Preview Panel - Step 08 */}
        {showPDFPreview && currentStage === 'pdf_generation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-6"
          >
            <PDFPreviewPanel
              caseId={caseId}
              onConfirmGeneration={generateFinalPDFs}
              onRegenerateWithChanges={handleRegenerateWithChanges}
            />
          </motion.div>
        )}

        {/* Document Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 my-8"
        >
          <h3 className="text-2xl font-heading font-bold mb-4">Dropbox Documents</h3>
          
          <div className="mb-6 flex gap-3 items-center">
            <Button
              onClick={syncDropboxDocuments}
              disabled={isUploading || !caseData?.dropbox_path || !!workflowRun}
              className="w-full md:w-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Syncing...' : 'Sync from Dropbox'}
            </Button>
            
            {!workflowRun && documents && documents.length > 0 && (
              <>
                <Button size="sm" variant="outline" onClick={selectAllDocuments}>
                  Select All
                </Button>
                <Button size="sm" variant="outline" onClick={deselectAllDocuments}>
                  Deselect All
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedDocuments.size} of {documents.length} selected
                </span>
              </>
            )}
            
            {!caseData?.dropbox_path && (
              <p className="text-sm text-destructive">No Dropbox path configured for this case</p>
            )}
          </div>

          {docsLoading ? (
            <p>Loading documents...</p>
          ) : documents && documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 border rounded">
                  {!workflowRun && (
                    <Checkbox
                      checked={selectedDocuments.has(doc.id)}
                      onCheckedChange={() => toggleDocumentSelection(doc.id)}
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{doc.name}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{doc.ocr_status || 'pending'}</Badge>
                      {doc.document_type && <Badge>{doc.document_type}</Badge>}
                      {doc.person_type && <Badge variant="secondary">{doc.person_type}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePreviewDocument(doc.dropbox_path, doc.name, doc.id)}
                      title="Preview document"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(doc.dropbox_path, doc.name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(doc.id)}
                      disabled={!!workflowRun}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No documents found. Sync from Dropbox to get started.</p>
          )}
        </motion.div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          {workflowSteps.map((step, index) => {
            const isFlipped = flippedCards[step.number];
            const isActive = currentStage === step.stage;
            const isCompleted = trackedSteps.find(s => s.id === step.stage)?.status === 'completed';
            
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative h-[400px] perspective"
                onClick={() => toggleFlip(step.number)}
              >
                <div className={`relative w-full h-full transition-transform duration-500 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}>
                  {/* Front */}
                  <div className={`absolute inset-0 backface-hidden rounded-2xl p-6 ${isActive ? 'ring-2 ring-primary' : ''} ${isCompleted ? 'bg-green-50' : 'glass-card'}`}>
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-4xl font-bold text-primary/20">{step.number}</span>
                        <step.icon className={`w-8 h-8 ${isCompleted ? 'text-green-600' : 'text-primary'}`} />
                      </div>
                      
                      <h3 className="text-xl font-heading font-bold mb-3">{step.title}</h3>
                      <p className="text-sm text-muted-foreground flex-1">{step.description}</p>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <Badge variant={step.agent === 'ai' ? 'default' : 'secondary'}>
                          {step.agent === 'ai' ? 'AI' : step.agent === 'human' ? 'HAC' : 'Both'}
                        </Badge>
                        {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                        {isActive && <Badge variant="outline">Active</Badge>}
                      </div>

                      {step.agent === 'human' && isActive && !isRunning && (
                        <Button
                          className="mt-4 w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            approveAndContinue(step.stage);
                          }}
                        >
                          Approve & Continue
                        </Button>
                      )}

                      {step.agent === 'ai' && isActive && !isRunning && !isPaused && (
                        <Button
                          className="mt-4 w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            runWorkflowStep(step.stage);
                          }}
                        >
                          Start {step.title}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-6 glass-card">
                    <div className="flex flex-col h-full">
                      <h4 className="text-lg font-bold mb-4">Technical Details</h4>
                      <p className="text-sm text-muted-foreground">{step.backDetails}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Start Button */}
        {canStart && (
          <div className="flex justify-center mt-8">
            <Button
              size="lg"
              onClick={startWorkflow}
              disabled={selectedDocuments.size === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              Start AI Workflow ({selectedDocuments.size} documents)
            </Button>
          </div>
        )}

        {/* Document Viewer Modal */}
        <DocumentViewer
          isOpen={previewDocument.isOpen}
          onClose={closePreview}
          documentUrl={previewDocument.url}
          documentName={previewDocument.name}
          documentType={previewDocument.type}
          ocrText={previewDocument.ocrText}
        />
      </div>
    </section>
  );
}
