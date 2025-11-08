import { useState } from "react";
import { Camera, FileText, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { POAOCRScanner } from "./POAOCRScanner";
import { POABatchOCRScanner } from "./POABatchOCRScanner";
import { POAGenerateButton } from "./POAGenerateButton";
import { POASignSendDialog } from "./POASignSendDialog";

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
    { number: 1, icon: Camera, label: 'PHOTO', description: 'Scan Documents' },
    { number: 2, icon: FileText, label: 'PRINT', description: 'Generate PDF' },
    { number: 3, icon: Send, label: 'SIGN', description: 'Sign & Send' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle>POA Generation Wizard</CardTitle>
          <CardDescription>Complete in 3 simple steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isComplete = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      isComplete ? 'bg-green-500 text-white' :
                      isCurrent ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-bold ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                        {step.label}
                      </div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-4 ${
                      isComplete ? 'bg-green-500' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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