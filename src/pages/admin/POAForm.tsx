import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useRef, lazy, Suspense, useEffect } from "react";
import { Loader2, Save, Download, FileText, Sparkles, Type, User, ArrowLeft, HelpCircle, Maximize2, Minimize2, Users, Baby, Heart } from "lucide-react";
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
import { StaticHeritagePlaceholder } from "@/components/heroes/StaticHeritagePlaceholder";

const StaticHeritage = lazy(() => import("@/components/heroes/StaticHeritage").then(m => ({ default: m.StaticHeritage })));
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string>("");
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [activePOAType, setActivePOAType] = useState('adult');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [previewFormData, setPreviewFormData] = useState<any>(null);
  const [isFullView, setIsFullView] = useState(true);
  
  // ⚠️ LOCKED DESIGN - DO NOT MODIFY CONDITIONAL RENDERING LOGIC
  // Conditional rendering controlled by 4 master fields:
  // 1. applicant_sex (M/F)
  // 2. applicant_is_married (boolean)
  // 3. children_count (0-10) - selected manually in IntakeFormContent
  // 4. minor_children_count (0 to children_count) - selected manually in IntakeFormContent
  
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

  const showSpousePOA = formData.applicant_marital_status === "Married";
  const minorChildrenCount = formData.minor_children_count || 0;

  // Auto-populate POA date with current date in DD.MM.YYYY format
  useEffect(() => {
    if (!formData.poa_date_filed) {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const dateString = `${day}.${month}.${year}`;
      
      handleInputChange('poa_date_filed', dateString);
    }
  }, [formData.poa_date_filed]);


  // Custom save handler for POA (includes latest formData ref for PDF generation)
  const handlePOASave = async () => {
    if (!caseId) return false;
    latestFormData.current = formData;
    return await handleSave();
  };

  const handleGenerateAndPreview = (url: string) => {
    // Set the URL and open preview dialog
    setPdfPreviewUrl(url);
    setPreviewFormData(formData);
  };

  const handleRegeneratePDF = async (updatedData: any) => {
    if (!caseId) return;

    setIsGenerating(true);
    try {
      // Sanitize before saving
      const sanitizedData = sanitizeMasterData(updatedData);
      
      await supabase.from("master_table").update(sanitizedData).eq("case_id", caseId);

      // Use async queue system
      const { generatePdf } = await import('@/lib/generate-pdf');
      await generatePdf({
        supabase,
        caseId,
        templateType: 'poa-adult',
        toast: {
          loading: (msg: string) => toast.info(msg),
          dismiss: () => {},
          success: (msg: string) => toast.success(msg),
          error: (msg: string) => toast.error(msg),
        },
        setIsGenerating,
        filename: `poa-adult-${caseId}.pdf`
      });
    } catch (error: any) {
      console.error("Regeneration error:", error);
      toast.error(`Failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadEditable = async () => {
    if (!pdfPreviewUrl) {
      toast.error('No PDF available to download');
      return;
    }
    
    const link = document.createElement("a");
    link.href = pdfPreviewUrl;
    link.download = `POA-${activePOAType.toUpperCase()}-EDITABLE-${caseId}.pdf`;
    link.click();
    
    toast.success('Editable PDF downloaded');
  };

  const handleDownloadFinal = async () => {
    if (!pdfPreviewUrl) {
      toast.error('No PDF available to download');
      return;
    }
    
    try {
      toast.loading('Locking PDF for printing...');
      
      // Call lock-pdf edge function to flatten the PDF
      const { data, error } = await supabase.functions.invoke('lock-pdf', {
        body: { pdfUrl: pdfPreviewUrl }
      });

      if (error || !data?.url) {
        throw new Error('Failed to create final PDF');
      }
      
      // Download the locked PDF
      const link = document.createElement("a");
      link.href = data.url;
      link.download = `POA-${activePOAType.toUpperCase()}-FINAL-${caseId}.pdf`;
      link.click();
      
      toast.dismiss();
      toast.success('Final PDF downloaded (locked for printing)');
    } catch (error: any) {
      toast.dismiss();
      toast.error('Failed to generate final PDF: ' + error.message);
    }
  };

  const handleGenerateAllPOAs = async () => {
    try {
      setIsGenerating(true);
      toast.loading("Generating all POAs...");

      const isMarried = formData?.applicant_marital_status === 'Married';
      const minorCount = parseInt(formData?.minor_children_count || '0');

      const poaTypes: Array<{ type: string; label: string }> = [
        { type: 'poa-adult', label: 'POA Adult' }
      ];
      
      // Add minor POAs
      for (let i = 1; i <= minorCount; i++) {
        poaTypes.push({ 
          type: 'poa-minor', 
          label: `POA Minor ${i}`
        });
      }
      
      if (isMarried) {
        poaTypes.push({ type: 'poa-spouses', label: 'POA Spouses' });
      }

      console.log('[POA] Generating all POAs:', poaTypes.map(p => p.label));

      // Generate all PDFs using pdf-simple
      const { generateSimplePDF } = await import('@/lib/pdf-simple');
      
      const results = await Promise.allSettled(
        poaTypes.map(async ({ type, label }) => {
          const url = await generateSimplePDF({
            caseId: caseId!,
            templateType: type,
            toast: {
              loading: () => {},
              dismiss: () => {},
              success: () => {},
              error: (msg: string) => console.error(`[${label}] Error:`, msg)
            },
            setIsGenerating: () => {}
          });
          
          return { label, url, success: !!url };
        })
      );

      const successful = results
        .map((r, idx) => r.status === 'fulfilled' ? r.value : null)
        .filter(r => r?.success);
      
      const failed = results
        .map((r, idx) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success) ? poaTypes[idx].label : null)
        .filter(Boolean);

      toast.dismiss();

      if (successful.length > 0) {
        const labels = successful.map(p => p.label).join(', ');
        toast.success(`✅ Generated ${successful.length} POA(s): ${labels}`, { 
          description: 'Opening first PDF in preview...',
          duration: 5000
        });
        
        // Open first PDF in preview
        if (successful[0]?.url) {
          setPdfPreviewUrl(successful[0].url);
          setPreviewFormData(formData);
        }

        // Auto-download all PDFs
        setTimeout(() => {
          successful.forEach(pdf => {
            const link = document.createElement('a');
            link.href = pdf.url!;
            link.download = `${pdf.label.replace(/\s+/g, '-')}-${caseId}.pdf`;
            link.click();
          });
        }, 1000);
      }

      if (failed.length > 0) {
        toast.error(`❌ Failed to generate: ${failed.join(', ')}`);
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error('Failed to generate POAs: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // NEW: Generate specific POA type
  const handleGenerateSpecificPOA = async (poaType: 'adult' | 'minor' | 'spouses') => {
    setIsGenerating(true);
    try {
      // Save form data first
      await handlePOASave();
      
      const templateType = `poa-${poaType}`;
      
      console.log(`[POA] Generating ${poaType} PDF, caseId: ${caseId}`);
      toast.loading(`Generating ${poaType.toUpperCase()} POA...`);
      
      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { 
          caseId, 
          templateType 
        }
      });

      if (error) {
        console.error(`[POA] ${poaType} edge function error:`, error);
        throw error;
      }
      
      if (data?.url) {
        setPdfPreviewUrl(data.url);
        setPreviewFormData(formData);
        toast.success(`${poaType.toUpperCase()} POA generated! ${data.stats?.filled}/${data.stats?.total} fields filled`);
      } else {
        throw new Error('No PDF URL returned from edge function');
      }

    } catch (error: any) {
      console.error(`[POA] ${poaType} PDF generation error:`, error);
      toast.error(`Failed to generate ${poaType} POA: ${error.message || 'Unknown error'}`);
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
          className="mb-1 md:mb-6"
        >
          <h2 className="text-5xl md:text-8xl font-heading font-black mb-14 tracking-tight text-center">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Power of Attorney
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
          formData={formData}
          activePOAType={activePOAType}
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
                {/* Left column: Gender and Marital Status */}
                <div className="space-y-6">
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

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2" onDoubleClick={() => handleInputChange("applicant_marital_status", null)}>
                    <Label className={isLargeFonts ? "text-2xl" : ""}>Marital status</Label>
                    <Select value={formData?.applicant_marital_status || ""} onValueChange={(value) => handleInputChange("applicant_marital_status", value)}>
                      <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        <SelectItem value="Married" className="cursor-pointer">Married</SelectItem>
                        <SelectItem value="Single" className="cursor-pointer">Single</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                </div>

                {/* Right column: Children counts */}
                <div className="space-y-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2" onDoubleClick={() => handleInputChange("children_count", null)}>
                    <Label className={isLargeFonts ? "text-2xl" : ""}>Children</Label>
                    <Select value={formData?.children_count?.toString() || ""} onValueChange={(value) => handleInputChange("children_count", parseInt(value))}>
                      <SelectTrigger className="h-16 border-2 hover-glow bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        {[0,1,2,3,4,5,6,7,8,9,10].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {formData?.children_count > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2" onDoubleClick={() => handleInputChange("minor_children_count", null)}>
                      <Label className={isLargeFonts ? "text-2xl" : ""}>Minors</Label>
                      <Select value={formData?.minor_children_count?.toString() || ""} onValueChange={(value) => handleInputChange("minor_children_count", parseInt(value))}>
                        <SelectTrigger className="h-16 border-2 hover-glow bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-2 z-50">
                          {Array.from({length: formData.children_count + 1}, (_, i) => i).map(n => 
                            <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

          {/* POA Adult */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5, delay: 0 }} 
            className="space-y-6"
            onClick={() => setActivePOAType('adult')}
          >
            <div className={cn(
              "cursor-pointer select-none transition-all border-b pb-6 px-6 py-4 rounded-lg",
              activePOAType === 'adult' 
                ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(59,130,246,0.3)]" 
                : "border-border/50 hover:bg-muted/50"
            )}>
              <div className="flex items-center justify-between">
                <h2 className={cn(
                  "text-4xl md:text-5xl font-heading font-bold",
                  activePOAType === 'adult'
                    ? "bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
                    : "text-gray-600 dark:text-gray-400"
                )}>
                  {poaFormConfigs.adult.title}
                </h2>
                {activePOAType === 'adult' && (
                  <Badge className="bg-primary/20 text-primary border-primary text-lg px-4 py-2">
                    <Check className="w-5 h-5 mr-2" />
                    ACTIVE
                  </Badge>
                )}
              </div>
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
          </motion.div>

          {/* POA Minor - Shown for each minor child based on minor_children_count */}
          {Array.from({ length: minorChildrenCount }, (_, index) => index + 1).map((childNum, index) => (
            <motion.div 
              key={`minor-${childNum}`}
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.5, delay: 0.1 + (index * 0.1) }}
              className="space-y-6"
              onClick={() => setActivePOAType('minor')}
            >
              <div className={cn(
                "cursor-pointer select-none transition-all border-b pb-6 px-6 py-4 rounded-lg",
                activePOAType === 'minor' 
                  ? "border-secondary bg-secondary/10 shadow-[0_0_30px_rgba(236,72,153,0.3)]" 
                  : "border-border/50 hover:bg-muted/50"
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={cn(
                      "text-4xl md:text-5xl font-heading font-bold",
                      activePOAType === 'minor'
                        ? "bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent"
                        : "text-gray-600 dark:text-gray-400"
                    )}>
                      POA Minor {childNum}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      Minor child {childNum} (DOB: {formData[`child_${childNum}_dob`] || 'Not entered'})
                    </p>
                  </div>
                  {activePOAType === 'minor' && (
                    <Badge className="bg-secondary/20 text-secondary border-secondary text-lg px-4 py-2">
                      <Check className="w-5 h-5 mr-2" />
                      ACTIVE
                    </Badge>
                  )}
                </div>
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
          </motion.div>
          ))}

          {/* POA Spouses - Only show if married */}
          {showSpousePOA && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.5, delay: 0.2 }} 
              className="space-y-6"
              onClick={() => setActivePOAType('spouses')}
            >
              <div className={cn(
                "cursor-pointer select-none transition-all border-b pb-6 px-6 py-4 rounded-lg",
                activePOAType === 'spouses' 
                  ? "border-accent bg-accent/10 shadow-[0_0_30px_rgba(168,85,247,0.3)]" 
                  : "border-border/50 hover:bg-muted/50"
              )}>
                <div className="flex items-center justify-between">
                  <h2 className={cn(
                    "text-4xl md:text-5xl font-heading font-bold",
                    activePOAType === 'spouses'
                      ? "bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent"
                      : "text-gray-600 dark:text-gray-400"
                  )}>
                    {poaFormConfigs.spouses.title}
                  </h2>
                  {activePOAType === 'spouses' && (
                    <Badge className="bg-accent/20 text-accent border-accent text-lg px-4 py-2">
                      <Check className="w-5 h-5 mr-2" />
                      ACTIVE
                    </Badge>
                  )}
                </div>
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
