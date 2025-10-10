import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Loader2, Save, FileText, Users, Baby, Heart, Sparkles, Download, GitBranch, Type, FilePlus, User, ArrowLeft, TreePine, BookOpen, FolderOpen, HelpCircle, Maximize2, Minimize2 } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFormSync } from "@/hooks/useFormSync";
import { CountrySelect } from "@/components/CountrySelect";
import { DateField } from "@/components/DateField";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FormButtonsRow } from "@/components/FormButtonsRow";

export default function MasterDataTable() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();

  console.log('MasterDataTable - caseId from URL:', caseId);
  
  const { formData, setFormData, isLoading, isSaving, saveData } = useFormSync(caseId);
  const [activeTab, setActiveTab] = useState("applicant");
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { isLargeFonts, toggleFontSize } = useAccessibility();
  const [isFullView, setIsFullView] = useState(false);

  // Show error if no valid caseId
  if (!caseId || caseId === ':id') {
    return <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Invalid Case ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please navigate to this page from a valid case detail page.</p>
          </CardContent>
        </Card>
      </div>;
  }
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      // Handle address fields specially
      if (field.startsWith('applicant_address_')) {
        const addressField = field.replace('applicant_address_', '');
        return {
          ...prev,
          [field]: value,
          applicant_address: {
            ...(typeof prev.applicant_address === 'object' ? prev.applicant_address : {}),
            [addressField]: value
          }
        };
      }

      // Auto-sync children's last names when father's last name changes
      if (field === 'father_last_name') {
        console.log('🔄 Father last name changed to:', value);
        const updatedData = { ...prev, [field]: value };
        const childrenCount = 10; // Always sync all 10 possible children
        
        for (let i = 1; i <= childrenCount; i++) {
          updatedData[`child_${i}_last_name`] = value;
        }
        
        toast.success(`Father's last name synced to all ${childrenCount} children fields`);
        return updatedData;
      }

      // Auto-sync husband's last name after marriage with his current last name
      if (prev.applicant_sex === 'M' && field === 'applicant_last_name') {
        console.log('🤵 Male applicant: syncing applicant_last_name_after_marriage =', value);
        toast.success('Husband\'s last name after marriage auto-synced');
        return {
          ...prev,
          [field]: value,
          applicant_last_name_after_marriage: value
        };
      }
      
      if (prev.applicant_sex === 'F' && field === 'spouse_last_name') {
        console.log('🤵 Husband (spouse): syncing spouse_last_name_after_marriage =', value);
        toast.success('Husband\'s last name after marriage auto-synced');
        return {
          ...prev,
          [field]: value,
          spouse_last_name_after_marriage: value
        };
      }

      return {
        ...prev,
        [field]: value
      };
    });
  };
  const handleSave = async () => {
    if (!caseId) return;
    await saveData(formData);
  };

  const handleClearData = () => {
    setFormData({});
    toast.success('All form data cleared');
    setShowClearDialog(false);
  };
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
  // Use DateField component for consistent date styling
  const renderDateFieldComponent = (name: string, label: string) => {
    return (
      <DateField
        name={name}
        label={label}
        value={formData[name] || ""}
        onChange={(value) => handleInputChange(name, value)}
      />
    );
  };
  const renderFieldGroup = (fields: Array<{
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
  }>) => {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field, idx) => field.type === "date" ? (
          <div key={field.name}>
            {renderDateFieldComponent(field.name, field.label)}
          </div>
        ) : (
          <motion.div key={field.name} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: idx * 0.05,
        duration: 0.4
      }} className="space-y-4">
            <Label htmlFor={field.name} className="text-sm font-normal text-foreground/90">
              {field.label}
            </Label>
            <Input id={field.name} type={field.type || "text"} value={formData[field.name] || ""} onChange={e => handleInputChange(field.name, field.type === "email" ? e.target.value : e.target.value.toUpperCase())} placeholder="" className={cn("h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur", field.type === "email" ? "" : "uppercase")} style={{
            fontSize: '1.125rem',
            fontWeight: '400'
          }} />
          </motion.div>
        ))}
      </div>;
  };
  const renderCheckboxGroup = (fields: Array<{
    name: string;
    label: string;
  }>) => {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  const renderTextarea = (name: string, label: string, rows = 4) => {
    return <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="space-y-3">
        <Label htmlFor={name} className="text-base font-medium text-foreground">
          {label}
        </Label>
        <Textarea id={name} value={formData[name] || ""} onChange={e => handleInputChange(name, e.target.value)} rows={rows} className="border-2 text-base hover-glow focus:shadow-lg transition-all resize-vertical bg-card/50 backdrop-blur min-h-[150px]" />
      </motion.div>;
  };
  return <div className="min-h-screen relative">
      {/* Footer-style Background */}
      <div className="fixed inset-0 bg-gradient-to-t from-background via-primary/5 to-background pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 relative z-10 max-w-7xl">

        {/* Action Buttons Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card border-primary/20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
            <CardHeader className="relative pb-6 pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
                <Button
                  onClick={() => window.open('https://docs.lovable.dev', '_blank')}
                  size="lg"
                  variant="ghost"
                  className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 text-2xl font-light opacity-60"
                  title="How to fill this form"
                >
                  ?
                </Button>
                  <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text">
                    Master Form
                  </CardTitle>
                </motion.div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => navigate(`/admin/case/${caseId}`)}
                    size="lg"
                    variant="ghost"
                    className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 z-50 opacity-60"
                    title="Back to Case"
                  >
                    <ArrowLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    size="lg"
                    variant="ghost"
                    className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 z-50 opacity-60"
                    title="Login / Register"
                  >
                    <User className="h-8 w-8" />
                  </Button>
                  <Button
                    onClick={toggleFontSize}
                    size="lg"
                    variant="ghost"
                    className={`h-16 w-16 rounded-full transition-all hover:bg-primary/10 z-50 opacity-60 ${
                      isLargeFonts ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-primary'
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
                currentForm="master-data"
                onSave={handleSave}
                onClear={() => setShowClearDialog(true)}
                onGeneratePDF={() => {}}
                isSaving={isSaving}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Form with Tabs */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Card className="glass-card border-primary/20">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50 flex items-center gap-2">
                <Button
                  onClick={() => setIsFullView(!isFullView)}
                  variant="ghost"
                  size="sm"
                  className="ml-2 flex-shrink-0"
                  title={isFullView ? "Show tabs" : "Show all sections"}
                >
                  {isFullView ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </Button>
                <div className="flex-1">
                  <TabsList className="w-full h-auto p-2 bg-transparent flex flex-wrap justify-start gap-1">
                  <TabsTrigger value="applicant" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Applicant</span>
                  </TabsTrigger>
                  {formData.applicant_is_married && (
                    <TabsTrigger value="spouse" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                      <Heart className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Spouse</span>
                    </TabsTrigger>
                  )}
                  {(formData.minor_children_count > 0) && (
                    <TabsTrigger value="children" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                      <Baby className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Children</span>
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="parents" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Parents</span>
                  </TabsTrigger>
                  <TabsTrigger value="grandparents" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                    <GitBranch className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Grandparents</span>
                  </TabsTrigger>
                  <TabsTrigger value="great-grandparents" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                    <TreePine className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Great Grandparents</span>
                  </TabsTrigger>
                  <TabsTrigger value="additional-data" className="data-[state=active]:bg-primary/20 text-sm md:text-base py-3">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Additional</span>
                  </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <TabsContent value="applicant" className="mt-0">
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

                  {/* Row 3: Names */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
                      <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                        Given names / Imię/ imiona
                      </Label>
                      <Input
                        value={formData.applicant_first_name || ""}
                        onChange={(e) => handleInputChange("applicant_first_name", e.target.value.toUpperCase())}
                        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                        style={{ fontSize: '1.125rem', fontWeight: '400' }}
                      />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-2">
                      <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                        Full last name / Nazwisko
                      </Label>
                      <Input
                        value={formData.applicant_last_name || ""}
                        onChange={(e) => handleInputChange("applicant_last_name", e.target.value.toUpperCase())}
                        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                        style={{ fontSize: '1.125rem', fontWeight: '400' }}
                      />
                    </motion.div>
                  </div>

                  {/* Row 4: Maiden name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-2">
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

                  {/* Row 5: Place and Date of birth */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="space-y-2">
                      <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                        Place of birth / Miejsce urodzenia
                      </Label>
                      <Input
                        value={formData.applicant_pob || ""}
                        onChange={(e) => handleInputChange("applicant_pob", e.target.value.toUpperCase())}
                        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                        style={{ fontSize: '1.125rem', fontWeight: '400' }}
                      />
                    </motion.div>
                    <DateField
                      name="applicant_dob"
                      label="Date of birth / Data urodzenia"
                      value={formData.applicant_dob || ""}
                      onChange={(value) => handleInputChange("applicant_dob", value)}
                    />
                  </div>

                  {/* Marriage fields - Only show if married */}
                  {formData.applicant_is_married && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                        <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                          Place of marriage / Miejsce zawarcia związku małżeńskiego
                        </Label>
                        <Input
                          value={formData.place_of_marriage || ""}
                          onChange={(e) => handleInputChange("place_of_marriage", e.target.value.toUpperCase())}
                          className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                          style={{ fontSize: '1.125rem', fontWeight: '400' }}
                        />
                      </motion.div>
                      <DateField
                        name="date_of_marriage"
                        label="Date of marriage / Data zawarcia związku małżeńskiego"
                        value={formData.date_of_marriage || ""}
                        onChange={(value) => handleInputChange("date_of_marriage", value)}
                      />
                    </div>
                  )}

                  {/* Contact information */}
                  <div className="pt-8">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Contact information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                        <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                          Email
                        </Label>
                        <Input
                          value={formData.applicant_email || ""}
                          onChange={(e) => handleInputChange("applicant_email", e.target.value)}
                          type="email"
                          className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur"
                          style={{ fontSize: '1.125rem', fontWeight: '400' }}
                        />
                      </motion.div>
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                        <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                          Phone
                        </Label>
                        <Input
                          value={formData.applicant_phone || ""}
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
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                        <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                          Passport number
                        </Label>
                        <Input
                          value={formData.applicant_passport_number || ""}
                          onChange={(e) => handleInputChange("applicant_passport_number", e.target.value.toUpperCase())}
                          className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                          style={{ fontSize: '1.125rem', fontWeight: '400' }}
                        />
                      </motion.div>
                      <DateField
                        name="applicant_passport_expiry_date"
                        label="Passport expiry date"
                        value={formData.applicant_passport_expiry_date || ""}
                        onChange={(value) => handleInputChange("applicant_passport_expiry_date", value)}
                      />
                    </div>
                  </div>


                  {/* Immigration information */}
                  <div className="pt-8">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Immigration information</h3>
                    {renderFieldGroup([{
                      name: "applicant_date_of_emigration",
                      label: "Date of emigration",
                      type: "date"
                    }, {
                      name: "applicant_date_of_naturalization",
                      label: "Date of naturalization",
                      type: "date"
                    }])}
                  </div>

                  {/* Address Section */}
                  <div className="pt-8">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Address</h3>
                    {renderFieldGroup([{
                    name: "applicant_address_street",
                    label: "Street Address"
                  }, {
                    name: "applicant_address_city",
                    label: "City"
                  }, {
                    name: "applicant_address_state",
                    label: "State/Province"
                  }, {
                    name: "applicant_address_postal",
                    label: "Postal code"
                  }])}
                  
                  <CountrySelect
                    value={formData.applicant_address_country || ""}
                    onChange={(value) => handleInputChange("applicant_address_country", value)}
                    label="Country"
                    isLargeFonts={isLargeFonts}
                  />
                  </div>

                  <div className="pt-8">
                    <h3 className="font-light text-foreground/90 text-sm mb-6">Documents required</h3>
                    {renderCheckboxGroup([{
                    name: "applicant_has_polish_documents",
                    label: "Polish documents"
                  }, {
                    name: "applicant_has_passport",
                    label: "Passport copy"
                  }, {
                    name: "applicant_has_birth_cert",
                    label: "Birth certificate"
                  }, {
                    name: "applicant_has_marriage_cert",
                    label: "Marriage certificate"
                  }, {
                    name: "applicant_has_naturalization",
                    label: "Naturalization certificate"
                  }, ...(formData.applicant_sex === "Male / Mężczyzna" ? [{
                    name: "applicant_has_military_record",
                    label: "Military record (males only)"
                  }] : []), {
                    name: "applicant_has_foreign_documents",
                    label: "Foreign documents"
                  }, {
                    name: "applicant_has_additional_documents",
                    label: "Additional documents"
                  }])}
                  </div>

                  <div className="pt-8">
                    {renderTextarea("applicant_notes", "Additional notes")}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* SPOUSE TAB - Always accessible */}
          {activeTab === "spouse" && (
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
                    Spouse Information
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
                      <Select value={formData.spouse_sex || ""} onValueChange={(value) => handleInputChange("spouse_sex", value)}>
                        <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-2 z-50">
                          <SelectItem value="Male / Mężczyzna" className="text-base cursor-pointer">Male / Mężczyzna</SelectItem>
                          <SelectItem value="Female / Kobieta" className="text-base cursor-pointer">Female / Kobieta</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </div>

                  {/* Row 2: Names */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
                      <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                        Given names / Imię/ imiona
                      </Label>
                      <Input
                        value={formData.spouse_first_name || ""}
                        onChange={(e) => handleInputChange("spouse_first_name", e.target.value.toUpperCase())}
                        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                        style={{ fontSize: '1.125rem', fontWeight: '400' }}
                      />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-2">
                      <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                        Full last name / Nazwisko
                      </Label>
                      <Input
                        value={formData.spouse_last_name || ""}
                        onChange={(e) => handleInputChange("spouse_last_name", e.target.value.toUpperCase())}
                        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                        style={{ fontSize: '1.125rem', fontWeight: '400' }}
                      />
                    </motion.div>
                  </div>

                  {/* Row 3: Maiden name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-2">
                      <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                        Maiden name / Nazwisko rodowe
                      </Label>
                      <Input
                        value={formData.spouse_maiden_name || ""}
                        onChange={(e) => handleInputChange("spouse_maiden_name", e.target.value.toUpperCase())}
                        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                        style={{ fontSize: '1.125rem', fontWeight: '400' }}
                      />
                    </motion.div>
                  </div>

                  {/* Row 4: Place and Date of birth */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="space-y-2">
                      <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                        Place of birth / Miejsce urodzenia
                      </Label>
                      <Input
                        value={formData.spouse_pob || ""}
                        onChange={(e) => handleInputChange("spouse_pob", e.target.value.toUpperCase())}
                        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                        style={{ fontSize: '1.125rem', fontWeight: '400' }}
                      />
                    </motion.div>
                    <DateField
                      name="spouse_dob"
                      label="Date of birth / Data urodzenia"
                      value={formData.spouse_dob || ""}
                      onChange={(value) => handleInputChange("spouse_dob", value)}
                    />
                  </div>

                  {/* Marriage fields - Always show for spouse */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                      <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                        Place of marriage / Miejsce zawarcia związku małżeńskiego
                      </Label>
                      <Input
                        value={formData.place_of_marriage || ""}
                        onChange={(e) => handleInputChange("place_of_marriage", e.target.value.toUpperCase())}
                        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                        style={{ fontSize: '1.125rem', fontWeight: '400' }}
                      />
                    </motion.div>
                    <DateField
                      name="date_of_marriage"
                      label="Date of marriage / Data zawarcia związku małżeńskiego"
                      value={formData.date_of_marriage || ""}
                      onChange={(value) => handleInputChange("date_of_marriage", value)}
                    />
                  </div>

                  {/* Contact information */}
                  <div className="pt-8">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Contact information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                        <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                          Email
                        </Label>
                        <Input
                          value={formData.spouse_email || ""}
                          onChange={(e) => handleInputChange("spouse_email", e.target.value)}
                          type="email"
                          className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur"
                          style={{ fontSize: '1.125rem', fontWeight: '400' }}
                        />
                      </motion.div>
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                        <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                          Phone
                        </Label>
                        <Input
                          value={formData.spouse_phone || ""}
                          onChange={(e) => handleInputChange("spouse_phone", e.target.value)}
                          className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur"
                          style={{ fontSize: '1.125rem', fontWeight: '400' }}
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Immigration information */}
                  <div className="pt-8">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Immigration information</h3>
                    {renderFieldGroup([{
                      name: "spouse_date_of_emigration",
                      label: "Date of emigration",
                      type: "date"
                    }, {
                      name: "spouse_date_of_naturalization",
                      label: "Date of naturalization",
                      type: "date"
                    }])}
                  </div>

                  {/* Documents required */}
                  <div className="pt-8">
                    <h3 className="font-light text-foreground/90 text-sm mb-6">Documents required</h3>
                    {renderCheckboxGroup([{
                      name: "spouse_has_polish_documents",
                      label: "Polish documents"
                    }, {
                      name: "spouse_has_passport",
                      label: "Passport copy"
                    }, {
                      name: "spouse_has_birth_cert",
                      label: "Birth certificate"
                    }, {
                      name: "spouse_has_marriage_cert",
                      label: "Marriage certificate"
                    }, {
                      name: "spouse_has_naturalization",
                      label: "Naturalization certificate"
                    }, ...(formData.spouse_sex === "Male / Mężczyzna" ? [{
                      name: "spouse_has_military_record",
                      label: "Military record (males only)"
                    }] : []), {
                      name: "spouse_has_foreign_documents",
                      label: "Foreign documents"
                    }, {
                      name: "spouse_has_additional_documents",
                      label: "Additional documents"
                    }])}
                  </div>

                  {/* Additional notes */}
                  <div className="pt-8">
                    {renderTextarea("spouse_notes", "Additional notes")}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* KIDS TAB */}
          {activeTab === "children" && (
            <ScrollArea className="h-[800px]">
              <motion.div initial={{
              opacity: 0,
              scale: 0.95
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              duration: 0.5
            }} className="space-y-6">
                <Card className="glass-card border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      Children Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-10 space-y-8">
                    {/* Info message about children count */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                      <p className="text-sm text-foreground/80">
                        Based on the Applicant tab, you have <span className="font-semibold text-primary">{formData.minor_children_count || 0} minor {formData.minor_children_count === 1 ? 'child' : 'children'}</span> (under 18) to enter details for below.
                        <span className="block mt-1 text-muted-foreground">
                          Note: Adult children should be processed as separate applicants.
                        </span>
                      </p>
                    </motion.div>
                  </CardContent>
                </Card>

                {Array.from({
                length: formData.minor_children_count || 0
              }, (_, i) => i + 1).map(num => <Card key={num} className="glass-card border-primary/20">
                    <CardHeader className="border-b border-border/50">
                      <CardTitle className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Minor Child {num}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-10 space-y-8">
                      {renderFieldGroup([{
                    name: `child_${num}_first_name`,
                    label: "Given names / Imię/ imiona"
                  }, {
                    name: `child_${num}_last_name`,
                    label: "Full last name / Nazwisko"
                  }, {
                    name: `child_${num}_sex`,
                    label: "Sex"
                  }, {
                    name: `child_${num}_dob`,
                    label: "Date of birth",
                    type: "date"
                  }, {
                    name: `child_${num}_pob`,
                    label: "Place of birth"
                  }])}
                      <div className="pt-4">
                        {renderCheckboxGroup([{
                      name: `child_${num}_has_passport`,
                      label: "Passport Copy"
                    }, {
                      name: `child_${num}_has_birth_cert`,
                      label: "Birth certificate"
                    }])}
                      </div>
                      <div>
                        {renderTextarea(`child_${num}_notes`, "Notes", 2)}
                      </div>
                    </CardContent>
                  </Card>)}
              </motion.div>
            </ScrollArea>
          )}

          {/* PARENTS TAB */}
          {activeTab === "parents" && (
            <ScrollArea className="h-[800px]">
              <motion.div initial={{
              opacity: 0,
              scale: 0.95
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              duration: 0.5
            }} className="space-y-6">
                {/* Father */}
                <Card className="glass-card border-primary/20">
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        Father Information
                      </CardTitle>
                      {/* Polish descent marker */}
                      <div className="flex items-center gap-2 bg-primary/10 border-2 border-primary/30 rounded-lg px-4 py-2">
                        <Checkbox
                          id="father_polish_descent"
                          checked={formData.father_polish_descent || false}
                          onCheckedChange={(checked) => handleInputChange("father_polish_descent", checked)}
                        />
                        <Label htmlFor="father_polish_descent" className="text-sm font-semibold text-primary cursor-pointer">
                          Polish Descent
                        </Label>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 md:p-10 space-y-8">
                    {/* Names and Birth */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-foreground">Personal information</h3>
                      {renderFieldGroup([{
                        name: "father_first_name",
                        label: "Given names / Imię/ imiona"
                      }, {
                        name: "father_last_name",
                        label: "Full last name / Nazwisko"
                      }, {
                        name: "father_pob",
                        label: "Place of birth / Miejsce urodzenia"
                      }, {
                        name: "father_dob",
                        label: "Date of birth / Data urodzenia",
                        type: "date"
                      }])}
                    </div>

                    {/* Emigration and Naturalization */}
                    <div className="space-y-6 pt-6 border-t border-border/30">
                      <h3 className="text-xl font-semibold text-foreground">Immigration information</h3>
                      {renderFieldGroup([{
                        name: "father_date_of_emigration",
                        label: "Date of emigration / Data emigracji",
                        type: "date"
                      }, {
                        name: "father_date_of_naturalization",
                        label: "Date of naturalization / Data naturalizacji",
                        type: "date"
                      }])}
                    </div>

                    {/* Documents */}
                    <div className="pt-6 border-t border-border/30">
                      <h3 className="text-xl font-semibold mb-4 text-foreground">Documents checklist</h3>
                      {renderCheckboxGroup([{
                        name: "father_has_birth_cert",
                        label: "Birth certificate"
                      }, {
                        name: "father_has_marriage_cert",
                        label: "Marriage certificate"
                      }, {
                        name: "father_has_naturalization",
                        label: "Naturalization papers"
                      }, {
                        name: "father_has_additional_documents",
                        label: "Additional documents"
                      }])}
                    </div>

                    {/* Notes */}
                    <div className="pt-6 border-t border-border/30">
                      {renderTextarea("father_notes", "Notes")}
                    </div>
                  </CardContent>
                </Card>

                {/* Mother */}
                <Card className="glass-card border-primary/20">
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        Mother Information
                      </CardTitle>
                      {/* Polish descent marker */}
                      <div className="flex items-center gap-2 bg-primary/10 border-2 border-primary/30 rounded-lg px-4 py-2">
                        <Checkbox
                          id="mother_polish_descent"
                          checked={formData.mother_polish_descent || false}
                          onCheckedChange={(checked) => handleInputChange("mother_polish_descent", checked)}
                        />
                        <Label htmlFor="mother_polish_descent" className="text-sm font-semibold text-primary cursor-pointer">
                          Polish Descent
                        </Label>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 md:p-10 space-y-8">
                    {/* Names and Birth */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-foreground">Personal information</h3>
                      {renderFieldGroup([{
                        name: "mother_first_name",
                        label: "Given names / Imię/ imiona"
                      }, {
                        name: "mother_last_name",
                        label: "Full last name / Nazwisko"
                      }, {
                        name: "mother_maiden_name",
                        label: "Maiden name / Nazwisko panieńskie"
                      }, {
                        name: "mother_pob",
                        label: "Place of birth / Miejsce urodzenia"
                      }, {
                        name: "mother_dob",
                        label: "Date of birth / Data urodzenia",
                        type: "date"
                      }])}
                    </div>

                    {/* Emigration and Naturalization */}
                    <div className="space-y-6 pt-6 border-t border-border/30">
                      <h3 className="text-xl font-semibold text-foreground">Immigration information</h3>
                      {renderFieldGroup([{
                        name: "mother_date_of_emigration",
                        label: "Date of emigration / Data emigracji",
                        type: "date"
                      }, {
                        name: "mother_date_of_naturalization",
                        label: "Date of naturalization / Data naturalizacji",
                        type: "date"
                      }])}
                    </div>

                    {/* Documents */}
                    <div className="pt-6 border-t border-border/30">
                      <h3 className="text-xl font-semibold mb-4 text-foreground">Documents checklist</h3>
                      {renderCheckboxGroup([{
                        name: "mother_has_birth_cert",
                        label: "Birth certificate"
                      }, {
                        name: "mother_has_marriage_cert",
                        label: "Marriage certificate"
                      }, {
                        name: "mother_has_naturalization",
                        label: "Naturalization papers"
                      }, {
                        name: "mother_has_additional_documents",
                        label: "Additional documents"
                      }])}
                    </div>

                    {/* Notes */}
                    <div className="pt-6 border-t border-border/30">
                      {renderTextarea("mother_notes", "Notes")}
                    </div>
                  </CardContent>
                </Card>

                {/* Parents Marriage Information - Always visible */}
                <Card className="glass-card border-primary/20">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      Parents' Marriage Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-10 space-y-6">
                    {renderFieldGroup([{
                      name: "father_mother_marriage_place",
                      label: "Place of marriage / Miejsce zawarcia związku małżeńskiego"
                    }, {
                      name: "father_mother_marriage_date",
                      label: "Date of marriage / Data zawarcia związku małżeńskiego",
                      type: "date"
                    }])}
                    
                    {/* Documents required for parents' marriage */}
                    <div className="pt-6 border-t border-border/30">
                      <h3 className="text-xl font-semibold mb-4 text-foreground">
                        Marriage documents checklist
                      </h3>
                      {renderCheckboxGroup([{
                        name: "parents_has_marriage_cert",
                        label: "Marriage certificate"
                      }, {
                        name: "parents_has_marriage_foreign_docs",
                        label: "Foreign marriage documents"
                      }, {
                        name: "parents_has_marriage_additional_docs",
                        label: "Additional marriage documents"
                      }])}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </ScrollArea>
          )}

          {/* GRANDPARENTS TAB */}
          {activeTab === "grandparents" && (
            <ScrollArea className="h-[800px]">
              <motion.div initial={{
              opacity: 0,
              scale: 0.95
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              duration: 0.5
            }} className="space-y-6">
                {["pgf", "pgm", "mgf", "mgm"].map((prefix, idx) => {
                const labels = {
                  pgf: "Paternal Grandfather",
                  pgm: "Paternal Grandmother",
                  mgf: "Maternal Grandfather",
                  mgm: "Maternal Grandmother"
                };
                const marriageLabels = {
                  pgf: "Paternal Grandparents' Marriage",
                  mgf: "Maternal Grandparents' Marriage"
                };
                const marriagePrefix = prefix === "pgf" ? "pgf_pgm" : prefix === "mgf" ? "mgf_mgm" : null;
                
                return (
                  <React.Fragment key={prefix}>
                    <Card className="glass-card border-primary/20">
                      <CardHeader className="border-b border-border/50">
                        <CardTitle className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                          {labels[prefix as keyof typeof labels]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 md:p-10 space-y-8">
                        {/* Names and Birth */}
                        <div className="space-y-6">
                          {renderFieldGroup([{
                            name: `${prefix}_first_name`,
                            label: "Given names / Imię/ imiona"
                          }, {
                            name: `${prefix}_last_name`,
                            label: "Full last name / Nazwisko"
                          }, ...(prefix.includes("gm") ? [{
                            name: `${prefix}_maiden_name`,
                            label: "Maiden name / Nazwisko panieńskie"
                          }] : []), {
                            name: `${prefix}_pob`,
                            label: "Place of birth / Miejsce urodzenia"
                          }, {
                            name: `${prefix}_dob`,
                            label: "Date of birth / Data urodzenia",
                            type: "date"
                          }])}
                        </div>

                        {/* Emigration and Naturalization */}
                        <div className="space-y-6 pt-6 border-t border-border/30">
                          <h3 className="text-xl font-semibold text-foreground">Immigration information</h3>
                          {renderFieldGroup([{
                            name: `${prefix}_date_of_emigration`,
                            label: "Date of emigration / Data emigracji",
                            type: "date"
                          }, {
                            name: `${prefix}_date_of_naturalization`,
                            label: "Date of naturalization / Data naturalizacji",
                            type: "date"
                          }])}
                        </div>

                        {/* Documents */}
                        <div className="pt-6 border-t border-border/30">
                          <h3 className="text-xl font-semibold mb-4 text-foreground">Documents checklist</h3>
                          {renderCheckboxGroup([{
                            name: `${prefix}_has_birth_cert`,
                            label: "Birth certificate"
                          }, {
                            name: `${prefix}_has_naturalization`,
                            label: "Naturalization papers"
                          }])}
                        </div>

                        {/* Notes */}
                        <div className="pt-6 border-t border-border/30">
                          {renderTextarea(`${prefix}_notes`, "Notes")}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Marriage card after each grandfather */}
                    {marriagePrefix && (
                      <Card className="glass-card border-primary/20">
                        <CardHeader className="border-b border-border/50">
                          <CardTitle className="text-2xl md:text-3xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                            {marriageLabels[prefix as keyof typeof marriageLabels]}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-10 space-y-6">
                          {renderFieldGroup([{
                            name: `${marriagePrefix}_marriage_place`,
                            label: "Place of marriage / Miejsce zawarcia związku małżeńskiego"
                          }, {
                            name: `${marriagePrefix}_marriage_date`,
                            label: "Date of marriage / Data zawarcia związku małżeńskiego",
                            type: "date"
                          }])}
                        </CardContent>
                      </Card>
                    )}
                  </React.Fragment>
                );
              })}
              </motion.div>
            </ScrollArea>
          )}

          {/* GREAT-GRANDPARENTS TAB */}
          {activeTab === "great-grandparents" && (
            <ScrollArea className="h-[800px]">
              <motion.div initial={{
              opacity: 0,
              scale: 0.95
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              duration: 0.5
            }} className="space-y-6">
                {["pggf", "pggm", "mggf", "mggm"].map(prefix => {
                const labels = {
                  pggf: "Pat. Great-Grandfather (Father's Side)",
                  pggm: "Pat. Great-Grandmother (Father's Side)",
                  mggf: "Mat. Great-Grandfather (Mother's Side)",
                  mggm: "Mat. Great-Grandmother (Mother's Side)"
                };
                return <Card key={prefix} className="glass-card border-primary/20">
                      <CardHeader className="border-b border-border/50">
                        <CardTitle className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                          {labels[prefix as keyof typeof labels]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 md:p-10 space-y-10">
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
                        <div className="pt-4">
                          {renderCheckboxGroup([...(prefix === "pggf" || prefix === "mggf" ? [{
                        name: `${prefix}_has_polish_documents`,
                        label: "Polish documents"
                      }] : []), ...(prefix === "pggm" || prefix === "mggm" ? [{
                        name: `${prefix}_has_polish_documents`,
                        label: "Polish documents"
                      }] : []), {
                        name: `${prefix}_has_birth_cert`,
                        label: "Birth certificate"
                      }, {
                        name: `${prefix}_has_marriage_cert`,
                        label: "Marriage certificate"
                      }, {
                        name: `${prefix}_has_naturalization_papers`,
                        label: "Naturalization Papers"
                      }, {
                        name: `${prefix}_has_foreign_documents`,
                        label: "Foreign Documents"
                      }, ...(prefix === "pggf" || prefix === "mggf" ? [{
                        name: `${prefix}_has_military_records`,
                        label: "Military Records"
                      }] : [])])}
                        </div>
                        <div>{renderTextarea(`${prefix}_notes`, "Notes")}</div>
                      </CardContent>
                    </Card>;
              })}
              </motion.div>
            </ScrollArea>
          )}

          {/* ADDITIONAL DATA TAB */}
          {activeTab === "additional-data" && (
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
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-10 space-y-10">
                  <div className="text-center py-20">
                    <p className="text-xl text-muted-foreground">
                      Additional fields will be added here...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
            </Tabs>
          </Card>
        </motion.div>
      </div>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear entire form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all fields in the Master Form. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData}>
              Clear all fields
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>;
}