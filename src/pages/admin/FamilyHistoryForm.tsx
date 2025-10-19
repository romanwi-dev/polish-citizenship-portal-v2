import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Sparkles, Type, User, ArrowLeft, BookOpen, Maximize2, Minimize2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useFormManager } from "@/hooks/useFormManager";
import { FormButtonsRow } from "@/components/FormButtonsRow";
import { FormHeader, FormLabel } from "@/components/forms";

export default function FamilyHistoryForm() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const { isLargeFonts, toggleFontSize } = useAccessibility();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
  
  // Use the universal form manager
  const {
    formData,
    isLoading,
    isSaving,
    completion,
    handleInputChange,
    handleSave,
    handleClearAll,
  } = useFormManager(caseId, []);

  if (caseId !== 'demo-preview' && (!caseId || caseId === ':id')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Invalid Case ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please navigate to this page from a valid case.</p>
            <Button onClick={() => navigate('/admin/cases')} className="mt-4">
              Go to Cases
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleClearData = async () => {
    await handleClearAll();
    setShowClearDialog(false);
    toast.success('All family history data cleared');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Sparkles className="h-16 w-16 text-primary" />
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden min-h-screen relative">
      <div className="container mx-auto py-3 md:py-12 px-4 md:px-6 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="mb-1 md:mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-4 pb-1 md:pb-6">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text text-center md:text-left">
                Family History
              </h1>
            </motion.div>
            <div className="flex items-center gap-1 md:gap-3 justify-center md:justify-end">
              <Button
                onClick={() => navigate('/admin/forms-demo')}
                size="lg"
                variant="ghost"
                className="h-12 w-12 md:h-16 md:w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 z-50 opacity-60"
                title="Back to Case"
              >
                <ArrowLeft className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
              <Button
                onClick={() => setIsFullView(!isFullView)}
                size="lg"
                variant="ghost"
                className={`h-12 w-12 md:h-16 md:w-16 rounded-full transition-all hover:bg-primary/10 ${
                  isFullView ? 'bg-primary/20 text-primary opacity-100' : 'text-muted-foreground hover:text-primary opacity-60'
                }`}
                title={isFullView ? "Collapse to Tabs" : "Expand All Sections"}
              >
                {isFullView ? <Minimize2 className="h-6 w-6 md:h-8 md:w-8" /> : <Maximize2 className="h-6 w-6 md:h-8 md:w-8" />}
              </Button>
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                variant="ghost"
                className="h-12 w-12 md:h-16 md:w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 z-50 opacity-60"
                title="Login / Register"
              >
                <User className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
              <Button
                onClick={toggleFontSize}
                size="lg"
                variant="ghost"
                className={`h-12 w-12 md:h-16 md:w-16 rounded-full transition-all hover:bg-primary/10 z-50 opacity-60 ${
                  isLargeFonts ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-primary'
                }`}
                title="Toggle font size"
              >
                <Type className="h-6 w-6 md:h-8 md:w-8" />
              </Button>
              <Button
                onClick={() => window.open('https://docs.lovable.dev', '_blank')}
                size="lg"
                variant="ghost"
                className="h-12 w-12 md:h-16 md:w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 text-xl md:text-2xl font-light opacity-60"
                title="How to fill this form"
              >
                ?
              </Button>
            </div>
          </div>
        </motion.div>

        <FormButtonsRow 
          caseId={caseId!}
          currentForm="family-history"
          onSave={handleSave}
          onClear={() => setShowClearDialog(true)}
          onGeneratePDF={() => {}}
          isSaving={isSaving}
        />

        {/* Form Content */}
        <div className="space-y-2 md:space-y-6">
          <Textarea
              value={formData.family_history_notes || ""}
              onChange={(e) => handleInputChange("family_history_notes", e.target.value)}
              placeholder=""
              className={cn("min-h-[600px] text-base border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur", isLargeFonts && "text-xl")}
            />
        </div>
      </div>

      {/* Clear Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all family history data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all family history information. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData}>Clear all fields</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
