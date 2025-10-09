import { useParams, useNavigate } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Loader2, Save, Download, FileCheck, Sparkles, Type, FilePlus, User, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLongPressWithFeedback } from "@/hooks/useLongPressWithFeedback";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useRealtimeFormSync } from "@/hooks/useRealtimeFormSync";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export default function CitizenshipForm() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const { data: masterData, isLoading } = useMasterData(caseId);
  const updateMutation = useUpdateMasterData();
  const { isLargeFonts, toggleFontSize } = useAccessibility();
  const [formData, setFormData] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  
  // Enable real-time sync with direct state updates
  useRealtimeFormSync(caseId, masterData, isLoading, setFormData);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const clearCardFields = (fieldNames: string[], cardTitle: string) => {
    const clearedFields: any = {};
    fieldNames.forEach((name) => {
      clearedFields[name] = "";
    });
    setFormData((prev: any) => ({ ...prev, ...clearedFields }));
    toast.success(`Cleared all fields in ${cardTitle}`);
  };

  const clearAllFields = () => {
    setFormData({});
    toast.success("Cleared all fields");
    setShowClearAllDialog(false);
  };

  const handleSave = () => {
    if (!caseId) return;
    updateMutation.mutate({ caseId, updates: formData });
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      toast.loading("Generating Citizenship Application PDF...");

      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType: 'citizenship' },
      });

      if (error) throw error;

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `citizenship-application-${caseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Citizenship Application PDF generated successfully!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Failed to generate PDF: ${error.message}`);
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

  // Section 1: Person Data
  const {
    handlers: section1LongPressHandlers,
    isPressed: isSection1Pressed
  } = useLongPressWithFeedback({
    onLongPress: () => clearCardFields([
      "applicant_last_name", "applicant_maiden_name", "applicant_first_name",
      "father_first_name", "mother_first_name", "applicant_sex", "applicant_pob",
      "applicant_other_citizenships"
    ], "Person Data"),
    duration: 2000,
    feedbackMessage: "Hold for 2 seconds to clear this section..."
  });

  // Section 2: Parents Data
  const {
    handlers: section2LongPressHandlers,
    isPressed: isSection2Pressed
  } = useLongPressWithFeedback({
    onLongPress: () => clearCardFields([
      "mother_last_name", "mother_maiden_name", "mother_first_name", "mother_pob",
      "father_last_name", "father_first_name", "father_pob", "father_mother_marriage_place"
    ], "Parents Data"),
    duration: 2000,
    feedbackMessage: "Hold for 2 seconds to clear this section..."
  });

  // Section 3: Grandparents Data
  const {
    handlers: section3LongPressHandlers,
    isPressed: isSection3Pressed
  } = useLongPressWithFeedback({
    onLongPress: () => clearCardFields([
      "mgf_last_name", "mgf_first_name", "mgf_pob",
      "mgm_last_name", "mgm_maiden_name", "mgm_first_name", "mgm_pob",
      "pgf_last_name", "pgf_first_name", "pgf_pob",
      "pgm_last_name", "pgm_maiden_name", "pgm_first_name", "pgm_pob"
    ], "Grandparents Data"),
    duration: 2000,
    feedbackMessage: "Hold for 2 seconds to clear this section..."
  });

  // Section 4: Address Data
  const {
    handlers: section4LongPressHandlers,
    isPressed: isSection4Pressed
  } = useLongPressWithFeedback({
    onLongPress: () => clearCardFields([
      "applicant_address_street", "applicant_address_city", "applicant_address_state",
      "applicant_address_postal", "applicant_address_country", "applicant_phone", "applicant_email"
    ], "Address Data"),
    duration: 2000,
    feedbackMessage: "Hold for 2 seconds to clear this section..."
  });

  // Section 5: Additional Info
  const {
    handlers: section5LongPressHandlers,
    isPressed: isSection5Pressed
  } = useLongPressWithFeedback({
    onLongPress: () => clearCardFields([
      "applicant_notes"
    ], "Additional Information"),
    duration: 2000,
    feedbackMessage: "Hold for 2 seconds to clear this section..."
  });

  // Section 6: Biographies
  const {
    handlers: section6LongPressHandlers,
    isPressed: isSection6Pressed
  } = useLongPressWithFeedback({
    onLongPress: () => clearCardFields([
      "applicant_notes", "mother_notes", "father_notes",
      "mgf_notes", "mgm_notes", "pgf_notes", "pgm_notes"
    ], "Biographies"),
    duration: 2000,
    feedbackMessage: "Hold for 2 seconds to clear this section..."
  });

  const renderDateField = (name: string, label: string) => {
    const dateValue = formData[name] ? new Date(formData[name]) : undefined;
    
    return (
      <div className="space-y-2">
        <Label htmlFor={name} className={cn(
          "font-light text-foreground/90",
          isLargeFonts ? "text-xl" : "text-sm"
        )}>
          {label}
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-16 justify-start text-left font-normal border-2 hover-glow bg-card/50 backdrop-blur transition-all",
                !dateValue && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-5 w-5" />
              {dateValue ? format(dateValue, "dd/MM/yyyy") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={(date) => handleInputChange(name, date ? format(date, "yyyy-MM-dd") : "")}
              disabled={(date) => date > new Date("2030-12-31") || date < new Date("1900-01-01")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const renderFieldGroup = (fields: Array<{ name: string; label: string; type?: string; placeholder?: string }>) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field, idx) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="space-y-2"
            onDoubleClick={() => !field.type && handleInputChange(field.name, "")}
          >
            {field.type === "date" ? (
              renderDateField(field.name, field.label)
            ) : (
              <>
                <Label htmlFor={field.name} className={cn(
                  "font-light text-foreground/90",
                  isLargeFonts ? "text-xl" : "text-sm"
                )}>
                  {field.label}
                </Label>
                <Input
                  id={field.name}
                  type={field.type || "text"}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value.toUpperCase())}
                  placeholder={field.placeholder || ""}
                  className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                />
              </>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  const renderTextarea = (name: string, label: string, rows = 4) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <Label htmlFor={name} className={cn(
          "font-light text-foreground/90",
          isLargeFonts ? "text-xl" : "text-sm"
        )}>
          {label}
        </Label>
        <Textarea
          id={name}
          value={formData[name] || ""}
          onChange={(e) => handleInputChange(name, e.target.value.toUpperCase())}
          rows={rows}
          className="border-2 hover-glow focus:shadow-lg transition-all resize-vertical bg-card/50 backdrop-blur uppercase"
        />
      </motion.div>
    );
  };

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-16 w-16 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
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
                    Citizenship Application
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
                    Save data
                  </span>
                </>
              )}
            </Button>
            <Button 
              onClick={handleGeneratePDF} 
              disabled={isGenerating} 
              variant="outline" 
              className="text-sm md:text-base lg:text-xl font-bold px-6 md:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[160px] md:min-w-[220px] lg:min-w-[260px] whitespace-nowrap"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3 md:h-4 lg:h-5 w-3 md:w-4 lg:w-5 animate-spin mr-1 md:mr-2 opacity-50" />
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Generating...
                  </span>
                </>
              ) : (
                <>
                  <Download className="h-3 md:h-4 lg:h-5 w-3 md:w-4 lg:w-5 mr-1 md:mr-2 opacity-50" />
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Generate PDF
                  </span>
                </>
              )}
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
            <Button 
              onClick={() => navigate(`/admin/cases/${caseId}/additional-data`)}
              size="default" 
              className="text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Additional Data
              </span>
            </Button>
          </div>
        </motion.div>

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Part I - Person Data */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={cn(
              "glass-card border-primary/20 transition-opacity",
              isSection1Pressed && "opacity-70"
            )}>
              <CardHeader 
                className="border-b border-border/50 pb-6 cursor-pointer"
                {...section1LongPressHandlers}
              >
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold text-primary">
                  CZĘŚĆ I - Dane osoby, której dotyczy wniosek
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-10">
                {/* Row 1: Gender and Civil Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gender */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
                    <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                      Gender / Płeć
                    </Label>
                    <Select value={formData.applicant_sex || ""} onValueChange={(value) => handleInputChange("applicant_sex", value)}>
                      <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        <SelectItem value="Male / Mężczyzna" className="text-base cursor-pointer">Male / Mężczyzna</SelectItem>
                        <SelectItem value="Female / Kobieta" className="text-base cursor-pointer">Female / Kobieta</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Civil Status */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2">
                    <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                      Civil status / Stan cywilny
                    </Label>
                    <Select value={formData.applicant_is_married === true ? "Married" : formData.applicant_is_married === false ? "Single" : undefined} onValueChange={(value) => handleInputChange("applicant_is_married", value === "Married")}>
                      <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        <SelectItem value="Married" className="text-base cursor-pointer">Married</SelectItem>
                        <SelectItem value="Single" className="text-base cursor-pointer">Single</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                </div>

                {/* Row 2: Children counts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Number of children */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
                    <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                      Number of children (including minors) / Liczba dzieci (w tym nieletnich)
                    </Label>
                    <Select value={formData.children_count?.toString() || ""} onValueChange={(value) => { const count = parseInt(value); handleInputChange("children_count", count); }}>
                      <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (<SelectItem key={num} value={num.toString()} className="text-base cursor-pointer">{num}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Number of minor children - only show if children_count > 0 */}
                  {(formData.children_count > 0) && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-2">
                      <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                        Number of minor children (under 18)
                      </Label>
                      <Select value={formData.minor_children_count?.toString() || ""} onValueChange={(value) => handleInputChange("minor_children_count", parseInt(value))}>
                        <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-2 z-50">
                          {Array.from({ length: (formData.children_count || 0) + 1 }, (_, i) => i).map((num) => (<SelectItem key={num} value={num.toString()} className="text-base cursor-pointer">{num}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </div>

                {renderFieldGroup([
                  { name: "applicant_first_name", label: "Imię/ imiona / Given names" },
                  { name: "applicant_last_name", label: "Nazwisko / Full last name" }
                ])}
                
                {renderFieldGroup([
                  { name: "applicant_pob", label: "Miejsce urodzenia / Place of birth" },
                  { name: "applicant_dob", label: "Data urodzenia / Date of birth", type: "date" }
                ])}
                
                {/* Marriage Information - Only show if married */}
                {formData.applicant_is_married && (
                  <div className="pt-6">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Marriage Information / Dane małżeństwa</h3>
                    {renderFieldGroup([
                      { name: "place_of_marriage", label: "Miejsce zawarcia związku małżeńskiego / Place of marriage" },
                      { name: "date_of_marriage", label: "Data zawarcia związku małżeńskiego / Date of marriage", type: "date" }
                    ])}
                  </div>
                )}
                
                {renderFieldGroup([
                  { name: "applicant_maiden_name", label: "Nazwisko rodowe / Maiden name" },
                  { name: "father_first_name", label: "Imię i nazwisko ojca / Father's full name" }
                ])}
                
                {renderFieldGroup([
                  { name: "mother_first_name", label: "Imię i nazwisko rodowe matki / Mother's full name" }
                ])}
                
                <div className="pt-6">
                  {renderTextarea("applicant_other_citizenships", "Posiadane obce obywatelstwa wraz z datą nabycia / Foreign citizenships with acquisition date", 3)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Part I - Parents Data */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className={cn(
              "glass-card border-primary/20 transition-opacity",
              isSection2Pressed && "opacity-70"
            )}>
              <CardHeader 
                className="border-b border-border/50 pb-6 cursor-pointer"
                {...section2LongPressHandlers}
              >
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold text-primary">
                  Dane osobowe rodziców / Parents Personal Data
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-10">
                {/* Mother */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-foreground border-b pb-2">Dane dotyczące matki / Mother's Data</h3>
                  {renderFieldGroup([
                    { name: "mother_last_name", label: "Nazwisko / Full last name" },
                    { name: "mother_maiden_name", label: "Nazwisko rodowe / Maiden name" },
                    { name: "mother_first_name", label: "Imię/ imiona / Given names" },
                    { name: "mother_dob", label: "Data urodzenia / Date of birth", type: "date" },
                    { name: "mother_pob", label: "Miejsce urodzenia / Place of birth" },
                  ])}
                </div>

                {/* Father */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-foreground border-b pb-2">Dane dotyczące ojca / Father's Data</h3>
                  {renderFieldGroup([
                    { name: "father_last_name", label: "Nazwisko / Full last name" },
                    { name: "father_first_name", label: "Imię/ imiona / Given names" },
                    { name: "father_dob", label: "Data urodzenia / Date of birth", type: "date" },
                    { name: "father_pob", label: "Miejsce urodzenia / Place of birth" },
                    { name: "father_mother_marriage_date", label: "Data zawarcia związku małżeńskiego / Date of marriage", type: "date" },
                    { name: "father_mother_marriage_place", label: "Miejsce zawarcia związku małżeńskiego / Place of marriage" },
                  ])}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Part I - Grandparents Data */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className={cn(
              "glass-card border-primary/20 transition-opacity",
              isSection3Pressed && "opacity-70"
            )}>
              <CardHeader 
                className="border-b border-border/50 pb-6 cursor-pointer"
                {...section3LongPressHandlers}
              >
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold text-primary">
                  Dane osobowe dalszych wstępnych / Grandparents Data
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-10">
                {/* Maternal Grandfather */}
                <div className="p-6 border-2 border-border/50 rounded-xl bg-card/30 backdrop-blur space-y-6">
                  <h3 className="text-2xl font-semibold text-foreground">Dziadek ze strony matki / Maternal Grandfather</h3>
                  {renderFieldGroup([
                    { name: "mgf_last_name", label: "Nazwisko / Full last name" },
                    { name: "mgf_first_name", label: "Imię/ imiona / Given names" },
                    { name: "mgf_dob", label: "Data urodzenia / Date of birth", type: "date" },
                    { name: "mgf_pob", label: "Miejsce urodzenia / Place of birth" },
                  ])}
                </div>

                {/* Maternal Grandmother */}
                <div className="p-6 border-2 border-border/50 rounded-xl bg-card/30 backdrop-blur space-y-6">
                  <h3 className="text-2xl font-semibold text-foreground">Babka ze strony matki / Maternal Grandmother</h3>
                  {renderFieldGroup([
                    { name: "mgm_last_name", label: "Nazwisko / Full last name" },
                    { name: "mgm_maiden_name", label: "Nazwisko rodowe / Maiden name" },
                    { name: "mgm_first_name", label: "Imię/ imiona / Given names" },
                    { name: "mgm_dob", label: "Data urodzenia / Date of birth", type: "date" },
                    { name: "mgm_pob", label: "Miejsce urodzenia / Place of birth" },
                  ])}
                </div>

                {/* Paternal Grandfather */}
                <div className="p-6 border-2 border-border/50 rounded-xl bg-card/30 backdrop-blur space-y-6">
                  <h3 className="text-2xl font-semibold text-foreground">Dziadek ze strony ojca / Paternal Grandfather</h3>
                  {renderFieldGroup([
                    { name: "pgf_last_name", label: "Nazwisko / Full last name" },
                    { name: "pgf_first_name", label: "Imię/ imiona / Given names" },
                    { name: "pgf_dob", label: "Data urodzenia / Date of birth", type: "date" },
                    { name: "pgf_pob", label: "Miejsce urodzenia / Place of birth" },
                  ])}
                </div>

                {/* Paternal Grandmother */}
                <div className="p-6 border-2 border-border/50 rounded-xl bg-card/30 backdrop-blur space-y-6">
                  <h3 className="text-2xl font-semibold text-foreground">Babka ze strony ojca / Paternal Grandmother</h3>
                  {renderFieldGroup([
                    { name: "pgm_last_name", label: "Nazwisko / Full last name" },
                    { name: "pgm_maiden_name", label: "Nazwisko rodowe / Maiden name" },
                    { name: "pgm_first_name", label: "Imię/ imiona / Given names" },
                    { name: "pgm_dob", label: "Data urodzenia / Date of birth", type: "date" },
                    { name: "pgm_pob", label: "Miejsce urodzenia / Place of birth" },
                  ])}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Part II & III - Additional Information */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className={cn(
              "glass-card border-primary/20 transition-opacity",
              isSection6Pressed && "opacity-70"
            )}>
              <CardHeader 
                className="border-b border-border/50 pb-6 cursor-pointer"
                {...section6LongPressHandlers}
              >
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold text-primary">
                  CZĘŚĆ II & III - Dodatkowe informacje / Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-10">
                {renderTextarea("applicant_notes", "Życiorys osoby / Person's Biography", 6)}
                {renderTextarea("mother_notes", "Życiorys matki / Mother's Biography", 6)}
                {renderTextarea("father_notes", "Życiorys ojca / Father's Biography", 6)}
                {renderTextarea("mgf_notes", "Życiorys dziadka ze strony matki / Maternal Grandfather's Biography", 6)}
                {renderTextarea("mgm_notes", "Życiorys babki ze strony matki / Maternal Grandmother's Biography", 6)}
                {renderTextarea("pgf_notes", "Życiorys dziadka ze strony ojca / Paternal Grandfather's Biography", 6)}
                {renderTextarea("pgm_notes", "Życiorys babki ze strony ojca / Paternal Grandmother's Biography", 6)}
              </CardContent>
            </Card>
          </motion.div>
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

    </div>
  );
}