import { motion } from "framer-motion";
import { useState, useRef } from "react";
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

interface AIWorkflowStep {
  number: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  stage: 'upload' | 'ai_classify' | 'hac_classify' | 'form_population' | 'hac_forms' | 'ai_verify' | 'hac_verify' | 'pdf_generation';
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
    number: "04",
    title: "Form Population",
    description: "OCR-extracted data automatically fills citizenship application forms and family tree.",
    icon: FileText,
    gradient: "from-primary to-secondary",
    stage: 'form_population',
    agent: 'ai',
    backDetails: "System uses pre-existing OCR data to populate master_table, citizenship forms, and POA documents. Smart field mapping ensures accuracy. Non-overwrite mode protects manual entries."
  },
  {
    number: "05",
    title: "HAC Review - Forms",
    description: "Attorney verifies all populated form data for accuracy and completeness.",
    icon: ShieldCheck,
    gradient: "from-secondary to-accent",
    stage: 'hac_forms',
    agent: 'human',
    backDetails: "Human review of all form fields populated by AI. Attorney checks data consistency, flags missing information, and approves forms for PDF generation."
  },
  {
    number: "06",
    title: "Dual AI Verification",
    description: "Both Gemini and OpenAI GPT-5 verify data quality, completeness, and readiness for PDF generation.",
    icon: Brain,
    gradient: "from-accent to-primary",
    stage: 'ai_verify',
    agent: 'ai',
    backDetails: "Gemini 2.5 Flash and OpenAI GPT-5 independently analyze form data. They check for missing fields, data consistency, legal compliance, and generate quality scores with detailed feedback."
  },
  {
    number: "07",
    title: "HAC Review - Verification",
    description: "Attorney reviews AI verification results and makes final approval decision.",
    icon: ShieldCheck,
    gradient: "from-primary to-secondary",
    stage: 'hac_verify',
    agent: 'human',
    backDetails: "Attorney analyzes dual AI verification reports. Reviews flagged issues, confidence scores, and recommendations. Final human judgment before PDF generation authorization."
  },
  {
    number: "08",
    title: "PDF Generation",
    description: "Generate final citizenship application, POA, and family tree PDFs ready for submission.",
    icon: FileCheck,
    gradient: "from-secondary to-accent",
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
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('upload');
  const [isUploading, setIsUploading] = useState(false);

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
        .select('id, name, type, ocr_status, dropbox_path, file_size, created_at')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!caseId
  });

  const toggleFlip = (stepNumber: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const runWorkflowStep = async (stage: AIWorkflowStep['stage']) => {
    setIsRunning(true);
    try {
      switch (stage) {
        case 'ai_classify':
          const { data: docs } = await supabase
            .from('documents')
            .select('id')
            .eq('case_id', caseId);

          for (const doc of docs || []) {
            await supabase.functions.invoke('ai-classify-document', {
              body: { documentId: doc.id, caseId }
            });
          }
          toast({ title: "AI Classification Complete" });
          setCurrentStage('hac_classify');
          break;

        case 'form_population':
          const { data: ocrDocs } = await supabase
            .from('documents')
            .select('id')
            .eq('case_id', caseId)
            .eq('ocr_status', 'completed');

          for (const doc of ocrDocs || []) {
            await supabase.functions.invoke('apply-ocr-to-forms', {
              body: { documentId: doc.id, caseId, overwriteManual: false }
            });
          }
          toast({ title: "Forms Populated" });
          setCurrentStage('hac_forms');
          break;

        case 'ai_verify':
          await supabase.functions.invoke('verify-changes', {
            body: {
              proposal: {
                type: 'frontend',
                description: 'Dual AI verification',
                files: [],
                reasoning: 'Pre-generation verification',
                metadata: { caseId, verificationType: 'dual' }
              }
            }
          });
          toast({ title: "AI Verification Complete" });
          setCurrentStage('hac_verify');
          break;

        case 'pdf_generation':
          const templates = ['poa-adult', 'citizenship', 'family-tree'];
          for (const template of templates) {
            await supabase.functions.invoke('fill-pdf', {
              body: { caseId, templateType: template }
            });
          }
          toast({ title: "PDFs Generated Successfully" });
          break;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
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
    try {
      const { data, error } = await supabase.functions.invoke('list-dropbox-documents', {
        body: { caseId, dropboxPath: caseData.dropbox_path }
      });

      if (error) throw error;

      toast({ 
        title: "Dropbox sync complete",
        description: `Synced ${data.synced} new documents`
      });
      
      refetchDocs();
    } catch (error) {
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

      // Create blob from response and download
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

  return (
    <section className="relative py-8 overflow-hidden">
      <div className="container relative z-10 mx-auto px-4">
        {/* Document Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-8"
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
            <p className="text-muted-foreground">Loading documents...</p>
          ) : documents && documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{doc.name}</p>
                    <div className="flex gap-3 text-sm text-muted-foreground">
                      <span>{doc.ocr_status === 'completed' ? '✓ OCR Complete' : 'Pending OCR'}</span>
                      {doc.file_size && <span>{(doc.file_size / 1024).toFixed(1)} KB</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(doc.dropbox_path || '', doc.name || 'document')}
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
            <p className="text-muted-foreground">No documents in Dropbox. Click "Sync from Dropbox" to load documents.</p>
          )}
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 1.5, 
              type: "spring",
              stiffness: 50,
              damping: 15
            }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-heading font-black mb-6 tracking-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary">
              AI Document Workflow
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground max-w-3xl mx-auto"
          >
            Automated workflow with HAC authorization gates: Documents → AI Classification → Forms → Verification → PDFs
          </motion.p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {workflowSteps.map((step, index) => {
            const isActive = step.stage === currentStage;
            
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div 
                  className="relative h-[450px]"
                  style={{ perspective: '1000px' }}
                >
                  <div
                    onClick={() => toggleFlip(step.number)}
                    className="absolute inset-0 cursor-pointer transition-transform duration-700"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: flippedCards[step.number] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* Front Side */}
                    <motion.div
                      whileHover={{ scale: 1.03, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className={`absolute inset-0 glass-card p-8 rounded-lg group ${
                        isActive ? 'ring-2 ring-primary shadow-xl' : ''
                      }`}
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                      }}
                    >
                      {/* Icon and Number */}
                      <div className="mb-6 relative">
                        <div className="w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                          <step.icon className="w-16 h-16 text-primary opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className={`absolute top-4 left-4 text-5xl font-heading font-black bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent opacity-20`}>
                          {step.number}
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge variant={step.agent === 'ai' ? 'default' : 'secondary'}>
                            {step.agent === 'ai' ? 'AI' : step.agent === 'human' ? 'HAC' : 'BOTH'}
                          </Badge>
                        </div>
                        {isActive && (
                          <div className="absolute -top-2 -right-2">
                            <CheckCircle2 className="h-8 w-8 text-primary animate-pulse" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-4">
                        <motion.h3 
                          className="text-2xl md:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300"
                        >
                          {step.title}
                        </motion.h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {step.description}
                        </p>
                        {isActive && step.agent === 'human' && (
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              approveAndContinue(step.stage);
                            }}
                            disabled={isRunning}
                          >
                            Approve & Continue
                          </Button>
                        )}
                        {isActive && step.agent === 'ai' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled
                          >
                            AI Processing...
                          </Button>
                        )}
                        <p className="text-xs text-muted-foreground/60 text-center mt-2">Tap card for details</p>
                      </div>
                    </motion.div>

                    {/* Back Side */}
                    <div 
                      className="absolute inset-0 glass-card p-8 rounded-lg"
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      <div className="flex flex-col gap-4 h-full">
                        <div className="mb-4 relative">
                          <div className="w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-secondary/5 to-accent/5 flex items-center justify-center">
                            <step.icon className="w-16 h-16 text-secondary opacity-60" />
                          </div>
                          <div className={`absolute top-4 left-4 text-5xl font-heading font-black bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent opacity-20`}>
                            {step.number}
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-heading font-bold tracking-tight text-card-foreground mb-2">
                          Step Details
                        </h3>
                        <div className="flex-1 overflow-auto space-y-3">
                          <div className="p-3 rounded-lg bg-muted/30">
                            <p className="text-sm font-medium mb-1">Agent Type:</p>
                            <Badge variant={step.agent === 'ai' ? 'default' : 'secondary'}>
                              {step.agent === 'ai' ? '🤖 AI Agent' : step.agent === 'human' ? '👤 Human (HAC)' : '🤝 Both'}
                            </Badge>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/30">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {step.backDetails}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground/60 text-center">Tap to flip back</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Start Workflow CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            className="text-xl md:text-2xl font-bold px-8 md:px-20 py-6 h-auto rounded-lg bg-white/5 hover:bg-white/10 shadow-glow group relative overflow-hidden backdrop-blur-md border border-white/30 w-full md:w-auto"
            onClick={() => runWorkflowStep('ai_classify')}
            disabled={isRunning}
          >
            <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {isRunning ? 'Running Workflow...' : 'Start AI Workflow'}
            </span>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
