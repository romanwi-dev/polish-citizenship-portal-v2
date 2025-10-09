import { useParams, useNavigate } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, Save, Sparkles, CheckCircle2, Type, User, FileText, GitBranch, Download, Heart, ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { POAFormField } from "@/components/POAFormField";
import { DateField } from "@/components/DateField";
import { Label } from "@/components/ui/label";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLongPressWithFeedback } from "@/hooks/useLongPressWithFeedback";
import { useFormAutoSave } from "@/hooks/useFormAutoSave";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { validateEmail, validatePassport } from "@/utils/validators";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useRealtimeFormSync } from "@/hooks/useRealtimeFormSync";

export default function IntakeForm() {
  const {
    id: caseId
  } = useParams();
  const navigate = useNavigate();
  const {
    data: masterData,
    isLoading
  } = useMasterData(caseId);
  const updateMutation = useUpdateMasterData();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { isLargeFonts, toggleFontSize } = useAccessibility();
  const [formData, setFormData] = useState<any>({});
  const [originalData, setOriginalData] = useState<any>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Enable real-time sync
  useRealtimeFormSync(caseId);

  useEffect(() => {
    if (masterData) {
      setFormData(masterData);
      setOriginalData(masterData);
    } else if (!isLoading) {
      // Initialize with empty object when no data exists
      setFormData({});
      setOriginalData({});
    }
  }, [masterData, isLoading]);

  useEffect(() => {
    setHasUnsavedChanges(JSON.stringify(formData) !== JSON.stringify(originalData));
  }, [formData, originalData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!caseId) return;

    // Validate email
    if (formData.applicant_email) {
      const emailValidation = validateEmail(formData.applicant_email);
      if (!emailValidation.valid) {
        toast.error(emailValidation.error);
        return;
      }
    }

    // Validate passport
    if (formData.applicant_passport_number) {
      const passportValidation = validatePassport(formData.applicant_passport_number);
      if (!passportValidation.valid) {
        toast.error(passportValidation.error);
        return;
      }
    }

    // No need to filter - useMasterData hook handles sanitization
    updateMutation.mutate({
      caseId,
      updates: formData
    }, {
      onSuccess: () => {
        setOriginalData(formData);
        setHasUnsavedChanges(false);
      }
    });
  };

  // Auto-save
  useFormAutoSave({
    formData,
    onSave: (data) => {
      if (caseId) {
        // No need to filter - useMasterData hook handles sanitization
        updateMutation.mutate({
          caseId,
          updates: data
        }, {
          onSuccess: () => {
            setOriginalData(data);
          }
        });
      }
    },
    delay: 5000,
    enabled: hasUnsavedChanges
  });

  // Unsaved changes warning
  useUnsavedChanges(hasUnsavedChanges);
  const clearAllFields = () => {
    setFormData({});
    toast.success("All fields cleared");
  };
  const clearField = (field: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: typeof prev[field] === 'boolean' ? false : typeof prev[field] === 'number' ? 0 : ""
    }));
    toast.success("Field cleared");
  };
  const titleLongPress = useLongPressWithFeedback({
    onLongPress: clearAllFields,
    duration: 2000,
    feedbackMessage: "Hold to clear all fields..."
  });
  const backgroundLongPress = useLongPressWithFeedback({
    onLongPress: () => setShowClearDialog(true),
    duration: 5000,
    feedbackMessage: "Hold to clear entire form..."
  });
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
  return <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-t from-background via-primary/5 to-background pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="sticky top-0 z-20 bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-sm border-b mb-0"
        >
          <Card className="glass-card border-primary/20 overflow-hidden rounded-none border-x-0 border-t-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
            <CardHeader className="relative pb-6 pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text">
                    Client Intake Form
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
            <Button onClick={handleSave} disabled={updateMutation.isPending} size="default" className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0">
              {updateMutation.isPending ? <>
                  <Loader2 className="h-4 md:h-5 w-4 md:w-5 animate-spin mr-2 opacity-50" />
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Saving...
                  </span>
                </> : <>
                  <Save className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Save data
                  </span>
                </>}
            </Button>
            <Button 
              onClick={() => setShowClearDialog(true)}
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0"
            >
              <Sparkles className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Clear All
              </span>
            </Button>
            <Button 
              onClick={() => navigate(`/admin/cases/${caseId}/master-data`)}
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Master Form
              </span>
            </Button>
            <Button 
              onClick={() => navigate(`/admin/cases/${caseId}/family-tree`)}
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Family Tree
              </span>
            </Button>
            <Button 
              onClick={() => navigate(`/admin/cases/${caseId}/poa`)}
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[180px] md:min-w-[220px] lg:min-w-[260px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Power of Attorney
              </span>
            </Button>
            <Button 
              onClick={() => navigate(`/admin/cases/${caseId}/citizenship`)}
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[200px] md:min-w-[240px] lg:min-w-[280px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Citizenship Application
              </span>
            </Button>
            <Button 
              onClick={() => navigate(`/admin/cases/${caseId}/civil-registry`)}
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[160px] md:min-w-[200px] lg:min-w-[240px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Civil Registry
              </span>
            </Button>
            <Button 
              onClick={() => navigate(`/admin/cases/${caseId}/additional-data`)}
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[160px] md:min-w-[200px] lg:min-w-[240px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Additional Data
              </span>
            </Button>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        duration: 0.5
      }}>
          <Card className="glass-card border-primary/20">
            <CardHeader className="border-b border-border/50 pb-6">
              <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Applicant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div onDoubleClick={() => clearField("applicant_first_name")}>
                  <POAFormField name="applicant_first_name" label="Given names (exactly like in your valid ID/ passport)" value={formData.applicant_first_name} onChange={value => handleInputChange("applicant_first_name", value)} delay={0} />
                </div>
                
                <div onDoubleClick={() => clearField("applicant_last_name")}>
                  <POAFormField name="applicant_last_name" label="Full last name (exactly like in your valid ID/ passport)" value={formData.applicant_last_name} onChange={value => handleInputChange("applicant_last_name", value)} delay={0.05} />
                </div>

                {/* Passport */}
                <div onDoubleClick={() => clearField("applicant_passport_number")}>
                  <POAFormField name="applicant_passport_number" label="Passport number" value={formData.applicant_passport_number} onChange={value => handleInputChange("applicant_passport_number", value)} delay={0.1} />
                </div>

                {/* Gender/Sex */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="space-y-4" 
                  onDoubleClick={() => clearField("applicant_sex")}
                >
                  <Label className={cn(
                    "font-light text-foreground/90",
                    isLargeFonts ? "text-xl" : "text-sm"
                  )}>Gender / Sex</Label>
                  <Select 
                    value={formData.applicant_sex || ""} 
                    onValueChange={(value) => handleInputChange("applicant_sex", value)}
                  >
                    <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-2 border-border shadow-xl z-50">
                      <SelectItem value="M" className="text-lg py-3 hover:bg-primary/10 cursor-pointer">Male</SelectItem>
                      <SelectItem value="F" className="text-lg py-3 hover:bg-primary/10 cursor-pointer">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Mobile */}
                <div onDoubleClick={() => clearField("applicant_phone")}>
                  <POAFormField name="applicant_phone" label="Mobile number" value={formData.applicant_phone} onChange={value => handleInputChange("applicant_phone", value)} delay={0.15} />
                </div>

                {/* Email */}
                <div onDoubleClick={() => clearField("applicant_email")}>
                  <POAFormField name="applicant_email" label="Email address" type="email" value={formData.applicant_email} onChange={value => handleInputChange("applicant_email", value.toLowerCase())} delay={0.2} />
                </div>

                {/* Confirm Email - Not stored in master_table, just for UI validation */}
                <div onDoubleClick={() => clearField("confirm_email")}>
                  <POAFormField name="confirm_email" label="Confirm your email address" type="email" value={formData.confirm_email} onChange={value => handleInputChange("confirm_email", value.toLowerCase())} delay={0.25} />
                </div>

                {/* Civil Status */}
                <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.3,
                duration: 0.4
              }} className="space-y-4" onDoubleClick={() => clearField("applicant_is_married")}>
                  <Label className={cn(
                    "font-light text-foreground/90",
                    isLargeFonts ? "text-xl" : "text-sm"
                  )}>Civil status</Label>
                  <Select value={formData.applicant_is_married ? "married" : "not_married"} onValueChange={value => handleInputChange("applicant_is_married", value === "married")}>
                    <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="not_married">Not Married</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Children Count */}
                <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.35,
                duration: 0.4
              }} className="space-y-4" onDoubleClick={() => {
                clearField("children_count");
                clearField("has_children");
              }}>
                  <Label className={cn(
                    "font-light text-foreground/90",
                    isLargeFonts ? "text-xl" : "text-sm"
                  )}>Number of children (including minors)</Label>
                  <Select value={formData.children_count?.toString() || "0"} onValueChange={value => {
                  const count = parseInt(value);
                  handleInputChange("children_count", count);
                  handleInputChange("has_children", count > 0);
                }}>
                    <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Minor Children if applicable */}
                {formData.children_count > 0 && <>
                    <motion.div initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  delay: 0.4,
                  duration: 0.4
                }} className="space-y-4" onDoubleClick={() => clearField("has_minor_children")}>
                      <Label className={cn(
                        "font-light text-foreground/90",
                        isLargeFonts ? "text-xl" : "text-sm"
                      )}>Do you have minor children (under 18)?</Label>
                      <Select value={formData.has_minor_children ? "yes" : "no"} onValueChange={value => handleInputChange("has_minor_children", value === "yes")}>
                        <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {formData.has_minor_children && <motion.div initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  delay: 0.45,
                  duration: 0.4
                }} className="space-y-4" onDoubleClick={() => clearField("minor_children_count")}>
                        <Label className={cn(
                          "font-light text-foreground/90",
                          isLargeFonts ? "text-xl" : "text-sm"
                        )}>How many minor kids?</Label>
                        <Select value={formData.minor_children_count?.toString() || "0"} onValueChange={value => handleInputChange("minor_children_count", parseInt(value))}>
                          <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({
                        length: formData.children_count + 1
                      }, (_, i) => i).map(num => <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                      </motion.div>}
                  </>}

                {/* Additional Information - Full Width */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="col-span-1 md:col-span-2 space-y-4"
                  onDoubleClick={() => clearField("applicant_notes")}
                >
                  <Label className={cn(
                    "font-light text-foreground/90",
                    isLargeFonts ? "text-xl" : "text-sm"
                  )}>Additional relevant information</Label>
                  <Textarea
                    value={formData.applicant_notes || ""}
                    onChange={(e) => handleInputChange("applicant_notes", e.target.value)}
                    placeholder=""
                    className="min-h-[120px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur resize-vertical"
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: '400'
                    }}
                  />
                </motion.div>
              </div>
            </CardContent>
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
            <AlertDialogAction onClick={clearAllFields}>
              Clear all fields
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>;
}