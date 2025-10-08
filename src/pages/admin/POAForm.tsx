import { useParams, useNavigate } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Loader2, Save, FileText, Sparkles, Type, User, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { POAFormField } from "@/components/POAFormField";
import { poaFormConfigs } from "@/config/poaFormConfig";
import { useLongPressWithFeedback } from "@/hooks/useLongPressWithFeedback";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { PDFPreviewDialog } from "@/components/PDFPreviewDialog";
import { sanitizeMasterData } from "@/utils/masterDataSanitizer";

export default function POAForm() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const { data: masterData, isLoading } = useMasterData(caseId);
  const updateMutation = useUpdateMasterData();
  const { isLargeFonts, toggleFontSize } = useAccessibility();
  
  const [formData, setFormData] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [activePOAType, setActivePOAType] = useState('adult');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [previewFormData, setPreviewFormData] = useState<any>(null);

  // Initialize form ONCE on mount only - NEVER overwrite user edits
  const hasInitialized = useRef(false);
  
  useEffect(() => {
    if (hasInitialized.current) {
      console.log('⏭️ Form already initialized, skipping data load');
      return;
    }
    
    const today = format(new Date(), "yyyy-MM-dd");
    if (masterData) {
      console.log('🆕 Initializing form with master data (FIRST TIME ONLY)');
      setFormData({ ...masterData, poa_date_filed: masterData.poa_date_filed || today });
      hasInitialized.current = true;
    } else if (!isLoading) {
      console.log('🆕 Initializing empty form (FIRST TIME ONLY)');
      setFormData({ poa_date_filed: today });
      hasInitialized.current = true;
    }
  }, [masterData, isLoading]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const clearCardFields = (config: any) => {
    const clearedFields: any = {};
    config.fields.forEach((field: any) => {
      if (field.type !== "date") clearedFields[field.name] = "";
    });
    setFormData((prev: any) => ({ ...prev, ...clearedFields }));
    toast.success(`Cleared all fields in ${config.title}`);
  };

  const clearAllFields = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    setFormData({ poa_date_filed: formData.poa_date_filed || today });
    toast.success("Cleared all fields");
    setShowClearAllDialog(false);
  };

  const handleSave = async () => {
    console.log('💾 SAVE BUTTON CLICKED - caseId:', caseId);
    console.log('📋 Form data to save:', formData);
    if (!caseId) {
      console.error('❌ No caseId!');
      return;
    }
    try {
      await updateMutation.mutateAsync({ caseId, updates: formData });
      console.log('✅ Save completed successfully');
    } catch (error) {
      console.error('❌ Save failed:', error);
    }
  };

  const handleGenerateAndPreview = async (templateType: 'poa-adult' | 'poa-minor' | 'poa-spouses') => {
    if (!caseId || caseId === ':id') {
      toast.error('Invalid case ID');
      return;
    }

    setIsGenerating(true);
    setActivePOAType(templateType.replace('poa-', ''));
    try {
      // Save first
      await handleSave();

      // Generate PDF
      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || 'PDF generation failed');
      }

      if (!data) {
        throw new Error('No PDF data received');
      }

      // Create blob and preview URL
      const blob = new Blob([data], { type: 'application/pdf' });
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

      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType: 'poa-adult' }
      });

      if (error) throw error;

      const blob = new Blob([data], { type: 'application/pdf' });
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

  const { handlers: formLongPressHandlers } = useLongPressWithFeedback({
    onLongPress: () => setShowClearAllDialog(true),
    duration: 5000,
    feedbackMessage: "Hold for 5 seconds to clear entire form..."
  });

  const adultCardLongPress = useLongPressWithFeedback({
    onLongPress: () => clearCardFields(poaFormConfigs.adult),
    duration: 2000,
    feedbackMessage: "Hold for 2 seconds to clear POA Adult..."
  });

  const minorCardLongPress = useLongPressWithFeedback({
    onLongPress: () => clearCardFields(poaFormConfigs.minor),
    duration: 2000,
    feedbackMessage: "Hold for 2 seconds to clear POA Minor..."
  });

  const spousesCardLongPress = useLongPressWithFeedback({
    onLongPress: () => clearCardFields(poaFormConfigs.spouses),
    duration: 2000,
    feedbackMessage: "Hold for 2 seconds to clear POA Spouses..."
  });

  if (!caseId || caseId === ':id') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 max-w-md">
          <CardHeader><CardTitle className="text-red-500">Invalid Case ID</CardTitle></CardHeader>
          <CardContent>
            <p>Please navigate to this page from a valid case.</p>
            <Button onClick={() => navigate('/admin/cases')} className="mt-4">Go to Cases</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Sparkles className="h-16 w-16 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-t from-background via-primary/5 to-background pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="sticky top-0 z-20 bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-sm border-b mb-0">
          <Card className="glass-card border-primary/20 overflow-hidden rounded-none border-x-0 border-t-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
            <CardHeader className="relative pb-6 pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text">
                    Power of Attorney
                  </CardTitle>
                </motion.div>
                <div className="flex items-center gap-3">
                  <Button onClick={() => navigate(`/admin/case/${caseId}`)} size="lg" variant="ghost"
                    className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10" title="Back to Case">
                    <ArrowLeft className="h-8 w-8" />
                  </Button>
                  <Button onClick={() => navigate('/login')} size="lg" variant="ghost"
                    className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10" title="Login / Register">
                    <User className="h-8 w-8" />
                  </Button>
                  <Button onClick={toggleFontSize} size="lg" variant="ghost"
                    className={`h-16 w-16 rounded-full transition-all ${isLargeFonts ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`} title="Toggle font size">
                    <Type className="h-8 w-8" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-sm pb-4 pt-4">
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 p-3 md:p-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <Button onClick={handleSave} disabled={updateMutation.isPending} size="default"
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0">
              {updateMutation.isPending ? (
                <><Loader2 className="h-4 md:h-5 w-4 md:w-5 animate-spin mr-2 opacity-50" />
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Saving...</span></>
              ) : (
                <><Save className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Save data</span></>
              )}
            </Button>


            <Button onClick={() => setShowClearAllDialog(true)} size="default" variant="outline"
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0">
              <Sparkles className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Clear All</span>
            </Button>

            <Button onClick={() => navigate(`/admin/cases/${caseId}/intake`)} variant="outline"
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[160px] md:min-w-[200px] lg:min-w-[240px] whitespace-nowrap flex-shrink-0">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Client Intake</span>
            </Button>

            <Button onClick={() => navigate(`/admin/cases/${caseId}/master-data`)} variant="outline"
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Master Form</span>
            </Button>

            <Button onClick={() => navigate(`/admin/cases/${caseId}/family-tree`)} variant="outline"
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Family Tree</span>
            </Button>

            <Button onClick={() => navigate(`/admin/cases/${caseId}/citizenship`)} variant="outline"
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[200px] md:min-w-[240px] lg:min-w-[280px] whitespace-nowrap flex-shrink-0">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Citizenship Application</span>
            </Button>

            <Button onClick={() => navigate(`/admin/cases/${caseId}/civil-registry`)} variant="outline"
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[160px] md:min-w-[200px] lg:min-w-[240px] whitespace-nowrap flex-shrink-0">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Civil Registry</span>
            </Button>

            <Button onClick={() => navigate(`/admin/cases/${caseId}/additional-data`)} variant="outline"
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[160px] md:min-w-[200px] lg:min-w-[240px] whitespace-nowrap flex-shrink-0">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Additional Data</span>
            </Button>
          </div>
        </motion.div>

        {/* POA Forms */}
        <div className="space-y-8">
          {/* POA Adult */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0 }}>
            <Card className="glass-card border-primary/20">
              <CardHeader className="border-b border-border/50 pb-6">
                <div {...adultCardLongPress.handlers} className="cursor-pointer select-none hover:opacity-80 transition-opacity">
                  <CardTitle className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {poaFormConfigs.adult.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Gender Selector */}
                <div className="mb-6">
                  <Label className="text-base md:text-lg lg:text-xl font-semibold mb-3 block text-foreground/80">
                    Applicant Gender / Płeć
                  </Label>
                  <RadioGroup
                    value={formData.applicant_sex || ""}
                    onValueChange={(value) => handleInputChange("applicant_sex", value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="M" id="gender-male" />
                      <Label htmlFor="gender-male" className="cursor-pointer text-sm md:text-base lg:text-lg text-foreground/80">
                        Male / Mężczyzna
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="F" id="gender-female" />
                      <Label htmlFor="gender-female" className="cursor-pointer text-sm md:text-base lg:text-lg text-foreground/80">
                        Female / Kobieta
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <POAFormField
                    name="applicant_first_name"
                    label="Applicant given names / Imię/ imiona"
                    value={formData.applicant_first_name || ""}
                    onChange={(value) => handleInputChange("applicant_first_name", value)}
                  />
                  <POAFormField
                    name="applicant_last_name"
                    label="Applicant full last name / Nazwisko"
                    value={formData.applicant_last_name || ""}
                    onChange={(value) => handleInputChange("applicant_last_name", value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <POAFormField
                    name="applicant_passport_number"
                    label="ID/ passport number / Nr dokumentu tożsamości"
                    value={formData.applicant_passport_number || ""}
                    onChange={(value) => handleInputChange("applicant_passport_number", value)}
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <Button 
                    onClick={async () => {
                      const { data, error } = await supabase.functions.invoke('inspect-pdf-fields', {
                        body: { templateType: 'poa-adult' }
                      });
                      if (error) {
                        console.error("Inspection error:", error);
                        toast.error("Failed to inspect PDF");
                      } else {
                        console.log("PDF FIELDS:", data);
                        toast.success(`Found ${data.totalFields} fields - check console`);
                      }
                    }}
                    variant="outline"
                    className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30"
                  >
                    <FileText className="h-4 md:h-5 w-4 md:w-5 mr-2" />
                    Inspect PDF Fields
                  </Button>
                  <Button onClick={() => handleGenerateAndPreview('poa-adult')} disabled={isGenerating}
                    className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30">
                    {isGenerating && activePOAType === 'adult' ? (
                      <><Loader2 className="h-4 md:h-5 w-4 md:w-5 animate-spin mr-2 opacity-50" />
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Generating...</span></>
                    ) : (
                      <><FileText className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Generate POA Adult</span></>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* POA Minor */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="glass-card border-primary/20">
              <CardHeader className="border-b border-border/50 pb-6">
                <div {...minorCardLongPress.handlers} className="cursor-pointer select-none hover:opacity-80 transition-opacity">
                  <CardTitle className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {poaFormConfigs.minor.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <POAFormField
                    name="applicant_first_name"
                    label="Parent given names / Imię/ imiona rodzica"
                    value={formData.applicant_first_name || ""}
                    onChange={(value) => handleInputChange("applicant_first_name", value)}
                  />
                  <POAFormField
                    name="applicant_last_name"
                    label="Parent full last name / Nazwisko rodzica"
                    value={formData.applicant_last_name || ""}
                    onChange={(value) => handleInputChange("applicant_last_name", value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <POAFormField
                    name="applicant_passport_number"
                    label="Parent ID/ passport number / Nr dokumentu tożsamości"
                    value={formData.applicant_passport_number || ""}
                    onChange={(value) => handleInputChange("applicant_passport_number", value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <POAFormField
                    name="child_1_first_name"
                    label="Child given names / Imię/ imiona dziecka"
                    value={formData.child_1_first_name || ""}
                    onChange={(value) => handleInputChange("child_1_first_name", value)}
                  />
                  <POAFormField
                    name="child_1_last_name"
                    label="Child full last name / Nazwisko dziecka"
                    value={formData.child_1_last_name || ""}
                    onChange={(value) => handleInputChange("child_1_last_name", value)}
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => handleGenerateAndPreview('poa-minor')} disabled={isGenerating}
                    className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30">
                    {isGenerating && activePOAType === 'minor' ? (
                      <><Loader2 className="h-4 md:h-5 w-4 md:w-5 animate-spin mr-2 opacity-50" />
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Generating...</span></>
                    ) : (
                      <><FileText className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Generate POA Minor</span></>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* POA Spouses */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="glass-card border-primary/20">
              <CardHeader className="border-b border-border/50 pb-6">
                <div {...spousesCardLongPress.handlers} className="cursor-pointer select-none hover:opacity-80 transition-opacity">
                  <CardTitle className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {poaFormConfigs.spouses.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Primary Applicant Gender Selector - synced with master_table */}
                <div className="mb-8 p-4 bg-muted/30 rounded-lg border border-border/50">
                  <Label className="text-lg font-semibold mb-3 block">Who is the primary applicant?</Label>
                  <RadioGroup 
                    value={formData.applicant_sex === 'F' ? 'female' : 'male'} 
                    onValueChange={(value: 'male' | 'female') => {
                      const sex = value === 'female' ? 'F' : 'M';
                      handleInputChange('applicant_sex', sex);
                    }}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="cursor-pointer font-medium">Husband / Mąż</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="cursor-pointer font-medium">Wife / Żona</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Primary Applicant Fields - labels based on master_table applicant_sex */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <POAFormField
                    name="applicant_first_name"
                    label={formData.applicant_sex === 'F'
                      ? "Wife given names / Imię / imiona żony"
                      : "Husband given names / Imię / imiona męża"
                    }
                    value={formData.applicant_first_name || ""}
                    onChange={(value) => handleInputChange("applicant_first_name", value)}
                  />
                  <POAFormField
                    name="applicant_last_name"
                    label={formData.applicant_sex === 'F'
                      ? "Wife full last name / Nazwisko żony"
                      : "Husband full last name / Nazwisko męża"
                    }
                    value={formData.applicant_last_name || ""}
                    onChange={(value) => handleInputChange("applicant_last_name", value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <POAFormField
                    name="applicant_passport_number"
                    label={formData.applicant_sex === 'F'
                      ? "Wife ID/passport number / Nr dokumentu tożsamości żony"
                      : "Husband ID/passport number / Nr dokumentu tożsamości męża"
                    }
                    value={formData.applicant_passport_number || ""}
                    onChange={(value) => handleInputChange("applicant_passport_number", value)}
                  />
                </div>

                {/* Spouse Fields - labels swap based on primary applicant */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <POAFormField
                    name="spouse_first_name"
                    label={formData.applicant_sex === 'F'
                      ? "Husband given names / Imię / imiona męża"
                      : "Wife given names / Imię / imiona żony"
                    }
                    value={formData.spouse_first_name || ""}
                    onChange={(value) => handleInputChange("spouse_first_name", value)}
                  />
                  <POAFormField
                    name="spouse_last_name"
                    label={formData.applicant_sex === 'F'
                      ? "Husband full last name / Nazwisko męża"
                      : "Wife full last name / Nazwisko żony"
                    }
                    value={formData.spouse_last_name || ""}
                    onChange={(value) => handleInputChange("spouse_last_name", value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <POAFormField
                    name="spouse_passport_number"
                    label={formData.applicant_sex === 'F'
                      ? "Husband ID/passport number / Nr dokumentu tożsamości męża"
                      : "Wife ID/passport number / Nr dokumentu tożsamości żony"
                    }
                    value={formData.spouse_passport_number || ""}
                    onChange={(value) => handleInputChange("spouse_passport_number", value)}
                  />
                </div>

                {/* Marriage Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <POAFormField
                    name="applicant_last_name_after_marriage"
                    label={formData.applicant_sex === 'F'
                      ? "Wife's full last name after marriage / Nazwisko żony po zawarciu małżeństwa"
                      : "Husband's full last name after marriage / Nazwisko męża po zawarciu małżeństwa"
                    }
                    value={formData.applicant_last_name_after_marriage || ""}
                    onChange={(value) => handleInputChange("applicant_last_name_after_marriage", value)}
                  />
                  <POAFormField
                    name="spouse_last_name_after_marriage"
                    label={formData.applicant_sex === 'F'
                      ? "Husband's full last name after marriage / Nazwisko męża po zawarciu małżeństwa"
                      : "Wife's full last name after marriage / Nazwisko żony po zawarciu małżeństwa"
                    }
                    value={formData.spouse_last_name_after_marriage || ""}
                    onChange={(value) => handleInputChange("spouse_last_name_after_marriage", value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
                  <POAFormField
                    name="children_surnames"
                    label="Children's full last name(s) / Nazwisko/a dzieci"
                    value={formData.children_surnames || ""}
                    onChange={(value) => handleInputChange("children_surnames", value)}
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => handleGenerateAndPreview('poa-spouses')} disabled={isGenerating}
                    className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30">
                    {isGenerating && activePOAType === 'spouses' ? (
                      <><Loader2 className="h-4 md:h-5 w-4 md:w-5 animate-spin mr-2 opacity-50" />
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Generating...</span></>
                    ) : (
                      <><FileText className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Generate POA Spouses</span></>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Fields?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all form fields (except dates). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearAllFields}>Clear All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PDFPreviewDialog
        open={!!pdfPreviewUrl}
        onClose={() => setPdfPreviewUrl(null)}
        pdfUrl={pdfPreviewUrl || ""}
        formData={previewFormData}
        onRegeneratePDF={handleRegeneratePDF}
        onDownload={handleDownloadPDF}
        documentTitle="POA Adult"
      />
    </div>
  );
}
