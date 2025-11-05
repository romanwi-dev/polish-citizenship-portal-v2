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
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [completedStages, setCompletedStages] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);

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

  // Fetch documents for this case
  const { data: documents, refetch: refetchDocuments } = useQuery({
    queryKey: ['case-documents', caseId],
    queryFn: async () => {
      if (!caseId) return [];
      
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
    enabled: true
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!caseId) {
      toast({
        title: "No case selected",
        description: "Please select a case first to upload documents.",
        variant: "destructive",
      });
      return;
    }

    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      // Get Dropbox path for the case
      const dropboxPath = caseData?.dropbox_path || `/CASES/${caseId}`;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${caseId}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create document record with Dropbox path
        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            case_id: caseId,
            name: file.name,
            dropbox_path: `${dropboxPath}/${file.name}`,
            file_extension: fileExt,
            file_size: file.size,
            ocr_status: 'pending',
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Upload successful",
        description: `${files.length} document(s) uploaded to ${dropboxPath}`,
      });

      refetchDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="w-full pb-40">
      {/* Vertical Timeline - Matching Homepage */}
      <div className="relative max-w-7xl mx-auto">
        {/* Center line - hidden on mobile, visible on desktop */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden md:block" />

        {workflowSteps.map((step, index) => {
          const Icon = step.icon;
          const docCount = getDocumentCountForStage(step.stage);
          const isCompleted = completedStages[step.stage];
          
          return (
            <div 
              key={step.stage}
              className={`relative mb-16 md:mb-24 flex flex-col md:flex-row items-center gap-12 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''} animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Content Card - 6/12 width on desktop for wider spacing */}
              <div className="w-full md:w-6/12">
                <div 
                  className="relative h-[350px] md:h-[450px]"
                  style={{ perspective: '1000px' }}
                >
                  <div
                    onClick={() => toggleFlip(step.stage)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleFlip(step.stage);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${step.title} - ${isMobile ? 'Tap' : 'Click'} to view details`}
                    className="absolute inset-0 cursor-pointer transition-transform duration-700 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: flippedCards[step.stage] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                      {/* Front Side */}
                      <div 
                        className={cn(
                          "absolute inset-0 glass-card p-6 rounded-lg hover-glow group transition-transform duration-300 hover:scale-[1.02]",
                          isCompleted && "ring-2 ring-green-500/50"
                        )}
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          boxShadow: isCompleted 
                            ? '0 0 40px rgba(34, 197, 94, 0.3)' 
                            : '0 0 20px rgba(59, 130, 246, 0.2)',
                        }}
                      >
                        <div className="flex flex-col gap-3 h-full">
                          {/* Header */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm md:text-xs font-bold px-3 py-1.5 md:px-2 md:py-1 rounded-full bg-gradient-to-r ${step.gradient} text-white`}>
                              {step.number}
                            </span>
                            <Badge variant={step.agent === 'ai' ? 'default' : step.agent === 'human' ? 'secondary' : 'outline'} className="text-xs">
                              {step.agent === 'ai' ? 'AI' : step.agent === 'human' ? 'HAC' : 'AI+HAC'}
                            </Badge>
                          </div>

                          {/* Completed Badge */}
                          {isCompleted && (
                            <div className="absolute top-4 right-4">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
                                <Check className="h-5 w-5" />
                              </div>
                            </div>
                          )}

                          {/* Icon */}
                          <div className="mb-3 flex h-16 md:h-20 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10">
                            <Icon className="h-10 w-10 md:h-12 md:w-12 text-primary" />
                          </div>

                          {/* Title */}
                          <h3 className="text-xl md:text-2xl lg:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-all duration-300 drop-shadow-lg animate-fade-in">
                            {step.title}
                          </h3>

                          {/* Description */}
                          <p className="text-xs md:text-sm text-muted-foreground mb-3 flex-1 line-clamp-3 md:line-clamp-none">
                            {step.description}
                          </p>

                          {/* Upload Section for First Card */}
                          {step.stage === 'upload' && (
                            <div className="mb-3">
                              <input
                                type="file"
                                id="doc-upload"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={!caseId || uploading}
                              />
                              <label htmlFor="doc-upload">
                                <Button
                                  variant="default"
                                  size="lg"
                                  className="w-full"
                                  disabled={!caseId || uploading}
                                  asChild
                                >
                                  <span className="cursor-pointer flex items-center justify-center gap-2">
                                    <Upload className="h-5 w-5" />
                                    {uploading ? 'Uploading...' : caseId ? 'Upload Documents' : 'Select a case first'}
                                  </span>
                                </Button>
                              </label>
                            </div>
                          )}

                          {/* Document Count */}
                          <div className="flex items-center justify-between">
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
                          </div>

                          <p className="text-xs text-muted-foreground/60 mt-1 text-center">
                            {isMobile ? 'Tap' : 'Click'} to see details
                          </p>
                        </div>
                      </div>

                      {/* Back Side */}
                      <div 
                        className="absolute inset-0 glass-card p-6 rounded-lg hover-glow"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                        }}
                      >
                        <div className="flex flex-col gap-3 h-full">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-base md:text-xs font-bold px-3 py-1.5 md:px-2 md:py-1 rounded-full bg-gradient-to-r ${step.gradient} text-white`}>
                              {step.number}
                            </span>
                            <span className="text-xs text-primary/60">Details</span>
                          </div>
                          
                          <h3 className="text-xl font-heading font-bold tracking-tight text-card-foreground mb-2">
                            {step.title}
                          </h3>

                          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed flex-1 overflow-y-auto">
                            {step.backDetails}
                          </p>

                          {/* Document Preview */}
                          {docCount > 0 && (
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

                          <p className="text-xs text-muted-foreground/60 mt-2 text-center">
                            {isMobile ? 'Tap' : 'Click'} to flip back
                          </p>
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Circle Node - Only visible on desktop */}
              <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary shadow-xl items-center justify-center z-10">
                <Icon className="h-6 w-6 text-white" />
              </div>

              {/* Empty spacer for alternating layout - 6/12 width */}
              <div className="hidden md:block md:w-6/12" />
            </div>
          );
        })}
      </div>

      {/* Summary Stats - Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t shadow-2xl">
        {/* Animated Progress Bar Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ 
            width: `${Math.round((Object.values(completedStages).filter(Boolean).length / workflowSteps.length) * 100)}%` 
          }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent"
          style={{
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
          }}
        />
        
        <div className="max-w-[1800px] mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 transition-all"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{documents?.length || 0}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Total Documents</div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 transition-all"
            >
              <motion.div
                key={Object.values(completedStages).filter(Boolean).length}
                initial={{ scale: 1.2, color: '#22c55e' }}
                animate={{ scale: 1, color: '#16a34a' }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold text-green-600 mb-1"
              >
                {Object.values(completedStages).filter(Boolean).length}
              </motion.div>
              <div className="text-xs md:text-sm text-muted-foreground">Completed Stages</div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 transition-all"
            >
              <div className="text-3xl md:text-4xl font-bold text-accent mb-1">
                {workflowSteps.length - Object.values(completedStages).filter(Boolean).length}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Remaining</div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 transition-all"
            >
              <motion.div
                key={Object.values(completedStages).filter(Boolean).length}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="text-3xl md:text-4xl font-bold text-secondary mb-1"
              >
                {Math.round((Object.values(completedStages).filter(Boolean).length / workflowSteps.length) * 100)}%
              </motion.div>
              <div className="text-xs md:text-sm text-muted-foreground">Progress</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Padding */}
      <div className="h-32"></div>
    </div>
  );
}
