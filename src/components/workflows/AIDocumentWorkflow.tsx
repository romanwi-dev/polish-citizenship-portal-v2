import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  Upload, 
  Brain, 
  ShieldCheck, 
  FileText, 
  CheckCircle2,
  FileCheck,
  Languages,
  ChevronRight,
  Eye,
  Download,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { DocumentUploadFAB } from "./DocumentUploadFAB";

interface AIWorkflowStep {
  number: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  stage: string;
  agent: 'human' | 'ai' | 'both';
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
  },
  {
    number: "02",
    title: "AI Classification",
    description: "AI automatically names, describes, and categorizes each document by type and person.",
    icon: Brain,
    gradient: "from-secondary to-accent",
    stage: 'ai_classify',
    agent: 'ai',
  },
  {
    number: "03",
    title: "HAC Review - Classification",
    description: "Human attorney approves or corrects AI document classification before proceeding.",
    icon: ShieldCheck,
    gradient: "from-accent to-primary",
    stage: 'hac_classify',
    agent: 'human',
  },
  {
    number: "04",
    title: "OCR Processing",
    description: "Extract text data from all documents using OCR technology.",
    icon: Brain,
    gradient: "from-primary to-secondary",
    stage: 'ocr',
    agent: 'ai',
  },
  {
    number: "05",
    title: "Translation Detection",
    description: "Identify documents requiring translation from foreign languages to Polish.",
    icon: Languages,
    gradient: "from-accent to-primary",
    stage: 'translation_detection',
    agent: 'ai',
  },
  {
    number: "06",
    title: "Document Translation",
    description: "Professional sworn translators translate foreign documents to Polish.",
    icon: FileText,
    gradient: "from-primary to-secondary",
    stage: 'translation',
    agent: 'both',
  },
  {
    number: "07",
    title: "Translation Review",
    description: "HAC reviews and approves all translated documents for accuracy.",
    icon: ShieldCheck,
    gradient: "from-secondary to-accent",
    stage: 'translation_review',
    agent: 'human',
  },
  {
    number: "08",
    title: "Form Population",
    description: "OCR-extracted data automatically fills citizenship application forms and family tree.",
    icon: FileText,
    gradient: "from-accent to-primary",
    stage: 'form_population',
    agent: 'ai',
  },
  {
    number: "09",
    title: "HAC Review - Forms",
    description: "Attorney verifies all populated form data for accuracy and completeness.",
    icon: ShieldCheck,
    gradient: "from-accent to-primary",
    stage: 'hac_forms',
    agent: 'human',
  },
  {
    number: "10",
    title: "Dual AI Verification",
    description: "Multiple AI systems verify data quality, completeness, and readiness for PDF generation.",
    icon: Brain,
    gradient: "from-primary to-secondary",
    stage: 'ai_verify',
    agent: 'ai',
  },
  {
    number: "11",
    title: "HAC Review - Verification",
    description: "Attorney reviews AI verification results and makes final approval decision.",
    icon: ShieldCheck,
    gradient: "from-secondary to-accent",
    stage: 'hac_verify',
    agent: 'human',
  },
  {
    number: "12",
    title: "PDF Generation",
    description: "Generate final citizenship application, POA, and family tree PDFs ready for submission.",
    icon: FileCheck,
    gradient: "from-accent to-primary",
    stage: 'pdf_generation',
    agent: 'both',
  },
  {
    number: "13",
    title: "Ready to Print",
    description: "Documents are prepared and ready for printing.",
    icon: FileText,
    gradient: "from-primary to-secondary",
    stage: 'ready_to_print',
    agent: 'human',
  },
  {
    number: "14",
    title: "In Signature",
    description: "Documents are currently being signed by the client.",
    icon: FileCheck,
    gradient: "from-secondary to-accent",
    stage: 'in_signature',
    agent: 'human',
  },
  {
    number: "15",
    title: "Ready for Filing",
    description: "Signed documents are prepared and ready for official filing.",
    icon: CheckCircle2,
    gradient: "from-accent to-primary",
    stage: 'ready_for_filing',
    agent: 'human',
  },
  {
    number: "16",
    title: "Filed",
    description: "Documents have been officially filed with the Polish authorities.",
    icon: ShieldCheck,
    gradient: "from-primary to-secondary",
    stage: 'filed',
    agent: 'human',
  },
];

interface AIDocumentWorkflowProps {
  caseId: string;
}

