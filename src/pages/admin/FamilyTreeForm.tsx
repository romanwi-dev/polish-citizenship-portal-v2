import { useParams, useNavigate } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { sanitizeMasterData } from "@/utils/masterDataSanitizer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Loader2, Save, Download, Users, Sparkles, Type, User, ArrowLeft, TreePine, BookOpen, Baby, Heart, FileText, GitBranch, HelpCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { DateField } from "@/components/DateField";
import { toast } from "sonner";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useRealtimeFormSync } from "@/hooks/useRealtimeFormSync";
import { FormButtonsRow } from "@/components/FormButtonsRow";

export default function FamilyTreeForm() {
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
  const [activeTab, setActiveTab] = useState("select");
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
      toast.loading("Generating Family Tree PDF...");
      const {
        data,
        error
      } = await supabase.functions.invoke('fill-pdf', {
        body: {
          caseId,
          templateType: 'family-tree'
        }
      });
      if (error) throw error;
      const blob = new Blob([data], {
        type: 'application/pdf'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `family-tree-${caseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success("Family Tree PDF generated successfully!");
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
    isNameField?: boolean;
    isSelect?: boolean;
    selectOptions?: Array<{ value: string; label: string }>;
  }>) => {
    return <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
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
            {field.type === "date" ? renderDateField(field.name, field.label) : field.isSelect ? <>
                <Label htmlFor={field.name} className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                  {field.label}
                </Label>
                <Select value={formData[field.name] || ""} onValueChange={(value) => handleInputChange(field.name, value)}>
                  <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur" style={{ fontSize: '1.125rem', fontWeight: '400' }}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-2 z-50">
                    {field.selectOptions?.map(option => (
                      <SelectItem key={option.value} value={option.value} className="text-base cursor-pointer">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </> : <>
                <Label htmlFor={field.name} className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                  {field.label}
                </Label>
                <Input 
                  id={field.name} 
                  type={field.type || "text"} 
                  value={formData[field.name] || ""} 
                  onChange={e => {
                    // Only uppercase name fields, not phone/passport numbers
                    const shouldUppercase = field.isNameField && field.type !== "email";
                    handleInputChange(field.name, shouldUppercase ? e.target.value.toUpperCase() : e.target.value);
                  }} 
                  placeholder="" 
                  className={cn(
                    "h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur", 
                    field.isNameField && field.type !== "email" && "uppercase"
                  )} 
                  style={{ fontSize: '1.125rem', fontWeight: '400' }}
                />
              </>}
          </motion.div>)}
      </div>;
  };
  const renderCheckboxGroup = (fields: Array<{
    name: string;
    label: string;
  }>) => {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map((field, idx) => <motion.div key={field.name} initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        delay: idx * 0.05
      }} className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
            <Checkbox id={field.name} checked={formData[field.name] || false} onCheckedChange={checked => handleInputChange(field.name, checked)} className="h-6 w-6" />
            <Label htmlFor={field.name} className="cursor-pointer text-sm font-normal">
              {field.label}
            </Label>
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
        {/* Sticky Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="sticky top-0 z-20 bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-sm border-b mb-0"
        >
          <Card className="glass-card border-primary/20 overflow-hidden rounded-none border-x-0 border-t-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
            <CardHeader className="relative pb-6 pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
                  <Button
                    onClick={() => window.open('https://docs.lovable.dev', '_blank')}
                    size="lg"
                    variant="ghost"
                    className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 text-2xl"
                    title="How to fill this form"
                  >
                    ?
                  </Button>
                  <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text">
                    Polish Family Tree
                  </CardTitle>
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
                  <Button
                    onClick={toggleFontSize}
                    size="lg"
                    variant="ghost"
                    className={`h-16 w-16 rounded-full transition-all z-50 ${
                      isLargeFonts ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
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
              currentForm="family-tree"
              onSave={handleSave}
              onClear={() => setShowClearDialog(true)}
              onGeneratePDF={handleGeneratePDF}
              isSaving={updateMutation.isPending}
            />
          </CardContent>
        </Card>
      </motion.div>

        {/* Form with Tabs */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Card className="glass-card border-primary/20">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-border/50">
                <TabsList className="w-full h-auto p-2 bg-transparent justify-start">
                  <TabsTrigger value="select" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Select...</span>
                  </TabsTrigger>
                  <TabsTrigger value="applicant" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Applicant</span>
                  </TabsTrigger>
                  {(formData.minor_children_count > 0) && (
                    <TabsTrigger value="children" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                      <Baby className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Children</span>
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="parents" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Polish Parent</span>
                  </TabsTrigger>
                  <TabsTrigger value="grandparents" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                    <GitBranch className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Grandparents</span>
                  </TabsTrigger>
                  <TabsTrigger value="great-grandparents" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                    <TreePine className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Great Grandparents</span>
                  </TabsTrigger>
                  <TabsTrigger value="additional" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Additional Info</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="select" className="mt-0">
          {activeTab === 'select' && (
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
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Select Information

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
              </CardContent>
            </Card>
          </motion.div>
          )}
        </TabsContent>

              <TabsContent value="applicant" className="mt-0">
          {/* Applicant Section */}
          {activeTab === 'applicant' && (
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
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Applicant

              </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-10">

                {/* Row 1: Names */}
                {renderFieldGroup([{
                  name: "applicant_first_name",
                  label: "Given names / Imię/ imiona",
                  isNameField: true
                }, {
                  name: "applicant_last_name",
                  label: "Full last name / Nazwisko",
                  isNameField: true
                }])}

                {/* Row 2: Maiden name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                      Maiden name / Nazwisko rodowe
                    </Label>
                    <Input
                      value={formData.applicant_maiden_name || ""}
                      onChange={(e) => handleInputChange("applicant_maiden_name", e.target.value.toUpperCase())}
                      className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                      style={{ fontSize: '1.125rem', fontWeight: '400' }}
                    />
                  </motion.div>
                </div>

                {/* Row 3: Birth fields */}
                {renderFieldGroup([{
                  name: "applicant_pob",
                  label: "Place of birth",
                  isNameField: true
                }, {
                  name: "applicant_dob",
                  label: "Date of birth",
                  type: "date"
                }])}

                {/* Row 4: Marriage fields (conditional) */}
                {formData.applicant_is_married && renderFieldGroup([{
                  name: "place_of_marriage",
                  label: "Place of marriage",
                  isNameField: true
                }, {
                  name: "date_of_marriage",
                  label: "Date of marriage",
                  type: "date"
                }])}

                {/* Row 5: Emigration and Naturalization */}
                {renderFieldGroup([{
                  name: "applicant_date_of_emigration",
                  label: "Date of emigration",
                  type: "date"
                }, {
                  name: "applicant_date_of_naturalization",
                  label: "Date of naturalization",
                  type: "date"
                }])}

                {/* Other fields */}
                {renderFieldGroup([{
                name: "applicant_passport_number",
                label: "Passport number"
              }, {
                name: "applicant_sex",
                label: "Sex",
                isSelect: true,
                selectOptions: [
                  { value: "MALE", label: "Male" },
                  { value: "FEMALE", label: "Female" }
                ]
              }, {
                name: "applicant_email",
                label: "Email",
                type: "email"
              }, {
                name: "applicant_phone",
                label: "Phone"
              }])}

                <div className="space-y-2">
                  <Label htmlFor="applicant_notes" className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                    Relevant additional information
                  </Label>
                  <Textarea
                    id="applicant_notes"
                    value={formData.applicant_notes || ""}
                    onChange={e => handleInputChange("applicant_notes", e.target.value.toUpperCase())}
                    placeholder=""
                    className={cn("min-h-[150px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                  />
                </div>

                <div className="pt-8">
                  <h3 className="font-light text-foreground/90 text-sm mb-6">Documents required</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                      <Checkbox
                        id="applicant_has_polish_documents"
                        checked={formData?.applicant_has_polish_documents || false}
                        onCheckedChange={(checked) => handleInputChange("applicant_has_polish_documents", checked)}
                        className="h-6 w-6"
                      />
                      <Label htmlFor="applicant_has_polish_documents" className="cursor-pointer text-sm font-normal">Polish documents</Label>
                    </div>
                    <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                      <Checkbox
                        id="applicant_has_passport"
                        checked={formData?.applicant_has_passport || false}
                        onCheckedChange={(checked) => handleInputChange("applicant_has_passport", checked)}
                        className="h-6 w-6"
                      />
                      <Label htmlFor="applicant_has_passport" className="cursor-pointer text-sm font-normal">Passport copy</Label>
                    </div>
                    <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                      <Checkbox
                        id="applicant_has_birth_cert"
                        checked={formData?.applicant_has_birth_cert || false}
                        onCheckedChange={(checked) => handleInputChange("applicant_has_birth_cert", checked)}
                        className="h-6 w-6"
                      />
                      <Label htmlFor="applicant_has_birth_cert" className="cursor-pointer text-sm font-normal">Birth certificate</Label>
                    </div>
                    <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                      <Checkbox
                        id="applicant_has_marriage_cert"
                        checked={formData?.applicant_has_marriage_cert || false}
                        onCheckedChange={(checked) => handleInputChange("applicant_has_marriage_cert", checked)}
                        className="h-6 w-6"
                      />
                      <Label htmlFor="applicant_has_marriage_cert" className="cursor-pointer text-sm font-normal">Marriage certificate</Label>
                    </div>
                    <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                      <Checkbox
                        id="applicant_has_naturalization"
                        checked={formData?.applicant_has_naturalization || false}
                        onCheckedChange={(checked) => handleInputChange("applicant_has_naturalization", checked)}
                        className="h-6 w-6"
                      />
                      <Label htmlFor="applicant_has_naturalization" className="cursor-pointer text-sm font-normal">Naturalization certificate</Label>
                    </div>
                    
                    {/* Military record - only for males */}
                    {(formData?.applicant_sex?.includes('Male') || formData?.applicant_sex?.includes('Mężczyzna') || formData?.applicant_sex === 'MALE') && (
                      <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                        <Checkbox
                          id="applicant_has_military_record"
                          checked={formData?.applicant_has_military_record || false}
                          onCheckedChange={(checked) => handleInputChange("applicant_has_military_record", checked)}
                          className="h-6 w-6"
                        />
                        <Label htmlFor="applicant_has_military_record" className="cursor-pointer text-sm font-normal">Military service record</Label>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                      <Checkbox
                        id="applicant_has_foreign_documents"
                        checked={formData?.applicant_has_foreign_documents || false}
                        onCheckedChange={(checked) => handleInputChange("applicant_has_foreign_documents", checked)}
                        className="h-6 w-6"
                      />
                      <Label htmlFor="applicant_has_foreign_documents" className="cursor-pointer text-sm font-normal">Foreign documents</Label>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                      <Checkbox
                        id="applicant_has_additional_documents"
                        checked={formData?.applicant_has_additional_documents || false}
                        onCheckedChange={(checked) => handleInputChange("applicant_has_additional_documents", checked)}
                        className="h-6 w-6"
                      />
                      <Label htmlFor="applicant_has_additional_documents" className="cursor-pointer text-sm font-normal">Additional documents</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          )}

          {/* Children Section - Only Minor Children */}
          {activeTab === 'children' && (formData.minor_children_count > 0) && (
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
                  Applicant's Minor Children
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Enter details for <span className="font-semibold text-primary">{formData.minor_children_count || 0} minor {formData.minor_children_count === 1 ? 'child' : 'children'}</span> (under 18 years old).
                  <span className="block mt-1 text-muted-foreground">
                    Note: Adult children should be processed as separate applicants.
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-10">
                {Array.from({ length: formData.minor_children_count || 0 }, (_, i) => i + 1).map(num => <div key={num} className="p-6 border-2 border-border/50 rounded-xl bg-card/30 backdrop-blur space-y-6">
                    <h3 className="text-xl font-semibold text-foreground">Minor Child {num}</h3>
                    {/* 1st row - Name fields */}
                    {renderFieldGroup([{
                  name: `child_${num}_first_name`,
                  label: "Given names / Imię/ imiona",
                  isNameField: true
                }, {
                  name: `child_${num}_last_name`,
                  label: "Full last name / Nazwisko",
                  isNameField: true
                }])}

                    {/* 2nd row - Places */}
                    {renderFieldGroup([{
                  name: `child_${num}_pob`,
                  label: "Place of birth"
                }])}

                    {/* 3rd row - Dates */}
                    {renderFieldGroup([{
                  name: `child_${num}_dob`,
                  label: "Date of birth",
                  type: "date"
                }])}
                    <div className="space-y-2">
                      <Label htmlFor={`child_${num}_notes`} className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                        Relevant additional information
                      </Label>
                      <Textarea
                        id={`child_${num}_notes`}
                        value={formData[`child_${num}_notes`] || ""}
                        onChange={e => handleInputChange(`child_${num}_notes`, e.target.value.toUpperCase())}
                        placeholder=""
                        className={cn("min-h-[150px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                      />
                    </div>
                    <div className="pt-4">
                      <h4 className="font-light text-foreground/90 text-sm mb-4">Documents required</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id={`child_${num}_has_polish_documents`}
                            checked={formData?.[`child_${num}_has_polish_documents`] || false}
                            onCheckedChange={(checked) => handleInputChange(`child_${num}_has_polish_documents`, checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor={`child_${num}_has_polish_documents`} className="cursor-pointer text-sm font-normal">Polish documents</Label>
                        </div>
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id={`child_${num}_has_passport`}
                            checked={formData?.[`child_${num}_has_passport`] || false}
                            onCheckedChange={(checked) => handleInputChange(`child_${num}_has_passport`, checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor={`child_${num}_has_passport`} className="cursor-pointer text-sm font-normal">Passport copy</Label>
                        </div>
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id={`child_${num}_has_birth_cert`}
                            checked={formData?.[`child_${num}_has_birth_cert`] || false}
                            onCheckedChange={(checked) => handleInputChange(`child_${num}_has_birth_cert`, checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor={`child_${num}_has_birth_cert`} className="cursor-pointer text-sm font-normal">Birth certificate</Label>
                        </div>
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id={`child_${num}_has_marriage_cert`}
                            checked={formData?.[`child_${num}_has_marriage_cert`] || false}
                            onCheckedChange={(checked) => handleInputChange(`child_${num}_has_marriage_cert`, checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor={`child_${num}_has_marriage_cert`} className="cursor-pointer text-sm font-normal">Marriage certificate</Label>
                        </div>
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id={`child_${num}_has_naturalization`}
                            checked={formData?.[`child_${num}_has_naturalization`] || false}
                            onCheckedChange={(checked) => handleInputChange(`child_${num}_has_naturalization`, checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor={`child_${num}_has_naturalization`} className="cursor-pointer text-sm font-normal">Naturalization certificate</Label>
                        </div>
                        
                        {/* Military record - only for males */}
                        {(formData?.[`child_${num}_sex`]?.includes('Male') || formData?.[`child_${num}_sex`]?.includes('Mężczyzna') || formData?.[`child_${num}_sex`] === 'MALE') && (
                          <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                            <Checkbox
                              id={`child_${num}_has_military_record`}
                              checked={formData?.[`child_${num}_has_military_record`] || false}
                              onCheckedChange={(checked) => handleInputChange(`child_${num}_has_military_record`, checked)}
                              className="h-6 w-6"
                            />
                            <Label htmlFor={`child_${num}_has_military_record`} className="cursor-pointer text-sm font-normal">Military service record</Label>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id={`child_${num}_has_foreign_documents`}
                            checked={formData?.[`child_${num}_has_foreign_documents`] || false}
                            onCheckedChange={(checked) => handleInputChange(`child_${num}_has_foreign_documents`, checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor={`child_${num}_has_foreign_documents`} className="cursor-pointer text-sm font-normal">Foreign documents</Label>
                        </div>
                        
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id={`child_${num}_has_additional_documents`}
                            checked={formData?.[`child_${num}_has_additional_documents`] || false}
                            onCheckedChange={(checked) => handleInputChange(`child_${num}_has_additional_documents`, checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor={`child_${num}_has_additional_documents`} className="cursor-pointer text-sm font-normal">Additional documents</Label>
                        </div>
                      </div>
                    </div>
                  </div>)}
              </CardContent>
            </Card>
          </motion.div>
          )}


          {/* Parents Section */}
          {activeTab === 'parents' && (
          <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5,
          delay: 0.3
        }}>
            <Card className="glass-card border-primary/20">
              <CardHeader className="border-b border-border/50 pb-6">
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Polish Parent
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-10">
                <Card className={cn(
                  "glass-card border-primary/20 mb-6",
                  formData.father_is_polish && "bg-red-950/30 border-red-900/50"
                )}>
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className={cn(
                      "text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent",
                      formData.father_is_polish && "text-red-400"
                    )}>
                      Father
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8 space-y-8">
                    <div className="mb-6 p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                      {renderCheckboxGroup([{
                        name: "father_is_polish",
                        label: "Polish Ancestor"
                      }])}
                    </div>
                    {/* 1st row - Name fields */}
                    {renderFieldGroup([{
                    name: "father_first_name",
                    label: "Given names / Imię/ imiona",
                    isNameField: true
                  }, {
                    name: "father_last_name",
                    label: "Full last name / Nazwisko",
                    isNameField: true
                  }])}

                    {/* 2nd row - Places and emigration */}
                    {renderFieldGroup([{
                    name: "father_pob",
                    label: "Place of birth"
                  }, {
                    name: "father_mother_marriage_place",
                    label: "Place of marriage"
                  }, {
                    name: "father_date_of_emigration",
                    label: "Date of emigration",
                    type: "date"
                  }])}

                    {/* 3rd row - Dates */}
                    {renderFieldGroup([{
                    name: "father_dob",
                    label: "Date of birth",
                    type: "date"
                  }, {
                    name: "father_mother_marriage_date",
                    label: "Date of marriage",
                    type: "date"
                  }, {
                    name: "father_date_of_naturalization",
                    label: "Date of naturalization",
                    type: "date"
                  }])}
                    <div className="space-y-2">
                      <Label htmlFor="father_notes" className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                        Relevant additional information
                      </Label>
                      <Textarea
                        id="father_notes"
                        value={formData.father_notes || ""}
                        onChange={e => handleInputChange("father_notes", e.target.value.toUpperCase())}
                        placeholder=""
                        className={cn("min-h-[150px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                      />
                    </div>
                    <div className="pt-4">
                      <h4 className="font-light text-foreground/90 text-sm mb-4">Documents required</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id="father_has_polish_documents"
                            checked={formData?.father_has_polish_documents || false}
                            onCheckedChange={(checked) => handleInputChange("father_has_polish_documents", checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor="father_has_polish_documents" className="cursor-pointer text-sm font-normal">Polish documents</Label>
                        </div>
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id="father_has_passport"
                            checked={formData?.father_has_passport || false}
                            onCheckedChange={(checked) => handleInputChange("father_has_passport", checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor="father_has_passport" className="cursor-pointer text-sm font-normal">Passport copy</Label>
                        </div>
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id="father_has_birth_cert"
                            checked={formData?.father_has_birth_cert || false}
                            onCheckedChange={(checked) => handleInputChange("father_has_birth_cert", checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor="father_has_birth_cert" className="cursor-pointer text-sm font-normal">Birth certificate</Label>
                        </div>
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id="father_has_marriage_cert"
                            checked={formData?.father_has_marriage_cert || false}
                            onCheckedChange={(checked) => handleInputChange("father_has_marriage_cert", checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor="father_has_marriage_cert" className="cursor-pointer text-sm font-normal">Marriage certificate</Label>
                        </div>
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id="father_has_naturalization"
                            checked={formData?.father_has_naturalization || false}
                            onCheckedChange={(checked) => handleInputChange("father_has_naturalization", checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor="father_has_naturalization" className="cursor-pointer text-sm font-normal">Naturalization certificate</Label>
                        </div>
                        
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id="father_has_military_record"
                            checked={formData?.father_has_military_record || false}
                            onCheckedChange={(checked) => handleInputChange("father_has_military_record", checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor="father_has_military_record" className="cursor-pointer text-sm font-normal">Military service record</Label>
                        </div>
                        
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id="father_has_foreign_documents"
                            checked={formData?.father_has_foreign_documents || false}
                            onCheckedChange={(checked) => handleInputChange("father_has_foreign_documents", checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor="father_has_foreign_documents" className="cursor-pointer text-sm font-normal">Foreign documents</Label>
                        </div>
                        
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id="father_has_additional_documents"
                            checked={formData?.father_has_additional_documents || false}
                            onCheckedChange={(checked) => handleInputChange("father_has_additional_documents", checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor="father_has_additional_documents" className="cursor-pointer text-sm font-normal">Additional documents</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={cn(
                  "glass-card border-primary/20",
                  formData.mother_is_polish && "bg-red-950/30 border-red-900/50"
                )}>
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className={cn(
                      "text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent",
                      formData.mother_is_polish && "text-red-400"
                    )}>
                      Mother
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8 space-y-8">
                    <div className="mb-6 p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                      {renderCheckboxGroup([{
                        name: "mother_is_polish",
                        label: "Polish Ancestor"
                      }])}
                    </div>
                    {/* 1st row - Name fields */}
                    {renderFieldGroup([{
                    name: "mother_first_name",
                    label: "Given names / Imię/ imiona",
                    isNameField: true
                  }, {
                    name: "mother_last_name",
                    label: "Full last name / Nazwisko",
                    isNameField: true
                  }, {
                    name: "mother_maiden_name",
                    label: "Maiden name",
                    isNameField: true
                  }])}

                    {/* 2nd row - Places and emigration */}
                    {renderFieldGroup([{
                    name: "mother_pob",
                    label: "Place of birth"
                  }, {
                    name: "father_mother_marriage_place",
                    label: "Place of marriage"
                  }, {
                    name: "mother_date_of_emigration",
                    label: "Date of emigration",
                    type: "date"
                  }])}

                    {/* 3rd row - Dates */}
                    {renderFieldGroup([{
                    name: "mother_dob",
                    label: "Date of birth",
                    type: "date"
                  }, {
                    name: "father_mother_marriage_date",
                    label: "Date of marriage",
                    type: "date"
                  }, {
                    name: "mother_date_of_naturalization",
                    label: "Date of naturalization",
                    type: "date"
                  }])}
                    <div className="space-y-2">
                      <Label htmlFor="mother_notes" className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                        Relevant additional information
                      </Label>
                      <Textarea
                        id="mother_notes"
                        value={formData.mother_notes || ""}
                        onChange={e => handleInputChange("mother_notes", e.target.value.toUpperCase())}
                        placeholder=""
                        className={cn("min-h-[150px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                      />
                    </div>
                    <div className="pt-4">
                      <h4 className="font-light text-foreground/90 text-sm mb-4">Documents required</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id="mother_has_polish_documents"
                            checked={formData?.mother_has_polish_documents || false}
                            onCheckedChange={(checked) => handleInputChange("mother_has_polish_documents", checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor="mother_has_polish_documents" className="cursor-pointer text-sm font-normal">Polish documents</Label>
                        </div>
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id="mother_has_passport"
                            checked={formData?.mother_has_passport || false}
                            onCheckedChange={(checked) => handleInputChange("mother_has_passport", checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor="mother_has_passport" className="cursor-pointer text-sm font-normal">Passport copy</Label>
                        </div>
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id="mother_has_birth_cert"
                            checked={formData?.mother_has_birth_cert || false}
                            onCheckedChange={(checked) => handleInputChange("mother_has_birth_cert", checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor="mother_has_birth_cert" className="cursor-pointer text-sm font-normal">Birth certificate</Label>
                        </div>
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id="mother_has_marriage_cert"
                            checked={formData?.mother_has_marriage_cert || false}
                            onCheckedChange={(checked) => handleInputChange("mother_has_marriage_cert", checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor="mother_has_marriage_cert" className="cursor-pointer text-sm font-normal">Marriage certificate</Label>
                        </div>
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id="mother_has_naturalization"
                            checked={formData?.mother_has_naturalization || false}
                            onCheckedChange={(checked) => handleInputChange("mother_has_naturalization", checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor="mother_has_naturalization" className="cursor-pointer text-sm font-normal">Naturalization certificate</Label>
                        </div>
                        
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id="mother_has_military_record"
                            checked={formData?.mother_has_military_record || false}
                            onCheckedChange={(checked) => handleInputChange("mother_has_military_record", checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor="mother_has_military_record" className="cursor-pointer text-sm font-normal">Military service record</Label>
                        </div>
                        
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id="mother_has_foreign_documents"
                            checked={formData?.mother_has_foreign_documents || false}
                            onCheckedChange={(checked) => handleInputChange("mother_has_foreign_documents", checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor="mother_has_foreign_documents" className="cursor-pointer text-sm font-normal">Foreign documents</Label>
                        </div>
                        
                        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                          <Checkbox
                            id="mother_has_additional_documents"
                            checked={formData?.mother_has_additional_documents || false}
                            onCheckedChange={(checked) => handleInputChange("mother_has_additional_documents", checked)}
                            className="h-6 w-6"
                          />
                          <Label htmlFor="mother_has_additional_documents" className="cursor-pointer text-sm font-normal">Additional documents</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </motion.div>
          )}

          {/* Grandparents Section */}
          {activeTab === 'grandparents' && (
          <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5,
          delay: 0.4
        }}>
            <Card className="glass-card border-primary/20">
              <CardHeader className="border-b border-border/50 pb-6">
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Polish Grandparents</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-8">
                {["pgf", "pgm", "mgf", "mgm"].map(prefix => {
                const labels = {
                  pgf: "Paternal Grandfather",
                  pgm: "Paternal Grandmother",
                  mgf: "Maternal Grandfather",
                  mgm: "Maternal Grandmother"
                };
                return <Card key={prefix} className={cn(
                  "glass-card border-primary/20",
                  formData[`${prefix}_is_polish`] && "bg-red-950/30 border-red-900/50"
                )}>
                      <CardHeader className="border-b border-border/50">
                        <CardTitle className={cn(
                          "text-2xl md:text-3xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent",
                          formData[`${prefix}_is_polish`] && "text-red-400"
                        )}>
                          {labels[prefix as keyof typeof labels]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 md:p-8 space-y-8">
                        <div className="mb-6 p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                          {renderCheckboxGroup([{
                        name: `${prefix}_is_polish`,
                        label: "Polish Ancestor"
                      }])}
                        </div>
                        {/* 1st row - Name fields */}
                        {renderFieldGroup([{
                      name: `${prefix}_first_name`,
                      label: "Given names / Imię/ imiona",
                      isNameField: true
                    }, {
                      name: `${prefix}_last_name`,
                      label: "Full last name / Nazwisko",
                      isNameField: true
                    }, ...(prefix.includes("gm") ? [{
                      name: `${prefix}_maiden_name`,
                      label: "Maiden name",
                      isNameField: true
                    }] : [])])}

                        {/* 2nd row - Places and emigration */}
                        {renderFieldGroup([{
                      name: `${prefix}_pob`,
                      label: "Place of birth"
                    }, {
                      name: `${prefix === 'pgf' || prefix === 'pgm' ? 'pgf_pgm_marriage_place' : 'mgf_mgm_marriage_place'}`,
                      label: "Place of marriage"
                    }, {
                      name: `${prefix}_date_of_emigration`,
                      label: "Date of emigration",
                      type: "date"
                    }])}

                        {/* 3rd row - Dates */}
                        {renderFieldGroup([{
                      name: `${prefix}_dob`,
                      label: "Date of birth",
                      type: "date"
                    }, {
                      name: `${prefix === 'pgf' || prefix === 'pgm' ? 'pgf_pgm_marriage_date' : 'mgf_mgm_marriage_date'}`,
                      label: "Date of marriage",
                      type: "date"
                    }, {
                      name: `${prefix}_date_of_naturalization`,
                      label: "Date of naturalization",
                      type: "date"
                    }])}
                        <div className="space-y-2">
                          <Label htmlFor={`${prefix}_notes`} className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                            Relevant additional information
                          </Label>
                          <Textarea
                            id={`${prefix}_notes`}
                            value={formData[`${prefix}_notes`] || ""}
                            onChange={e => handleInputChange(`${prefix}_notes`, e.target.value.toUpperCase())}
                            placeholder=""
                            className={cn("min-h-[150px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                          />
                        </div>
                        <div className="pt-4">
                          <h4 className="font-light text-foreground/90 text-sm mb-4">Documents required</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                              <Checkbox
                                id={`${prefix}_has_polish_documents`}
                                checked={formData?.[`${prefix}_has_polish_documents`] || false}
                                onCheckedChange={(checked) => handleInputChange(`${prefix}_has_polish_documents`, checked)}
                                className="h-6 w-6"
                              />
                              <Label htmlFor={`${prefix}_has_polish_documents`} className="cursor-pointer text-sm font-normal">Polish documents</Label>
                            </div>
                            <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                              <Checkbox
                                id={`${prefix}_has_passport`}
                                checked={formData?.[`${prefix}_has_passport`] || false}
                                onCheckedChange={(checked) => handleInputChange(`${prefix}_has_passport`, checked)}
                                className="h-6 w-6"
                              />
                              <Label htmlFor={`${prefix}_has_passport`} className="cursor-pointer text-sm font-normal">Passport copy</Label>
                            </div>
                            <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                              <Checkbox
                                id={`${prefix}_has_birth_cert`}
                                checked={formData?.[`${prefix}_has_birth_cert`] || false}
                                onCheckedChange={(checked) => handleInputChange(`${prefix}_has_birth_cert`, checked)}
                                className="h-6 w-6"
                              />
                              <Label htmlFor={`${prefix}_has_birth_cert`} className="cursor-pointer text-sm font-normal">Birth certificate</Label>
                            </div>
                            <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                              <Checkbox
                                id={`${prefix}_has_marriage_cert`}
                                checked={formData?.[`${prefix}_has_marriage_cert`] || false}
                                onCheckedChange={(checked) => handleInputChange(`${prefix}_has_marriage_cert`, checked)}
                                className="h-6 w-6"
                              />
                              <Label htmlFor={`${prefix}_has_marriage_cert`} className="cursor-pointer text-sm font-normal">Marriage certificate</Label>
                            </div>
                            <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                              <Checkbox
                                id={`${prefix}_has_naturalization`}
                                checked={formData?.[`${prefix}_has_naturalization`] || false}
                                onCheckedChange={(checked) => handleInputChange(`${prefix}_has_naturalization`, checked)}
                                className="h-6 w-6"
                              />
                              <Label htmlFor={`${prefix}_has_naturalization`} className="cursor-pointer text-sm font-normal">Naturalization certificate</Label>
                            </div>
                            
                            {/* Military record - show for all grandfathers */}
                            {prefix.includes('gf') && (
                              <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                                <Checkbox
                                  id={`${prefix}_has_military_record`}
                                  checked={formData?.[`${prefix}_has_military_record`] || false}
                                  onCheckedChange={(checked) => handleInputChange(`${prefix}_has_military_record`, checked)}
                                  className="h-6 w-6"
                                />
                                <Label htmlFor={`${prefix}_has_military_record`} className="cursor-pointer text-sm font-normal">Military service record</Label>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                              <Checkbox
                                id={`${prefix}_has_foreign_documents`}
                                checked={formData?.[`${prefix}_has_foreign_documents`] || false}
                                onCheckedChange={(checked) => handleInputChange(`${prefix}_has_foreign_documents`, checked)}
                                className="h-6 w-6"
                              />
                              <Label htmlFor={`${prefix}_has_foreign_documents`} className="cursor-pointer text-sm font-normal">Foreign documents</Label>
                            </div>
                            
                            <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                              <Checkbox
                                id={`${prefix}_has_additional_documents`}
                                checked={formData?.[`${prefix}_has_additional_documents`] || false}
                                onCheckedChange={(checked) => handleInputChange(`${prefix}_has_additional_documents`, checked)}
                                className="h-6 w-6"
                              />
                              <Label htmlFor={`${prefix}_has_additional_documents`} className="cursor-pointer text-sm font-normal">Additional documents</Label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>;
              })}
              </CardContent>
            </Card>
          </motion.div>
          )}

          {/* Great-Grandparents Section */}
          {activeTab === 'great-grandparents' && (
          <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5,
          delay: 0.5
        }}>
            <Card className="glass-card border-primary/20">
              <CardHeader className="border-b border-border/50 pb-6">
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Polish Great-Grandparents</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-8">
                {["pggf", "pggm", "mggf", "mggm"].map(prefix => {
                const labels = {
                  pggf: "Pat. Great-Grandfather (Father's Side)",
                  pggm: "Pat. Great-Grandmother (Father's Side)",
                  mggf: "Mat. Great-Grandfather (Mother's Side)",
                  mggm: "Mat. Great-Grandmother (Mother's Side)"
                };
                return <Card key={prefix} className="glass-card border-primary/20">
                      <CardHeader className="border-b border-border/50">
                        <CardTitle className="text-2xl md:text-3xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                          {labels[prefix as keyof typeof labels]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 md:p-8 space-y-8">
                        {renderFieldGroup([{
                      name: `${prefix}_first_name`,
                      label: "Given names / Imię/ imiona"
                    }, {
                      name: `${prefix}_last_name`,
                      label: "Full last name / Nazwisko"
                    }, ...(prefix.includes("ggm") ? [{
                      name: `${prefix}_maiden_name`,
                      label: "Maiden name"
                    }] : []), {
                      name: `${prefix}_pob`,
                      label: "Place of birth"
                    }, {
                      name: `${prefix}_dob`,
                      label: "Date of birth",
                      type: "date"
                    }])}
                        <div className="space-y-2">
                          <Label htmlFor={`${prefix}_notes`} className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                            Relevant additional information
                          </Label>
                          <Textarea
                            id={`${prefix}_notes`}
                            value={formData[`${prefix}_notes`] || ""}
                            onChange={e => handleInputChange(`${prefix}_notes`, e.target.value.toUpperCase())}
                            placeholder=""
                            className={cn("min-h-[150px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                          />
                        </div>
                        <div className="pt-4">
                          <h4 className="font-light text-foreground/90 text-sm mb-4">Documents required</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                              <Checkbox
                                id={`${prefix}_has_polish_documents`}
                                checked={formData?.[`${prefix}_has_polish_documents`] || false}
                                onCheckedChange={(checked) => handleInputChange(`${prefix}_has_polish_documents`, checked)}
                                className="h-6 w-6"
                              />
                              <Label htmlFor={`${prefix}_has_polish_documents`} className="cursor-pointer text-sm font-normal">Polish documents</Label>
                            </div>
                            <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                              <Checkbox
                                id={`${prefix}_has_passport`}
                                checked={formData?.[`${prefix}_has_passport`] || false}
                                onCheckedChange={(checked) => handleInputChange(`${prefix}_has_passport`, checked)}
                                className="h-6 w-6"
                              />
                              <Label htmlFor={`${prefix}_has_passport`} className="cursor-pointer text-sm font-normal">Passport copy</Label>
                            </div>
                            <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                              <Checkbox
                                id={`${prefix}_has_birth_cert`}
                                checked={formData?.[`${prefix}_has_birth_cert`] || false}
                                onCheckedChange={(checked) => handleInputChange(`${prefix}_has_birth_cert`, checked)}
                                className="h-6 w-6"
                              />
                              <Label htmlFor={`${prefix}_has_birth_cert`} className="cursor-pointer text-sm font-normal">Birth certificate</Label>
                            </div>
                            <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                              <Checkbox
                                id={`${prefix}_has_marriage_cert`}
                                checked={formData?.[`${prefix}_has_marriage_cert`] || false}
                                onCheckedChange={(checked) => handleInputChange(`${prefix}_has_marriage_cert`, checked)}
                                className="h-6 w-6"
                              />
                              <Label htmlFor={`${prefix}_has_marriage_cert`} className="cursor-pointer text-sm font-normal">Marriage certificate</Label>
                            </div>
                            <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                              <Checkbox
                                id={`${prefix}_has_naturalization`}
                                checked={formData?.[`${prefix}_has_naturalization`] || false}
                                onCheckedChange={(checked) => handleInputChange(`${prefix}_has_naturalization`, checked)}
                                className="h-6 w-6"
                              />
                              <Label htmlFor={`${prefix}_has_naturalization`} className="cursor-pointer text-sm font-normal">Naturalization certificate</Label>
                            </div>
                            
                            {/* Military record - show for all great-grandfathers */}
                            {prefix.includes('ggf') && (
                              <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                                <Checkbox
                                  id={`${prefix}_has_military_record`}
                                  checked={formData?.[`${prefix}_has_military_record`] || false}
                                  onCheckedChange={(checked) => handleInputChange(`${prefix}_has_military_record`, checked)}
                                  className="h-6 w-6"
                                />
                                <Label htmlFor={`${prefix}_has_military_record`} className="cursor-pointer text-sm font-normal">Military service record</Label>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                              <Checkbox
                                id={`${prefix}_has_foreign_documents`}
                                checked={formData?.[`${prefix}_has_foreign_documents`] || false}
                                onCheckedChange={(checked) => handleInputChange(`${prefix}_has_foreign_documents`, checked)}
                                className="h-6 w-6"
                              />
                              <Label htmlFor={`${prefix}_has_foreign_documents`} className="cursor-pointer text-sm font-normal">Foreign documents</Label>
                            </div>
                            
                            <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
                              <Checkbox
                                id={`${prefix}_has_additional_documents`}
                                checked={formData?.[`${prefix}_has_additional_documents`] || false}
                                onCheckedChange={(checked) => handleInputChange(`${prefix}_has_additional_documents`, checked)}
                                className="h-6 w-6"
                              />
                              <Label htmlFor={`${prefix}_has_additional_documents`} className="cursor-pointer text-sm font-normal">Additional documents</Label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>;
              })}
              </CardContent>
            </Card>
          </motion.div>
          )}

          {/* Additional Info Section */}
          {activeTab === 'additional' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-card border-primary/20">
              <CardHeader className="border-b border-border/50 pb-6">
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10">
                <div className="space-y-2">
                  <Label htmlFor="additional_info" className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                    Additional relevant information
                  </Label>
                  <Textarea
                    id="additional_info"
                    value={formData.additional_info || ""}
                    onChange={e => handleInputChange("additional_info", e.target.value.toUpperCase())}
                    placeholder=""
                    className={cn("min-h-[200px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          )}
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>

      {/* Clear Data Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all fields in the Family Tree form. This action cannot be undone.
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