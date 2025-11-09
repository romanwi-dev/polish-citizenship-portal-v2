import { useParams, useNavigate } from "react-router-dom";
import { FlippableCardsDarkGlow } from "@/components/docs/FlippableCardsDarkGlow";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { sanitizeMasterData } from "@/utils/masterDataSanitizer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput } from "@/components/forms/FormInput";
import { MaskedPassportInput } from "@/components/forms/MaskedPassportInput";
import { FormHeader } from "@/components/forms/FormHeader";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Sparkles, Type, ArrowLeft, Maximize2, Minimize2, User, Download, HelpCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StaticHeritagePlaceholder } from "@/components/heroes/StaticHeritagePlaceholder";

const StaticHeritage = lazy(() => import("@/components/heroes/StaticHeritage").then(m => ({ default: m.StaticHeritage })));
import { DateField } from "@/components/DateField";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Textarea } from "@/components/ui/textarea";
import { useRealtimeFormSync } from "@/hooks/useRealtimeFormSync";
import { CountrySelect } from "@/components/CountrySelect";
import { FormButtonsRow } from "@/components/FormButtonsRow";
import { useFormManager } from "@/hooks/useFormManager";
import { PDFGenerateButton } from "@/components/pdf/PDFGenerateButton";
import { PDFPreviewDialog } from "@/components/PDFPreviewDialog";
import { 
  CIVIL_REGISTRY_FORM_REQUIRED_FIELDS,
  CIVIL_REGISTRY_DATE_FIELDS 
} from "@/config/formRequiredFields";