export function AIDocumentWorkflow({ caseId }: AIDocumentWorkflowProps) {
  const { toast } = useToast();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  // Fetch documents for this case
  const { data: documents, refetch: refetchDocuments } = useQuery({
    queryKey: ['case-documents', caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          ocr_documents(
            id,
            ocr_text,
            confidence_score,
            status,
            extracted_data
          )
        `)
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!caseId
  });

  // Get document counts per stage (using ocr_status as proxy for now)
  const getDocumentCountForStage = (stage: string) => {
    if (!documents) return 0;
    // Map stages to document states
    if (stage === 'upload') return documents.filter(d => !d.ocr_status).length;
    if (stage === 'ocr') return documents.filter(d => d.ocr_status === 'processing' || d.ocr_status === 'pending').length;
    if (stage === 'ai_classify') return documents.filter(d => d.ai_detected_type && !d.is_verified_by_hac).length;
    if (stage === 'hac_classify') return documents.filter(d => d.is_verified_by_hac && !d.ocr_status).length;
    if (stage === 'form_population') return documents.filter(d => d.data_applied_to_forms).length;
    return 0;
  };

  // Get stage status (completed, in-progress, pending)
  const getStageStatus = (stageIndex: number) => {
    const stage = workflowSteps[stageIndex];
    const count = getDocumentCountForStage(stage.stage);
    
    if (count === 0) return 'pending';
    if (count === documents?.length) return 'completed';
    return 'in-progress';
  };

  // Handle preview document
  const handlePreviewDocument = async (docId: string) => {
    toast({
      title: "Opening preview...",
      description: "Loading document preview",
    });
    // TODO: Implement preview modal
  };

  // Handle move to next stage
  const handleMoveToNextStage = async (currentStageIndex: number) => {
    const nextStage = workflowSteps[currentStageIndex + 1];
    
    if (!nextStage) {
      toast({
        title: "Final Stage",
        description: "Documents are at the final stage",
      });
      return;
    }

    toast({
      title: "Stage Advanced",
      description: `Moving to ${nextStage.title}`,
    });

    refetchDocuments();
  };

  return (
    <>
      <DocumentUploadFAB caseId={caseId} onUploadComplete={refetchDocuments} />
      
      <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Stage Timeline */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-secondary/20 to-accent/20" />

        {/* Stage Cards */}
        <div className="space-y-6">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            const status = getStageStatus(index);
            const docCount = getDocumentCountForStage(step.stage);
            const isSelected = selectedStage === step.stage;
            const isCompleted = status === 'completed';
            const isInProgress = status === 'in-progress';
            const isPending = status === 'pending';

            return (
              <motion.div
                key={step.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                {/* Stage Card */}
                <div
                  onClick={() => setSelectedStage(isSelected ? null : step.stage)}
                  className={cn(
                    "group relative overflow-hidden rounded-lg border transition-all duration-300 cursor-pointer",
                    "hover:shadow-lg hover:-translate-y-1",
                    isCompleted && "border-green-500/30 bg-green-500/5",
                    isInProgress && "border-primary/30 bg-primary/5",
                    isPending && "border-muted/30 bg-muted/5",
                    isSelected && "ring-2 ring-primary shadow-xl"
                  )}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Number Badge */}
                      <div className="relative flex-shrink-0">
                        <div className={cn(
                          "relative z-10 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold",
                          "bg-gradient-to-br transition-all duration-300",
                          step.gradient,
                          "text-white shadow-lg"
                        )}>
                          {step.number}
                        </div>
                        
                        {/* Status Icon Overlay */}
                        <div className="absolute -bottom-1 -right-1 z-20">
                          {isCompleted && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white shadow-md">
                              <CheckCircle className="h-4 w-4" />
                            </div>
                          )}
                          {isInProgress && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-md">
                              <Clock className="h-4 w-4 animate-pulse" />
                            </div>
                          )}
                          {isPending && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-md">
                              <AlertCircle className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Icon className="h-5 w-5 text-primary" />
                              <h3 className="text-xl font-semibold">{step.title}</h3>
                              <Badge variant={step.agent === 'ai' ? 'default' : step.agent === 'human' ? 'secondary' : 'outline'}>
                                {step.agent === 'ai' ? 'AI' : step.agent === 'human' ? 'HAC' : 'AI + HAC'}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">{step.description}</p>
                          </div>

                          {/* Document Count */}
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className="text-lg px-4 py-1">
                              {docCount} docs
                            </Badge>
                            {docCount > 0 && (
                              <ChevronRight className={cn(
                                "h-5 w-5 transition-transform",
                                isSelected && "rotate-90"
                              )} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document List - Expandable */}
                  <AnimatePresence>
                    {isSelected && docCount > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t"
                      >
                        <div className="p-6 space-y-4 bg-muted/20">
                          {/* Documents Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {documents
                              ?.slice(0, 6) // Show first 6 documents as example
                              .map(doc => (
                                <div
                                  key={doc.id}
                                  className="group relative overflow-hidden rounded-lg border bg-background p-4 hover:shadow-md transition-all"
                                >
                                  <div className="flex items-start gap-3">
                                    <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium truncate">{doc.name || 'Untitled Document'}</h4>
                                      <p className="text-sm text-muted-foreground truncate">
                                        {doc.document_type || 'Unknown Type'}
                                      </p>
                                      {doc.ocr_confidence && (
                                        <Badge variant="outline" className="mt-2">
                                          OCR: {Math.round(doc.ocr_confidence || 0)}%
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Quick Actions */}
                                  <div className="mt-3 flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handlePreviewDocument(doc.id)}
                                      className="flex-1"
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Preview
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {}}
                                      className="flex-1"
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>

                          {/* Stage Actions */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                              {docCount} document{docCount !== 1 ? 's' : ''} in this stage
                            </p>
                            <Button
                              onClick={() => handleMoveToNextStage(index)}
                              disabled={index === workflowSteps.length - 1}
                              className="gap-2"
                            >
                              Move to Next Stage
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-8 border-t">
        <div className="text-center p-4 rounded-lg bg-muted/30">
          <div className="text-3xl font-bold text-primary">{documents?.length || 0}</div>
          <div className="text-sm text-muted-foreground">Total Documents</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-green-500/10">
          <div className="text-3xl font-bold text-green-600">
            {workflowSteps.filter((_, i) => getStageStatus(i) === 'completed').length}
          </div>
          <div className="text-sm text-muted-foreground">Completed Stages</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-primary/10">
          <div className="text-3xl font-bold text-primary">
            {workflowSteps.filter((_, i) => getStageStatus(i) === 'in-progress').length}
          </div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-muted/30">
          <div className="text-3xl font-bold text-muted-foreground">
            {workflowSteps.filter((_, i) => getStageStatus(i) === 'pending').length}
          </div>
          <div className="text-sm text-muted-foreground">Pending Stages</div>
        </div>
      </div>
      </div>
    </>
  );
}

