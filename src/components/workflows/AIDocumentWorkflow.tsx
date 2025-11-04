import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Upload, 
  Brain, 
  ShieldCheck, 
  FileText, 
  CheckCircle2,
  FileCheck,
  Download,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WorkflowProgressTracker } from "./WorkflowProgressTracker";

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

export function AIDocumentWorkflow({ caseId }: AIDocumentWorkflowProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('upload');
  const [isUploading, setIsUploading] = useState(false);
  
  const [trackedSteps, setTrackedSteps] = useState<Array<{
    id: string;
    title: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    completedAt?: string;
  }>>([
    { id: 'upload', title: 'Document Upload & Sync', status: 'pending' },
    { id: 'ai_classify', title: 'AI Classification', status: 'pending' },
    { id: 'hac_classify', title: 'HAC Review (Classification)', status: 'pending' },
    { id: 'ocr', title: 'OCR Processing', status: 'pending' },
    { id: 'form_population', title: 'Form Population', status: 'pending' },
    { id: 'hac_forms', title: 'HAC Review (Forms)', status: 'pending' },
    { id: 'ai_verify', title: 'Dual AI Verification', status: 'pending' },
    { id: 'hac_verify', title: 'HAC Final Review', status: 'pending' },
  ]);

  const { data: caseData } = useQuery({
    queryKey: ['case-info', caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('dropbox_path')
        .eq('id', caseId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!caseId
  });

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

  const updateStepStatus = (stepId: string, status: 'processing' | 'completed' | 'failed', error?: string) => {
    setTrackedSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, error, completedAt: status === 'completed' ? new Date().toISOString() : undefined }
        : step
    ));
  };

  const toggleFlip = (stepNumber: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const runWorkflowStep = async (stage: AIWorkflowStep['stage'], retryCount = 0) => {
    const MAX_RETRIES = 3;
    console.log(`Running workflow step: ${stage} (attempt ${retryCount + 1})`);
    setCurrentStage(stage);
    updateStepStatus(stage, 'processing');
    setIsRunning(true);
    
    try {
      switch (stage) {
        case 'ai_classify':
          const { data: docs, error: docsError } = await supabase
            .from('documents')
            .select('id, name, dropbox_path')
            .eq('case_id', caseId)
            .is('document_type', null);

          if (docsError) throw docsError;
          if (!docs || docs.length === 0) {
            toast({ title: "No documents to classify", variant: "default" });
            updateStepStatus('ai_classify', 'completed');
            setCurrentStage('hac_classify');
            return;
          }

          // Parallel processing for speed
          const classifyPromises = docs.map(async (doc) => {
            try {
              // Download file
              const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
              const downloadResponse = await fetch(
                `${supabaseUrl}/functions/v1/download-dropbox-file`,
                {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ dropboxPath: doc.dropbox_path }),
                }
              );

              if (!downloadResponse.ok) throw new Error(`Download failed: ${downloadResponse.statusText}`);

              const arrayBuffer = await downloadResponse.arrayBuffer();
              const imageBase64 = btoa(
                new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
              );

              // Classify
              const { error: classifyError } = await supabase.functions.invoke(
                'ai-classify-document',
                { body: { documentId: doc.id, caseId, imageBase64 } }
              );

              if (classifyError) throw classifyError;
              return { success: true, name: doc.name };
            } catch (error) {
              console.error(`Failed to classify ${doc.name}:`, error);
              return { success: false, name: doc.name, error };
            }
          });

          const classifyResults = await Promise.all(classifyPromises);
          const successCount = classifyResults.filter(r => r.success).length;
          
          toast({ title: `AI Classification Complete (${successCount}/${docs.length})` });
          updateStepStatus('ai_classify', 'completed');
          await refetchDocs();
          setCurrentStage('hac_classify');
          break;

        case 'ocr':
          // Trigger OCR Worker
          console.log("Triggering OCR worker...");
          const { error: ocrError } = await supabase.functions.invoke('ocr-worker');
          
          if (ocrError) throw ocrError;
          
          toast({ title: "OCR Processing Complete" });
          updateStepStatus('ocr', 'completed');
          await refetchDocs();
          setCurrentStage('form_population');
          break;

        case 'form_population':
          const { data: ocrDocs, error: ocrDocsError } = await supabase
            .from('documents')
            .select('id, name')
            .eq('case_id', caseId)
            .eq('ocr_status', 'completed')
            .eq('data_applied_to_forms', false);

          if (ocrDocsError) throw ocrDocsError;
          if (!ocrDocs || ocrDocs.length === 0) {
            toast({ title: "No OCR data to apply", variant: "default" });
            updateStepStatus('form_population', 'completed');
            setCurrentStage('hac_forms');
            return;
          }

          // Parallel form population
          const applyPromises = ocrDocs.map(async (doc) => {
            try {
              const { error: applyError } = await supabase.functions.invoke(
                'apply-ocr-to-forms',
                { body: { documentId: doc.id, caseId, overwriteManual: false } }
              );

              if (applyError) throw applyError;
              return { success: true, name: doc.name };
            } catch (error) {
              console.error(`Failed to apply OCR for ${doc.name}:`, error);
              return { success: false, name: doc.name, error };
            }
          });

          const applyResults = await Promise.all(applyPromises);
          const applySuccessCount = applyResults.filter(r => r.success).length;

          toast({ title: `Forms Populated (${applySuccessCount}/${ocrDocs.length})` });
          updateStepStatus('form_population', 'completed');
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
          updateStepStatus('ai_verify', 'completed');
          setCurrentStage('hac_verify');
          break;

        case 'pdf_generation':
          const { data: pdfData, error: pdfError } = await supabase.functions.invoke('fill-pdf', {
            body: { caseId, formType: 'all' }
          });
          
          if (pdfError) throw pdfError;
          
          console.log('PDF generation result:', pdfData);
          toast({ title: "PDFs Generated Successfully" });
          updateStepStatus('pdf_generation', 'completed');
          
          setTimeout(() => {
            navigate(`/admin/poa/${caseId}`);
          }, 1500);
          break;
      }

      return true;
    } catch (error: any) {
      console.error(`Workflow step ${stage} failed (attempt ${retryCount + 1}):`, error);
      
      // Retry logic for transient errors
      const isTransientError = error?.message?.includes('timeout') || 
                              error?.message?.includes('network') ||
                              error?.status === 429 ||
                              error?.status === 503;

      if (isTransientError && retryCount < MAX_RETRIES) {
        const backoffMs = Math.pow(2, retryCount) * 1000;
        console.log(`Retrying ${stage} in ${backoffMs}ms...`);
        toast({
          title: `Retrying ${stage}...`,
          description: `Attempt ${retryCount + 2} of ${MAX_RETRIES + 1}`
        });
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        return runWorkflowStep(stage, retryCount + 1);
      }

      // Permanent failure
      updateStepStatus(stage, 'failed', error?.message || 'Unknown error');
      
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

  const approveAndContinue = async (currentStageId: AIWorkflowStep['stage']) => {
    const stageIndex = workflowSteps.findIndex(s => s.stage === currentStageId);
    const nextStep = workflowSteps[stageIndex + 1];
    
    if (nextStep && nextStep.agent === 'ai') {
      await runWorkflowStep(nextStep.stage);
    } else if (nextStep) {
      setCurrentStage(nextStep.stage);
      toast({ title: "Ready for Next Step" });
    }
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
    updateStepStatus('upload', 'processing');
    try {
      const { data, error } = await supabase.functions.invoke('list-dropbox-documents', {
        body: { caseId, dropboxPath: caseData.dropbox_path }
      });

      if (error) throw error;

      toast({ 
        title: "Dropbox sync complete",
        description: `Synced ${data.synced} new documents`
      });
      
      updateStepStatus('upload', 'completed');
      refetchDocs();
    } catch (error) {
      updateStepStatus('upload', 'failed', error instanceof Error ? error.message : 'Unknown error');
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

  const overallProgress = Math.round(
    (trackedSteps.filter(s => s.status === 'completed').length / trackedSteps.length) * 100
  );

  return (
    <section className="relative py-8 overflow-hidden">
      <div className="container relative z-10 mx-auto px-4">
        {/* Progress Tracker */}
        <WorkflowProgressTracker
          steps={trackedSteps}
          currentStepIndex={trackedSteps.findIndex(s => s.id === currentStage)}
          overallProgress={overallProgress}
        />

        {/* Document Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 my-8"
        >
          <h3 className="text-2xl font-heading font-bold mb-4">Dropbox Documents</h3>
          
          <div className="mb-6 flex gap-3">
            <Button
              onClick={syncDropboxDocuments}
              disabled={isUploading || !caseData?.dropbox_path}
              className="w-full md:w-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Syncing...' : 'Sync from Dropbox'}
            </Button>
            {!caseData?.dropbox_path && (
              <p className="text-sm text-destructive">No Dropbox path configured for this case</p>
            )}
          </div>

          {docsLoading ? (
            <p>Loading documents...</p>
          ) : documents && documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded">
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
                      variant="outline"
                      onClick={() => handleDownload(doc.dropbox_path, doc.name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(doc.id)}
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

                      {step.agent === 'human' && isActive && (
                        <Button
                          className="mt-4 w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            approveAndContinue(step.stage);
                          }}
                          disabled={isRunning}
                        >
                          Approve & Continue
                        </Button>
                      )}

                      {step.agent === 'ai' && isActive && !isRunning && (
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
        {currentStage === 'upload' && !isRunning && (
          <div className="flex justify-center mt-8">
            <Button
              size="lg"
              onClick={() => runWorkflowStep('ai_classify')}
              disabled={!documents || documents.length === 0}
            >
              Start AI Workflow
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
