import { useState, useEffect } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { POAOCRScanner } from "./POAOCRScanner";
import { POABatchOCRScanner } from "./POABatchOCRScanner";
import { POAGenerateButton } from "./POAGenerateButton";
import { POASignSendDialog } from "./POASignSendDialog";
import { POAConflictResolver } from "./POAConflictResolver";

interface POAThreeClickWizardProps {
  caseId: string;
  useBatchMode?: boolean;
}

export const POAThreeClickWizard = ({ caseId, useBatchMode = false }: POAThreeClickWizardProps) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [passportConfidence, setPassportConfidence] = useState<number>();
  const [birthCertConfidence, setBirthCertConfidence] = useState<number>();
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string>();
  const [poaId, setPoaId] = useState<string>();
  const [staleSession, setStaleSession] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved state on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const { data, error } = await supabase
          .from('case_workflow_state')
          .select('*')
          .eq('case_id', caseId)
          .eq('workflow_type', 'poa')
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          const ageHours = (Date.now() - new Date(data.created_at).getTime()) / (1000 * 60 * 60);
          if (ageHours > 24) {
            setStaleSession(true);
          }
          setCurrentStep(data.current_step as 1 | 2 | 3);
          if (data.form_data && typeof data.form_data === 'object') {
            const formData = data.form_data as any;
            setPassportConfidence(formData.passportConfidence);
            setBirthCertConfidence(formData.birthCertConfidence);
            setGeneratedPdfUrl(formData.generatedPdfUrl);
            setPoaId(formData.poaId);
          }
        }
      } catch (err: any) {
        console.error('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    };

    loadState();
  }, [caseId]);

  // Save state on changes
  useEffect(() => {
    if (loading) return;

    const saveState = async () => {
      try {
        await supabase.from('case_workflow_state').upsert({
          case_id: caseId,
          workflow_type: 'poa',
          current_step: currentStep,
          form_data: {
            passportConfidence,
            birthCertConfidence,
            generatedPdfUrl,
            poaId,
          },
        });
      } catch (err: any) {
        console.error('Failed to save session:', err);
      }
    };

    saveState();
  }, [currentStep, passportConfidence, birthCertConfidence, generatedPdfUrl, poaId, caseId, loading]);

  const handleOCRComplete = () => {
    setCurrentStep(2);
  };

  const handleOCRData = (data: { passport?: any; birthCert?: any }) => {
    if (data.passport?.confidence) {
      setPassportConfidence(data.passport.confidence);
    }
    if (data.birthCert?.confidence) {
      setBirthCertConfidence(data.birthCert.confidence);
    }
  };

  const handlePDFGenerated = (pdfUrl: string, poaId: string) => {
    setGeneratedPdfUrl(pdfUrl);
    setPoaId(poaId);
    setCurrentStep(3);
  };

  const steps = [
    { number: 1, label: 'Scan' },
    { number: 2, label: 'Print' },
    { number: 3, label: 'Send' },
  ];

  if (loading) {
    return <div className="max-w-4xl mx-auto p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {staleSession && (
        <Alert variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This session is over 24 hours old. Some data may be outdated.
          </AlertDescription>
        </Alert>
      )}

      <POAConflictResolver caseId={caseId} />

      {/* Progress Header */}
      <div className="mb-8 px-4 py-6 md:p-10">
        <div className="flex items-center justify-center gap-4 md:gap-8">
          {steps.map((step, idx) => {
            const isComplete = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            
            return (
              <div key={step.number} className="flex items-center gap-4 md:gap-8">
                <motion.div
                  className="flex flex-col items-center gap-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1, duration: 0.3 }}
                >
                  <motion.div
                    className={`
                      w-24 h-24 md:w-32 md:h-32 rounded-full 
                      flex items-center justify-center
                      border-4 transition-all duration-300
                      ${isComplete 
                        ? 'bg-green-500 border-green-500 text-white cursor-pointer hover:opacity-80' 
                        : isCurrent 
                          ? 'bg-transparent border-primary text-primary' 
                          : 'bg-background border-border text-muted-foreground'
                      }
                    `}
                    animate={{
                      scale: isCurrent ? [1, 1.05, 1] : 1,
                    }}
                    transition={{
                      duration: 2,
                      repeat: isCurrent ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                    onClick={() => {
                      if (isComplete) {
                        setCurrentStep(step.number as 1 | 2 | 3);
                      }
                    }}
                  >
                    <span className="text-lg md:text-2xl font-bold">{step.label}</span>
                  </motion.div>
                </motion.div>
                
                {idx < steps.length - 1 && (
                  <motion.div
                    className="flex items-center"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 + 0.2, duration: 0.3 }}
                  >
                    <ArrowRight 
                      className={`w-6 h-6 md:w-8 md:h-8 ${
                        isComplete ? 'text-green-500' : 'text-muted-foreground'
                      }`}
                    />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 1 && (
        useBatchMode ? (
          <POABatchOCRScanner
            caseId={caseId}
            onBatchComplete={(results) => {
              setCurrentStep(2);
            }}
            maxFiles={10}
          />
        ) : (
          <POAOCRScanner
            caseId={caseId}
            onDataExtracted={handleOCRData}
            onComplete={handleOCRComplete}
          />
        )
      )}

      {currentStep === 2 && (
        <POAGenerateButton
          caseId={caseId}
          passportConfidence={passportConfidence}
          birthCertConfidence={birthCertConfidence}
          onGenerated={handlePDFGenerated}
        />
      )}

      {currentStep === 3 && generatedPdfUrl && poaId && (
        <POASignSendDialog
          open={true}
          onOpenChange={() => {}}
          poaId={poaId}
          pdfUrl={generatedPdfUrl}
        />
      )}
    </div>
  );
};