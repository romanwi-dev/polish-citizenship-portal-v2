import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, lazy, Suspense } from "react";
import { Loader2, Sparkles, Type, User, ArrowLeft, Maximize2, Minimize2, Download, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast} from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StaticHeritagePlaceholder } from "@/components/heroes/StaticHeritagePlaceholder";

const StaticHeritage = lazy(() => import("@/components/heroes/StaticHeritage").then(m => ({ default: m.StaticHeritage })));
import { DateField } from "@/components/DateField";
import { FormInput } from "@/components/forms/FormInput";
import { useLongPressWithFeedback } from "@/hooks/useLongPressWithFeedback";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { PDFGenerateButton } from "@/components/pdf/PDFGenerateButton";
import { PDFPreviewDialog } from "@/components/PDFPreviewDialog";
import { FormButtonsRow } from "@/components/FormButtonsRow";
import { BulkPDFGenerator } from "@/components/BulkPDFGenerator";
import { useFormManager } from "@/hooks/useFormManager";
import { useOBYAutoPopulation } from "@/hooks/useOBYAutoPopulation";
import { MaskedPassportInput } from "@/components/forms/MaskedPassportInput";
import { Check, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StickyActionBar from "@/components/StickyActionBar";
import {
  CITIZENSHIP_FORM_REQUIRED_FIELDS,
  CITIZENSHIP_DATE_FIELDS
} from "@/config/formRequiredFields";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export default function CitizenshipForm() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const { isLargeFonts, toggleFontSize } = useAccessibility();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
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
    CITIZENSHIP_FORM_REQUIRED_FIELDS,
    CITIZENSHIP_DATE_FIELDS
  );

  // OBY Auto-Population Hook
  const { 
    generateOBYData, 
    calculateCompletionPercentage,
    hasData: hasOBYData, 
    isLoading: loadingOBYData,
    intakeData: obyIntakeData,
    masterData: obyMasterData
  } = useOBYAutoPopulation(caseId || '');


  const handleGeneratePDF = async (url: string) => {
    console.log('[CitizenshipForm] PDF generated with URL:', url);
    console.log('[CitizenshipForm] Setting pdfPreviewUrl to:', url);
    setPdfPreviewUrl(url);
    setPreviewFormData(formData);
    console.log('[CitizenshipForm] Preview URL set, dialog should open now');
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

  const {
    handlers: formLongPressHandlers,
    isPressed: isFormPressed
  } = useLongPressWithFeedback({
    onLongPress: () => setShowClearAllDialog(true),
    duration: 5000,
    feedbackMessage: "Hold for 5 seconds to clear entire form..."
  });

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
      colorScheme="citizenship"
      isLargeFonts={isLargeFonts}
    />;
  };

  const renderFieldGroup = (fields: Array<{ name: string; label: string; type?: string; placeholder?: string }>) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field, idx) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="space-y-2"
            onDoubleClick={() => !field.type && handleInputChange(field.name, "")}
          >
            {field.type === "date" ? (
              renderDateField(field.name, field.label)
            ) : (
              <>
                <Label htmlFor={field.name} className={cn(
                  "font-light text-foreground/90",
                  isLargeFonts ? "text-2xl" : "text-xl"
                )}>
                  {field.label}
                </Label>
                <FormInput
                  id={field.name}
                  type={field.type || "text"}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value.toUpperCase())}
                  placeholder={field.placeholder || ""}
                  colorScheme="citizenship"
                  isLargeFonts={isLargeFonts}
                  isNameField={true}
                />
              </>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  const renderTextarea = (name: string, label: string, rows = 4) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <Label htmlFor={name} className={cn(
          "font-light text-foreground/90",
          isLargeFonts ? "text-xl" : "text-sm"
        )}>
          {label}
        </Label>
        <Textarea
          id={name}
          value={formData[name] || ""}
          onChange={(e) => handleInputChange(name, e.target.value.toUpperCase())}
          rows={rows}
          colorScheme="citizenship"
          className="uppercase"
        />
      </motion.div>
    );
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-16 w-16 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("relative min-h-screen overflow-x-hidden", isLargeFonts && "text-lg")}>
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
          className="mb-0"
        >
          <h2 className="text-5xl md:text-8xl font-heading font-black mb-2 md:mb-3 tracking-tight text-center">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Polish Citizenship
            </span>
          </h2>
          <div className="flex items-center justify-center gap-3 md:gap-6 mt-2 md:mt-3 mb-4 md:mb-6">
              <Button
                onClick={() => navigate(`/admin/cases#case-${caseId}`)}
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-10 md:w-10"
                title="Back to Cases"
              >
                <ArrowLeft className="h-3.5 w-3.5 md:h-6 md:w-6" />
              </Button>
              <Button
                onClick={() => setIsFullView(!isFullView)}
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-10 md:w-10"
                title={isFullView ? "Collapse" : "Expand All"}
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
          currentForm="citizenship"
          onSave={handleSave}
          onClear={() => setShowClearAllDialog(true)}
          onGeneratePDF={handleGeneratePDF}
          isSaving={isSaving}
        />

        {/* Bulk PDF Generator - Centered between buttons and tabs */}
        <BulkPDFGenerator caseId={caseId!} />

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Part I - Person Data */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="px-4 py-6 md:p-10">
              <div className="border-b border-border/50 pb-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary leading-tight">
                  CZĘŚĆ I - Dane osoby, której dotyczy wniosek
                </h2>
              </div>
              <div className="space-y-10">
                {renderFieldGroup([
                  { name: "applicant_first_name", label: "Imię/ imiona / Given names" },
                  { name: "applicant_last_name", label: "Nazwisko / Full last name" }
                ])}
                
                {renderFieldGroup([
                  { name: "applicant_pob", label: "Miejsce urodzenia / Place of birth" },
                  { name: "applicant_dob", label: "Data urodzenia / Date of birth", type: "date" }
                ])}
                
                {/* Marriage information */}
                <div className="pt-6">
                  <h3 className="text-xl font-semibold mb-6 text-foreground">Marriage information / Dane małżeństwa</h3>
                  {renderFieldGroup([
                      { name: "place_of_marriage", label: "Miejsce zawarcia związku małżeńskiego / Place of marriage" },
                      { name: "date_of_marriage", label: "Data zawarcia związku małżeńskiego / Date of marriage", type: "date" }
                    ])}
                </div>
                
                {/* Maiden name - only for females */}
                {formData.applicant_sex === 'F' && renderFieldGroup([
                  { name: "applicant_maiden_name", label: "Nazwisko rodowe / Maiden name" }
                ])}
                
                {renderFieldGroup([
                  { name: "father_first_name", label: "Imię i nazwisko ojca / Father's full name" }
                ])}
                
                {renderFieldGroup([
                  { name: "mother_first_name", label: "Imię i nazwisko rodowe matki / Mother's full name" }
                ])}
                
                <div className="pt-6">
                  {renderTextarea("applicant_other_citizenships", "Posiadane obce obywatelstwa wraz z datą nabycia / Foreign citizenships with acquisition date", 3)}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Part I - Parents Data */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="px-4 py-6 md:p-10">
              <div 
                className="border-b border-border/50 pb-6 cursor-pointer"
              >
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary">
                  Dane osobowe rodziców / Parents Personal Data
                </h2>
              </div>
              <div className="space-y-10">
                {/* Mother */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-foreground border-b pb-2">Dane dotyczące matki / Mother's Data</h3>
                  {renderFieldGroup([
                    { name: "mother_last_name", label: "Nazwisko / Full last name" },
                    { name: "mother_maiden_name", label: "Nazwisko rodowe / Maiden name" },
                    { name: "mother_first_name", label: "Imię/ imiona / Given names" },
                    { name: "mother_dob", label: "Data urodzenia / Date of birth", type: "date" },
                    { name: "mother_pob", label: "Miejsce urodzenia / Place of birth" },
                  ])}
                </div>

                {/* Father */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-foreground border-b pb-2">Dane dotyczące ojca / Father's Data</h3>
                  {renderFieldGroup([
                    { name: "father_last_name", label: "Nazwisko / Full last name" },
                    { name: "father_first_name", label: "Imię/ imiona / Given names" },
                    { name: "father_dob", label: "Data urodzenia / Date of birth", type: "date" },
                    { name: "father_pob", label: "Miejsce urodzenia / Place of birth" },
                    { name: "father_mother_marriage_date", label: "Data zawarcia związku małżeńskiego / Date of marriage", type: "date" },
                    { name: "father_mother_marriage_place", label: "Miejsce zawarcia związku małżeńskiego / Place of marriage" },
                  ])}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Part I - Grandparents Data */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="px-4 py-6 md:p-10">
              <div 
                className="border-b border-border/50 pb-6 cursor-pointer"
              >
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary">
                  Dane osobowe dalszych wstępnych / Grandparents Data
                </h2>
              </div>
              <div className="space-y-10">
                {/* Maternal Grandfather */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-foreground border-b pb-2">Dziadek ze strony matki / Maternal Grandfather</h3>
                  {renderFieldGroup([
                    { name: "mgf_last_name", label: "Nazwisko / Full last name" },
                    { name: "mgf_first_name", label: "Imię/ imiona / Given names" },
                    { name: "mgf_dob", label: "Data urodzenia / Date of birth", type: "date" },
                    { name: "mgf_pob", label: "Miejsce urodzenia / Place of birth" },
                  ])}
                </div>

                {/* Maternal Grandmother */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-foreground border-b pb-2">Babka ze strony matki / Maternal Grandmother</h3>
                  {renderFieldGroup([
                    { name: "mgm_last_name", label: "Nazwisko / Full last name" },
                    { name: "mgm_maiden_name", label: "Nazwisko rodowe / Maiden name" },
                    { name: "mgm_first_name", label: "Imię/ imiona / Given names" },
                    { name: "mgm_dob", label: "Data urodzenia / Date of birth", type: "date" },
                    { name: "mgm_pob", label: "Miejsce urodzenia / Place of birth" },
                  ])}
                </div>

                {/* Paternal Grandfather */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-foreground border-b pb-2">Dziadek ze strony ojca / Paternal Grandfather</h3>
                  {renderFieldGroup([
                    { name: "pgf_last_name", label: "Nazwisko / Full last name" },
                    { name: "pgf_first_name", label: "Imię/ imiona / Given names" },
                    { name: "pgf_dob", label: "Data urodzenia / Date of birth", type: "date" },
                    { name: "pgf_pob", label: "Miejsce urodzenia / Place of birth" },
                  ])}
                </div>

                {/* Paternal Grandmother */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-foreground border-b pb-2">Babka ze strony ojca / Paternal Grandmother</h3>
                  {renderFieldGroup([
                    { name: "pgm_last_name", label: "Nazwisko / Full last name" },
                    { name: "pgm_maiden_name", label: "Nazwisko rodowe / Maiden name" },
                    { name: "pgm_first_name", label: "Imię/ imiona / Given names" },
                    { name: "pgm_dob", label: "Data urodzenia / Date of birth", type: "date" },
                    { name: "pgm_pob", label: "Miejsce urodzenia / Place of birth" },
                  ])}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Part II & III - Additional Information */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="px-4 py-6 md:p-10">
              <div 
                className="border-b border-border/50 pb-6 cursor-pointer"
              >
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary">
                  CZĘŚĆ II & III - Dodatkowe informacje / Additional Information
                </h2>
              </div>
              <div className="p-6 md:p-10 space-y-10">
                {renderTextarea("applicant_notes", "Życiorys osoby / Person's Biography", 6)}
                {renderTextarea("mother_notes", "Życiorys matki / Mother's Biography", 6)}
                {renderTextarea("father_notes", "Życiorys ojca / Father's Biography", 6)}
                {renderTextarea("mgf_notes", "Życiorys dziadka ze strony matki / Maternal Grandfather's Biography", 6)}
                {renderTextarea("mgm_notes", "Życiorys babki ze strony matki / Maternal Grandmother's Biography", 6)}
                {renderTextarea("pgf_notes", "Życiorys dziadka ze strony ojca / Paternal Grandfather's Biography", 6)}
                {renderTextarea("pgm_notes", "Życiorys babki ze strony ojca / Paternal Grandmother's Biography", 6)}
              </div>
            </div>
          </motion.div>
        </div>


        <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Clear Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all fields in the entire form. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={async () => { await handleClearAll(); setShowClearAllDialog(false); }}>
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
          documentTitle="Citizenship Application"
        />
      </div>
    </div>
  );
}