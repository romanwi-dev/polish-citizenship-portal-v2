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
import { usePOAAutoGeneration } from "@/hooks/usePOAAutoGeneration";
import { MaskedPassportInput } from "@/components/forms/MaskedPassportInput";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StickyActionBar from "@/components/StickyActionBar";
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

  // POA Auto-Generation Hook
  const { 
    generatePOAData, 
    hasData: hasIntakeData, 
    intakeData, 
    masterData
  } = usePOAAutoGeneration(caseId);

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
    console.log('[POA] Generate PDF clicked:', { templateType, caseId });
    
    if (!caseId || caseId === ':id' || caseId === 'demo-preview') {
      console.error('[POA] Cannot generate PDF - invalid caseId:', caseId);
      toast.error('PDF generation not available in demo mode');
      return;
    }

    setIsGenerating(true);
    setActivePOAType(templateType.replace('poa-', ''));
    try {
      // Auto-populate POA date if not set and save it
      let dateToUse = formData.poa_date_filed;
      if (!dateToUse) {
        const today = new Date();
        const formattedDate = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
        dateToUse = formattedDate;
        handleInputChange('poa_date_filed', formattedDate);
        
        // Save the date immediately to database
        await supabase
          .from('master_table')
          .update({ poa_date_filed: formattedDate })
          .eq('case_id', caseId);
      }
      
      // Save and wait for full completion
      console.log('[POA] Saving form data...');
      toast.info('Saving changes...');
      await handlePOASave();
      toast.success('Saved! Generating PDF...');

      console.log('[POA] Calling fill-pdf edge function with:', { caseId, templateType });
      
      // Generate PDF via direct fetch
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/fill-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caseId, templateType }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[POA] HTTP error:', response.status, errorText);
        throw new Error(`PDF generation failed: ${errorText}`);
      }

      const data = await response.json();
      console.log('[POA] Edge function response:', { data });

      if (!data?.url) {
        console.error('[POA] No URL in response:', data);
        toast.error(`PDF generation failed: ${JSON.stringify(data)}`);
        throw new Error('No URL returned from server');
      }

      console.log('[POA] Setting preview URL:', data.url);
      // Use signed URL for preview
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(data.url);
      setPreviewFormData(formData);
      
      console.log('[POA] PDF generated successfully, opening preview with URL:', data.url);
      toast.success(`${templateType.toUpperCase()} ready to preview!`);
    } catch (error: any) {
      console.error("[POA] PDF generation error:", error);
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

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/fill-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caseId, templateType: 'poa-adult' }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'PDF generation failed');
      }

      const data = await response.json();
      if (!data?.url) throw new Error('No URL returned from server');

      // Use signed URL for preview
      setPdfPreviewUrl(data.url);
      setPreviewFormData(updatedData);
      
      toast.success("PDF updated!");
    } catch (error: any) {
      console.error("Regeneration error:", error);
      toast.error(`Failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadEditable = () => {
    if (!pdfPreviewUrl) {
      toast.error('No PDF available to download');
      return;
    }
    const link = document.createElement("a");
    link.href = pdfPreviewUrl;
    link.download = `POA-${activePOAType.toUpperCase()}-EDITABLE-${caseId}.pdf`;
    link.click();
    toast.success('Editable PDF downloaded - you can fill fields offline!');
  };

  const handleDownloadFinal = async () => {
    if (!pdfPreviewUrl) {
      toast.error('No PDF available to download');
      return;
    }
    
    try {
      toast.loading('Generating final locked PDF...');
      
      // Call fill-pdf with flatten=true to create locked version
      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { 
          caseId, 
          templateType: `poa-${activePOAType}`,
          flatten: true 
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        const link = document.createElement("a");
        link.href = data.url;
        link.download = `POA-${activePOAType.toUpperCase()}-FINAL-${caseId}.pdf`;
        link.click();
        toast.dismiss();
        toast.success('Final PDF downloaded - fields are locked!');
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error('Failed to generate final PDF: ' + error.message);
    }
  };

  const handleGenerateAllPOAs = async () => {
    console.log('[POA] handleGenerateAllPOAs called, caseId:', caseId);
    
    if (!caseId || caseId === ':id' || caseId === 'demo-preview') {
      console.error('[POA] Blocked - invalid caseId:', caseId);
      toast.error('PDF generation not available in demo mode');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('[POA] Saving form data before PDF generation...');
      await handlePOASave();

      console.log('[POA] Generating PDF for:', activePOAType);
      
      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType: `poa-${activePOAType}` }
      });

      if (error) throw error;
      
      if (data?.url) {
        console.log('[POA] PDF generated successfully:', data.url);
        setPdfPreviewUrl(data.url);
        setPreviewFormData(formData);
        toast.success(`PDF generated! Stats: ${data.stats?.filled}/${data.stats?.total} fields filled`);
      } else {
        throw new Error('No PDF URL returned');
      }

    } catch (error: any) {
      console.error("[POA] PDF generation error:", error);
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
    <div className={cn("relative min-h-screen", isLargeFonts && "text-lg")}>
      <div className="relative z-10 pt-2 px-3 pb-3 md:p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="mb-1 md:mb-6"
        >
          <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text text-center leading-tight whitespace-nowrap">
            Power of Attorney
          </h2>
          <div className="flex items-center justify-center gap-1 md:gap-3 mt-2 md:mt-4">
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
          currentForm="poa"
          onSave={handlePOASave}
          onClear={() => setShowClearAllDialog(true)}
          onGeneratePDF={handleGenerateAllPOAs}
          isSaving={isSaving || isGenerating}
        />

        {/* POA Forms */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="space-y-6 md:space-y-12 pb-32">
          {/* Main Applicant - First Questions */}
          <div className="px-4 py-6 md:p-10">
            <div className="border-b border-border/50 pb-6 pt-6">
              <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Main Applicant
              </h2>
              <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
                First Questions
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2" onDoubleClick={() => handleInputChange("applicant_sex", null)}>
                  <Label className={isLargeFonts ? "text-2xl" : ""}>Gender</Label>
                  <Select value={formData?.applicant_sex || ""} onValueChange={(value) => handleInputChange("applicant_sex", value)}>
                    <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-2 z-50">
                      <SelectItem value="M" className="cursor-pointer">Male</SelectItem>
                      <SelectItem value="F" className="cursor-pointer">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2" onDoubleClick={() => handleInputChange("children_count", null)}>
                  <Label className={isLargeFonts ? "text-2xl" : ""}>Children</Label>
                  <Select value={formData?.children_count?.toString() || ""} onValueChange={(value) => handleInputChange("children_count", parseInt(value))}>
                    <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-2 z-50">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()} className="cursor-pointer">{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2" onDoubleClick={() => handleInputChange("applicant_is_married", null)}>
                  <Label className={isLargeFonts ? "text-2xl" : ""}>Marital status</Label>
                  <Select value={formData?.applicant_is_married === true ? "Married" : formData?.applicant_is_married === false ? "Single" : ""} onValueChange={(value) => handleInputChange("applicant_is_married", value === "Married")}>
                    <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-2 z-50">
                      <SelectItem value="Married" className="cursor-pointer">Married</SelectItem>
                      <SelectItem value="Single" className="cursor-pointer">Single</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Minor Children Count - only show if children_count > 0 */}
                {(formData?.children_count > 0) && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-2" onDoubleClick={() => handleInputChange("minor_children_count", null)}>
                    <Label className={isLargeFonts ? "text-2xl" : ""}>Minor children</Label>
                    <Select value={formData?.minor_children_count?.toString() || ""} onValueChange={(value) => handleInputChange("minor_children_count", parseInt(value))}>
                      <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        {Array.from({ length: (formData?.children_count || 0) + 1 }, (_, i) => i).map((num) => (
                          <SelectItem key={num} value={num.toString()} className="cursor-pointer">{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                  )}
              </div>
            </div>

          {/* POA Adult */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0 }} className="space-y-6">
            <div className="cursor-pointer select-none hover:opacity-80 transition-opacity border-b border-border/50 pb-6">
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-600 dark:text-gray-400">
                {poaFormConfigs.adult.title}
              </h2>
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
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0, duration: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="applicant_passport_number" className={cn(
                      "font-light text-foreground/90",
                      isLargeFonts ? "text-2xl" : "text-xl"
                    )}>
                      ID/ passport number
                    </Label>
                    <MaskedPassportInput
                      id="applicant_passport_number"
                      value={formData?.applicant_passport_number || ""}
                      onChange={(value) => handleInputChange("applicant_passport_number", value)}
                      isLargeFonts={isLargeFonts}
                      placeholder=""
                      colorScheme="poa"
                    />
                  </motion.div>
                </div>
                <div className="mt-10 flex justify-end">
                  <Button onClick={() => handleGenerateAndPreview('poa-adult')} disabled={isGenerating}
                    className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg shadow-glow hover-glow border border-white/30">
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
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0, duration: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="applicant_passport_number_minor" className={cn(
                      "font-light text-foreground/90",
                      isLargeFonts ? "text-2xl" : "text-xl"
                    )}>
                      Parent ID/ passport number
                    </Label>
                    <MaskedPassportInput
                      id="applicant_passport_number_minor"
                      value={formData?.applicant_passport_number || ""}
                      onChange={(value) => handleInputChange("applicant_passport_number", value)}
                      isLargeFonts={isLargeFonts}
                      placeholder=""
                      colorScheme="poa"
                    />
                  </motion.div>
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
                    className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg shadow-glow hover-glow border border-white/30">
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
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0, duration: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="applicant_passport_number_spouse" className={cn(
                      "font-light text-foreground/90",
                      isLargeFonts ? "text-2xl" : "text-xl"
                    )}>
                      {formData?.applicant_sex === 'F'
                        ? "Wife ID/passport number / Nr dokumentu tożsamości żony"
                        : "Husband ID/passport number / Nr dokumentu tożsamości męża"
                      }
                    </Label>
                    <MaskedPassportInput
                      id="applicant_passport_number_spouse"
                      value={formData?.applicant_passport_number || ""}
                      onChange={(value) => handleInputChange("applicant_passport_number", value)}
                      isLargeFonts={isLargeFonts}
                      placeholder=""
                      colorScheme="poa"
                    />
                  </motion.div>
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
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0, duration: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="spouse_passport_number" className={cn(
                      "font-light text-foreground/90",
                      isLargeFonts ? "text-2xl" : "text-xl"
                    )}>
                      {formData?.applicant_sex === 'F'
                        ? "Husband ID/passport number"
                        : "Wife ID/passport number"
                      }
                    </Label>
                    <MaskedPassportInput
                      id="spouse_passport_number"
                      value={formData?.spouse_passport_number || ""}
                      onChange={(value) => handleInputChange("spouse_passport_number", value)}
                      isLargeFonts={isLargeFonts}
                      placeholder=""
                      colorScheme="spouse"
                    />
                  </motion.div>
                </div>

                {/* Post-Marriage Last Names - separate fields for wife and husband */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <POAFormField
                    name="wife_last_name_after_marriage"
                    label="Wife's full last name after marriage / Nazwisko żony po zawarciu małżeństwa"
                    value={formData?.wife_last_name_after_marriage || ""}
                    onChange={(value) => handleInputChange("wife_last_name_after_marriage", value)}
                  />
                  <POAFormField
                    name="husband_last_name_after_marriage"
                    label="Husband's full last name after marriage / Nazwisko męża po zawarciu małżeństwa"
                    value={formData?.husband_last_name_after_marriage || ""}
                    onChange={(value) => handleInputChange("husband_last_name_after_marriage", value)}
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
                    className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg shadow-glow hover-glow border border-white/30">
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
        </motion.div>
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
        onDownloadEditable={handleDownloadEditable}
        onDownloadFinal={handleDownloadFinal}
        documentTitle={`POA - ${activePOAType.toUpperCase()}`}
      />
    </div>
  );
}
