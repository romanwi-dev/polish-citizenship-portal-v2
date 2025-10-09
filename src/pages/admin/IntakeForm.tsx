import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2, Save, Sparkles, CheckCircle2, Type, User, FileText, GitBranch, Download, Heart, ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { POAFormField } from "@/components/POAFormField";
import { DateField } from "@/components/DateField";
import { Label } from "@/components/ui/label";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLongPressWithFeedback } from "@/hooks/useLongPressWithFeedback";
import { validateEmail, validatePassport } from "@/utils/validators";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useFormSync } from "@/hooks/useFormSync";

export default function IntakeForm() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const { formData, setFormData, isLoading, isSaving, saveData, clearAll, clearField } = useFormSync(caseId);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { isLargeFonts, toggleFontSize } = useAccessibility();


  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validate
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
            <Button onClick={handleSave} disabled={isSaving} size="default" className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0">
              {isSaving ? <>
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
              {/* Row 1: Gender and Civil Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Gender */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                  onDoubleClick={() => clearField("applicant_sex")}
                >
                  <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                    Gender / Płeć
                  </Label>
                  <Select
                    value={formData?.applicant_sex || ""}
                    onValueChange={(value) => handleInputChange("applicant_sex", value)}
                  >
                    <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-2 z-50">
                      <SelectItem value="Male / Mężczyzna" className="text-base cursor-pointer">
                        Male / Mężczyzna
                      </SelectItem>
                      <SelectItem value="Female / Kobieta" className="text-base cursor-pointer">
                        Female / Kobieta
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Civil Status */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-2"
                  onDoubleClick={() => clearField("applicant_is_married")}
                >
                  <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                    Civil status / Stan cywilny
                  </Label>
                  <Select
                    value={formData?.applicant_is_married === true ? "Married" : "Single"}
                    onValueChange={(value) => handleInputChange("applicant_is_married", value === "Married")}
                  >
                    <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-2 z-50">
                      <SelectItem value="Married" className="text-base cursor-pointer">
                        Married
                      </SelectItem>
                      <SelectItem value="Single" className="text-base cursor-pointer">
                        Single
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              </div>

              {/* Row 2: Children counts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Number of children */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                  onDoubleClick={() => clearField("children_count")}
                >
                  <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                    Number of children (including minors) / Liczba dzieci (w tym nieletnich)
                  </Label>
                  <Select
                    value={formData?.children_count?.toString() || ""}
                    onValueChange={(value) => {
                      const count = parseInt(value);
                      handleInputChange("children_count", count);
                    }}
                  >
                    <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-2 z-50">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()} className="text-base cursor-pointer">
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Number of minor children - only show if children_count > 0 */}
                {(formData?.children_count > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="space-y-2"
                    onDoubleClick={() => clearField("minor_children_count")}
                  >
                    <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                      Number of minor children (under 18)
                    </Label>
                    <Select
                      value={formData?.minor_children_count?.toString() || ""}
                      onValueChange={(value) => handleInputChange("minor_children_count", parseInt(value))}
                    >
                      <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        {Array.from({ length: (formData?.children_count || 0) + 1 }, (_, i) => i).map((num) => (
                          <SelectItem key={num} value={num.toString()} className="text-base cursor-pointer">
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </div>

              {/* Row 3: Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                  onDoubleClick={() => clearField("applicant_first_name")}
                >
                  <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                    Given names / Imię/ imiona
                  </Label>
                  <Input
                    value={formData?.applicant_first_name || ""}
                    onChange={(e) => handleInputChange("applicant_first_name", e.target.value.toUpperCase())}
                    className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="space-y-2"
                  onDoubleClick={() => clearField("applicant_last_name")}
                >
                  <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                    Full last name / Nazwisko
                  </Label>
                  <Input
                    value={formData?.applicant_last_name || ""}
                    onChange={(e) => handleInputChange("applicant_last_name", e.target.value.toUpperCase())}
                    className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                  />
                </motion.div>
              </div>

              {/* Row 4: Maiden name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                  onDoubleClick={() => clearField("applicant_maiden_name")}
                >
                  <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                    Maiden name / Nazwisko rodowe
                  </Label>
                  <Input
                    value={formData?.applicant_maiden_name || ""}
                    onChange={(e) => handleInputChange("applicant_maiden_name", e.target.value.toUpperCase())}
                    className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                  />
                </motion.div>
              </div>

              {/* Row 5: Place and Date of birth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="space-y-2"
                  onDoubleClick={() => clearField("applicant_pob")}
                >
                  <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                    Place of birth / Miejsce urodzenia
                  </Label>
                  <Input
                    value={formData?.applicant_pob || ""}
                    onChange={(e) => handleInputChange("applicant_pob", e.target.value.toUpperCase())}
                    className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                  />
                </motion.div>
                <DateField
                  name="applicant_dob"
                  label="Date of birth / Data urodzenia"
                  value={formData?.applicant_dob}
                  onChange={(value) => handleInputChange("applicant_dob", value)}
                />
              </div>

              {/* Marriage fields - Only show if married */}
              {formData?.applicant_is_married && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                    onDoubleClick={() => clearField("place_of_marriage")}
                  >
                    <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                      Place of marriage / Miejsce zawarcia związku małżeńskiego
                    </Label>
                    <Input
                      value={formData?.place_of_marriage || ""}
                      onChange={(e) => handleInputChange("place_of_marriage", e.target.value.toUpperCase())}
                      className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                      style={{ fontSize: '1.125rem', fontWeight: '400' }}
                    />
                  </motion.div>
                  <DateField
                    name="date_of_marriage"
                    label="Date of marriage / Data zawarcia związku małżeńskiego"
                    value={formData?.date_of_marriage}
                    onChange={(value) => handleInputChange("date_of_marriage", value)}
                  />
                </div>
              )}

              {/* Contact information */}
              <div className="pt-8">
                <h3 className="text-xl font-semibold mb-6 text-foreground">Contact information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                    onDoubleClick={() => clearField("applicant_email")}
                  >
                    <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                      Email
                    </Label>
                    <Input
                      value={formData?.applicant_email || ""}
                      onChange={(e) => handleInputChange("applicant_email", e.target.value)}
                      type="email"
                      className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur"
                      style={{ fontSize: '1.125rem', fontWeight: '400' }}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                    onDoubleClick={() => clearField("applicant_phone")}
                  >
                    <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                      Phone
                    </Label>
                    <Input
                      value={formData?.applicant_phone || ""}
                      onChange={(e) => handleInputChange("applicant_phone", e.target.value)}
                      className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur"
                      style={{ fontSize: '1.125rem', fontWeight: '400' }}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Passport information */}
              <div className="pt-8">
                <h3 className="text-xl font-semibold mb-6 text-foreground">Passport information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                    onDoubleClick={() => clearField("applicant_passport_number")}
                  >
                    <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                      Passport number
                    </Label>
                    <Input
                      value={formData?.applicant_passport_number || ""}
                      onChange={(e) => handleInputChange("applicant_passport_number", e.target.value.toUpperCase())}
                      className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                      style={{ fontSize: '1.125rem', fontWeight: '400' }}
                    />
                  </motion.div>
                  <DateField
                    name="applicant_passport_expiry_date"
                    label="Passport expiry date"
                    value={formData?.applicant_passport_expiry_date}
                    onChange={(value) => handleInputChange("applicant_passport_expiry_date", value)}
                  />
                </div>
              </div>

              {/* Immigration information */}
              <div className="pt-8">
                <h3 className="text-xl font-semibold mb-6 text-foreground">Immigration information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DateField
                    name="applicant_date_of_emigration"
                    label="Date of emigration"
                    value={formData?.applicant_date_of_emigration}
                    onChange={(value) => handleInputChange("applicant_date_of_emigration", value)}
                  />
                  <DateField
                    name="applicant_date_of_naturalization"
                    label="Date of naturalization"
                    value={formData?.applicant_date_of_naturalization}
                    onChange={(value) => handleInputChange("applicant_date_of_naturalization", value)}
                  />
                </div>
              </div>

              {/* Address Section - Coming Soon Placeholder */}
              <div className="pt-8">
                <h3 className="text-xl font-semibold mb-6 text-foreground">Address information</h3>
                <div className="p-6 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5 text-center">
                  <p className="text-muted-foreground">
                    Address fields will be added here to match the Master Form
                  </p>
                </div>
              </div>

              {/* Documents Required */}
              <div className="pt-8">
                <h3 className="text-xl font-semibold mb-6 text-foreground">Documents required</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="applicant_has_polish_documents"
                      checked={formData?.applicant_has_polish_documents || false}
                      onCheckedChange={(checked) => handleInputChange("applicant_has_polish_documents", checked)}
                    />
                    <Label htmlFor="applicant_has_polish_documents" className="cursor-pointer">Polish documents</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="applicant_has_passport"
                      checked={formData?.applicant_has_passport || false}
                      onCheckedChange={(checked) => handleInputChange("applicant_has_passport", checked)}
                    />
                    <Label htmlFor="applicant_has_passport" className="cursor-pointer">Passport copy</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="applicant_has_birth_cert"
                      checked={formData?.applicant_has_birth_cert || false}
                      onCheckedChange={(checked) => handleInputChange("applicant_has_birth_cert", checked)}
                    />
                    <Label htmlFor="applicant_has_birth_cert" className="cursor-pointer">Birth certificate</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="applicant_has_marriage_cert"
                      checked={formData?.applicant_has_marriage_cert || false}
                      onCheckedChange={(checked) => handleInputChange("applicant_has_marriage_cert", checked)}
                    />
                    <Label htmlFor="applicant_has_marriage_cert" className="cursor-pointer">Marriage certificate</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="applicant_has_naturalization"
                      checked={formData?.applicant_has_naturalization || false}
                      onCheckedChange={(checked) => handleInputChange("applicant_has_naturalization", checked)}
                    />
                    <Label htmlFor="applicant_has_naturalization" className="cursor-pointer">Naturalization certificate</Label>
                  </div>
                  {(formData?.applicant_sex === "Male / Mężczyzna" || formData?.sex === "Male / Mężczyzna") && (
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="applicant_has_military_record"
                        checked={formData?.applicant_has_military_record || false}
                        onCheckedChange={(checked) => handleInputChange("applicant_has_military_record", checked)}
                      />
                      <Label htmlFor="applicant_has_military_record" className="cursor-pointer">Military record (males only)</Label>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="applicant_has_foreign_documents"
                      checked={formData?.applicant_has_foreign_documents || false}
                      onCheckedChange={(checked) => handleInputChange("applicant_has_foreign_documents", checked)}
                    />
                    <Label htmlFor="applicant_has_foreign_documents" className="cursor-pointer">Foreign documents</Label>
                  </div>
                </div>
              </div>

              {/* Additional notes */}
              <div className="pt-8">
                <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                  Additional notes
                </Label>
                <Textarea
                  value={formData?.applicant_notes || ""}
                  onChange={(e) => handleInputChange("applicant_notes", e.target.value.toUpperCase())}
                  className="mt-2 min-h-[100px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                  style={{ fontSize: '1.125rem', fontWeight: '400' }}
                />
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
            <AlertDialogAction onClick={clearAll}>
              Clear all fields
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>;
}