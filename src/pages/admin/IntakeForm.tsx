import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Loader2, Type, Maximize2, Minimize2, User, Phone, MapPin, Plane, Users, FolderOpen, MessageSquare, ArrowLeft, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useLongPressWithFeedback } from "@/hooks/useLongPressWithFeedback";
import { validateEmail, validatePassport } from "@/utils/validators";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useFormSync } from "@/hooks/useFormSync";
import { useBidirectionalSync } from "@/hooks/useBidirectionalSync";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormButtonsRow } from "@/components/FormButtonsRow";
import { SelectSection, ApplicantSection, ContactSection, AddressSection, PassportSection, ImmigrationSection, DocumentsSection, NotesSection } from "@/components/IntakeFormContent";

export default function IntakeForm() {
  const navigate = useNavigate();
  const { id: caseId } = useParams();
  const { formData, setFormData, isLoading, isSaving, saveData, clearAll, clearField } = useFormSync(caseId);
  const { syncIntakeToMaster } = useBidirectionalSync(caseId);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { isLargeFonts, toggleFontSize } = useAccessibility();
  const [activeTab, setActiveTab] = useState("select");
  const [isFullView, setIsFullView] = useState(false);
  const tabsListRef = useRef<HTMLDivElement>(null);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({
    select: null,
    applicant: null,
    contact: null,
    address: null,
    passport: null,
    immigration: null,
    documents: null,
    notes: null
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (isFullView && sectionRefs.current[value]) {
      const element = sectionRefs.current[value];
      if (element) {
        const yOffset = -100; // Offset for sticky header
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (formData.applicant_email) {
      const emailValidation = validateEmail(formData.applicant_email);
      if (!emailValidation.valid) {
        toast.error(emailValidation.error);
        return;
      }
    }

    if (formData.applicant_passport_number) {
      const passportValidation = validatePassport(formData.applicant_passport_number);
      if (!passportValidation.valid) {
        toast.error(passportValidation.error);
        return;
      }
    }

    await saveData(formData);
    
    // Auto-sync to master_table after save
    await syncIntakeToMaster(formData);
  };

  const titleLongPress = useLongPressWithFeedback({
    onLongPress: clearAll,
    duration: 2000,
    feedbackMessage: "Hold to clear all fields..."
  });

  const backgroundLongPress = useLongPressWithFeedback({
    onLongPress: () => setShowClearDialog(true),
    duration: 5000,
    feedbackMessage: "Hold to clear entire form..."
  });

  const contentProps = {
    formData,
    handleInputChange,
    clearField,
    isLargeFonts
  };

  useEffect(() => {
    // Scroll tabs to the start to show Select button fully
    if (tabsListRef.current) {
      tabsListRef.current.scrollLeft = 0;
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container mx-auto py-12 px-2 md:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
        >
          <Card className="glass-card border-primary/20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
            <CardHeader className="relative pb-6 pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text">
                    Client Intake Form
                  </CardTitle>
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
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            <FormButtonsRow 
              caseId={caseId!}
              currentForm="intake"
              onSave={handleSave}
              onClear={() => setShowClearDialog(true)}
              onGeneratePDF={() => {}}
              isSaving={isSaving}
            />
          </CardContent>
        </Card>
      </motion.div>

        {/* Form with Tabs or Full View */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="space-y-8">
          <Tabs defaultValue="select" value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border/50 pb-2 pt-2 rounded-t-lg">
              <TabsList ref={tabsListRef} className="w-full inline-flex justify-start gap-2 bg-transparent p-0 overflow-x-auto scrollbar-hide">
                <TabsTrigger value="select" className="flex-shrink-0">
                  <span>Select...</span>
                </TabsTrigger>
                <TabsTrigger value="applicant" className="flex-shrink-0">
                  <span>Applicant</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex-shrink-0">
                  <span>Contact</span>
                </TabsTrigger>
                <TabsTrigger value="address" className="flex-shrink-0">
                  <span>Address</span>
                </TabsTrigger>
                <TabsTrigger value="passport" className="flex-shrink-0">
                  <span>Passport</span>
                </TabsTrigger>
                <TabsTrigger value="immigration" className="flex-shrink-0">
                  <span>Emigration</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex-shrink-0">
                  <span>Documents</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex-shrink-0">
                  <span>Notes</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {isFullView ? (
              // Full View - All sections visible
              <div className="space-y-0">
                <div ref={(el) => sectionRefs.current.select = el} className="border-b border-border/10">
                  <SelectSection {...contentProps} />
                </div>
                <div ref={(el) => sectionRefs.current.applicant = el} className="border-b border-border/10">
                  <ApplicantSection {...contentProps} />
                </div>
                <div ref={(el) => sectionRefs.current.contact = el} className="border-b border-border/10">
                  <ContactSection {...contentProps} />
                </div>
                <div ref={(el) => sectionRefs.current.address = el} className="border-b border-border/10">
                  <AddressSection {...contentProps} />
                </div>
                <div ref={(el) => sectionRefs.current.passport = el} className="border-b border-border/10">
                  <PassportSection {...contentProps} />
                </div>
                <div ref={(el) => sectionRefs.current.immigration = el} className="border-b border-border/10">
                  <ImmigrationSection {...contentProps} />
                </div>
                <div ref={(el) => sectionRefs.current.documents = el} className="border-b border-border/10">
                  <DocumentsSection {...contentProps} />
                </div>
                <div ref={(el) => sectionRefs.current.notes = el}>
                  <NotesSection {...contentProps} />
                </div>
              </div>
            ) : (
              // Tabbed View
              <>
                <TabsContent value="select" className="mt-0">
                  <SelectSection {...contentProps} />
                </TabsContent>
                <TabsContent value="applicant" className="mt-0">
                  <ApplicantSection {...contentProps} />
                </TabsContent>
                <TabsContent value="contact" className="mt-0">
                  <ContactSection {...contentProps} />
                </TabsContent>
                <TabsContent value="address" className="mt-0">
                  <AddressSection {...contentProps} />
                </TabsContent>
                <TabsContent value="passport" className="mt-0">
                  <PassportSection {...contentProps} />
                </TabsContent>
                <TabsContent value="immigration" className="mt-0">
                  <ImmigrationSection {...contentProps} />
                </TabsContent>
                <TabsContent value="documents" className="mt-0">
                  <DocumentsSection {...contentProps} />
                </TabsContent>
                <TabsContent value="notes" className="mt-0">
                  <NotesSection {...contentProps} />
                </TabsContent>
              </>
            )}
          </Tabs>
        </motion.div>
      </div>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear entire form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all fields in the intake form. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearAll}>
              Clear all fields
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
