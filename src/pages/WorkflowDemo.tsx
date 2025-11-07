import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, FileText, Brain, Database, FileCheck, Download,
  ArrowRight, CheckCircle2, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WorkflowDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const demoSteps = [
    {
      id: 0,
      title: "1. Document Upload",
      description: "User uploads passport, birth certificate, marriage certificate",
      icon: Upload,
      data: {
        files: ["passport.pdf", "birth_cert.jpg", "marriage_cert.pdf"]
      },
      output: "Documents stored in database with status='pending'"
    },
    {
      id: 1,
      title: "2. OCR Processing",
      description: "AI extracts text from documents",
      icon: Brain,
      data: {
        passport: {
          name: "John Smith",
          birthDate: "15.03.1985",
          passportNumber: "AB1234567",
          sex: "Male"
        },
        birthCert: {
          name: "John William Smith",
          birthDate: "15.03.1985",
          birthPlace: "New York, USA",
          fatherName: "Robert Smith",
          motherName: "Mary Johnson"
        }
      },
      output: "OCR data stored in ocr_documents table with confidence scores"
    },
    {
      id: 2,
      title: "3. AI Classification",
      description: "AI identifies document types and person assignments",
      icon: FileCheck,
      data: {
        classifications: [
          { doc: "passport.pdf", type: "Passport", person: "Applicant", confidence: 0.98 },
          { doc: "birth_cert.jpg", type: "Birth Certificate", person: "Applicant", confidence: 0.95 },
          { doc: "marriage_cert.pdf", type: "Marriage Certificate", person: "Applicant & Spouse", confidence: 0.97 }
        ]
      },
      output: "Document metadata updated with ai_detected_type and person assignment"
    },
    {
      id: 3,
      title: "4. Form Population",
      description: "OCR data automatically fills form fields",
      icon: Database,
      data: {
        masterTable: {
          applicant_first_name: "John",
          applicant_last_name: "Smith",
          applicant_birth_date: "15.03.1985",
          applicant_sex: "Male",
          applicant_passport_number: "AB1234567",
          father_first_name: "Robert",
          father_last_name: "Smith",
          mother_maiden_name: "Johnson"
        },
        poaForm: {
          full_name: "John William Smith",
          date_of_birth: "15.03.1985",
          passport_number: "AB1234567"
        }
      },
      output: "Forms populated via apply-ocr-to-forms edge function"
    },
    {
      id: 4,
      title: "5. PDF Generation",
      description: "System generates filled PDFs ready for submission",
      icon: FileText,
      data: {
        pdfs: [
          { name: "POA_Adult_JohnSmith.pdf", status: "Generated", fields: 23 },
          { name: "Citizenship_Application.pdf", status: "Generated", fields: 142 },
          { name: "Family_Tree.pdf", status: "Generated", fields: 65 }
        ]
      },
      output: "PDFs stored in generated-pdfs bucket with all fields filled"
    },
    {
      id: 5,
      title: "6. Download & Submit",
      description: "Client downloads completed documents",
      icon: Download,
      data: {
        downloadLinks: [
          "POA_Adult_JohnSmith.pdf",
          "Citizenship_Application.pdf",
          "Family_Tree.pdf"
        ]
      },
      output: "Documents ready for submission to Polish authorities"
    }
  ];

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleReset = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(0);
      setIsAnimating(false);
    }, 300);
  };

  const step = demoSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Document → Form → PDF Workflow Demo
          </h1>
          <p className="text-muted-foreground">
            See how data flows from uploaded documents into forms and PDFs
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="flex justify-between items-center">
            {demoSteps.map((s, idx) => (
              <div key={s.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  idx <= currentStep 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background border-muted-foreground/30'
                }`}>
                  {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                </div>
                {idx < demoSteps.length - 1 && (
                  <div className={`h-0.5 w-24 mx-2 transition-all ${
                    idx < currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Input Data */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Input Data
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(step.data, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight className="h-8 w-8 text-primary rotate-90" />
                  </motion.div>
                </div>

                {/* Output */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Output
                  </h3>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="text-sm">{step.output}</p>
                  </div>
                </div>

                {/* Database/System Info */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    System Process
                  </h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    {currentStep === 0 && (
                      <>
                        <p>• Files uploaded to Dropbox via upload-to-dropbox function</p>
                        <p>• Document records created in documents table</p>
                        <p>• Workflow instances created with status="in_progress"</p>
                      </>
                    )}
                    {currentStep === 1 && (
                      <>
                        <p>• OCR function called: ocr-document edge function</p>
                        <p>• Adobe PDF Services API extracts text and data</p>
                        <p>• Results stored in ocr_documents table with confidence scores</p>
                      </>
                    )}
                    {currentStep === 2 && (
                      <>
                        <p>• AI Classification: ai-classify-document function</p>
                        <p>• Gemini 2.5 Flash analyzes document content and type</p>
                        <p>• Updates documents.ai_detected_type and person assignment</p>
                      </>
                    )}
                    {currentStep === 3 && (
                      <>
                        <p>• Form Population: apply-ocr-to-forms edge function</p>
                        <p>• OCR data mapped to form fields via field mapping rules</p>
                        <p>• Updates master_table, poa, and oby_forms tables</p>
                        <p>• Tracks source in form_field_sources for audit trail</p>
                      </>
                    )}
                    {currentStep === 4 && (
                      <>
                        <p>• PDF Generation: pdf-worker (async queue)</p>
                        <p>• Jobs enqueued via pdf-enqueue, processed by pdf-worker cron</p>
                        <p>• PDF-LIB fills template PDFs with form data</p>
                        <p>• Stores completed PDFs in generated-pdfs bucket</p>
                        <p>• Real-time notifications via Supabase Realtime</p>
                      </>
                    )}
                    {currentStep === 5 && (
                      <>
                        <p>• Download links generated with signed URLs</p>
                        <p>• Client portal shows completed documents</p>
                        <p>• HAC can approve final PDFs before client download</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0 || isAnimating}
            variant="outline"
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Badge variant="secondary">
              Step {currentStep + 1} of {demoSteps.length}
            </Badge>
            <Button onClick={handleReset} variant="ghost" size="sm">
              Reset
            </Button>
          </div>

          <Button
            onClick={handleNext}
            disabled={currentStep === demoSteps.length - 1 || isAnimating}
          >
            Next
          </Button>
        </div>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Tables & Functions</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Database Tables:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>documents</code> - Document metadata & status</li>
                <li>• <code>ocr_documents</code> - Extracted OCR data</li>
                <li>• <code>master_table</code> - Main citizenship form data</li>
                <li>• <code>poa</code> - Power of Attorney data</li>
                <li>• <code>oby_forms</code> - Polish citizenship application</li>
                <li>• <code>form_field_sources</code> - Data source tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Edge Functions:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>upload-to-dropbox</code> - File upload</li>
                <li>• <code>ocr-document</code> - Text extraction</li>
                <li>• <code>ai-classify-document</code> - Document type detection</li>
                <li>• <code>apply-ocr-to-forms</code> - Form population</li>
                <li>• <code>pdf-enqueue</code> - Enqueue PDF jobs</li>
                <li>• <code>pdf-worker</code> - Process PDF queue (cron)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
