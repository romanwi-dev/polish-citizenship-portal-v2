import { useState, useRef, useMemo } from "react";
import { 
  Upload, 
  Brain, 
  ShieldCheck, 
  FileText, 
  CheckCircle2,
  FileCheck,
  Languages,
  Eye,
  Download,
  Check,
  Image as ImageIcon,
  X,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { WorkflowStageCard } from "./WorkflowStageCard";
import { WorkflowProgressBar } from "./WorkflowProgressBar";
import { useDocumentWorkflowState } from "@/hooks/useDocumentWorkflowState";
import { useSidebar } from "@/components/ui/sidebar";
import type { Document, UploadResult, UploadProgress, AtomicWorkflowResponse } from "@/types/documentWorkflow";
import { DocumentViewer } from "./DocumentViewer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";

interface AIWorkflowStep {
  number: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  stage: string;
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
    title: "Document Intake",
    description: "System receives and validates uploaded documents for processing readiness.",
    icon: FileText,
    gradient: "from-secondary to-accent",
    stage: 'intake',
    agent: 'ai',
    backDetails: "Automated validation checks file formats, sizes, and quality. Documents are indexed and prepared for AI classification pipeline."
  },
  {
    number: "03",
    title: "AI Classification",
    description: "AI automatically names, describes, and categorizes each document by type and person.",
    icon: Brain,
    gradient: "from-accent to-primary",
    stage: 'ai_classify',
    agent: 'ai',
    backDetails: "Advanced AI analyzes document images to identify type and match to relevant family members with confidence scoring."
  },
  {
    number: "04",
    title: "HAC Review - Classification",
    description: "Human attorney approves or corrects AI document classification before proceeding.",
    icon: ShieldCheck,
    gradient: "from-primary to-secondary",
    stage: 'hac_classify',
    agent: 'human',
    backDetails: "Attorney reviews AI-suggested document types and person assignments. Can override low-confidence classifications. Ensures data integrity before form population."
  },
  {
    number: "05",
    title: "OCR Processing",
    description: "Extract text data from all documents using OCR technology.",
    icon: Brain,
    gradient: "from-secondary to-accent",
    stage: 'ocr',
    agent: 'ai',
    backDetails: "Automated OCR processing extracts structured data from documents in parallel for efficient form population."
  },
  {
    number: "06",
    title: "OCR Quality Check",
    description: "Verify OCR accuracy and data extraction quality for critical fields.",
    icon: Eye,
    gradient: "from-accent to-primary",
    stage: 'ocr_quality',
    agent: 'both',
    backDetails: "AI and human review OCR results for accuracy. Critical fields like names, dates, and document numbers are verified for errors."
  },
  {
    number: "07",
    title: "Translation Detection",
    description: "Identify documents requiring translation from foreign languages to Polish.",
    icon: Languages,
    gradient: "from-primary to-secondary",
    stage: 'translation_detection',
    agent: 'ai',
    backDetails: "AI detects document language and flags non-Polish documents for certified translation. Creates translation tasks automatically."
  },
  {
    number: "08",
    title: "Document Translation",
    description: "Professional sworn translators translate foreign documents to Polish.",
    icon: FileText,
    gradient: "from-secondary to-accent",
    stage: 'translation',
    agent: 'both',
    backDetails: "Certified sworn translators convert foreign-language documents to Polish. Both AI-assisted and human professional translation workflows supported."
  },
  {
    number: "09",
    title: "Translation Review",
    description: "HAC reviews and approves all translated documents for accuracy.",
    icon: ShieldCheck,
    gradient: "from-accent to-primary",
    stage: 'translation_review',
    agent: 'human',
    backDetails: "Attorney verifies translation accuracy, legal terminology, and ensures all documents meet Polish authority requirements."
  },
  {
    number: "10",
    title: "Form Population",
    description: "OCR-extracted data automatically fills citizenship application forms and family tree.",
    icon: FileText,
    gradient: "from-primary to-secondary",
    stage: 'form_population',
    agent: 'ai',
    backDetails: "Smart system populates citizenship forms and documents using OCR data with intelligent field mapping and manual entry protection."
  },
  {
    number: "11",
    title: "Data Validation",
    description: "Cross-reference and validate all populated data across multiple documents.",
    icon: CheckCircle2,
    gradient: "from-secondary to-accent",
    stage: 'data_validation',
    agent: 'ai',
    backDetails: "AI cross-checks data consistency across documents. Flags discrepancies in names, dates, and relationships for human review."
  },
  {
    number: "12",
    title: "HAC Review - Forms",
    description: "Attorney verifies all populated form data for accuracy and completeness.",
    icon: ShieldCheck,
    gradient: "from-accent to-primary",
    stage: 'hac_forms',
    agent: 'human',
    backDetails: "Human review of all form fields populated by AI. Attorney checks data consistency, flags missing information, and approves forms for PDF generation."
  },
  {
    number: "13",
    title: "Dual AI Verification",
    description: "Multiple AI systems verify data quality, completeness, and readiness for PDF generation.",
    icon: Brain,
    gradient: "from-primary to-secondary",
    stage: 'ai_verify',
    agent: 'ai',
    backDetails: "Independent AI systems analyze form data to check for missing fields, data consistency, legal compliance, and generate quality scores with detailed feedback."
  },
  {
    number: "14",
    title: "HAC Review - Verification",
    description: "Attorney reviews AI verification results and makes final approval decision.",
    icon: ShieldCheck,
    gradient: "from-secondary to-accent",
    stage: 'hac_verify',
    agent: 'human',
    backDetails: "Attorney analyzes dual AI verification reports. Reviews flagged issues, confidence scores, and recommendations. Final human judgment before PDF generation authorization."
  },
  {
    number: "15",
    title: "Final Quality Audit",
    description: "Complete audit of all documents, translations, and forms before PDF generation.",
    icon: FileCheck,
    gradient: "from-accent to-primary",
    stage: 'final_audit',
    agent: 'both',
    backDetails: "Comprehensive review ensuring all documents are present, translated, verified, and forms are complete. Last checkpoint before official PDF creation."
  },
  {
    number: "16",
    title: "PDF Generation",
    description: "Generate final citizenship application, POA, and family tree PDFs ready for submission.",
    icon: Download,
    gradient: "from-primary to-secondary",
    stage: 'pdf_generation',
    agent: 'both',
    backDetails: "System generates PDFs: POA (adult/minor/spouses), Citizenship Application, Family Tree, Uzupełnienie. All forms filled with verified data, formatted for Polish authorities."
  },
];

