import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Loader2, Sparkles, Type, User, ArrowLeft, Maximize2, Minimize2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DateField } from "@/components/DateField";
import { FormInput } from "@/components/forms/FormInput";
import { useLongPressWithFeedback } from "@/hooks/useLongPressWithFeedback";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { FormButtonsRow } from "@/components/FormButtonsRow";
import { useFormManager } from "@/hooks/useFormManager";
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


  const handleGeneratePDF = async () => {
    if (!caseId || caseId === ':id' || caseId === 'demo-preview') {
      toast.error('PDF generation not available in demo mode');
      return;
    }

    try {
      setIsGenerating(true);
      toast.loading("Generating Citizenship Application PDF...");

      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType: 'citizenship' },
      });

      if (error) throw error;

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `citizenship-application-${caseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Citizenship Application PDF generated successfully!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
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
                  isLargeFonts ? "text-xl" : "text-sm"
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
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
    <div className="overflow-x-hidden min-h-screen relative">
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
                Citizenship Application
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
          currentForm="citizenship"
          onSave={handleSave}
          onClear={() => setShowClearAllDialog(true)}
          onGeneratePDF={handleGeneratePDF}
          isSaving={isSaving}
        />

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Part I - Person Data */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <div className="border-b border-border/50 pb-6">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary">
                  CZĘŚĆ I - Dane osoby, której dotyczy wniosek
                </h2>
              </div>
              <div className="p-6 md:p-10 space-y-10">
                {/* Row 1: Gender and Civil Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gender */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
                    <Label className={isLargeFonts ? "text-2xl" : ""}>
                      Gender
                    </Label>
                    <Select value={formData.applicant_sex || ""} onValueChange={(value) => handleInputChange("applicant_sex", value)}>
                      <SelectTrigger 
                        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur"
                        style={{
                          boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                        }}
                      >
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        <SelectItem value="M" className="text-base cursor-pointer">Male / Mężczyzna</SelectItem>
                        <SelectItem value="F" className="text-base cursor-pointer">Female / Kobieta</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Civil Status */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2">
                    <Label className={isLargeFonts ? "text-2xl" : ""}>
                      Civil Status
                    </Label>
                    <Select value={formData.applicant_is_married === true ? "Married" : "Single"} onValueChange={(value) => handleInputChange("applicant_is_married", value === "Married")}>
                      <SelectTrigger 
                        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur"
                        style={{
                          boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                        }}
                      >
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        <SelectItem value="Married" className="text-base cursor-pointer">Married</SelectItem>
                        <SelectItem value="Single" className="text-base cursor-pointer">Single</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                </div>

                {/* Row 2: Children counts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Number of children */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
                    <Label className={isLargeFonts ? "text-2xl" : ""}>
                      Number of children
                    </Label>
                    <Select value={formData.children_count?.toString() || ""} onValueChange={(value) => { const count = parseInt(value); handleInputChange("children_count", count); }}>
                      <SelectTrigger 
                        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur z-50"
                        style={{
                          boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                        }}
                      >
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (<SelectItem key={num} value={num.toString()} className="text-base cursor-pointer">{num}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Number of minor children - only show if children_count > 0 */}
                  {(formData.children_count > 0) && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-2">
                      <Label className={isLargeFonts ? "text-2xl" : ""}>
                        Number of minor children
                      </Label>
                      <Select value={formData.minor_children_count?.toString() || ""} onValueChange={(value) => handleInputChange("minor_children_count", parseInt(value))}>
                        <SelectTrigger 
                          className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur"
                          style={{
                            boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                          }}
                        >
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-2 z-50">
                          {Array.from({ length: (formData.children_count || 0) + 1 }, (_, i) => i).map((num) => (<SelectItem key={num} value={num.toString()} className="text-base cursor-pointer">{num}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </div>

                {renderFieldGroup([
                  { name: "applicant_first_name", label: "Imię/ imiona / Given names" },
                  { name: "applicant_last_name", label: "Nazwisko / Full last name" }
                ])}
                
                {renderFieldGroup([
                  { name: "applicant_pob", label: "Miejsce urodzenia / Place of birth" },
                  { name: "applicant_dob", label: "Data urodzenia / Date of birth", type: "date" }
                ])}
                
                {/* Marriage information - Only show if married */}
                {formData.applicant_is_married && (
                  <div className="pt-6">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Marriage information / Dane małżeństwa</h3>
                    {renderFieldGroup([
                      { name: "place_of_marriage", label: "Miejsce zawarcia związku małżeńskiego / Place of marriage" },
                      { name: "date_of_marriage", label: "Data zawarcia związku małżeńskiego / Date of marriage", type: "date" }
                    ])}
                  </div>
                )}
                
                {renderFieldGroup([
                  { name: "applicant_maiden_name", label: "Nazwisko rodowe / Maiden name" },
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
            <div>
              <div 
                className="border-b border-border/50 pb-6 cursor-pointer"
              >
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary">
                  Dane osobowe rodziców / Parents Personal Data
                </h2>
              </div>
              <div className="p-6 md:p-10 space-y-10">
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
            <div>
              <div 
                className="border-b border-border/50 pb-6 cursor-pointer"
              >
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary">
                  Dane osobowe dalszych wstępnych / Grandparents Data
                </h2>
              </div>
              <div className="p-6 md:p-10 space-y-10">
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
            <div>
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

        {/* Generate PDF Button at Bottom */}
        <div className="mt-12 flex justify-center">
          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            size="lg"
            className="px-16 py-8 text-2xl md:text-3xl font-bold bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] min-w-[300px] md:min-w-[400px]"
          >
            <span className="text-blue-100 font-bold">{isGenerating ? "Generating..." : "Generate PDF"}</span>
          </Button>
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
      </div>

    </div>
  );
}