export default function CivilRegistryForm() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const { isLargeFonts, toggleFontSize } = useAccessibility();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isFullView, setIsFullView] = useState(true);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [previewFormData, setPreviewFormData] = useState<any>({});
  
  // Use universal form manager (auto-save + validation + unsaved changes)
  const {
    formData,
    isLoading,
    isSaving,
    completion,
    validation,
    autoSave,
    handleInputChange,
    handleSave,
    handleClearAll,
  } = useFormManager(
    caseId,
    CIVIL_REGISTRY_FORM_REQUIRED_FIELDS,
    CIVIL_REGISTRY_DATE_FIELDS
  );

  const handleClearData = async () => {
    await handleClearAll();
    setShowClearDialog(false);
    toast.success('All form data cleared');
  };

  const handleGeneratePDF = async (url: string) => {
    console.log('[CivilRegistryForm] PDF generated:', url);
    setPdfPreviewUrl(url);
    setPreviewFormData(formData);
  };

  const handleRegeneratePDF = async () => {
    setPdfPreviewUrl(null);
  };

  const handleDownloadEditable = async () => {
    if (!pdfPreviewUrl) return;
    window.open(pdfPreviewUrl, '_blank');
  };

  const handleDownloadFinal = async () => {
    if (!pdfPreviewUrl) return;
    window.open(pdfPreviewUrl, '_blank');
  };
  const renderDateField = (name: string, label: string, delay = 0) => {
    // Convert ISO format to DD.MM.YYYY for display
    const isoValue = formData[name] || "";
    let displayValue = "";
    if (isoValue) {
      try {
        const date = new Date(isoValue);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        displayValue = `${day}.${month}.${year}`;
      } catch (e) {
        displayValue = isoValue;
      }
    }
    
    return <DateField
      name={name}
      label={label}
      value={displayValue}
      onChange={(value) => {
        // Convert DD.MM.YYYY to ISO format for storage
        if (value && value.length === 10) {
          const [day, month, year] = value.split('.');
          const isoDate = `${year}-${month}-${day}`;
          handleInputChange(name, isoDate);
        } else {
          handleInputChange(name, value);
        }
      }}
      delay={delay}
      colorScheme="civil-reg"
    />;
  };
  const renderFieldGroup = (fields: Array<{
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
  }>) => {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field, idx) => <motion.div key={field.name} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: idx * 0.05,
        duration: 0.4
      }} className="space-y-2" onDoubleClick={() => !field.type || field.type === "text" ? handleInputChange(field.name, "") : null}>
            {field.type === "date" ? renderDateField(field.name, field.label) : <>
                <Label htmlFor={field.name} className={isLargeFonts ? "text-2xl" : ""}>
                  {field.label}
                </Label>
                {field.name.includes('passport_number') ? (
                  <MaskedPassportInput
                    id={field.name}
                    value={formData[field.name] || ""}
                    onChange={(value) => handleInputChange(field.name, value)}
                    isLargeFonts={isLargeFonts}
                    colorScheme="civil-reg"
                  />
                ) : (
                  <FormInput
                    id={field.name} 
                    type={field.type || "text"} 
                    value={formData[field.name] || ""} 
                    onChange={e => {
                      // Only uppercase name/POB fields, preserve phone/passport/email as-is
                      const isNameOrPlace = field.name.includes('_name') || field.name.includes('_pob');
                      const shouldUppercase = isNameOrPlace && field.type !== "email";
                      handleInputChange(field.name, shouldUppercase ? e.target.value.toUpperCase() : e.target.value);
                    }} 
                    isNameField={(field.name.includes('_name') || field.name.includes('_pob')) && field.type !== "email"}
                    isLargeFonts={isLargeFonts}
                    colorScheme="civil-reg"
                  />
                )}
              </>}
          </motion.div>)}
      </div>;
  };
  if (caseId !== 'demo-preview' && (!caseId || caseId === ':id')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Invalid Case ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please navigate to this page from a valid case.</p>
            <Button onClick={() => navigate('/admin/cases')} className="mt-4">
              Go to Cases
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
        <motion.div animate={{
        rotate: 360
      }} transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}>
          <Sparkles className="h-16 w-16 text-primary" />
        </motion.div>
      </div>;
  }
  return <div className={cn("relative min-h-screen overflow-x-hidden", isLargeFonts && "text-lg")}>
      {/* Global Background */}
      <div className="fixed inset-0 z-0">
        <Suspense fallback={<StaticHeritagePlaceholder />}>
          <StaticHeritage />
        </Suspense>
      </div>
      
      <div className="relative z-10 pt-2 px-3 pb-3 md:p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="mb-1 md:mb-6"
        >
          <h2 className="text-5xl md:text-8xl font-heading font-black mb-14 tracking-tight text-center">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Civil Registry
            </span>
          </h2>
          <div className="flex items-center justify-center gap-3 md:gap-6 mt-2 md:mt-4">
              <Button
                onClick={() => navigate('/admin/forms-demo')}
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-10 md:w-10"
                title="Back to Case"
              >
                <ArrowLeft className="h-3.5 w-3.5 md:h-6 md:w-6" />
              </Button>
              <Button
                onClick={() => setIsFullView(!isFullView)}
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-10 md:w-10"
                title={isFullView ? "Collapse to Tabs" : "Expand All Sections"}
              >
                {isFullView ? <Minimize2 className="h-3.5 w-3.5 md:h-6 md:w-6" /> : <Maximize2 className="h-3.5 w-3.5 md:h-6 md:w-6" />}
              </Button>
              <Button
                onClick={() => navigate('/login')}
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-10 md:w-10"
                title="Login / Register"
              >
                <User className="h-3.5 w-3.5 md:h-6 md:w-6" />
              </Button>
              <Button
                onClick={toggleFontSize}
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-10 md:w-10"
                title="Toggle Font Size"
              >
                <Type className="h-3.5 w-3.5 md:h-6 md:w-6" />
              </Button>
              <Button
                onClick={() => window.open('https://docs.lovable.dev', '_blank')}
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-10 md:w-10"
                title="How to fill this form"
              >
                <HelpCircle className="h-3.5 w-3.5 md:h-6 md:w-6" />
              </Button>
            </div>
        </motion.div>

        <FormButtonsRow 
          caseId={caseId!}
          currentForm="civil-registry"
          onSave={handleSave}
          onClear={() => setShowClearDialog(true)}
          onGeneratePDF={() => {}} // No PDF generation for Civil Registry
          isSaving={isSaving}
        />

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Applicant Information */}
          <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5
        }}>
            <div className="px-4 py-6 md:p-10">
              <div className="border-b border-emerald-200/20 pb-6">
                <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 bg-clip-text text-transparent">
                  Applicant Information / Dane wnioskodawcy
                </h2>
              </div>
              <div className="space-y-10">
                {renderFieldGroup([{
                name: "applicant_first_name",
                label: "Given names / Imię/ imiona"
              }, {
                name: "applicant_last_name",
                label: "Full last name / Nazwisko"
              }])}
              
                {renderFieldGroup([{
                name: "applicant_pob",
                label: "Place of birth / Miejsce urodzenia"
              }, {
                name: "applicant_dob",
                label: "Date of birth / Data urodzenia",
                type: "date"
              }])}
              
              {/* Maiden name - only for females */}
              {formData.applicant_sex === 'F' && renderFieldGroup([{
                name: "applicant_maiden_name",
                label: "Maiden name / Nazwisko rodowe"
              }])}
              
              {renderFieldGroup([{
                name: "applicant_email",
                label: "Email",
                type: "email"
              }])}
              
                {renderFieldGroup([{
                name: "applicant_phone",
                label: "Phone / Telefon"
              }, {
                name: "applicant_passport_number",
                label: "Passport number / Nr paszportu"
              }])}
              </div>
            </div>
          </motion.div>

          {/* Document Information */}
          <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5,
          delay: 0.1
        }}>
            <div className="px-4 py-6 md:p-10">
              <div className="border-b border-emerald-200/20 pb-6">
                <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 bg-clip-text text-transparent">
                  Document to Register / Dokument do rejestracji
                </h2>
              </div>
              <div className="space-y-10">
                {renderFieldGroup([
                  {
                    name: "document_type",
                    label: "Document Type / Typ dokumentu (Birth/Marriage/Death)"
                  },
                  {
                    name: "document_issue_place",
                    label: "Place of document issuance / Miejsce sporządzenia aktu"
                  },
                  {
                    name: "document_registry_number",
                    label: "Registry number / Numer aktu"
                  },
                ])}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CountrySelect
                    value={formData.document_issue_country || ""}
                    onChange={(value) => handleInputChange("document_issue_country", value)}
                    label="Country / Kraj"
                    isLargeFonts={isLargeFonts}
                    colorScheme="civil-reg"
                  />
                </div>

                <div className="pt-8">
                  <h3 className={cn("font-semibold mb-6 text-foreground", isLargeFonts ? "text-2xl" : "text-xl")}>Required Documents Checklist / Lista wymaganych dokumentów</h3>
                  <FlippableCardsDarkGlow 
                    documents={[
                      {
                        id: 'has_original_foreign_act',
                        label: 'Original foreign civil act / Oryginał aktu zagranicznego',
                        checked: formData?.has_original_foreign_act || false,
                        importance: 'critical' as const,
                        difficulty: 'hard' as const,
                      },
                      {
                        id: 'has_sworn_translation',
                        label: 'Sworn translation into Polish / Tłumaczenie przysięgłe na język polski',
                        checked: formData?.has_sworn_translation || false,
                        importance: 'critical' as const,
                        difficulty: 'medium' as const,
                      },
                      {
                        id: 'has_tax_payment',
                        label: 'Proof of Tax Payment (50 PLN) / Dowód uiszczenia opłaty skarbowej',
                        checked: formData?.has_tax_payment || false,
                        importance: 'high' as const,
                        difficulty: 'easy' as const,
                      },
                      {
                        id: 'has_power_of_attorney',
                        label: 'Power of Attorney / Pełnomocnictwo (notarized or consular)',
                        checked: formData?.has_power_of_attorney || false,
                        importance: 'high' as const,
                        difficulty: 'medium' as const,
                      },
                      {
                        id: 'has_passport_copy',
                        label: 'Valid Passport Copy / Kopia paszportu',
                        checked: formData?.has_passport_copy || false,
                        importance: 'medium' as const,
                        difficulty: 'easy' as const,
                      },
                    ]}
                    onToggle={(id) => {
                      handleInputChange(id, !formData?.[id]);
                    }}
                    colorScheme="civil-reg"
                  />
                </div>

          {/* Additional Notes Section - Matching Family Tree */}
          <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }} className="mt-10 pb-32 md:pb-8">
            <div className="border-b border-border/50 pb-6">
              <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 bg-clip-text text-transparent">
                Additional notes / Dodatkowe informacje
              </h2>
            </div>
            <div className="mt-8">
              <Textarea
                id="civil_registry_notes"
                value={formData.civil_registry_notes || ""}
                onChange={(e) => handleInputChange("civil_registry_notes", e.target.value.toUpperCase())}
                placeholder=""
                rows={10}
                colorScheme="civil-reg"
                className={cn(
                  "min-h-[300px] resize-y border-2 border-gray-300/10 hover-glow focus:shadow-lg transition-all backdrop-blur uppercase",
                  isLargeFonts && "text-xl"
                )}
              />
            </div>
          </motion.div>


              </div>
            </div>
          </motion.div>
        </div>

        {/* Generate PDF Button */}
        <div className="mt-12 flex justify-center pb-8">
          <PDFGenerateButton
            caseId={caseId!}
            templateType="registration"
            onGenerate={handleGeneratePDF}
          >
            <span className="text-emerald-100 font-heading font-black text-2xl md:text-3xl px-12 py-4">
              Generate PDF
            </span>
          </PDFGenerateButton>
        </div>
      </div>


      {/* Clear Data Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all fields in the Civil Registry form. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData}>
              Clear Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PDFPreviewDialog
        open={!!pdfPreviewUrl}
        onClose={() => setPdfPreviewUrl(null)}
        pdfUrl={pdfPreviewUrl || ""}
        formData={previewFormData}
        onRegeneratePDF={handleRegeneratePDF}
        onDownloadEditable={handleDownloadEditable}
        onDownloadFinal={handleDownloadFinal}
        documentTitle="Civil Registry Application"
      />

    </div>;
}