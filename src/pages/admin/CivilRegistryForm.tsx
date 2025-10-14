import { useParams, useNavigate } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { sanitizeMasterData } from "@/utils/masterDataSanitizer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput } from "@/components/forms/FormInput";
import { FormHeader } from "@/components/forms/FormHeader";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useRef } from "react";
import { Sparkles, Type, ArrowLeft, Maximize2, Minimize2, User, Download } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DateField } from "@/components/DateField";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Textarea } from "@/components/ui/textarea";
import { useRealtimeFormSync } from "@/hooks/useRealtimeFormSync";
import { CountrySelect } from "@/components/CountrySelect";
import { FormButtonsRow } from "@/components/FormButtonsRow";
import { useFormManager } from "@/hooks/useFormManager";
import { 
  CIVIL_REGISTRY_FORM_REQUIRED_FIELDS,
  CIVIL_REGISTRY_DATE_FIELDS 
} from "@/config/formRequiredFields";

export default function CivilRegistryForm() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const { isLargeFonts, toggleFontSize } = useAccessibility();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isFullView, setIsFullView] = useState(true);
  
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
  const handleGeneratePDF = async () => {
    if (!caseId || caseId === ':id' || caseId === 'demo-preview') {
      toast.error('PDF generation not available in demo mode');
      return;
    }

    try {
      setIsGenerating(true);
      toast.loading("Generating Civil Registry Application PDF...");
      const {
        data,
        error
      } = await supabase.functions.invoke('fill-pdf', {
        body: {
          caseId,
          templateType: 'registration'
        }
      });
      if (error) throw error;
      const blob = new Blob([data], {
        type: 'application/pdf'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `civil-registry-${caseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success("Civil Registry Application PDF generated successfully!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearData = async () => {
    await handleClearAll();
    setShowClearDialog(false);
    toast.success('All form data cleared');
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
              </>}
          </motion.div>)}
      </div>;
  };
  if (caseId !== 'demo-preview' && (!caseId || caseId === ':id')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
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
    return <div className="flex items-center justify-center min-h-screen bg-background">
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
  return <div className="overflow-x-hidden min-h-screen relative">
      {/* Checkered grid background - matching footer */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container mx-auto py-12 px-4 md:px-6 relative z-10 max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text">
                Civil Registry
              </h1>
            </motion.div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => window.open('https://docs.lovable.dev', '_blank')}
                size="lg"
                variant="ghost"
                className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 text-2xl font-light opacity-60"
                title="How to fill this form"
              >
                ?
              </Button>
              <Button
                onClick={() => navigate(`/admin/case/${caseId}`)}
                size="lg"
                variant="ghost"
                className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 z-50 opacity-60"
                title="Back to Case"
              >
                <ArrowLeft className="h-8 w-8" />
              </Button>
              <Button
                onClick={() => setIsFullView(!isFullView)}
                size="lg"
                variant="ghost"
                className={`h-16 w-16 rounded-full transition-all hover:bg-primary/10 ${
                  isFullView ? 'bg-primary/20 text-primary opacity-100' : 'text-muted-foreground hover:text-primary opacity-60'
                }`}
                title={isFullView ? "Collapse to Tabs" : "Expand All Sections"}
              >
                {isFullView ? <Minimize2 className="h-8 w-8" /> : <Maximize2 className="h-8 w-8" />}
              </Button>
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                variant="ghost"
                className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 z-50 opacity-60"
                title="Login / Register"
              >
                <User className="h-8 w-8" />
              </Button>
              <Button
                onClick={toggleFontSize}
                size="lg"
                variant="ghost"
                className={`h-16 w-16 rounded-full transition-all hover:bg-primary/10 z-50 opacity-60 ${
                  isLargeFonts ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-primary'
                }`}
                title="Toggle font size"
              >
                <Type className="h-8 w-8" />
              </Button>
            </div>
          </div>
        </motion.div>

        <FormButtonsRow 
          caseId={caseId!}
          currentForm="civil-registry"
          onSave={handleSave}
          onClear={() => setShowClearDialog(true)}
          onGeneratePDF={handleGeneratePDF}
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
            <div>
              <div className="border-b border-emerald-200/20 pb-6">
                <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 bg-clip-text text-transparent">
                  Applicant Information / Dane wnioskodawcy
                </h2>
              </div>
              <div className="p-6 md:p-10 space-y-10">
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
              
                {renderFieldGroup([{
                name: "applicant_maiden_name",
                label: "Maiden name / Nazwisko rodowe"
              }, {
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
            <div>
              <div className="border-b border-border/50 pb-6">
                <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Document to Register / Dokument do rejestracji
                </h2>
              </div>
              <div className="p-6 md:p-10 space-y-10">
                {renderFieldGroup([
                  {
                    name: "document_type",
                    label: "Document Type / Typ dokumentu (Birth/Marriage/Death)"
                  },
                  {
                    name: "document_issue_place",
                    label: "Place where document was issued / Miejsce sporządzenia aktu"
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
                  />
                </div>

                <div className="pt-8">
                  <h3 className={cn("font-semibold mb-6 text-foreground", isLargeFonts ? "text-2xl" : "text-xl")}>Required Documents Checklist / Lista wymaganych dokumentów</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: 0 }}
                      className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow"
                    >
                      <Checkbox
                        id="has_original_foreign_act"
                        checked={formData?.has_original_foreign_act || false}
                        onCheckedChange={(checked) => handleInputChange("has_original_foreign_act", checked)}
                        className="h-6 w-6"
                      />
                      <Label htmlFor="has_original_foreign_act" className="cursor-pointer text-sm font-normal">
                        Original foreign civil act / Oryginał aktu zagranicznego
                      </Label>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: 0.05 }}
                      className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow"
                    >
                      <Checkbox
                        id="has_sworn_translation"
                        checked={formData?.has_sworn_translation || false}
                        onCheckedChange={(checked) => handleInputChange("has_sworn_translation", checked)}
                        className="h-6 w-6"
                      />
                      <Label htmlFor="has_sworn_translation" className="cursor-pointer text-sm font-normal">
                        Sworn translation into Polish / Tłumaczenie przysięgłe na język polski
                      </Label>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: 0.1 }}
                      className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow"
                    >
                      <Checkbox
                        id="has_tax_payment"
                        checked={formData?.has_tax_payment || false}
                        onCheckedChange={(checked) => handleInputChange("has_tax_payment", checked)}
                        className="h-6 w-6"
                      />
                      <Label htmlFor="has_tax_payment" className="cursor-pointer text-sm font-normal">
                        Proof of Tax Payment (50 PLN) / Dowód uiszczenia opłaty skarbowej
                      </Label>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: 0.15 }}
                      className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow"
                    >
                      <Checkbox
                        id="has_power_of_attorney"
                        checked={formData?.has_power_of_attorney || false}
                        onCheckedChange={(checked) => handleInputChange("has_power_of_attorney", checked)}
                        className="h-6 w-6"
                      />
                      <Label htmlFor="has_power_of_attorney" className="cursor-pointer text-sm font-normal">
                        Power of Attorney / Pełnomocnictwo (notarized or consular)
                      </Label>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: 0.2 }}
                      className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow"
                    >
                      <Checkbox
                        id="has_passport_copy"
                        checked={formData?.has_passport_copy || false}
                        onCheckedChange={(checked) => handleInputChange("has_passport_copy", checked)}
                        className="h-6 w-6"
                      />
                      <Label htmlFor="has_passport_copy" className="cursor-pointer text-sm font-normal">
                        Valid Passport Copy / Kopia paszportu
                      </Label>
                    </motion.div>
                  </div>
                </div>

                <div className="rounded-lg p-6 border-2 border-primary/20">
                  <h3 className={cn("font-semibold mb-6 text-foreground", isLargeFonts ? "text-3xl" : "text-2xl")}>Additional notes / Dodatkowe informacje</h3>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="civil_registry_notes" className={isLargeFonts ? "text-2xl" : ""}>
                      Notes / Uwagi
                    </Label>
                    <Textarea
                      id="civil_registry_notes"
                      value={formData.civil_registry_notes || ""}
                      onChange={(e) => handleInputChange("civil_registry_notes", e.target.value.toUpperCase())}
                      placeholder=""
                      className={cn(
                        "min-h-32 border-emerald-300/10 dark:border-emerald-500/10 hover-glow focus:shadow-lg transition-all uppercase",
                        isLargeFonts ? "text-lg" : "text-base"
                      )}
                    />
                  </motion.div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Generate PDF Button at Bottom */}
      <div className="mt-12 flex justify-center">
        <Button
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          size="lg"
          className="px-16 py-8 text-2xl md:text-3xl font-heading font-black bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] min-w-[300px] md:min-w-[400px]"
        >
          <span className="text-blue-100 font-heading font-black">{isGenerating ? "Generating..." : "Generate PDF"}</span>
        </Button>
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

    </div>;
}