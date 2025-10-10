import { useParams, useNavigate } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { sanitizeMasterData } from "@/utils/masterDataSanitizer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { Loader2, Save, Download, FileText, Sparkles, Type, FilePlus, User, ArrowLeft, HelpCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateField } from "@/components/DateField";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Textarea } from "@/components/ui/textarea";
import { useRealtimeFormSync } from "@/hooks/useRealtimeFormSync";
import { CountrySelect } from "@/components/CountrySelect";
import { FormButtonsRow } from "@/components/FormButtonsRow";

export default function CivilRegistryForm() {
  const {
    id: caseId
  } = useParams();
  const navigate = useNavigate();
  const {
    data: masterData,
    isLoading
  } = useMasterData(caseId);
  const updateMutation = useUpdateMasterData();
  const {
    isLargeFonts,
    toggleFontSize
  } = useAccessibility();
  const [formData, setFormData] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  
  // Enable real-time sync with direct state updates
  useRealtimeFormSync(caseId, masterData, isLoading, setFormData);
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSave = () => {
    if (!caseId) return;
    const sanitizedData = sanitizeMasterData(formData);
    updateMutation.mutate({
      caseId,
      updates: sanitizedData
    });
  };
  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      toast.loading("Generating Civil Registry Application PDF...");
      const {
        data,
        error
      } = await supabase.functions.invoke('fill-pdf', {
        body: {
          caseId,
          templateType: 'registration'
        }
      });
      if (error) throw error;
      const blob = new Blob([data], {
        type: 'application/pdf'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `civil-registry-${caseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success("Civil Registry Application PDF generated successfully!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearData = () => {
    setFormData({});
    toast.success('All form data cleared');
    setShowClearDialog(false);
  };
  const renderDateField = (name: string, label: string, delay = 0) => {
    // Convert ISO format to DD.MM.YYYY for display
    const isoValue = formData[name] || "";
    let displayValue = "";
    if (isoValue) {
      try {
        const date = new Date(isoValue);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        displayValue = `${day}.${month}.${year}`;
      } catch (e) {
        displayValue = isoValue;
      }
    }
    
    return <DateField
      name={name}
      label={label}
      value={displayValue}
      onChange={(value) => {
        // Convert DD.MM.YYYY to ISO format for storage
        if (value && value.length === 10) {
          const [day, month, year] = value.split('.');
          const isoDate = `${year}-${month}-${day}`;
          handleInputChange(name, isoDate);
        } else {
          handleInputChange(name, value);
        }
      }}
      delay={delay}
    />;
  };
  const renderFieldGroup = (fields: Array<{
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
  }>) => {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field, idx) => <motion.div key={field.name} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: idx * 0.05,
        duration: 0.4
      }} className="space-y-2" onDoubleClick={() => !field.type || field.type === "text" ? handleInputChange(field.name, "") : null}>
            {field.type === "date" ? renderDateField(field.name, field.label) : <>
                <Label htmlFor={field.name} className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                  {field.label}
                </Label>
                <Input 
                  id={field.name} 
                  type={field.type || "text"} 
                  value={formData[field.name] || ""} 
                  onChange={e => {
                    // Only uppercase name/POB fields, preserve phone/passport/email as-is
                    const isNameOrPlace = field.name.includes('_name') || field.name.includes('_pob') || field.name === 'place_of_marriage';
                    const shouldUppercase = isNameOrPlace && field.type !== "email";
                    handleInputChange(field.name, shouldUppercase ? e.target.value.toUpperCase() : e.target.value);
                  }} 
                  placeholder="" 
                  className={cn(
                    "h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur", 
                    (field.name.includes('_name') || field.name.includes('_pob') || field.name === 'place_of_marriage') && field.type !== "email" && "uppercase"
                  )} 
                />
              </>}
          </motion.div>)}
      </div>;
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
        <motion.div initial={{
        opacity: 0,
        y: -50
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8
      }} className="sticky top-0 z-20 bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-sm border-b mb-0">
          <Card className="glass-card border-primary/20 overflow-hidden rounded-none border-x-0 border-t-0 relative z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
            <CardHeader className="relative pb-6 pt-6 z-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <motion.div initial={{
                x: -20,
                opacity: 0
              }} animate={{
                x: 0,
                opacity: 1
              }} transition={{
                delay: 0.2
              }} className="flex items-center gap-3">
                  <Button
                    onClick={() => window.open('https://docs.lovable.dev', '_blank')}
                    size="lg"
                    variant="ghost"
                    className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 text-3xl font-bold"
                    title="How to fill this form"
                  >
                    ?
                  </Button>
                  <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text">Civil Registry</CardTitle>
                </motion.div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => navigate(`/admin/case/${caseId}`)}
                    size="lg"
                    variant="ghost"
                    className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 z-50"
                    title="Back to Case"
                  >
                    <ArrowLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    size="lg"
                    variant="ghost"
                    className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 z-50"
                    title="Login / Register"
                  >
                    <User className="h-8 w-8" />
                  </Button>
                  <Button onClick={toggleFontSize} size="lg" variant="ghost" className={`h-16 w-16 rounded-full transition-all z-50 ${isLargeFonts ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`} title="Toggle font size">
                    <Type className="h-8 w-8" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <FormButtonsRow 
                caseId={caseId!}
                currentForm="civil-registry"
                onSave={handleSave}
                onClear={() => setShowClearDialog(true)}
                onGeneratePDF={handleGeneratePDF}
                isSaving={updateMutation.isPending || isGenerating}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Applicant Information */}
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
                  Applicant Information / Dane wnioskodawcy
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
                    <Select value={formData.applicant_is_married === true ? "Married" : "Single"} onValueChange={(value) => handleInputChange("applicant_is_married", value === "Married")}>
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
                      Number of children
                    </Label>
                    <Select value={formData.children_count?.toString() || ""} onValueChange={(value) => { const count = parseInt(value); handleInputChange("children_count", count); }}>
                      <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur z-50">
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
                        Number of minor children
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

                {renderFieldGroup([{
                name: "applicant_first_name",
                label: "Given names / Imię/ imiona"
              }, {
                name: "applicant_last_name",
                label: "Full last name / Nazwisko"
              }])}
              
                {renderFieldGroup([{
                name: "applicant_pob",
                label: "Place of birth / Miejsce urodzenia"
              }, {
                name: "applicant_dob",
                label: "Date of birth / Data urodzenia",
                type: "date"
              }])}
              
                {/* Marriage information - Only show if married */}
                {formData.applicant_is_married && (
                  <div className="pt-6">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Marriage information</h3>
                    {renderFieldGroup([{
                      name: "place_of_marriage",
                      label: "Place of marriage / Miejsce zawarcia związku małżeńskiego"
                    }, {
                      name: "date_of_marriage",
                      label: "Date of marriage / Data zawarcia związku małżeńskiego",
                      type: "date"
                    }])}
                  </div>
                )}
              
                {renderFieldGroup([{
                name: "applicant_maiden_name",
                label: "Maiden name / Nazwisko rodowe"
              }, {
                name: "applicant_email",
                label: "Email",
                type: "email"
              }])}
              
                {renderFieldGroup([{
                name: "applicant_phone",
                label: "Phone / Telefon"
              }, {
                name: "applicant_passport_number",
                label: "Passport number / Nr paszportu"
              }])}
              </CardContent>
            </Card>
          </motion.div>

          {/* Document Information */}
          <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5,
          delay: 0.1
        }}>
            <Card className="glass-card border-primary/20">
              <CardHeader className="border-b border-border/50 pb-6">
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Document to Register / Dokument do rejestracji
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-10">
                {renderFieldGroup([
                  {
                    name: "document_type",
                    label: "Document Type / Typ dokumentu (Birth/Marriage/Death)"
                  },
                  {
                    name: "document_issue_place",
                    label: "Place where document was issued / Miejsce sporządzenia aktu"
                  },
                  {
                    name: "document_registry_number",
                    label: "Registry number / Numer aktu"
                  },
                ])}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CountrySelect
                    value={formData.document_issue_country || ""}
                    onChange={(value) => handleInputChange("document_issue_country", value)}
                    label="Country / Kraj"
                    isLargeFonts={isLargeFonts}
                  />
                </div>

                <div className="pt-8">
                  <h3 className={cn("font-semibold mb-6 text-foreground", isLargeFonts ? "text-2xl" : "text-xl")}>Required Documents Checklist / Lista wymaganych dokumentów</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: 0 }}
                      className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur"
                    >
                      <Checkbox
                        id="has_original_foreign_act"
                        checked={formData?.has_original_foreign_act || false}
                        onCheckedChange={(checked) => handleInputChange("has_original_foreign_act", checked)}
                        className="h-6 w-6"
                      />
                      <Label htmlFor="has_original_foreign_act" className="cursor-pointer text-sm font-normal">
                        Original foreign civil act / Oryginał aktu zagranicznego
                      </Label>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: 0.05 }}
                      className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur"
                    >
                      <Checkbox
                        id="has_sworn_translation"
                        checked={formData?.has_sworn_translation || false}
                        onCheckedChange={(checked) => handleInputChange("has_sworn_translation", checked)}
                        className="h-6 w-6"
                      />
                      <Label htmlFor="has_sworn_translation" className="cursor-pointer text-sm font-normal">
                        Sworn translation into Polish / Tłumaczenie przysięgłe na język polski
                      </Label>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: 0.1 }}
                      className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur"
                    >
                      <Checkbox
                        id="has_tax_payment"
                        checked={formData?.has_tax_payment || false}
                        onCheckedChange={(checked) => handleInputChange("has_tax_payment", checked)}
                        className="h-6 w-6"
                      />
                      <Label htmlFor="has_tax_payment" className="cursor-pointer text-sm font-normal">
                        Proof of Tax Payment (50 PLN) / Dowód uiszczenia opłaty skarbowej
                      </Label>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: 0.15 }}
                      className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur"
                    >
                      <Checkbox
                        id="has_power_of_attorney"
                        checked={formData?.has_power_of_attorney || false}
                        onCheckedChange={(checked) => handleInputChange("has_power_of_attorney", checked)}
                        className="h-6 w-6"
                      />
                      <Label htmlFor="has_power_of_attorney" className="cursor-pointer text-sm font-normal">
                        Power of Attorney / Pełnomocnictwo (notarized or consular)
                      </Label>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      transition={{ delay: 0.2 }}
                      className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur"
                    >
                      <Checkbox
                        id="has_passport_copy"
                        checked={formData?.has_passport_copy || false}
                        onCheckedChange={(checked) => handleInputChange("has_passport_copy", checked)}
                        className="h-6 w-6"
                      />
                      <Label htmlFor="has_passport_copy" className="cursor-pointer text-sm font-normal">
                        Valid Passport Copy / Kopia paszportu
                      </Label>
                    </motion.div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-6 border-2 border-primary/20">
                  <h3 className={cn("font-semibold mb-6 text-foreground", isLargeFonts ? "text-3xl" : "text-2xl")}>Additional notes / Dodatkowe informacje</h3>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="civil_registry_notes" className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                      Notes / Uwagi
                    </Label>
                    <Textarea
                      id="civil_registry_notes"
                      value={formData.civil_registry_notes || ""}
                      onChange={(e) => handleInputChange("civil_registry_notes", e.target.value.toUpperCase())}
                      placeholder=""
                      className={cn(
                        "min-h-32 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase",
                        isLargeFonts ? "text-lg" : "text-base"
                      )}
                    />
                  </motion.div>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Clear Data Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all fields in the Civil Registry form. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData}>
              Clear Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>;
}