interface AIDocumentWorkflowProps {
  caseId?: string;
}

export function AIDocumentWorkflow({ caseId = '' }: AIDocumentWorkflowProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { open: sidebarOpen } = useSidebar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    uploading: 0,
    errors: []
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [viewerDoc, setViewerDoc] = useState<{ url: string; name: string; type: string; ocrText?: string } | null>(null);
  
  // Calculate responsive left margin for bottom bar
  const bottomBarLeftClass = useMemo(() => {
    return sidebarOpen ? 'md:left-64' : 'md:left-16';
  }, [sidebarOpen]);
  
  // Use workflow state hook for persistence
  const {
    flippedCards,
    completedStages,
    toggleFlip,
    toggleComplete,
    workflowInstances,
    refetchWorkflows,
  } = useDocumentWorkflowState({ caseId: caseId || '' });

  // Fetch case details including Dropbox path
  const { data: caseData } = useQuery({
    queryKey: ['case-details', caseId],
    queryFn: async () => {
      if (!caseId) return null;
      
      const { data, error } = await supabase
        .from('cases')
        .select('id, client_name, dropbox_path')
        .eq('id', caseId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!caseId
  });

  // FIX #5: Explicit security validation via edge function (server-side ownership check)
  const { data: documents, refetch: refetchDocuments, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['case-documents', caseId],
    queryFn: async () => {
      if (!caseId) return [];
      
      // Use secure edge function instead of direct query
      const { data, error } = await supabase.functions.invoke('get-case-documents', {
        body: { caseId, verifyOwnership: true }
      });
      
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to fetch documents');
      
      // Type-safe return with explicit Document[] typing
      return (data.documents as Document[]) || [];
    },
    enabled: !!caseId
  });

  // FIX #4, #7, #8: Removed - now handled by useDocumentWorkflowState hook

  // Get document counts per stage
  const getDocumentCountForStage = (stage: string) => {
    if (!documents) return 0;
    if (stage === 'upload') return documents.filter(d => !d.ocr_status).length;
    if (stage === 'ocr') return documents.filter(d => d.ocr_status === 'processing' || d.ocr_status === 'pending').length;
    if (stage === 'ai_classify') return documents.filter(d => d.ai_detected_type && !d.is_verified_by_hac).length;
    if (stage === 'hac_classify') return documents.filter(d => d.is_verified_by_hac && !d.ocr_status).length;
    if (stage === 'form_population') return documents.filter(d => d.data_applied_to_forms).length;
    return 0;
  };

  // Get documents for a specific stage
  const getDocumentsForStage = (stage: string) => {
    if (!documents) return [];
    if (stage === 'upload') return documents.filter(d => !d.ocr_status);
    if (stage === 'intake') return documents.filter(d => d.ocr_status === 'pending');
    if (stage === 'ai_classify') return documents.filter(d => d.ai_detected_type && !d.is_verified_by_hac);
    if (stage === 'hac_classify') return documents.filter(d => d.is_verified_by_hac && !d.ocr_status);
    if (stage === 'ocr') return documents.filter(d => d.ocr_status === 'processing' || d.ocr_status === 'pending');
    if (stage === 'ocr_quality') return documents.filter(d => d.ocr_status === 'completed');
    if (stage === 'translation_detection') return documents.filter(d => d.needs_translation);
    if (stage === 'translation') return documents.filter(d => d.needs_translation && d.is_verified_by_hac);
    if (stage === 'translation_review') return documents.filter(d => d.needs_translation && d.is_verified_by_hac);
    if (stage === 'form_population') return documents.filter(d => d.data_applied_to_forms);
    return documents.slice(0, 3); // Default: show first 3
  };

  // Get storage URL for document thumbnail with proper typing
  const getDocumentThumbnail = (doc: Document): string | null => {
    if (!doc.dropbox_path) return null;
    
    // For images, return storage URL
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (doc.file_extension && imageExts.includes(doc.file_extension.toLowerCase())) {
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(`${caseId}/${doc.id}.${doc.file_extension}`);
      return data.publicUrl;
    }
    
    return null;
  };

  // Handle file selection and show previews
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
    }
  };

  // Remove file from preview
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ALL 5 FIXES INTEGRATED: Atomic transactions, version locking, error recovery, batch atomicity, security validation
  const handleFileUpload = async (filesToUpload: File[]) => {
    if (!caseId) {
      toast({
        title: "No case selected",
        description: "Please select a case first to upload documents.",
        variant: "destructive",
      });
      return;
    }

    if (!filesToUpload || filesToUpload.length === 0) return;

    setUploading(true);
    setUploadProgress({
      total: filesToUpload.length,
      completed: 0,
      failed: 0,
      uploading: filesToUpload.length,
      errors: []
    });

    // FIX #4: Create batch tracking record
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Initialize batch tracking
      const { error: batchError } = await supabase.rpc('create_batch_upload', {
        p_case_id: caseId,
        p_batch_id: batchId,
        p_total_files: filesToUpload.length
      });
      
      if (batchError) {
        console.error('Batch initialization failed:', batchError);
        // Continue anyway - batch tracking is optional
      }

      // PARALLEL UPLOAD: Process all files simultaneously with ALL fixes applied
      const uploadPromises = filesToUpload.map(async (file): Promise<UploadResult> => {
        try {
          // SECURITY FIX: Server-side file validation BEFORE upload
          const validationFormData = new FormData();
          validationFormData.append('file', file);

          const { data: validationData, error: validationError } = await supabase.functions.invoke(
            'validate-file-upload',
            { body: validationFormData }
          );

          if (validationError || !validationData?.valid) {
            // Enhanced error logging with details
            console.error('File validation failed:', {
              file: file.name,
              error: validationData?.error,
              details: validationData?.details,
              functionError: validationError
            });

            return {
              documentId: 'validation-failed',
              success: false,
              error: validationData?.error || validationError?.message || 'File validation failed',
              phase: 'validation',
              details: validationData?.details // Include validation details for debugging
            };
          }

          // Phase 1: Upload to Dropbox
          const formData = new FormData();
          formData.append('file', file);
          formData.append('caseId', caseId);

          const { data: uploadData, error: uploadError } = await supabase.functions.invoke(
            'upload-to-dropbox',
            { body: formData }
          );

          if (uploadError || !uploadData?.success) {
            const errorMsg = uploadData?.error || uploadError?.message || 'Upload failed';
            console.error('UPLOAD FAILURE:', {
              fileName: file.name,
              uploadError,
              uploadData,
              errorMessage: errorMsg
            });
            
            toast({
              title: "Upload Failed",
              description: `${file.name}: ${errorMsg}`,
              variant: "destructive",
            });
            
            throw new Error(errorMsg);
          }

          const docId = uploadData.document.id;
          const initialVersion = uploadData.document.version || 0;

          // FIX #1 & #2: Atomic workflow creation with version locking (single database function call)
          const { data: rawWorkflowResult, error: workflowError } = await supabase.rpc(
            'atomic_create_document_workflow',
            {
              p_case_id: caseId,
              p_document_id: docId,
              p_initial_version: initialVersion
            }
          );

          // Type-safe conversion from Json to AtomicWorkflowResponse
          const workflowResult = rawWorkflowResult as unknown as AtomicWorkflowResponse;

          if (workflowError || !workflowResult?.success) {
            const error = workflowResult?.error || workflowError?.message || 'Atomic workflow creation failed';
            console.error('Atomic workflow creation failed:', error);
            
            // FIX #4: Update batch progress
            await supabase.rpc('update_batch_upload_progress', {
              p_batch_id: batchId,
              p_document_id: docId,
              p_success: false,
              p_error_message: error
            });
            
            return {
              documentId: docId,
              success: false,
              error,
              phase: 'workflow' as const
            };
          }

          const workflowInstanceId = workflowResult.workflow_instance_id!;

          // Phase 3: Trigger OCR with automatic error recovery
          try {
            const { error: ocrError } = await supabase.functions.invoke('ocr-document', {
              body: { documentId: docId, expectedVersion: initialVersion },
            });

            if (ocrError) {
              console.error('OCR trigger failed:', ocrError);
              
              // FIX #3: Automatic error recovery - schedule retry instead of leaving orphaned
              await supabase.functions.invoke('schedule-ocr-retry', {
                body: {
                  documentId: docId,
                  workflowInstanceId,
                  errorPhase: 'ocr',
                  errorMessage: ocrError.message
                }
              });
              
              // User-friendly notification
              toast({
                title: `OCR queued for retry`,
                description: `${file.name} will be retried automatically. Check workflow status for updates.`,
                variant: "default",
              });

              // FIX #4: Update batch progress (mark as successful since retry is scheduled)
              await supabase.rpc('update_batch_upload_progress', {
                p_batch_id: batchId,
                p_document_id: docId,
                p_success: true,
                p_error_message: null
              });

              return {
                documentId: docId,
                success: true, // Success because retry is scheduled
                phase: 'ocr_retry_scheduled'
              };
            }
          } catch (ocrError) {
            // FIX #3: Schedule retry even on exception
            await supabase.functions.invoke('schedule-ocr-retry', {
              body: {
                documentId: docId,
                workflowInstanceId,
                errorPhase: 'ocr',
                errorMessage: ocrError instanceof Error ? ocrError.message : 'Unknown OCR error'
              }
            });

            toast({
              title: `OCR retry scheduled`,
              description: `${file.name} encountered an error but will be retried automatically.`,
            });

            return {
              documentId: docId,
              success: true, // Success because retry is scheduled
              phase: 'ocr_retry_scheduled'
            };
          }

          // FIX #4: Update batch progress on success
          await supabase.rpc('update_batch_upload_progress', {
            p_batch_id: batchId,
            p_document_id: docId,
            p_success: true,
            p_error_message: null
          });

          return {
            documentId: docId,
            success: true,
            phase: 'ocr'
          };

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error('UPLOAD EXCEPTION:', {
            fileName: filesToUpload.find((f, i) => i === filesToUpload.indexOf(filesToUpload[0]))?.name,
            error: errorMsg,
            stack: error instanceof Error ? error.stack : undefined
          });
          
          return {
            documentId: 'unknown',
            success: false,
            error: `Upload failed: ${errorMsg}`,
            phase: 'upload'
          };
        }
      });

      // Wait for all uploads to complete
      const results = await Promise.allSettled(uploadPromises);
      
      // Process results atomically (avoid race conditions in state updates)
      const successCount = results.filter(r => 
        r.status === 'fulfilled' && r.value.success
      ).length;
      
      const failures = results
        .map((r, idx) => ({
          file: filesToUpload[idx].name,
          result: r.status === 'fulfilled' ? r.value : { success: false, error: 'Promise rejected', phase: 'upload' }
        }))
        .filter(f => !f.result.success);

      // ATOMIC state update - single setState call to prevent race conditions
      setUploadProgress({
        total: filesToUpload.length,
        completed: successCount,
        failed: failures.length,
        uploading: 0,
        errors: failures.map(f => ({
          file: f.file,
          error: f.result.error || 'Unknown error',
          phase: f.result.phase || 'unknown'
        }))
      });

      // Show comprehensive toast notification
      if (successCount === filesToUpload.length) {
        toast({
          title: "Upload successful",
          description: `All ${successCount} document(s) uploaded and processing started`,
        });
        setSelectedFiles([]); // Clear preview on success
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else if (successCount > 0) {
        toast({
          title: "Partial success",
          description: `${successCount} of ${filesToUpload.length} documents uploaded. ${failures.length} failed.`,
          variant: "destructive",
        });
        
        // Show detailed error toast for validation/security failures
        failures.forEach(({ file, result }) => {
          toast({
            title: `${file} failed`,
            description: `${result.phase.toUpperCase()}: ${result.error}`,
            variant: "destructive",
          });
        });
      } else {
        toast({
          title: "Upload failed",
          description: `All ${filesToUpload.length} documents failed to upload. Check errors below.`,
          variant: "destructive",
        });
        
        failures.slice(0, 3).forEach(({ file, result }) => {
          toast({
            title: `${file} failed`,
            description: `${result.phase.toUpperCase()}: ${result.error}`,
            variant: "destructive",
          });
        });
      }

      // Refresh data
      refetchDocuments();
      refetchWorkflows();

    } catch (error) {
      console.error('Upload batch error:', error);
      toast({
        title: "System error",
        description: error instanceof Error ? error.message : "Failed to process uploads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle document preview
  const handleDocumentView = (doc: Document) => {
    const thumbnail = getDocumentThumbnail(doc);
    if (thumbnail || doc.dropbox_path) {
      setViewerDoc({
        url: thumbnail || doc.dropbox_path || '',
        name: doc.name,
        type: doc.file_extension || 'pdf',
        ocrText: undefined // OCR text available in doc.ocr_data if needed
      });
    }
  };

  return (
    <ErrorBoundary>
    <div className="w-full pb-40 pt-12 md:pt-20">
      {/* Vertical Timeline - Matching Translations Workflow */}
      <div className="relative max-w-6xl mx-auto">
        {/* Header with Dropbox button */}
        {caseData?.dropbox_path && (
          <div className="mb-6 flex justify-end">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                if (caseData?.dropbox_path) {
                  window.open(`https://www.dropbox.com/home${caseData.dropbox_path}`, '_blank');
                } else {
                  toast({ title: 'No Dropbox path configured', variant: 'destructive' });
                }
              }}
            >
              <FolderOpen className="h-4 w-4" />
              Open Dropbox Folder
            </Button>
          </div>
        )}

        {/* Center line - hidden on mobile, visible on desktop */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden md:block" />

        {workflowSteps.map((step, index) => {
          const Icon = step.icon;
          const docCount = getDocumentCountForStage(step.stage);
          const isCompleted = completedStages[step.stage];
          const stageDocuments = getDocumentsForStage(step.stage);
          const isFirstCard = index === 0;
          const isLeft = index % 2 === 0;
          
          return (
            <motion.div 
              key={step.stage}
              initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="mb-12"
            >
              <div className={`md:flex ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8`}>
                {/* Content Card - Left or Right */}
                <div className="md:w-5/12">
                  <div
                    className="relative h-[500px] md:h-[600px]"
                    style={{ perspective: '1000px' }}
                  >
                    <motion.div
                      onClick={() => toggleFlip(step.stage)}
                      whileHover={{ scale: 1.03, y: -5 }}
                      transition={{ duration: 0.3 }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleFlip(step.stage);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${step.title} - Click to view details`}
                      className="absolute inset-0 cursor-pointer transition-transform duration-700 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: flippedCards[step.stage] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      }}
                    >
                        {/* Front Side */}
                        <motion.div 
                          className={cn(
                            "absolute inset-0 glass-card p-6 rounded-lg group transition-transform duration-300 hover-glow",
                            isCompleted 
                              ? "ring-2 ring-green-500/50" 
                              : ""
                          )}
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                          }}
                        >
                          <div className="flex flex-col gap-3 h-full items-center text-center justify-center">
                            <motion.div 
                              className="flex items-center gap-2 mb-1"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: 0.1 }}
                            >
                              <span className="text-xs text-primary/60">{step.agent === 'human' ? 'Manual' : step.agent === 'ai' ? 'Automated' : 'Hybrid'}</span>
                            </motion.div>
                            
                            <motion.h3 
                              className="text-2xl md:text-3xl font-heading font-bold tracking-tight mb-1 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                            >
                              {step.title}
                            </motion.h3>

                            <motion.p 
                              className="text-xs md:text-sm text-muted-foreground leading-relaxed flex-1 overflow-y-auto"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5, delay: 0.3 }}
                            >
                              {step.description}
                            </motion.p>

                            {/* File Upload Section for First Card */}
                            {isFirstCard && !isLoadingDocuments && (
                              <motion.div 
                                className="mt-auto space-y-3"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                              >
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  onChange={handleFileSelect}
                                  multiple
                                  accept="image/*,.pdf,.doc,.docx"
                                  className="hidden"
                                />
                                <Button
                                  onClick={() => fileInputRef.current?.click()}
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  disabled={uploading}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  {uploading ? 'Uploading...' : 'Select Files'}
                                </Button>
                                {selectedFiles.length > 0 && (
                                  <Badge variant="secondary" className="w-full justify-center">
                                    {selectedFiles.length} file(s) selected
                                  </Badge>
                                )}
                              </motion.div>
                            )}

                            {/* Document Thumbnails */}
                            {stageDocuments.length > 0 && (
                              <motion.div 
                                className="mb-3"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                              >
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                  {stageDocuments.slice(0, 4).map((doc, idx) => {
                                    const thumbnail = getDocumentThumbnail(doc);
                                    return (
                                       <motion.div
                                         key={doc.id}
                                         onClick={() => handleDocumentView(doc)}
                                         className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-primary/20 overflow-hidden bg-muted/50 flex items-center justify-center group hover:border-primary/60 transition-all cursor-pointer"
                                         initial={{ opacity: 0, scale: 0.8 }}
                                         animate={{ opacity: 1, scale: 1 }}
                                         transition={{ duration: 0.3, delay: 0.5 + (idx * 0.1) }}
                                       >
                                         {thumbnail ? (
                                           <img
                                             src={thumbnail}
                                             alt={doc.name}
                                             className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                           />
                                         ) : (
                                           <FileText className="h-6 w-6 text-primary/40" />
                                         )}
                                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                           <Eye className="h-4 w-4 text-white" />
                                         </div>
                                       </motion.div>
                                    );
                                  })}
                                  {stageDocuments.length > 4 && (
                                    <div className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-primary/20 bg-muted/30 flex items-center justify-center">
                                      <span className="text-xs font-semibold text-primary">+{stageDocuments.length - 4}</span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}

                            {/* Document Count and Mark Done Button */}
                            <motion.div 
                              className="flex items-center justify-between w-full mt-auto mb-4"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.6 }}
                            >
                              <span className="text-xs px-2 py-1 md:px-3 md:py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                {docCount} documents
                              </span>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleComplete(step.stage);
                                }}
                                variant={isCompleted ? "default" : "outline"}
                                size="sm"
                                className="text-xs"
                              >
                                {isCompleted ? "✓ Done" : "Mark Done"}
                              </Button>
                            </motion.div>
                            <p className="text-xs text-muted-foreground/60 text-center">Tap to see details</p>
                          </div>
                        </motion.div>

                        {/* Back Side */}
                        <div 
                          className="absolute inset-0 glass-card p-6 rounded-lg hover-glow"
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                          }}
                        >
                          <div className="flex flex-col gap-3 h-full justify-center">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-primary/60">Details</span>
                            </div>
                            
                            <h3 className="text-2xl md:text-3xl font-heading font-bold tracking-tight mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in glow-text">
                              {step.title}
                            </h3>

                            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed flex-1 overflow-y-auto">
                              {step.backDetails}
                            </p>

                            {/* Document Preview Grid on Back */}
                            {stageDocuments.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <h5 className="font-semibold text-xs flex items-center gap-2">
                                  <ImageIcon className="h-3 w-3" />
                                  Documents ({docCount})
                                </h5>
                                <div className="grid grid-cols-3 gap-2">
                                  {stageDocuments.slice(0, 6).map((doc) => {
                                    const thumbnail = getDocumentThumbnail(doc);
                                    return (
                                      <div
                                        key={doc.id}
                                        className="relative aspect-square rounded-lg border border-primary/20 overflow-hidden bg-muted/50 group hover:border-primary/60 transition-all"
                                      >
                                        {thumbnail ? (
                                          <img
                                            src={thumbnail}
                                            alt={doc.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <FileText className="h-6 w-6 text-primary/40" />
                                          </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                      </div>
                                    );
                                  })}
                                </div>
                                {docCount > 6 && (
                                  <p className="text-xs text-muted-foreground text-center pt-1">
                                    +{docCount - 6} more documents
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Document Preview - Old List View (removed) */}
                            {docCount > 0 && stageDocuments.length === 0 && (
                              <div className="mt-2 space-y-2">
                                <h5 className="font-semibold text-xs">Documents in this stage:</h5>
                                <div className="space-y-1">
                                  {documents
                                    ?.slice(0, 2)
                                    .map(doc => (
                                      <div key={doc.id} className="flex items-center gap-2 p-1.5 rounded bg-muted/50">
                                        <FileText className="h-3 w-3 text-primary flex-shrink-0" />
                                        <span className="text-xs truncate flex-1">{doc.name}</span>
                                      </div>
                                    ))}
                                  {docCount > 2 && (
                                    <p className="text-xs text-muted-foreground text-center">
                                      +{docCount - 2} more
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Timeline Dot - Center Aligned */}
                <div className="hidden md:flex md:w-2/12 flex-shrink-0 justify-center relative z-10 items-center">
                  <div className="w-16 h-16 rounded-full bg-card/90 border-2 border-white shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-all duration-300 flex items-center justify-center">
                    <span className="text-white/60 font-heading font-bold text-3xl">{step.number}</span>
                  </div>
                </div>

                {/* Preview Card OR Empty Space - Properly positioned */}
                {isFirstCard && selectedFiles.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="md:w-5/12 h-[500px] md:h-[600px] glass-card p-6 rounded-lg border-2 border-primary/20 mt-4 md:mt-0"
                    style={{
                      boxShadow: '0 0 30px hsla(221, 83%, 53%, 0.15)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        Preview ({selectedFiles.length})
                      </h3>
                      <Button
                        onClick={() => setSelectedFiles([])}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-[280px] md:max-h-[320px] overflow-y-auto mb-4">
                      {selectedFiles.map((file, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative p-3 rounded border border-primary/20 bg-background/50 group hover:border-primary/40 transition-all"
                        >
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 z-10 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>

                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded bg-muted flex items-center justify-center flex-shrink-0">
                              {file.type.startsWith('image/') ? (
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <FileText className="h-7 w-7 text-primary/40" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(0)} KB
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleFileUpload(selectedFiles)}
                      disabled={uploading}
                      className="w-full"
                      size="lg"
                    >
                      {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
                    </Button>
                  </motion.div>
                ) : (
                  <div className="hidden md:block md:w-5/12" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>


      {/* Document Viewer Modal */}
      {viewerDoc && (
        <DocumentViewer
          isOpen={!!viewerDoc}
          onClose={() => setViewerDoc(null)}
          documentUrl={viewerDoc.url}
          documentName={viewerDoc.name}
          documentType={viewerDoc.type}
          ocrText={viewerDoc.ocrText}
        />
      )}
      
      <ScrollToTop />
    </div>
    </ErrorBoundary>
  );
}
