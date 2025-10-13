import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Loader2, Save, Download, FileText, Sparkles, Type, User, ArrowLeft, HelpCircle, Maximize2, Minimize2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { POAFormField } from "@/components/POAFormField";
import { poaFormConfigs } from "@/config/poaFormConfig";
import { DateField } from "@/components/DateField";
import { useLongPressWithFeedback } from "@/hooks/useLongPressWithFeedback";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { PDFPreviewDialog } from "@/components/PDFPreviewDialog";
import { sanitizeMasterData } from "@/utils/masterDataSanitizer";
import { cn } from "@/lib/utils";
import { FormButtonsRow } from "@/components/FormButtonsRow";
import { useFormManager } from "@/hooks/useFormManager";
import {
  POA_FORM_REQUIRED_FIELDS,
  POA_DATE_FIELDS
} from "@/config/formRequiredFields";

export default function POAForm() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const { isLargeFonts, toggleFontSize } = useAccessibility();
  const latestFormData = useRef<any>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [activePOAType, setActivePOAType] = useState('adult');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [previewFormData, setPreviewFormData] = useState<any>(null);
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
    POA_FORM_REQUIRED_FIELDS,
    POA_DATE_FIELDS
  );

  // Calculate if there are minor children (under 18)
  const hasMinorChildren = () => {
    const today = new Date();
    for (let i = 1; i <= 10; i++) {
      const childDob = formData[`child_${i}_dob`];
      if (childDob) {
        const dob = new Date(childDob);
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          if (age - 1 < 18) return true;
        } else if (age < 18) {
          return true;
        }
      }
    }
    return false;
  };

  const showSpousePOA = formData.applicant_is_married === true;
  const minorChildrenCount = formData.minor_children_count || 0;

  // Custom save handler for POA (includes latest formData ref for PDF generation)
  const handlePOASave = async () => {
    if (!caseId) return false;
    latestFormData.current = formData;
    return await handleSave();
  };

  const handleGenerateAndPreview = async (templateType: 'poa-adult' | 'poa-minor' | 'poa-spouses') => {
    if (!caseId || caseId === ':id') {
      toast.error('Invalid case ID');
      return;
    }

    setIsGenerating(true);
    setActivePOAType(templateType.replace('poa-', ''));
    try {
      // Save and wait for full completion
      toast.info('Saving changes...');
      await handlePOASave();
      toast.success('Saved! Generating PDF...');

      // Generate PDF - it will fetch fresh data from DB
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fill-pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ caseId, templateType }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Edge function error:", errorText);
        throw new Error(`PDF generation failed: ${errorText}`);
      }

      // Get the PDF as a blob
      const blob = await response.blob();
      // Revoke old URL to prevent memory leaks
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
      const url = URL.createObjectURL(blob);
      
      setPdfPreviewUrl(url);
      setPreviewFormData(formData);
      
      toast.success(`${templateType.toUpperCase()} ready to print!`);
    } catch (error: any) {
      console.error("PDF generation error:", error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegeneratePDF = async (updatedData: any) => {
    if (!caseId) return;

    setIsGenerating(true);
    try {
      // Sanitize before saving
      const sanitizedData = sanitizeMasterData(updatedData);
      
      await supabase.from("master_table").update(sanitizedData).eq("case_id", caseId);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fill-pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ caseId, templateType: 'poa-adult' }),
        }
      );

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      setPdfPreviewUrl(url);
      setPreviewFormData(updatedData);
      
      toast.success("PDF updated!");
    } catch (error: any) {
      console.error("Regeneration error:", error);
      toast.error(`Failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!pdfPreviewUrl) return;
    const link = document.createElement("a");
    link.href = pdfPreviewUrl;
    link.download = `POA-Adult-${caseId}.pdf`;
    link.click();
  };

  const handleGenerateAllPOAs = async () => {
    if (!caseId || caseId === ':id') {
      toast.error('Invalid case ID');
      return;
    }

    setIsGenerating(true);
    try {
      await handlePOASave();

      const templates: Array<'poa-adult' | 'poa-minor' | 'poa-spouses'> = ['poa-adult'];
      if (hasMinorChildren() && minorChildrenCount > 0) templates.push('poa-minor');
      if (showSpousePOA) templates.push('poa-spouses');

      for (const templateType of templates) {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fill-pdf`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ caseId, templateType }),
          }
        );

        if (!response.ok) throw new Error('PDF generation failed');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `POA-${templateType.replace('poa-', '').toUpperCase()}-${caseId}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      }

      toast.success(`Generated ${templates.length} POA document(s)!`);
    } catch (error: any) {
      console.error("PDF generation error:", error);
      toast.error(`Failed to generate PDFs: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };


  if (isLoading) {
    return <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 relative z-10 max-w-7xl">
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
                Power of Attorney
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
                className={`h-16 w-16 rounded-full transition-all hover:bg-primary/10 opacity-60 ${
                  isFullView ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-primary'
                }`}
                title={isFullView ? "Collapse" : "Expand All"}
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
              <Button onClick={toggleFontSize} size="lg" variant="ghost"
                className={`h-16 w-16 rounded-full transition-all hover:bg-primary/10 z-50 opacity-60 ${isLargeFonts ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-primary'}`} title="Toggle font size">
                <Type className="h-8 w-8" />
              </Button>
            </div>
          </div>
        </motion.div>

        <FormButtonsRow 
          caseId={caseId!}
          currentForm="poa"
          onSave={handlePOASave}
          onClear={() => setShowClearAllDialog(true)}
          onGeneratePDF={handleGenerateAllPOAs}
          isSaving={isSaving || isGenerating}
        />

        {/* POA Forms */}
        <div className="space-y-8">
          {/* POA Adult */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0 }} className="space-y-6">
            <div className="cursor-pointer select-none hover:opacity-80 transition-opacity border-b border-border/50 pb-6">
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-600 dark:text-gray-400">
                {poaFormConfigs.adult.title}
              </h2>
            </div>
                {/* Row 1: Gender and Civil Status */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Gender */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
                    <Label className={isLargeFonts ? "text-2xl" : ""}>
                      Gender
                    </Label>
                    <Select 
                      value={formData.applicant_sex === 'M' ? 'Male' : formData.applicant_sex === 'F' ? 'Female' : ''} 
                      onValueChange={(value) => handleInputChange("applicant_sex", value === 'Male' ? 'M' : 'F')}
                    >
                      <SelectTrigger className="h-10 text-2xl border hover:border-transparent focus:border-transparent hover-glow focus:shadow-lg transition-all bg-gray-200/45 dark:bg-gray-700/45 border-gray-300/30 dark:border-gray-500/30 backdrop-blur normal-case" style={{ boxShadow: '0 0 30px rgba(156,163,175,0.25)' }}>
                        <SelectValue placeholder="Select..." className="text-xs opacity-50 normal-case" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        <SelectItem value="Male" className="text-base cursor-pointer normal-case">Male</SelectItem>
                        <SelectItem value="Female" className="text-base cursor-pointer normal-case">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Civil Status */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2">
                    <Label className={isLargeFonts ? "text-2xl" : ""}>
                      Civil Status
                    </Label>
                    <Select value={formData.applicant_is_married === true ? "Married" : "Single"} onValueChange={(value) => handleInputChange("applicant_is_married", value === "Married")}>
                      <SelectTrigger className="h-10 text-2xl border hover:border-transparent focus:border-transparent hover-glow focus:shadow-lg transition-all bg-gray-200/45 dark:bg-gray-700/45 border-gray-300/30 dark:border-gray-500/30 backdrop-blur normal-case" style={{ boxShadow: '0 0 30px rgba(156,163,175,0.25)' }}>
                        <SelectValue placeholder="Select..." className="text-xs opacity-50 normal-case" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        <SelectItem value="Married" className="text-base cursor-pointer normal-case">Married</SelectItem>
                        <SelectItem value="Single" className="text-base cursor-pointer normal-case">Single</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                </div>


                {/* Row 2: Children counts */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Number of children */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
                    <Label className={isLargeFonts ? "text-2xl" : ""}>
                      Children
                    </Label>
                    <Select value={formData.children_count?.toString() || ""} onValueChange={(value) => { const count = parseInt(value); handleInputChange("children_count", count); }}>
                      <SelectTrigger className="h-10 text-2xl border hover:border-transparent focus:border-transparent hover-glow focus:shadow-lg transition-all bg-gray-200/45 dark:bg-gray-700/45 border-gray-300/30 dark:border-gray-500/30 backdrop-blur z-50 normal-case" style={{ boxShadow: '0 0 30px rgba(156,163,175,0.25)' }}>
                        <SelectValue placeholder="Select..." className="text-xs opacity-50 normal-case" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (<SelectItem key={num} value={num.toString()} className="text-base cursor-pointer normal-case">{num}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Number of minor children - only show if children_count > 0 */}
                  {(formData.children_count > 0) && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-2">
                      <Label className={isLargeFonts ? "text-2xl" : ""}>
                        Minor children
                      </Label>
                      <Select value={formData.minor_children_count?.toString() || ""} onValueChange={(value) => handleInputChange("minor_children_count", parseInt(value))}>
                        <SelectTrigger className="h-10 text-2xl border hover:border-transparent focus:border-transparent hover-glow focus:shadow-lg transition-all bg-gray-200/45 dark:bg-gray-700/45 border-gray-300/30 dark:border-gray-500/30 backdrop-blur normal-case" style={{ boxShadow: '0 0 30px rgba(156,163,175,0.25)' }}>
                          <SelectValue placeholder="Select..." className="text-xs opacity-50 normal-case" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-2 z-50">
                          {Array.from({ length: (formData.children_count || 0) + 1 }, (_, i) => i).map((num) => (<SelectItem key={num} value={num.toString()} className="text-base cursor-pointer normal-case">{num}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <POAFormField
                    name="applicant_first_name"
                    label="Applicant given names"
                    value={formData?.applicant_first_name || ""}
                    onChange={(value) => handleInputChange("applicant_first_name", value)}
                  />
                  <POAFormField
                    name="applicant_last_name"
                    label="Applicant full last name"
                    value={formData?.applicant_last_name || ""}
                    onChange={(value) => handleInputChange("applicant_last_name", value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6">
                  <POAFormField
                    name="applicant_passport_number"
                    label="ID/ passport number"
                    value={formData?.applicant_passport_number || ""}
                    onChange={(value) => handleInputChange("applicant_passport_number", value)}
                  />
                </div>
                <div className="mt-10 flex justify-end">
                  <Button onClick={() => handleGenerateAndPreview('poa-adult')} disabled={isGenerating}
                    className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30">
                    {isGenerating && activePOAType === 'adult' ? (
                      <><Loader2 className="h-4 md:h-5 w-4 md:w-5 animate-spin mr-2 opacity-50" />
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Generating...</span></>
                    ) : (
                      <><FileText className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Generate POA</span></>
                    )}
                  </Button>
                </div>
          </motion.div>

          {/* POA Minor - Show as many forms as minor children count */}
          {Array.from({ length: minorChildrenCount }, (_, index) => (
            <motion.div 
              key={`minor-${index}`}
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.5, delay: 0.1 + (index * 0.1) }}
              className="space-y-6"
            >
              <div className="cursor-pointer select-none hover:opacity-80 transition-opacity border-b border-border/50 pb-6">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-600 dark:text-gray-400">
                  {poaFormConfigs.minor.title} {minorChildrenCount > 1 ? `- Child ${index + 1}` : ''}
                </h2>
              </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <POAFormField
                    name="applicant_first_name"
                    label="Parent given names"
                    value={formData?.applicant_first_name || ""}
                    onChange={(value) => handleInputChange("applicant_first_name", value)}
                  />
                  <POAFormField
                    name="applicant_last_name"
                    label="Parent full last name"
                    value={formData?.applicant_last_name || ""}
                    onChange={(value) => handleInputChange("applicant_last_name", value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <POAFormField
                    name="applicant_passport_number"
                    label="Parent ID/ passport number"
                    value={formData?.applicant_passport_number || ""}
                    onChange={(value) => handleInputChange("applicant_passport_number", value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <POAFormField
                    name={`child_${index + 1}_first_name`}
                    label="Child given names"
                    value={formData?.[`child_${index + 1}_first_name`] || ""}
                    onChange={(value) => handleInputChange(`child_${index + 1}_first_name`, value)}
                  />
                  <POAFormField
                    name={`child_${index + 1}_last_name`}
                    label="Child full last name"
                    value={formData?.[`child_${index + 1}_last_name`] || ""}
                    onChange={(value) => handleInputChange(`child_${index + 1}_last_name`, value)}
                  />
                </div>
                <div className="mt-10 flex justify-end">
                  <Button onClick={() => handleGenerateAndPreview('poa-minor')} disabled={isGenerating}
                    className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30">
                    {isGenerating && activePOAType === 'minor' ? (
                      <><Loader2 className="h-4 md:h-5 w-4 md:w-5 animate-spin mr-2 opacity-50" />
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Generating...</span></>
                    ) : (
                      <><FileText className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Generate POA</span></>
                    )}
                  </Button>
                </div>
          </motion.div>
          ))}

          {/* POA Spouses - Only show if married */}
          {showSpousePOA && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-6">
              <div className="cursor-pointer select-none hover:opacity-80 transition-opacity border-b border-border/50 pb-6">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-600 dark:text-gray-400">
                  {poaFormConfigs.spouses.title}
                </h2>
              </div>
                {/* Primary Applicant Fields - labels based on master_table applicant_sex */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <POAFormField
                    name="applicant_first_name"
                    label={formData?.applicant_sex === 'F'
                      ? "Wife given names / Imię/ imiona żony"
                      : "Husband given names / Imię/ imiona męża"
                    }
                    value={formData?.applicant_first_name || ""}
                    onChange={(value) => handleInputChange("applicant_first_name", value)}
                  />
                  <POAFormField
                    name="applicant_last_name"
                    label={formData?.applicant_sex === 'F'
                      ? "Wife full last name / Nazwisko żony"
                      : "Husband full last name / Nazwisko męża"
                    }
                    value={formData?.applicant_last_name || ""}
                    onChange={(value) => handleInputChange("applicant_last_name", value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <POAFormField
                    name="applicant_passport_number"
                    label={formData?.applicant_sex === 'F'
                      ? "Wife ID/passport number / Nr dokumentu tożsamości żony"
                      : "Husband ID/passport number / Nr dokumentu tożsamości męża"
                    }
                    value={formData?.applicant_passport_number || ""}
                    onChange={(value) => handleInputChange("applicant_passport_number", value)}
                  />
                </div>

                {/* Spouse Fields - labels swap based on primary applicant */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <POAFormField
                    name="spouse_first_name"
                    label={formData?.applicant_sex === 'F'
                      ? "Husband given names"
                      : "Wife given names"
                    }
                    value={formData?.spouse_first_name || ""}
                    onChange={(value) => handleInputChange("spouse_first_name", value)}
                  />
                  <POAFormField
                    name="spouse_last_name"
                    label={formData?.applicant_sex === 'F'
                      ? "Husband full last name"
                      : "Wife full last name"
                    }
                    value={formData?.spouse_last_name || ""}
                    onChange={(value) => handleInputChange("spouse_last_name", value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <POAFormField
                    name="spouse_passport_number"
                    label={formData?.applicant_sex === 'F'
                      ? "Husband ID/passport number"
                      : "Wife ID/passport number"
                    }
                    value={formData?.spouse_passport_number || ""}
                    onChange={(value) => handleInputChange("spouse_passport_number", value)}
                  />
                </div>

                {/* Marriage Names - Show wife's name after marriage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <POAFormField
                    name={formData?.applicant_sex === 'F' ? "applicant_last_name" : "spouse_last_name"}
                    label="Wife's full last name after marriage / Nazwisko żony po zawarciu małżeństwa"
                    value={formData?.applicant_sex === 'F' ? (formData?.applicant_last_name || "") : (formData?.spouse_last_name || "")}
                    onChange={(value) => handleInputChange(formData?.applicant_sex === 'F' ? "applicant_last_name" : "spouse_last_name", value)}
                  />
                  <POAFormField
                    name={formData?.applicant_sex === 'M' ? "applicant_last_name" : "spouse_last_name"}
                    label="Husband's full last name after marriage / Nazwisko męża po zawarciu małżeństwa"
                    value={formData?.applicant_sex === 'M' ? (formData?.applicant_last_name || "") : (formData?.spouse_last_name || "")}
                    onChange={(value) => handleInputChange(formData?.applicant_sex === 'M' ? "applicant_last_name" : "spouse_last_name", value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <POAFormField
                    name="child_1_last_name"
                    label="Children's full last name(s)"
                    value={formData?.child_1_last_name || ""}
                    onChange={(value) => handleInputChange("child_1_last_name", value)}
                  />
                </div>
                <div className="mt-10 flex justify-end">
                  <Button onClick={() => handleGenerateAndPreview('poa-spouses')} disabled={isGenerating}
                    className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30">
                    {isGenerating && activePOAType === 'spouses' ? (
                      <><Loader2 className="h-4 md:h-5 w-4 md:w-5 animate-spin mr-2 opacity-50" />
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Generating...</span></>
                    ) : (
                      <><FileText className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Generate POA</span></>
                    )}
                  </Button>
                </div>
          </motion.div>
          )}
        </div>
      </div>

      <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all form fields (except dates). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await handleClearAll(); setShowClearAllDialog(false); }}>Clear Data</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PDFPreviewDialog
        open={!!pdfPreviewUrl}
        onClose={() => setPdfPreviewUrl(null)}
        pdfUrl={pdfPreviewUrl || ""}
        formData={previewFormData}
        onRegeneratePDF={handleRegeneratePDF}
        onDownloadEditable={handleDownloadPDF}
        onDownloadFinal={() => {
          // For POAForm, we only have editable download - final can be same
          handleDownloadPDF();
        }}
        documentTitle="POA Adult"
      />
    </div>
  );
}
