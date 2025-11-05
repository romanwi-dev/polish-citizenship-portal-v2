import { motion } from "framer-motion";
import { useState } from "react";
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
  Check
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
    description: "AI automatically names, describes, and categorizes each document by type and person.",
    icon: Brain,
    gradient: "from-secondary to-accent",
    stage: 'ai_classify',
    agent: 'ai',
    backDetails: "Advanced AI analyzes document images to identify type and match to relevant family members with confidence scoring."
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
    number: "04",
    title: "OCR Processing",
    description: "Extract text data from all documents using OCR technology.",
    icon: Brain,
    gradient: "from-primary to-secondary",
    stage: 'ocr',
    agent: 'ai',
    backDetails: "Automated OCR processing extracts structured data from documents in parallel for efficient form population."
  },
  {
    number: "05",
    title: "Translation Detection",
    description: "Identify documents requiring translation from foreign languages to Polish.",
    icon: Languages,
    gradient: "from-accent to-primary",
    stage: 'translation_detection',
    agent: 'ai',
    backDetails: "AI detects document language and flags non-Polish documents for certified translation. Creates translation tasks automatically."
  },
  {
    number: "06",
    title: "Document Translation",
    description: "Professional sworn translators translate foreign documents to Polish.",
    icon: FileText,
    gradient: "from-primary to-secondary",
    stage: 'translation',
    agent: 'both',
    backDetails: "Certified sworn translators convert foreign-language documents to Polish. Both AI-assisted and human professional translation workflows supported."
  },
  {
    number: "07",
    title: "Translation Review",
    description: "HAC reviews and approves all translated documents for accuracy.",
    icon: ShieldCheck,
    gradient: "from-secondary to-accent",
    stage: 'translation_review',
    agent: 'human',
    backDetails: "Attorney verifies translation accuracy, legal terminology, and ensures all documents meet Polish authority requirements."
  },
  {
    number: "08",
    title: "Form Population",
    description: "OCR-extracted data automatically fills citizenship application forms and family tree.",
    icon: FileText,
    gradient: "from-accent to-primary",
    stage: 'form_population',
    agent: 'ai',
    backDetails: "Smart system populates citizenship forms and documents using OCR data with intelligent field mapping and manual entry protection."
  },
  {
    number: "09",
    title: "HAC Review - Forms",
    description: "Attorney verifies all populated form data for accuracy and completeness.",
    icon: ShieldCheck,
    gradient: "from-accent to-primary",
    stage: 'hac_forms',
    agent: 'human',
    backDetails: "Human review of all form fields populated by AI. Attorney checks data consistency, flags missing information, and approves forms for PDF generation."
  },
  {
    number: "10",
    title: "Dual AI Verification",
    description: "Multiple AI systems verify data quality, completeness, and readiness for PDF generation.",
    icon: Brain,
    gradient: "from-primary to-secondary",
    stage: 'ai_verify',
    agent: 'ai',
    backDetails: "Independent AI systems analyze form data to check for missing fields, data consistency, legal compliance, and generate quality scores with detailed feedback."
  },
  {
    number: "11",
    title: "HAC Review - Verification",
    description: "Attorney reviews AI verification results and makes final approval decision.",
    icon: ShieldCheck,
    gradient: "from-secondary to-accent",
    stage: 'hac_verify',
    agent: 'human',
    backDetails: "Attorney analyzes dual AI verification reports. Reviews flagged issues, confidence scores, and recommendations. Final human judgment before PDF generation authorization."
  },
  {
    number: "12",
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
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [completedStages, setCompletedStages] = useState<Record<string, boolean>>({});

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

  const toggleFlip = (stage: string) => {
    setFlippedCards(prev => ({ ...prev, [stage]: !prev[stage] }));
  };

  const toggleComplete = (stage: string) => {
    setCompletedStages(prev => ({ ...prev, [stage]: !prev[stage] }));
  };

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

  // Handle preview document
  const handlePreviewDocument = async (docId: string) => {
    toast({
      title: "Opening preview...",
      description: "Loading document preview",
    });
  };

  return (
    <>
      <DocumentUploadFAB caseId={caseId} onUploadComplete={refetchDocuments} />
      
      <div className="w-full max-w-[1800px] mx-auto space-y-12">
        {/* Horizontal scrollable workflow cards */}
        <div className="relative">
          <div className="overflow-x-auto pb-8 px-4">
            <div className="flex gap-6 min-w-max">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                const docCount = getDocumentCountForStage(step.stage);
                const isCompleted = completedStages[step.stage];
                
                return (
                  <motion.div
                    key={step.stage}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative w-[340px] flex-shrink-0"
                  >
                    <div 
                      className="relative w-full h-[420px]"
                      style={{ perspective: '1000px' }}
                    >
                      <div
                        onClick={() => toggleFlip(step.stage)}
                        className="absolute inset-0 cursor-pointer transition-transform duration-700"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: flippedCards[step.stage] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                      >
                        {/* Front Side */}
                        <motion.div
                          whileHover={{ scale: 1.02, y: -4 }}
                          transition={{ duration: 0.3 }}
                          className={cn(
                            "absolute inset-0 rounded-lg border-2 p-6 backdrop-blur-sm",
                            "bg-gradient-to-br from-background/80 to-background/60",
                            isCompleted ? "border-green-500/50 bg-green-500/5" : "border-primary/20",
                            "transition-all duration-300"
                          )}
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            boxShadow: isCompleted 
                              ? '0 0 40px rgba(34, 197, 94, 0.2)' 
                              : '0 0 30px rgba(59, 130, 246, 0.15)',
                          }}
                        >
                          {/* Stage Number Badge */}
                          <div className="absolute -top-4 left-6">
                            <div className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white shadow-xl",
                              "bg-gradient-to-br",
                              step.gradient
                            )}>
                              {step.number}
                            </div>
                          </div>

                          {/* Completed Checkmark */}
                          {isCompleted && (
                            <div className="absolute -top-4 -right-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
                                <Check className="h-6 w-6" />
                              </div>
                            </div>
                          )}

                          {/* Icon */}
                          <div className="mb-4 mt-8 flex h-24 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10">
                            <Icon className="h-14 w-14 text-primary" />
                          </div>

                          {/* Content */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-xl font-bold">{step.title}</h3>
                              <Badge variant={step.agent === 'ai' ? 'default' : step.agent === 'human' ? 'secondary' : 'outline'} className="text-xs">
                                {step.agent === 'ai' ? 'AI' : step.agent === 'human' ? 'HAC' : 'AI+HAC'}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {step.description}
                            </p>

                            {/* Document Count */}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <span className="text-sm text-muted-foreground">Documents</span>
                              <Badge variant="outline" className="text-base px-3">
                                {docCount}
                              </Badge>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="absolute bottom-6 left-6 right-6 space-y-2">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleComplete(step.stage);
                              }}
                              variant={isCompleted ? "default" : "outline"}
                              className="w-full"
                              size="sm"
                            >
                              {isCompleted ? "✓ Completed" : "Mark Complete"}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                              Click card for details
                            </p>
                          </div>
                        </motion.div>

                        {/* Back Side */}
                        <motion.div
                          className={cn(
                            "absolute inset-0 rounded-lg border-2 p-6 backdrop-blur-sm",
                            "bg-gradient-to-br from-background/90 to-background/70",
                            "border-accent/30"
                          )}
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            boxShadow: '0 0 30px rgba(168, 85, 247, 0.15)',
                          }}
                        >
                          <div className="h-full flex flex-col">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <Badge className="mb-2">{step.number}</Badge>
                                <h4 className="font-bold text-lg">{step.title}</h4>
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 overflow-y-auto">
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {step.backDetails}
                              </p>

                              {/* Document Preview */}
                              {docCount > 0 && (
                                <div className="mt-4 space-y-2">
                                  <h5 className="font-semibold text-sm">Documents in this stage:</h5>
                                  <div className="space-y-2">
                                    {documents
                                      ?.slice(0, 3)
                                      .map(doc => (
                                        <div key={doc.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                                          <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                                          <span className="text-xs truncate flex-1">{doc.name}</span>
                                        </div>
                                      ))}
                                    {docCount > 3 && (
                                      <p className="text-xs text-muted-foreground text-center">
                                        +{docCount - 3} more
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Back Actions */}
                            <div className="space-y-2 mt-4">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View All
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Download className="h-4 w-4 mr-1" />
                                  Export
                                </Button>
                              </div>
                              <p className="text-xs text-center text-muted-foreground">
                                Click to flip back
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-1 w-12 bg-primary/20 rounded-full" />
            <span className="text-xs text-muted-foreground">← Scroll to see all stages →</span>
            <div className="h-1 w-12 bg-primary/20 rounded-full" />
          </div>
        </div>

        {/* Summary Stats - Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t shadow-2xl">
          <div className="max-w-[1800px] mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{documents?.length || 0}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Total Documents</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-1">
                  {Object.values(completedStages).filter(Boolean).length}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">Completed Stages</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                <div className="text-3xl md:text-4xl font-bold text-accent mb-1">
                  {workflowSteps.length - Object.values(completedStages).filter(Boolean).length}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">Remaining</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-1">
                  {Math.round((Object.values(completedStages).filter(Boolean).length / workflowSteps.length) * 100)}%
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom padding to prevent content being hidden under sticky bar */}
        <div className="h-32" />
      </div>
    </>
  );
}
