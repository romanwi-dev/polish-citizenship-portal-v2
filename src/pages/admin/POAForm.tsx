import { useParams, useNavigate } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, Save, Download, Sparkles, Type, User, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { POAFormField } from "@/components/POAFormField";
import { poaFormConfigs } from "@/config/poaFormConfig";
import { useLongPressWithFeedback } from "@/hooks/useLongPressWithFeedback";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAccessibility } from "@/contexts/AccessibilityContext";
export default function POAForm() {
  const {
    id: caseId
  } = useParams();
  const navigate = useNavigate();
  const {
    data: masterData,
    isLoading
  } = useMasterData(caseId);
  const updateMutation = useUpdateMasterData();
  const { isLargeFonts, toggleFontSize } = useAccessibility();
  const today = format(new Date(), "yyyy-MM-dd");
  const [formData, setFormData] = useState<any>({
    poa_date_filed: today
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [activePOAType, setActivePOAType] = useState('adult');
  useEffect(() => {
    if (masterData) {
      setFormData({
        ...masterData,
        poa_date_filed: masterData.poa_date_filed || today
      });
    }
  }, [masterData, today]);
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };
  const clearCardFields = (config: any) => {
    const clearedFields: any = {};
    config.fields.forEach((field: any) => {
      // Skip date fields
      if (field.type !== "date") {
        clearedFields[field.name] = "";
      }
    });
    setFormData((prev: any) => ({
      ...prev,
      ...clearedFields
    }));
    toast.success(`Cleared all fields in ${config.title}`);
  };
  const clearAllFields = () => {
    // Preserve date fields when clearing all
    setFormData({
      poa_date_filed: formData.poa_date_filed || today
    });
    toast.success("Cleared all fields");
    setShowClearAllDialog(false);
  };
  const handleSave = () => {
    if (!caseId) return;
    updateMutation.mutate({
      caseId,
      updates: formData
    });
  };
  const handleGeneratePDF = async (poaType: string, label: string) => {
    if (!caseId || caseId === ':id') {
      toast.error('Invalid case ID. Please navigate to this page from the cases list.');
      return;
    }
    try {
      setIsGenerating(true);
      toast.loading(`Generating ${label}...`);
      console.log('Generating PDF for case:', caseId, 'Type:', poaType);
      const {
        data,
        error
      } = await supabase.functions.invoke('fill-pdf', {
        body: {
          caseId,
          templateType: poaType
        }
      });
      if (error) throw error;
      const blob = new Blob([data], {
        type: 'application/pdf'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${poaType}-${caseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success(`${label} generated successfully!`);
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Failed to generate PDF: ${error.message}`);
      console.error('PDF Generation Error:', error);
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

  // Create long-press handlers for each card type
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
  return <div className={`min-h-screen relative overflow-hidden transition-opacity ${isFormPressed ? 'opacity-90' : 'opacity-100'}`} {...formLongPressHandlers}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: -50
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8
      }} className="sticky top-0 z-20 bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-sm border-b mb-0">
          <Card className="glass-card border-primary/20 overflow-hidden rounded-none border-x-0 border-t-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
            <CardHeader className="relative pb-6 pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <motion.div initial={{
                x: -20,
                opacity: 0
              }} animate={{
                x: 0,
                opacity: 1
              }} transition={{
                delay: 0.2
              }}>
                  <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-primary">
                    Power of Attorney
                  </CardTitle>
                </motion.div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => navigate(`/admin/case/${caseId}`)}
                    size="lg"
                    variant="ghost"
                    className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10"
                    title="Back to Case"
                  >
                    <ArrowLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    size="lg"
                    variant="ghost"
                    className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10"
                    title="Login / Register"
                  >
                    <User className="h-8 w-8" />
                  </Button>
                  <Button
                    onClick={toggleFontSize}
                    size="lg"
                    variant="ghost"
                    className={`h-16 w-16 rounded-full transition-all ${
                      isLargeFonts ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
                    }`}
                    title="Toggle font size"
                  >
                    <Type className="h-8 w-8" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Action Buttons Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-sm pb-4 pt-4"
        >
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 p-3 md:p-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <Button 
              onClick={handleSave} 
              disabled={updateMutation.isPending} 
              size="default" 
              className="text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[120px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-3 md:h-4 lg:h-5 w-3 md:w-4 lg:w-5 animate-spin mr-1 md:mr-2 opacity-50" />
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Saving...
                  </span>
                </>
              ) : (
                <>
                  <Save className="h-3 md:h-4 lg:h-5 w-3 md:w-4 lg:w-5 mr-1 md:mr-2 opacity-50" />
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Save Data
                  </span>
                </>
              )}
            </Button>
            <Button 
              onClick={() => setActivePOAType('adult')}
              variant={activePOAType === 'adult' ? 'default' : 'outline'}
              className={`text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg ${
                activePOAType === 'adult' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                  : 'bg-white/5 hover:bg-white/10'
              } shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[120px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap`}
            >
              <span className={activePOAType === 'adult' ? 'text-white' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'}>
                Adult POA
              </span>
            </Button>
            <Button 
              onClick={() => setActivePOAType('minor')}
              variant={activePOAType === 'minor' ? 'default' : 'outline'}
              className={`text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg ${
                activePOAType === 'minor' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                  : 'bg-white/5 hover:bg-white/10'
              } shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[120px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap`}
            >
              <span className={activePOAType === 'minor' ? 'text-white' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'}>
                Minor POA
              </span>
            </Button>
            <Button 
              onClick={() => setActivePOAType('spouses')}
              variant={activePOAType === 'spouses' ? 'default' : 'outline'}
              className={`text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg ${
                activePOAType === 'spouses' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                  : 'bg-white/5 hover:bg-white/10'
              } shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[120px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap`}
            >
              <span className={activePOAType === 'spouses' ? 'text-white' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'}>
                Spouses POA
              </span>
            </Button>
            <Button variant="outline" className="text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[120px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap">
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Button 3
              </span>
            </Button>
            <Button variant="outline" className="text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[120px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap">
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Button 4
              </span>
            </Button>
            <Button variant="outline" className="text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[120px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap">
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Button 5
              </span>
            </Button>
            <Button variant="outline" className="text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[120px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap">
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Button 6
              </span>
            </Button>
          </div>
        </motion.div>

        {/* POA Forms */}
        <div className="space-y-8">
          {Object.entries(poaFormConfigs).map(([key, config]) => activePOAType === key && (
            <motion.div 
              key={key} 
              initial={{
                opacity: 0,
                scale: 0.95
              }} 
              animate={{
                opacity: 1,
                scale: 1
              }} 
              transition={{
                duration: 0.5
              }}
            >
                <Card className="glass-card border-primary/20">
                  <CardHeader className="border-b border-border/50 pb-6">
                    <div {...key === 'adult' ? adultCardLongPress.handlers : key === 'minor' ? minorCardLongPress.handlers : spousesCardLongPress.handlers} className="cursor-pointer select-none hover:opacity-80 transition-opacity">
                      <CardTitle className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent whitespace-nowrap">
                        {config.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 md:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {config.fields.map((field, idx) => <POAFormField key={field.name} name={field.name} label={field.label} type={field.type} value={formData[field.name]} onChange={value => handleInputChange(field.name, value)} placeholder={field.placeholder} delay={idx * 0.05} />)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
          ))}
        </div>

        <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Fields?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear all fields in the entire form. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={clearAllFields}>
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>;
}