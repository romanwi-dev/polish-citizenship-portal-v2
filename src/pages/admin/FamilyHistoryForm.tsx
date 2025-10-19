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
    <div className={cn("relative min-h-full", isLargeFonts && "text-lg")}>
      <div className="relative z-10 pt-2 px-3 pb-3 md:p-6">
        <motion.div 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="mb-1 md:mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-4 pb-1 md:pb-6">
            <h2 className="text-3xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text text-center md:text-left flex-1">
              Family History
            </h2>
            <div className="flex items-center gap-1 md:gap-3 justify-center md:justify-end">
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
