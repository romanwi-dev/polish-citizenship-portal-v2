import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Sparkles, Award, Building, FileCheck, BookOpen, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useLayoutEffect, lazy, Suspense } from "react";
import { Loader2, Type, Maximize2, Minimize2, User, Phone, MapPin, Plane, Users, FolderOpen, MessageSquare, ArrowLeft, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StaticHeritagePlaceholder } from "@/components/heroes/StaticHeritagePlaceholder";

const StaticHeritage = lazy(() => import("@/components/heroes/StaticHeritage").then(m => ({ default: m.StaticHeritage })));
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { validateEmail, validatePassport } from "@/utils/validators";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormButtonsRow } from "@/components/FormButtonsRow";
import { SelectSection, ApplicantSection, SpouseSection, ChildrenSection, ContactSection, AddressSection, PassportSection, NotesSection } from "@/components/IntakeFormContent";
import { useFormManager } from "@/hooks/useFormManager";
import { INTAKE_FORM_REQUIRED_FIELDS, INTAKE_DATE_FIELDS } from "@/config/formRequiredFields";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";

export default function IntakeForm() {
  const navigate = useNavigate();
  const { id: caseId } = useParams();
  const { isLargeFonts, toggleFontSize } = useAccessibility();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const tabsListRef = useRef<HTMLDivElement | null>(null);

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

  const handleGeneratePDF = async () => {
    if (!caseId) return;
    toast.info('Intake form does not have a PDF template yet');
  };

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({
    select: null,
    applicant: null,
    spouse: null,
    children: null,
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

  // Force scroll to Select tab on mount
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Wait for DOM to be fully ready, then scroll
    const timer = setTimeout(() => {
      const selectTrigger = document.querySelector('[data-state="active"]');
      if (selectTrigger) {
        selectTrigger.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'start' });
      } else if (tabsListRef.current) {
        tabsListRef.current.scrollLeft = 0;
      }
    }, 150);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
          <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text text-center leading-tight whitespace-nowrap">
            Client Intake
          </h2>
          <div className="flex items-center justify-center gap-1 md:gap-3 mt-2 md:mt-4">
              <Button
                onClick={() => navigate('/admin/forms-demo')}
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-10 md:w-10"
                title="Back to Control Room"
              >
                <ArrowLeft className="h-3.5 w-3.5 md:h-6 md:w-6" />
              </Button>
              <Button
                onClick={() => setIsFullView(!isFullView)}
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-10 md:w-10"
                title={isFullView ? "Collapse to Tabs" : "Expand All Sections"}
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
                title="Toggle font size"
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
          currentForm="intake"
          formData={formData}
          onSave={handleSave}
          onClear={() => setShowClearDialog(true)}
          onGeneratePDF={handleGeneratePDF}
          saveLabel="Save data"
          isSaving={isSaving || isGenerating}
        />

        {/* Form with Tabs or Full View */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="pb-32 -mt-4">
          <Tabs defaultValue="select" value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="sticky top-0 z-50 border-b border-border/50 pb-2 -mx-4 md:-mx-6 -mt-2">
              <TabsList ref={tabsListRef} className="w-full inline-flex gap-0.5 overflow-x-auto scrollbar-hide bg-transparent p-0 px-0 md:px-6">
                <TabsTrigger value="select" className="flex-shrink-0 md:flex-1 scroll-snap-align-start">
                  <span className="text-blue-600 dark:text-blue-400">Select</span>
                </TabsTrigger>
                <TabsTrigger value="applicant" className="flex-shrink-0 md:flex-1">
                  <span className="text-blue-600 dark:text-blue-400">Applicant</span>
                </TabsTrigger>
                <TabsTrigger value="spouse" className="flex-shrink-0 md:flex-1">
                  <span className="text-blue-600 dark:text-blue-400">Spouse</span>
                </TabsTrigger>
                <TabsTrigger value="children" className="flex-shrink-0 md:flex-1">
                  <span className="text-blue-600 dark:text-blue-400">Children</span>
                </TabsTrigger>
                <TabsTrigger value="passport" className="flex-shrink-0 md:flex-1">
                  <span className="text-blue-600 dark:text-blue-400">Passport</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex-shrink-0 md:flex-1">
                  <span className="text-blue-600 dark:text-blue-400">Contact</span>
                </TabsTrigger>
                <TabsTrigger value="address" className="flex-shrink-0 md:flex-1">
                  <span className="text-blue-600 dark:text-blue-400">Address</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex-shrink-0 md:flex-1">
                  <span className="text-blue-600 dark:text-blue-400">Notes</span>
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
                <div ref={(el) => sectionRefs.current.spouse = el} className="border-b border-border/10">
                  <SpouseSection {...contentProps} />
                </div>
                <div ref={(el) => sectionRefs.current.children = el} className="border-b border-border/10">
                  <ChildrenSection {...contentProps} />
                </div>
                <div ref={(el) => sectionRefs.current.passport = el} className="border-b border-border/10">
                  <PassportSection {...contentProps} />
                </div>
                <div ref={(el) => sectionRefs.current.contact = el} className="border-b border-border/10">
                  <ContactSection {...contentProps} />
                </div>
                <div ref={(el) => sectionRefs.current.address = el} className="border-b border-border/10">
                  <AddressSection {...contentProps} />
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
                <TabsContent value="spouse" className="mt-0">
                  <SpouseSection {...contentProps} />
                </TabsContent>
                <TabsContent value="children" className="mt-0">
                  <ChildrenSection {...contentProps} />
                </TabsContent>
                <TabsContent value="passport" className="mt-0">
                  <PassportSection {...contentProps} />
                </TabsContent>
                <TabsContent value="contact" className="mt-0">
                  <ContactSection {...contentProps} />
                </TabsContent>
                <TabsContent value="address" className="mt-0">
                  <AddressSection {...contentProps} />
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
