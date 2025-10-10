import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2, Type, Maximize2, Minimize2, User, Phone, MapPin, Plane, Users, FolderOpen, MessageSquare, ArrowLeft, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useLongPressWithFeedback } from "@/hooks/useLongPressWithFeedback";
import { validateEmail, validatePassport } from "@/utils/validators";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useFormSync } from "@/hooks/useFormSync";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormButtonsRow } from "@/components/FormButtonsRow";
import { SelectSection, ApplicantSection, ContactSection, AddressSection, PassportSection, ImmigrationSection, DocumentsSection, NotesSection } from "@/components/IntakeFormContent";

export default function IntakeForm() {
  const navigate = useNavigate();
  const { id: caseId } = useParams();
  const { formData, setFormData, isLoading, isSaving, saveData, clearAll, clearField } = useFormSync(caseId);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { isLargeFonts, toggleFontSize } = useAccessibility();
  const [activeTab, setActiveTab] = useState("select");
  const [isFullView, setIsFullView] = useState(false);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="py-6 px-4 md:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <Card className="glass-card border-primary/20 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
          <CardHeader className="relative pb-6 pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
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
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Client Intake Form
                </CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigate(`/admin/cases/${caseId}`)}
                  size="lg"
                  variant="ghost"
                  className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-60"
                  title="Back to Case"
                >
                  <ArrowLeft className="h-8 w-8" />
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  size="lg"
                  variant="ghost"
                  className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-60"
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

        {/* Form with Tabs or Full View */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card border-primary/20">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50 flex items-center gap-2 pb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullView(!isFullView)}
                  className="ml-2 flex-shrink-0"
                  title={isFullView ? "Switch to tabbed view" : "Show all sections"}
                >
                  {isFullView ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </Button>
                <TabsList className="flex-1 grid grid-cols-2 md:grid-cols-8 h-auto p-2">
                    <TabsTrigger value="select" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Select...</span>
                    </TabsTrigger>
                    <TabsTrigger value="applicant" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Applicant</span>
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Contact</span>
                    </TabsTrigger>
                    <TabsTrigger value="address" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Address</span>
                    </TabsTrigger>
                    <TabsTrigger value="passport" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                      <Plane className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Passport</span>
                    </TabsTrigger>
                    <TabsTrigger value="immigration" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Immigration</span>
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Documents</span>
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Notes</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {isFullView ? (
                // Full View - All sections visible
                <div className="space-y-0">
                  <div className="border-b border-border/10">
                    <SelectSection {...contentProps} />
                  </div>
                  <div className="border-b border-border/10">
                    <ApplicantSection {...contentProps} />
                  </div>
                  <div className="border-b border-border/10">
                    <ContactSection {...contentProps} />
                  </div>
                  <div className="border-b border-border/10">
                    <AddressSection {...contentProps} />
                  </div>
                  <div className="border-b border-border/10">
                    <PassportSection {...contentProps} />
                  </div>
                  <div className="border-b border-border/10">
                    <ImmigrationSection {...contentProps} />
                  </div>
                  <div className="border-b border-border/10">
                    <DocumentsSection {...contentProps} />
                  </div>
                  <div>
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
          </Card>
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
