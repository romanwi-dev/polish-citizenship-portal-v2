import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Brain, 
  FileText, 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ShieldCheck,
  Play,
  Pause
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'awaiting_hac' | 'completed' | 'failed';
  icon: any;
  description: string;
}

interface AIDocumentWorkflowProps {
  caseId: string;
}

export function AIDocumentWorkflow({ caseId }: AIDocumentWorkflowProps) {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: 'upload',
      name: 'Document Upload',
      status: 'pending',
      icon: Upload,
      description: 'Upload scanned documents/photos'
    },
    {
      id: 'ai_classify',
      name: 'AI Classification',
      status: 'pending',
      icon: Brain,
      description: 'AI names and describes documents'
    },
    {
      id: 'hac_classify',
      name: 'HAC Review - Classification',
      status: 'pending',
      icon: ShieldCheck,
      description: 'HAC approves AI classification'
    },
    {
      id: 'form_population',
      name: 'Form Population',
      status: 'pending',
      icon: FileText,
      description: 'OCR data populates forms'
    },
    {
      id: 'hac_forms',
      name: 'HAC Review - Forms',
      status: 'pending',
      icon: ShieldCheck,
      description: 'HAC approves form data'
    },
    {
      id: 'ai_verify',
      name: 'AI Verification',
      status: 'pending',
      icon: Brain,
      description: 'Dual AI verification (Gemini + OpenAI)'
    },
    {
      id: 'hac_verify',
      name: 'HAC Review - Verification',
      status: 'pending',
      icon: ShieldCheck,
      description: 'HAC approves AI verification'
    },
    {
      id: 'pdf_generation',
      name: 'PDF Generation',
      status: 'pending',
      icon: FileCheck,
      description: 'Generate final PDFs'
    }
  ]);

  const updateStepStatus = (stepId: string, status: WorkflowStep['status']) => {
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, status } : s));
  };

  const runAIClassification = async (documentId: string) => {
    try {
      // Get document image
      const { data: doc } = await supabase
        .from('documents')
        .select('dropbox_path')
        .eq('id', documentId)
        .single();

      if (!doc?.dropbox_path) {
        throw new Error('No document image found');
      }

      // Download image
      const { data: imageData } = await supabase.storage
        .from('client-photos')
        .download(doc.dropbox_path);

      if (!imageData) {
        throw new Error('Failed to download image');
      }

      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageData);
      });
      const imageBase64 = await base64Promise;

      // Call AI classification
      const { data, error } = await supabase.functions.invoke('ai-classify-document', {
        body: { 
          documentId, 
          caseId,
          imageBase64 
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('AI classification failed:', error);
      throw error;
    }
  };

  const runDualAIVerification = async () => {
    try {
      // Get form data
      const { data: masterData } = await supabase
        .from('master_table')
        .select('*')
        .eq('case_id', caseId)
        .single();

      if (!masterData) {
        throw new Error('No form data found');
      }

      // Run Gemini verification
      const geminiResult = await supabase.functions.invoke('verify-changes', {
        body: {
          proposal: {
            type: 'frontend',
            description: 'Verify form data for PDF generation',
            files: [],
            reasoning: 'Pre-generation verification',
            metadata: {
              formData: masterData,
              verificationType: 'gemini'
            }
          }
        }
      });

      // Run OpenAI verification
      const openaiResult = await supabase.functions.invoke('verify-changes', {
        body: {
          proposal: {
            type: 'frontend',
            description: 'Verify form data for PDF generation',
            files: [],
            reasoning: 'Pre-generation verification',
            metadata: {
              formData: masterData,
              verificationType: 'openai'
            }
          }
        }
      });

      return {
        gemini: geminiResult.data,
        openai: openaiResult.data
      };
    } catch (error) {
      console.error('Dual AI verification failed:', error);
      throw error;
    }
  };

  const executeWorkflow = async () => {
    setIsRunning(true);
    
    try {
      // Step 1: Check for uploaded documents
      updateStepStatus('upload', 'running');
      const { data: docs } = await supabase
        .from('documents')
        .select('id')
        .eq('case_id', caseId);

      if (!docs || docs.length === 0) {
        throw new Error('No documents uploaded yet');
      }
      updateStepStatus('upload', 'completed');
      setCurrentStepIndex(1);

      // Step 2: AI Classification
      updateStepStatus('ai_classify', 'running');
      for (const doc of docs) {
        await runAIClassification(doc.id);
      }
      updateStepStatus('ai_classify', 'completed');
      setCurrentStepIndex(2);

      // Step 3: HAC Review - Classification
      updateStepStatus('hac_classify', 'awaiting_hac');
      toast({
        title: "HAC Authorization Required",
        description: "Please review AI document classification",
      });
      // Workflow pauses here - HAC must manually approve

      // Remaining steps would continue after HAC approval...
      // This is a manual trigger workflow

    } catch (error) {
      const currentStep = steps[currentStepIndex];
      updateStepStatus(currentStep.id, 'failed');
      toast({
        title: "Workflow Error",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const continueFromHACApproval = async () => {
    const currentStep = steps[currentStepIndex];
    
    if (currentStep.status !== 'awaiting_hac') {
      toast({
        title: "Cannot Continue",
        description: "No HAC approval pending",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);

    try {
      // Mark current HAC step as completed
      updateStepStatus(currentStep.id, 'completed');
      setCurrentStepIndex(prev => prev + 1);

      // Continue to next automated step
      if (currentStep.id === 'hac_classify') {
        // Step 4: Form Population
        updateStepStatus('form_population', 'running');
        
        // Call OCR and form population
        const { data: docs } = await supabase
          .from('documents')
          .select('id')
          .eq('case_id', caseId)
          .eq('ocr_status', 'completed');

        for (const doc of docs || []) {
          await supabase.functions.invoke('apply-ocr-to-forms', {
            body: {
              documentId: doc.id,
              caseId,
              overwriteManual: false
            }
          });
        }

        updateStepStatus('form_population', 'completed');
        setCurrentStepIndex(4);

        // Step 5: HAC Review - Forms
        updateStepStatus('hac_forms', 'awaiting_hac');
        toast({
          title: "HAC Authorization Required",
          description: "Please review populated form data",
        });
      } else if (currentStep.id === 'hac_forms') {
        // Step 6: AI Verification
        updateStepStatus('ai_verify', 'running');
        
        const verificationResults = await runDualAIVerification();
        
        updateStepStatus('ai_verify', 'completed');
        setCurrentStepIndex(6);

        // Step 7: HAC Review - Verification
        updateStepStatus('hac_verify', 'awaiting_hac');
        toast({
          title: "HAC Authorization Required",
          description: "Please review AI verification results",
        });
      } else if (currentStep.id === 'hac_verify') {
        // Step 8: PDF Generation
        updateStepStatus('pdf_generation', 'running');
        
        // Generate PDFs
        const templates = ['poa-adult', 'citizenship', 'family-tree'];
        for (const template of templates) {
          await supabase.functions.invoke('fill-pdf', {
            body: {
              caseId,
              templateType: template
            }
          });
        }

        updateStepStatus('pdf_generation', 'completed');
        toast({
          title: "Workflow Complete",
          description: "All PDFs generated successfully",
        });
      }
    } catch (error) {
      const nextStep = steps[currentStepIndex];
      updateStepStatus(nextStep.id, 'failed');
      toast({
        title: "Workflow Error",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500 animate-pulse';
      case 'awaiting_hac': return 'bg-yellow-500 animate-pulse';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'running': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'awaiting_hac': return <ShieldCheck className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const progress = ((steps.filter(s => s.status === 'completed').length) / steps.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Document Workflow
        </CardTitle>
        <CardDescription>
          Automated workflow with HAC authorization gates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Workflow Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  index === currentStepIndex ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className={`rounded-full p-2 ${getStatusColor(step.status)}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{step.name}</h4>
                    {getStatusIcon(step.status)}
                    <Badge variant={step.status === 'awaiting_hac' ? 'default' : 'secondary'}>
                      {step.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isRunning && currentStepIndex === 0 && (
            <Button onClick={executeWorkflow} className="gap-2">
              <Play className="h-4 w-4" />
              Start Workflow
            </Button>
          )}
          
          {steps[currentStepIndex]?.status === 'awaiting_hac' && (
            <Button onClick={continueFromHACApproval} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Approve & Continue
            </Button>
          )}

          {isRunning && (
            <Button variant="secondary" disabled className="gap-2">
              <Pause className="h-4 w-4" />
              Running...
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
