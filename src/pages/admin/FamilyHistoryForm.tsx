import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2, Save, Sparkles, Type, User, ArrowLeft, BookOpen } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useFormSync } from "@/hooks/useFormSync";

export default function FamilyHistoryForm() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const { formData, setFormData, isLoading, isSaving, saveData } = useFormSync(caseId);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { isLargeFonts, toggleFontSize } = useAccessibility();

  if (!caseId || caseId === ':id') {
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

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await saveData(formData);
  };

  const handleClearData = () => {
    setFormData({});
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Card className="glass-card border-primary/20 rounded-none border-x-0 border-t-0">
          <CardHeader className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => navigate(`/admin/cases/${caseId}`)}
                  size="lg"
                  variant="ghost"
                  className="h-16 w-16 rounded-full transition-all hover:bg-primary/10"
                  title="Back to case"
                >
                  <ArrowLeft className="h-8 w-8" />
                </Button>
                <div>
                  <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Family History
                  </CardTitle>
                  <CardDescription className="text-lg mt-2 text-muted-foreground">
                    Document the family's historical narrative, stories, and background
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-4">
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
                  className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10"
                  title="Toggle font size"
                >
                  <Type className={cn("transition-all", isLargeFonts ? "h-9 w-9" : "h-8 w-8")} />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Top Navigation Buttons */}
        <div className="bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-sm pb-4 pt-4">
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 p-3 md:p-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <Button 
              onClick={handleSave} 
              disabled={isSaving} 
              size="default" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 md:h-5 w-4 md:w-5 animate-spin mr-2 opacity-50" />
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Save data</span>
                </>
              )}
            </Button>

            <Button 
              onClick={() => setShowClearDialog(true)} 
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Clear Data</span>
            </Button>

            <Button 
              onClick={() => navigate(`/admin/case/${caseId}/intake`)} 
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Client Intake</span>
            </Button>

            <Button 
              onClick={() => navigate(`/admin/case/${caseId}/master-data`)} 
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Master Form</span>
            </Button>

            <Button 
              onClick={() => navigate(`/admin/case/${caseId}/family-tree`)} 
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Family Tree</span>
            </Button>

            {/* Current form - Family History - HIGHLIGHTED */}
            <Button 
              variant="default" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-gradient-to-r from-primary to-secondary shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[160px] md:min-w-[200px] lg:min-w-[240px] whitespace-nowrap flex-shrink-0"
            >
              <span className="text-white">Family History</span>
            </Button>

            <Button 
              onClick={() => navigate(`/admin/case/${caseId}/poa`)} 
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[180px] md:min-w-[220px] lg:min-w-[260px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Power of Attorney</span>
            </Button>

            <Button 
              onClick={() => navigate(`/admin/case/${caseId}/citizenship`)} 
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[200px] md:min-w-[240px] lg:min-w-[280px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Citizenship Application</span>
            </Button>

            <Button 
              onClick={() => navigate(`/admin/case/${caseId}/civil-registry`)} 
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[160px] md:min-w-[200px] lg:min-w-[240px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Civil Registry</span>
            </Button>

            <Button 
              onClick={() => navigate(`/admin/case/${caseId}/additional-data`)} 
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[160px] md:min-w-[200px] lg:min-w-[240px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Additional Data</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Form Content */}
      <div className="w-full px-4 py-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Card className="glass-card border-primary/20">
            <CardHeader className="border-b border-border/50 pb-6">
              <div className="flex items-center gap-4">
                <BookOpen className="h-12 w-12 text-primary" />
                <div>
                  <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Family Historical Narrative
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Record stories, traditions, and historical context about the family
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-10 space-y-8">
              {/* Family Origin Story */}
              <div className="space-y-4">
                <Label className={cn("text-lg font-semibold text-foreground", isLargeFonts && "text-2xl")}>
                  Family Origin Story
                </Label>
                <Textarea
                  value={formData.family_origin_story || ""}
                  onChange={(e) => handleInputChange("family_origin_story", e.target.value)}
                  placeholder="Describe where the family came from, when they emigrated, why they left Poland..."
                  className="min-h-[200px] text-base"
                />
              </div>

              {/* Immigration Journey */}
              <div className="space-y-4">
                <Label className={cn("text-lg font-semibold text-foreground", isLargeFonts && "text-2xl")}>
                  Immigration Journey
                </Label>
                <Textarea
                  value={formData.family_immigration_journey || ""}
                  onChange={(e) => handleInputChange("family_immigration_journey", e.target.value)}
                  placeholder="Details about how the family traveled, ports of entry, first settlements..."
                  className="min-h-[200px] text-base"
                />
              </div>

              {/* Cultural Traditions */}
              <div className="space-y-4">
                <Label className={cn("text-lg font-semibold text-foreground", isLargeFonts && "text-2xl")}>
                  Polish Cultural Traditions & Heritage
                </Label>
                <Textarea
                  value={formData.family_cultural_traditions || ""}
                  onChange={(e) => handleInputChange("family_cultural_traditions", e.target.value)}
                  placeholder="Polish traditions maintained, language spoken, religious practices, holidays celebrated..."
                  className="min-h-[200px] text-base"
                />
              </div>

              {/* Family Stories */}
              <div className="space-y-4">
                <Label className={cn("text-lg font-semibold text-foreground", isLargeFonts && "text-2xl")}>
                  Notable Family Stories & Anecdotes
                </Label>
                <Textarea
                  value={formData.family_stories || ""}
                  onChange={(e) => handleInputChange("family_stories", e.target.value)}
                  placeholder="Memorable stories passed down through generations, family legends, significant events..."
                  className="min-h-[200px] text-base"
                />
              </div>

              {/* Historical Context */}
              <div className="space-y-4">
                <Label className={cn("text-lg font-semibold text-foreground", isLargeFonts && "text-2xl")}>
                  Historical Context
                </Label>
                <Textarea
                  value={formData.family_historical_context || ""}
                  onChange={(e) => handleInputChange("family_historical_context", e.target.value)}
                  placeholder="Historical events that affected the family (wars, political changes, economic conditions)..."
                  className="min-h-[200px] text-base"
                />
              </div>

              {/* Additional Notes */}
              <div className="space-y-4">
                <Label className={cn("text-lg font-semibold text-foreground", isLargeFonts && "text-2xl")}>
                  Additional Notes & Information
                </Label>
                <Textarea
                  value={formData.family_history_notes || ""}
                  onChange={(e) => handleInputChange("family_history_notes", e.target.value)}
                  placeholder="Any other relevant information about the family history..."
                  className="min-h-[200px] text-base"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
