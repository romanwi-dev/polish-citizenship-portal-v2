import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef, lazy, Suspense, useEffect } from "react";
import { Loader2, Save, Download, FileText, Camera, Type, User, ArrowLeft, HelpCircle, Maximize2, Minimize2, Users, Baby, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { detectDevice } from "@/utils/deviceDetection";
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
import { BulkPDFGenerator } from "@/components/BulkPDFGenerator";
import { useFormManager } from "@/hooks/useFormManager";
import { usePOAAutoGeneration } from "@/hooks/usePOAAutoGeneration";
import { MaskedPassportInput } from "@/components/forms/MaskedPassportInput";
import { Printer } from "lucide-react";
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
  const [generatedPOATypes, setGeneratedPOATypes] = useState<string[]>([]); 
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({});
  
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
  }, []);


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
      toast.loading('Preparing PDF...');
      
      // Get current user for lock-pdf function
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Call lock-pdf edge function to flatten the PDF
      const { data, error } = await supabase.functions.invoke('lock-pdf', {
        body: { 
          pdfUrl: pdfPreviewUrl,
          userId: user.id
        }
      });

      if (error || !data?.url) {
        console.error('[POAForm] Lock PDF error:', error);
        throw new Error(error?.message || 'Failed to create final PDF');
      }
      
      // Fetch PDF as Blob
      const response = await fetch(data.url);
      const blob = await response.blob();
      const filename = `POA-${activePOAType.toUpperCase()}-FINAL-${caseId}.pdf`;

      toast.dismiss();

      // Mobile-first: Use native share if available
      const device = detectDevice();
      if ((device.isIOS || device.isAndroid) && navigator.share) {
        try {
          const file = new File([blob], filename, { type: 'application/pdf' });
          
          // Check if sharing is supported
          if (navigator.canShare && !navigator.canShare({ files: [file] })) {
            throw new Error('File sharing not supported');
          }
          
          await navigator.share({
            files: [file],
            title: 'POA Final PDF',
            text: `Power of Attorney - ${activePOAType.toUpperCase()}`
          });
          
          toast.success("PDF shared successfully");
          return;
        } catch (shareError: any) {
          // User cancelled or share failed - fall through to download
          if (shareError.name !== 'AbortError') {
            console.log("Share cancelled or not available:", shareError);
          }
        }
      }

      // Desktop fallback: Standard download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded');
    } catch (error: any) {
      console.error('[POAForm] Failed to prepare PDF:', error);
      toast.dismiss();
      toast.error('Failed to generate final PDF: ' + error.message);
    }
  };


  const handleGenerateCombinedPOA = async () => {
    if (!caseId) {
      toast.error('No case ID available');
      return;
    }

    try {
      setIsGenerating(true);
      
      // Save form data FIRST
      await handlePOASave();
      
      // Build array of POA types to generate using pdf-simple templates
      const poaTypes: Array<'adult' | 'minor' | 'spouses'> = [];
      
      // Always generate adult POA
      poaTypes.push('adult');
      
      // Generate spouses POA if married
      console.log('[POAForm] Marriage check:', { showSpousePOA, maritalStatus: formData.applicant_marital_status });
      if (showSpousePOA) {
        poaTypes.push('spouses');
      }
      
      // Generate ONE minor POA if there are any minor children
      // (the pdf-simple minor template is generic, not per-child)
      console.log('[POAForm] Minor check:', { minorChildrenCount });
      if (minorChildrenCount > 0) {
        poaTypes.push('minor');
      }

      console.log('[POAForm] POA types to generate:', poaTypes);

      if (poaTypes.length === 0) {
        toast.error('No POA types to generate');
        setIsGenerating(false);
        return;
      }

      const loadingToast = toast.loading(`Generating ${poaTypes.length} POA(s)...`);

      // Generate PDFs using pdf-simple
      const results: Record<string, string> = {};
      const generatedTypes: string[] = [];

      for (const type of poaTypes) {
        console.log(`[POAForm] Generating ${type} POA with pdf-simple...`);
        
        const { data, error } = await supabase.functions.invoke('pdf-simple', {
          body: { 
            caseId, 
            templateType: `poa-${type}` 
          }
        });

        if (error || !data?.success) {
          console.error(`[POAForm] Failed to generate ${type} POA:`, error || data);
          toast.error(`Failed to generate ${type} POA`);
          continue;
        }

        // Store PDF URL
        if (data.url) {
          results[type] = data.url;
          generatedTypes.push(type);
          console.log(`[POAForm] ${type} POA generated:`, data.url);
        }
      }

      console.log('[POAForm] Generation complete:', { generatedTypes, resultsKeys: Object.keys(results) });

      if (generatedTypes.length === 0) {
        toast.dismiss(loadingToast);
        toast.error('Failed to generate any POAs');
        setIsGenerating(false);
        return;
      }

      // Update state with PDF URLs and open preview
      console.log('[POAForm] Setting state:', { 
        pdfUrls: results, 
        generatedPOATypes: generatedTypes,
        firstPdfUrl: results[generatedTypes[0]],
        activePOAType: generatedTypes[0]
      });
      
      setPdfUrls(results);
      setGeneratedPOATypes(generatedTypes);
      setPdfPreviewUrl(results[generatedTypes[0]]); // Show first POA
      setActivePOAType(generatedTypes[0]);
      setPreviewOpen(true);

      toast.dismiss(loadingToast);
      toast.success(`Generated ${generatedTypes.length} POA(s) successfully!`);
    } catch (error: any) {
      console.error('[POA] Generation error:', error);
      toast.dismiss();
      toast.error('Failed to generate POAs: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // NEW: Generate specific POA type using pdf-simple
  const handleGenerateSpecificPOA = async (poaType: 'adult' | 'minor' | 'spouses') => {
    if (!caseId) {
      toast.error('No case ID available');
      return;
    }

    setIsGenerating(true);
    try {
      // Save form data FIRST to ensure all fields are persisted
      await handlePOASave();
      
      const templateType = `poa-${poaType}`;
      
      console.log(`[POA] Generating ${poaType} PDF using pdf-simple, caseId: ${caseId}`);
      toast.loading(`Generating ${poaType.toUpperCase()} POA...`);
      
      const { data, error } = await supabase.functions.invoke('pdf-simple', {
        body: { 
          caseId, 
          templateType 
        }
      });

      if (error) {
        console.error(`[POA] ${poaType} edge function error:`, error);
        throw error;
      }
      
      if (data?.success && data?.url) {
        // Set single POA preview state and trigger preview dialog
        setGeneratedPOATypes([poaType]);
        setActivePOAType(poaType);
        setPdfUrls({ [poaType]: data.url });
        setPdfPreviewUrl(data.url);
        setPreviewFormData(formData);
        setPreviewOpen(true); // Open the preview dialog
        
        toast.dismiss();
        const message = data.fieldsFilledCount === 0 
          ? 'Blank PDF ready for manual completion'
          : `PDF ready! Filled ${data.fieldsFilledCount}/${data.totalFields} fields (${data.fillRate}%)`;
        toast.success(message);
      } else {
        throw new Error(data?.error || 'No PDF URL returned from edge function');
      }

    } catch (error: any) {
      console.error(`[POA] ${poaType} PDF generation error:`, error);
      toast.dismiss();
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
          className="mb-0"
        >
          <h2 className="text-5xl md:text-8xl font-heading font-black mb-2 md:mb-3 tracking-tight text-center">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Power of Attorney
            </span>
          </h2>
          <div className="flex items-center justify-center gap-3 md:gap-6 mt-2 md:mt-3 mb-1 md:mb-2">
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
          onGeneratePDF={handleGenerateCombinedPOA}
          isSaving={isSaving || isGenerating}
          formData={formData}
          activePOAType={activePOAType}
        />

        {/* Bulk PDF Generator - Centered between buttons and tabs */}
        <BulkPDFGenerator caseId={caseId!} />


        {/* POA Forms */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="space-y-6 md:space-y-12 pb-32">
          {/* Main Applicant - First Questions */}
          <div className="px-4 py-1 md:py-4 md:px-10">
            <div className="border-b border-border/50 pb-1 md:pb-4">
              <h2 className="text-2xl md:text-3xl font-heading font-bold mb-1 md:mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Main Applicant
              </h2>
              <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
                First Questions
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
                {/* Left column: Gender and Marital Status */}
                <div className="space-y-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="form-field-container space-y-2" onDoubleClick={() => handleInputChange("applicant_sex", null)}>
                    <Label className={isLargeFonts ? "text-2xl" : ""}>Gender</Label>
                    <Select value={formData?.applicant_sex || ""} onValueChange={(value) => handleInputChange("applicant_sex", value)}>
                      <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        <SelectItem value="M" className="cursor-pointer">Male</SelectItem>
                        <SelectItem value="F" className="cursor-pointer">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="form-field-container space-y-2" onDoubleClick={() => handleInputChange("applicant_marital_status", null)}>
                    <Label className={isLargeFonts ? "text-2xl" : ""}>Status</Label>
                    <Select value={formData?.applicant_marital_status || ""} onValueChange={(value) => handleInputChange("applicant_marital_status", value)}>
                      <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur">
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
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="form-field-container space-y-2" onDoubleClick={() => handleInputChange("children_count", null)}>
                    <Label className={isLargeFonts ? "text-2xl" : ""}>Children</Label>
                    <Select value={formData?.children_count?.toString() || ""} onValueChange={(value) => handleInputChange("children_count", parseInt(value))}>
                      <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()} className="cursor-pointer">{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {formData?.children_count > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.175 }} className="form-field-container space-y-2" onDoubleClick={() => handleInputChange("minor_children_count", null)}>
                      <Label className={isLargeFonts ? "text-2xl" : ""}>Minors</Label>
                      <Select value={formData?.minor_children_count?.toString() || ""} onValueChange={(value) => handleInputChange("minor_children_count", parseInt(value))}>
                        <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur">
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

              {/* Link to POA OCR Wizard */}
              <div className="flex justify-center items-center mt-16 mb-8 md:mt-20 md:mb-12">
                <Button
                  onClick={() => navigate(`/admin/cases/${caseId}/poa-ocr`)}
                  size="lg"
                  className="text-2xl md:text-3xl font-heading font-black tracking-wide px-8 py-4 md:px-16 md:py-6 h-[64px] md:h-[80px] w-[280px] md:w-[380px] rounded-lg bg-blue-900/60 hover:bg-blue-900/80 text-white backdrop-blur-md border-2 border-blue-600/40 hover:border-blue-500/60 transition-colors duration-300"
                >
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-lg">
                    Scan Papers
                  </span>
                </Button>
              </div>
            </div>

          {/* POA Adult */}
          <motion.div 
            id="poa-adult-section"
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5, delay: 0 }} 
            className="space-y-6"
            onClick={() => setActivePOAType('adult')}
          >
            <div className="border-b pb-6 px-6 py-4">
              <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
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
          </motion.div>

          {/* POA Minor - Shown for each minor child based on minor_children_count */}
          {Array.from({ length: minorChildrenCount }, (_, index) => index + 1).map((childNum, index) => (
            <motion.div 
              key={`minor-${childNum}`}
              id={`poa-minor-${childNum}-section`}
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.5, delay: 0.1 + (index * 0.1) }}
              className="space-y-6"
              onClick={() => setActivePOAType('minor')}
            >
              <div className="border-b pb-6 px-6 py-4">
                <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  POA Minor {childNum}
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
          </motion.div>
          ))}

          {/* POA Spouses - Only show if married */}
          {showSpousePOA && (
            <motion.div 
              id="poa-spouses-section"
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.5, delay: 0.2 }} 
              className="space-y-6"
              onClick={() => setActivePOAType('spouses')}
            >
              <div className="border-b pb-6 px-6 py-4">
                <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
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
                      colorScheme="poa"
                    />
                  </motion.div>
                </div>

                {/* Post-Marriage Last Names - separate fields for wife and husband */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <POAFormField
                    name="wife_last_name_after_marriage"
                    label="Wife's full last name after marriage"
                    value={formData?.wife_last_name_after_marriage || ""}
                    onChange={(value) => handleInputChange("wife_last_name_after_marriage", value)}
                  />
                  <POAFormField
                    name="husband_last_name_after_marriage"
                    label="Husband's full last name after marriage"
                    value={formData?.husband_last_name_after_marriage || ""}
                    onChange={(value) => {
                      handleInputChange("husband_last_name_after_marriage", value);
                      
                      // Polish grammar rule: convert -SKI to -SKA and -CKI to -CKA for wife's surname
                      if (value) {
                        const upperValue = value.toUpperCase();
                        let wifeSurname = value;
                        
                        if (upperValue.endsWith('SKI')) {
                          wifeSurname = value.slice(0, -1) + 'A'; // Remove 'I', add 'A'
                        } else if (upperValue.endsWith('CKI')) {
                          wifeSurname = value.slice(0, -1) + 'A'; // Remove 'I', add 'A'
                        }
                        
                        if (wifeSurname !== value) {
                          handleInputChange("wife_last_name_after_marriage", wifeSurname);
                        }
                      }
                    }}
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

      {/* Multi-POA Preview with Print */}
      {pdfPreviewUrl && generatedPOATypes.length > 0 && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Generated POAs ({generatedPOATypes.length})</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPdfPreviewUrl(null);
                setGeneratedPOATypes([]);
                setPdfUrls({});
              }}
            >
              Close Preview
            </Button>
          </div>
          
          {/* Standard Tabs for POA types */}
          {generatedPOATypes.length > 1 && (
            <Tabs value={activePOAType} onValueChange={(value) => {
              setActivePOAType(value);
              setPdfPreviewUrl(pdfUrls[value]);
            }}>
              <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/30 p-1 mb-4">
                {generatedPOATypes.map(type => (
                  <TabsTrigger
                    key={type}
                    value={type}
                    className="flex-1 min-w-[120px] data-[state=active]:bg-background"
                  >
                    {type.toUpperCase()} POA
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {/* PDF Preview */}
          {pdfPreviewUrl && (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  src={pdfPreviewUrl}
                  className="w-full h-[600px]"
                  title={`${activePOAType} POA Preview`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    const link = document.createElement("a");
                    link.href = pdfPreviewUrl;
                    link.download = `POA-${activePOAType.toUpperCase()}-${caseId}.pdf`;
                    link.click();
                    toast.success('PDF downloaded');
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Editable
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(pdfPreviewUrl, '_blank');
                    toast.success('Opening PDF for printing');
                  }}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button 
                  onClick={handleDownloadFinal}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Final
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

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
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPdfPreviewUrl(null);
        }}
        pdfUrl={pdfPreviewUrl || ""}
        onDownloadEditable={handleDownloadEditable}
        onDownloadFinal={handleDownloadFinal}
        documentTitle={`POA - ${activePOAType.toUpperCase()}`}
        documentId={pdfUrls[activePOAType]}
        caseId={caseId}
      />
    </div>
  );
}
