import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Loader2, Type, Maximize2, Minimize2, User, Phone, MapPin, Plane, Users, FolderOpen, MessageSquare, ArrowLeft, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { validateEmail, validatePassport } from "@/utils/validators";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormButtonsRow } from "@/components/FormButtonsRow";
import { SelectSection, ApplicantSection, ContactSection, AddressSection, PassportSection, NotesSection } from "@/components/IntakeFormContent";
import { useFormManager } from "@/hooks/useFormManager";
import { INTAKE_FORM_REQUIRED_FIELDS, INTAKE_DATE_FIELDS } from "@/config/formRequiredFields";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";

export default function IntakeForm() {
  const navigate = useNavigate();
  const { id: caseId } = useParams();
  const { isLargeFonts, toggleFontSize } = useAccessibility();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const tabsListRef = useRef<HTMLDivElement>(null);

  const {
    formData,
    isLoading,
    isSaving,
    activeTab,
    setActiveTab,
    isFullView,
    setIsFullView,
    completion,
    validation,
    autoSave,
    handleInputChange,
    handleSave,
    handleClearAll,
  } = useFormManager(caseId, INTAKE_FORM_REQUIRED_FIELDS, INTAKE_DATE_FIELDS);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({
    select: null,
    applicant: null,
    contact: null,
    address: null,
    passport: null,
    notes: null
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (isFullView && sectionRefs.current[value]) {
      const element = sectionRefs.current[value];
      if (element) {
        const yOffset = -100;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const contentProps = {
    formData,
    handleInputChange,
    clearField: (field: string) => handleInputChange(field, null),
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
...
        </motion.div>
      </div>

      {/* Button rows - OUTSIDE container for full width */}
      <div className="relative z-10">
        <div className="w-full px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <FormButtonsRow 
              caseId={caseId!}
              currentForm="intake"
              onSave={() => {}}
              onClear={() => {}}
              onGeneratePDF={() => {}}
              isSaving={false}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
        {/* Form with Tabs or Full View */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="space-y-8">
          <Tabs defaultValue="select" value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="sticky top-0 z-50 border-b border-border/50 pb-2 pt-2 w-screen -ml-[50vw] left-[50%]">
              <div className="flex gap-3 items-center overflow-x-auto scrollbar-hide px-4 md:px-6">
                {/* Save and Clear Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center whitespace-nowrap px-6 md:px-8 lg:px-10 py-2 text-sm md:text-base lg:text-lg font-bold rounded backdrop-blur-md border transition-all bg-green-500/20 hover:bg-green-500/30 border-green-400/40 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] opacity-50"
                  >
                    <Save className="mr-2 h-4 w-4 opacity-50" />
                    <span className="text-green-100 font-bold opacity-50">{isSaving ? "Saving..." : "Save"}</span>
                  </button>
                  
                  <button
                    onClick={() => setShowClearDialog(true)}
                    className="inline-flex items-center justify-center whitespace-nowrap px-6 md:px-8 lg:px-10 py-2 text-sm md:text-base lg:text-lg font-bold rounded backdrop-blur-md border transition-all bg-red-500/20 hover:bg-red-500/30 border-red-400/40 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] opacity-50"
                  >
                    <Sparkles className="mr-2 h-4 w-4 opacity-50" />
                    <span className="text-red-100 font-bold opacity-50">Clear</span>
                  </button>
                </div>

                {/* Tabs */}
                <TabsList ref={tabsListRef} className="inline-flex justify-start gap-2 bg-transparent p-0">
                  <TabsTrigger value="select" className="flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400">Select...</span>
                  </TabsTrigger>
                  <TabsTrigger value="applicant" className="flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400">Applicant</span>
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400">Contact</span>
                  </TabsTrigger>
                  <TabsTrigger value="address" className="flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400">Address</span>
                  </TabsTrigger>
                  <TabsTrigger value="passport" className="flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400">Passport</span>
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400">Notes</span>
                  </TabsTrigger>
                </TabsList>
              </div>
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
            <AlertDialogAction onClick={() => { handleClearAll(); setShowClearDialog(false); }}>
              Clear all fields
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
