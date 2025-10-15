import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useRef, Fragment } from "react";
import { Loader2, Save, Download, Users, Sparkles, Type, User, ArrowLeft, TreePine, BookOpen, Baby, Heart, FileText, GitBranch, HelpCircle, Maximize2, Minimize2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { DateField } from "@/components/DateField";
import { toast } from "sonner";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { FormButtonsRow } from "@/components/FormButtonsRow";
import { FamilyTreeInteractive } from "@/components/FamilyTreeInteractive";
import { FamilyMemberDocumentsSection } from "@/components/forms/FamilyMemberDocumentsSection";
import { FormInput } from "@/components/forms/FormInput";
import { MaskedPassportInput } from "@/components/forms/MaskedPassportInput";
import { useFormManager } from "@/hooks/useFormManager";
import { FAMILY_TREE_FORM_REQUIRED_FIELDS, FAMILY_TREE_DATE_FIELDS } from "@/config/formRequiredFields";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";

type ColorScheme = 'children' | 'applicant' | 'spouse' | 'parents' | 'grandparents' | 'ggp' | 'poa' | 'citizenship' | 'civil-reg';

export default function FamilyTreeForm() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const { isLargeFonts, toggleFontSize } = useAccessibility();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
    handleSave: formManagerSave,
    handleClearAll,
  } = useFormManager(caseId, FAMILY_TREE_FORM_REQUIRED_FIELDS, FAMILY_TREE_DATE_FIELDS);
  
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({
    select: null,
    applicant: null,
    spouse: null,
    children: null,
    father: null,
    mother: null,
    pgf: null,
    pgm: null,
    mgf: null,
    mgm: null,
    additional: null
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
  const handleGeneratePDF = async () => {
    if (!caseId || caseId === ':id' || caseId === 'demo-preview') {
      toast.error('PDF generation not available in demo mode');
      return;
    }

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

  const handleClearData = async () => {
    await handleClearAll();
    setShowClearDialog(false);
  };

  // Map formData to Person props for FamilyTreeInteractive
  const mapPersonData = (prefix: string) => ({
    firstName: formData[`${prefix}_first_name`] || "",
    lastName: formData[`${prefix}_last_name`] || "",
    maidenName: formData[`${prefix}_maiden_name`],
    dateOfBirth: formData[`${prefix}_dob`],
    placeOfBirth: formData[`${prefix}_pob`],
    dateOfMarriage: formData[`${prefix === 'applicant' ? 'date_of_marriage' : `${prefix}_date_of_marriage`}`],
    placeOfMarriage: formData[`${prefix === 'applicant' ? 'place_of_marriage' : `${prefix}_place_of_marriage`}`],
    dateOfEmigration: formData[`${prefix}_date_of_emigration`],
    dateOfNaturalization: formData[`${prefix}_date_of_naturalization`],
    isAlive: formData[`${prefix}_is_alive`],
    notes: formData[`${prefix}_notes`], // Biographical notes
    documents: {
      birthCertificate: formData[`${prefix}_has_birth_cert`] || false,
      marriageCertificate: formData[`${prefix}_has_marriage_cert`] || false,
      passport: formData[`${prefix}_has_passport`] || false,
      naturalizationDocs: formData[`${prefix}_has_naturalization`] || false,
    }
  });

  // Handle editing a person from the tree
  const handlePersonEdit = (personType: string) => {
    const tabMap: Record<string, string> = {
      'client': 'applicant',
      'spouse': 'spouse',
      'father': 'parents',
      'mother': 'parents',
      'paternalGrandfather': 'grandparents',
      'paternalGrandmother': 'grandparents',
      'maternalGrandfather': 'grandparents',
      'maternalGrandmother': 'grandparents',
      'paternalGreatGrandfather': 'great-grandparents',
      'paternalGreatGrandmother': 'great-grandparents',
      'maternalGreatGrandfather': 'great-grandparents',
      'maternalGreatGrandmother': 'great-grandparents',
    };
    const targetTab = tabMap[personType];
    if (targetTab) {
      setActiveTab(targetTab);
      toast.success(`Editing ${personType.replace(/([A-Z])/g, ' $1').trim()}`);
    }
  };
  const renderDateField = (name: string, label: string, delay = 0, colorScheme: ColorScheme = 'applicant') => {
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
      colorScheme={colorScheme}
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
  }>, colorScheme: ColorScheme = 'applicant') => {
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
            {field.type === "date" ? renderDateField(field.name, field.label, idx * 0.05, colorScheme) : field.isSelect ? <>
                <Label htmlFor={field.name} className={isLargeFonts ? "text-2xl" : ""}>
                  {field.label}
                </Label>
                     <Select value={formData[field.name] || ""} onValueChange={(value) => handleInputChange(field.name, value)}>
                  <SelectTrigger 
                    className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur"
                    style={{
                      boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                    }}
                  >
                    <SelectValue placeholder="Select" />
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
                <Label htmlFor={field.name} className={isLargeFonts ? "text-2xl" : ""}>
                  {field.label}
                </Label>
                {field.name.includes('passport_number') ? (
                  <MaskedPassportInput
                    id={field.name}
                    value={formData[field.name] || ""}
                    onChange={(value) => handleInputChange(field.name, value)}
                    isLargeFonts={isLargeFonts}
                    colorScheme={colorScheme}
                  />
                ) : (
                  <FormInput 
                    id={field.name} 
                    type={field.type || "text"} 
                    value={formData[field.name] || ""} 
                    onChange={e => {
                      // Only uppercase name fields, not phone/passport numbers
                      const shouldUppercase = field.isNameField && field.type !== "email";
                      handleInputChange(field.name, shouldUppercase ? e.target.value.toUpperCase() : e.target.value);
                    }}
                    placeholder="" 
                    isNameField={field.isNameField}
                    isLargeFonts={isLargeFonts}
                    colorScheme={colorScheme}
                  />
                 )}
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
  
  return (
    <div className="overflow-x-hidden min-h-screen relative">
    {/* Checkered grid background - matching footer */}
    <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
    
      <div className="container mx-auto py-3 md:py-12 px-4 md:px-6 relative z-10 max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="mb-1 md:mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-4 pb-1 md:pb-6">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text text-center md:text-left">
                Family Tree
              </h1>
            </motion.div>
            <div className="flex items-center gap-1 md:gap-3 justify-center md:justify-end">
              <Button
                onClick={() => window.open('https://docs.lovable.dev', '_blank')}
                size="lg"
                variant="ghost"
                className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 text-2xl font-light opacity-60"
                title="How to fill this form"
              >
                ?
              </Button>
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
                onClick={() => setIsFullView(!isFullView)}
                size="lg"
                variant="ghost"
                className={`h-16 w-16 rounded-full transition-all hover:bg-primary/10 ${
                  isFullView ? 'bg-primary/20 text-primary opacity-100' : 'text-muted-foreground hover:text-primary opacity-60'
                }`}
                title={isFullView ? "Collapse to Tabs" : "Expand All Sections"}
              >
                {isFullView ? <Minimize2 className="h-8 w-8" /> : <Maximize2 className="h-8 w-8" />}
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
        </motion.div>

        <FormButtonsRow 
          caseId={caseId!}
          currentForm="family-tree"
          onSave={formManagerSave}
          onClear={() => setShowClearDialog(true)}
          onGeneratePDF={handleGeneratePDF}
          isSaving={isSaving}
        />

        {/* Form with Tabs or Full View */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          {!isFullView ? (
            // Tabbed View
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="sticky top-0 z-50 border-b border-border/50 pb-2 pt-2 -mx-4 md:-mx-6">
                <TabsList className="w-screen md:w-full flex gap-0.5 overflow-x-auto md:overflow-visible md:justify-between scrollbar-hide bg-transparent p-0 px-4 md:px-6">

                  <TabsTrigger value="select" className="flex-shrink-0 md:flex-1">
                    <span className="text-blue-600 dark:text-blue-400">Select</span>
                  </TabsTrigger>
                  <TabsTrigger value="applicant" className="flex-shrink-0 md:flex-1">
                    <span className="text-blue-600 dark:text-blue-400">Applicant</span>
                  </TabsTrigger>
                  <TabsTrigger value="spouse" className="flex-shrink-0 md:flex-1">
                    <span className="text-blue-600 dark:text-blue-400">Spouse</span>
                  </TabsTrigger>
                  <TabsTrigger value="children" className="flex-shrink-0 md:flex-1">
                    <span className="text-cyan-600 dark:text-cyan-400">Children</span>
                  </TabsTrigger>
                  <TabsTrigger value="parents" className="flex-shrink-0 md:flex-1">
                    <span className="text-teal-600 dark:text-teal-400">Parents</span>
                  </TabsTrigger>
                  <TabsTrigger value="grandparents" className="flex-shrink-0 md:flex-1">
                    <span className="text-red-600 dark:text-red-400">Grandparents</span>
                  </TabsTrigger>
                  <TabsTrigger value="great-grandparents" className="flex-shrink-0 md:flex-1">
                    <span className="text-gray-600 dark:text-gray-400">Great Grandparents</span>
                  </TabsTrigger>
                </TabsList>
              </div>
                <>
                  <TabsContent value="select" className="mt-0" {...(isFullView ? { forceMount: true } : {})}>
          {(activeTab === 'select' || isFullView) && (
          <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5
        }} className="">
            {/* Main Applicant - First Questions */}
            <>
              <div className="border-b border-border/50 pb-6 pt-6">
                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Main Applicant
                </h2>
                <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
                  First Questions
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2" onDoubleClick={() => handleInputChange("applicant_sex", null)}>
                    <Label className={isLargeFonts ? "text-2xl" : ""}>Gender</Label>
                    <Select value={formData?.applicant_sex || ""} onValueChange={(value) => handleInputChange("applicant_sex", value)}>
                      <SelectTrigger 
                        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
                        style={{
                          boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                        }}
                      >
                        <SelectValue placeholder="Select" className="text-xs" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        <SelectItem value="M" className="text-xs cursor-pointer">Male</SelectItem>
                        <SelectItem value="F" className="text-xs cursor-pointer">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2" onDoubleClick={() => handleInputChange("children_count", null)}>
                    <Label className={isLargeFonts ? "text-2xl" : ""}>Number of children</Label>
                    <Select value={formData?.children_count?.toString() || ""} onValueChange={(value) => handleInputChange("children_count", parseInt(value))}>
                      <SelectTrigger 
                        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur z-50 text-xs"
                        style={{
                          boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                        }}
                      >
                        <SelectValue placeholder="Select" className="text-xs" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={num.toString()} className="text-xs cursor-pointer">{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2" onDoubleClick={() => handleInputChange("applicant_is_married", null)}>
                    <Label className={isLargeFonts ? "text-2xl" : ""}>Marital status</Label>
                    <Select value={formData?.applicant_is_married === true ? "Married" : formData?.applicant_is_married === false ? "Single" : ""} onValueChange={(value) => handleInputChange("applicant_is_married", value === "Married")}>
                      <SelectTrigger 
                        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
                        style={{
                          boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                        }}
                      >
                        <SelectValue placeholder="Select" className="text-xs" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        <SelectItem value="Married" className="text-xs cursor-pointer">Married</SelectItem>
                        <SelectItem value="Single" className="text-xs cursor-pointer">Single</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {(formData?.children_count > 0) && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-2" onDoubleClick={() => handleInputChange("minor_children_count", null)}>
                      <Label className={isLargeFonts ? "text-2xl" : ""}>Number of minor children (under 18)</Label>
                      <Select value={formData?.minor_children_count?.toString() || ""} onValueChange={(value) => handleInputChange("minor_children_count", parseInt(value))}>
                        <SelectTrigger 
                          className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
                          style={{
                            boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                          }}
                        >
                          <SelectValue placeholder="Select" className="text-xs" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-2 z-50">
                          {Array.from({ length: (formData?.children_count || 0) + 1 }, (_, i) => i).map((num) => (
                            <SelectItem key={num} value={num.toString()} className="text-xs cursor-pointer">{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </div>
            </>
          </motion.div>
          )}
        </TabsContent>

              <TabsContent value="applicant" className="mt-0" {...(isFullView ? { forceMount: true } : {})}>
          {/* Applicant Section */}
          {(activeTab === 'applicant' || isFullView) && (
          <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5
        }} className="space-y-10">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-blue-600 dark:text-blue-400 border-b border-border/50 pb-6">
              Applicant
            </h2>

                {/* Row 1: Names */}
                {renderFieldGroup([{
                  name: "applicant_first_name",
                  label: "Given names",
                  isNameField: true
                }, {
                  name: "applicant_last_name",
                  label: "Full last name",
                  isNameField: true
                }], 'applicant')}

                {/* Row 2: Maiden name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <Label className={isLargeFonts ? "text-2xl" : ""}>
                      Maiden name
                    </Label>
                    <Input
                      value={formData.applicant_maiden_name || ""}
                      onChange={(e) => handleInputChange("applicant_maiden_name", e.target.value.toUpperCase())}
                      className="h-16 md:h-20 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                      style={{ fontSize: '1.125rem', fontWeight: '400' }}
                    />
                  </motion.div>
                </div>

                {/* Row 3: Places - Birth & Marriage */}
                {renderFieldGroup([{
                  name: "applicant_pob",
                  label: "Place of birth",
                  isNameField: true
                }, {
                  name: "place_of_marriage",
                  label: "Place of marriage",
                  isNameField: true
                }], 'applicant')}

                {/* Row 4: Dates - Birth & Marriage */}
                {renderFieldGroup([{
                  name: "applicant_dob",
                  label: "Date of birth",
                  type: "date"
                }, {
                  name: "date_of_marriage",
                  label: "Date of marriage",
                  type: "date"
                }], 'applicant')}

                {/* Row 5: Dates - Emigration & Naturalization */}
                {renderFieldGroup([{
                  name: "applicant_date_of_emigration",
                  label: "Date of emigration",
                  type: "date"
                }, {
                  name: "applicant_date_of_naturalization",
                  label: "Date of naturalization",
                  type: "date"
                }], 'applicant')}

                <FamilyMemberDocumentsSection
                  prefix="applicant"
                  title="Required Documents"
                  formData={formData}
                  handleInputChange={handleInputChange}
                  personType="applicant"
                  sex={formData.applicant_sex}
                  colorScheme="applicant"
                />

                <div className="space-y-2 mt-8">
                  <Label htmlFor="applicant_notes" className={isLargeFonts ? "text-2xl" : ""}>
                    ADDITIONAL NOTES
                  </Label>
                  <Textarea
                    id="applicant_notes"
                    value={formData.applicant_notes || ""}
                    onChange={e => handleInputChange("applicant_notes", e.target.value.toUpperCase())}
                    placeholder=""
                    className={cn("min-h-[200px] border-2 border-blue-300/10 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                  />
                </div>
          </motion.div>
          )}
        </TabsContent>

        {/* Spouse Tab */}
        <TabsContent value="spouse" className="mt-0" {...(isFullView ? { forceMount: true } : {})}>
          {(activeTab === 'spouse' || isFullView) && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="space-y-10">
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-blue-300 dark:text-blue-300 border-b border-border/50 pb-6">
                Spouse
              </h2>
              
              {/* Names */}
              {renderFieldGroup([
                { name: "spouse_first_name", label: "Given names", isNameField: true },
                { name: "spouse_last_name", label: "Full family name", isNameField: true }
              ], 'spouse')}

              {/* Maiden name */}
              {renderFieldGroup([
                { name: "spouse_maiden_name", label: "Maiden name", isNameField: true }
              ], 'spouse')}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="children" className="mt-0" {...(isFullView ? { forceMount: true } : {})}>
          {/* Children Section - Only Minor Children */}
          {(activeTab === 'children' || isFullView) && (formData.minor_children_count > 0) && (
          <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5,
          delay: 0.1
        }} className="space-y-10">
            <div className="border-b border-border/50 pb-6">
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-cyan-600 dark:text-cyan-400">
                Applicant's Minor Children
              </h2>
              <p className="text-base mt-2">
                Enter details for <span className="font-semibold text-primary">{formData.minor_children_count || 0} minor {formData.minor_children_count === 1 ? 'child' : 'children'}</span> (under 18 years old).
                <span className="block mt-1 text-muted-foreground">
                  Note: Adult children should be processed as separate applicants.
                </span>
              </p>
            </div>

            {Array.from({ length: formData.minor_children_count || 0 }, (_, i) => i + 1).map(num => <Fragment key={num}>
                <h3 className="text-2xl md:text-3xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Minor Child {num}</h3>
                {/* 1st row - Name fields */}
                {renderFieldGroup([{
              name: `child_${num}_first_name`,
              label: "Given names",
              isNameField: true
            }, {
              name: `child_${num}_last_name`,
              label: "Full last name",
              isNameField: true
            }], 'children')}

                {/* 2nd row - Places */}
                {renderFieldGroup([{
              name: `child_${num}_pob`,
              label: "Place of birth"
            }], 'children')}

                {/* 3rd row - Dates */}
                {renderFieldGroup([{
              name: `child_${num}_dob`,
              label: "Date of birth",
              type: "date"
            }], 'children')}
                <FamilyMemberDocumentsSection
                  prefix={`child_${num}`}
                  title="Required Documents"
                  formData={formData}
                  handleInputChange={handleInputChange}
                  personType="child"
                  sex={formData[`child_${num}_sex`]}
                  colorScheme="children"
                />

                <div className="space-y-2 mt-8">
                  <Label htmlFor={`child_${num}_notes`} className={isLargeFonts ? "text-2xl" : ""}>
                    ADDITIONAL NOTES
                  </Label>
                  <Textarea
                    id={`child_${num}_notes`}
                    value={formData[`child_${num}_notes`] || ""}
                    onChange={e => handleInputChange(`child_${num}_notes`, e.target.value.toUpperCase())}
                    placeholder=""
                    colorScheme="children"
                    className={cn("min-h-[200px] border-2 border-purple-300/10 hover-glow focus:shadow-lg transition-all backdrop-blur uppercase")}
                  />
                </div>
              </Fragment>)}
          </motion.div>
          )}
        </TabsContent>

        <TabsContent value="parents" className="mt-0" {...(isFullView ? { forceMount: true } : {})}>
          {/* Parents Section */}
          {(activeTab === 'parents' || isFullView) && (
          <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5,
          delay: 0.3
        }} className="space-y-10">

              {/* Father */}
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <h3 className={cn(
                    "text-3xl font-heading font-bold text-teal-600/80 dark:text-teal-400/80 mt-10",
                    formData.father_is_polish && "text-red-400"
                  )}>
                    Father
                  </h3>
                  <Checkbox
                    id="father_is_polish"
                    checked={formData.father_is_polish || false}
                    onCheckedChange={(checked) => handleInputChange("father_is_polish", checked)}
                    className="h-6 w-6 mt-10 border-2 border-teal-600/50 rounded-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </div>

                {/* 1st row - Name fields */}
                {renderFieldGroup([{
                name: "father_first_name",
                label: "Given names",
                isNameField: true
              }, {
                name: "father_last_name",
                label: "Full last name",
                isNameField: true
              }], 'parents')}

                {/* 2nd row - Places: Birth & Marriage */}
                {renderFieldGroup([{
                name: "father_pob",
                label: "Place of birth"
              }, {
                name: "father_mother_marriage_place",
                label: "Place of marriage"
              }], 'parents')}

                {/* 3rd row - Dates: Birth & Marriage */}
                {renderFieldGroup([{
                name: "father_dob",
                label: "Date of birth",
                type: "date"
              }, {
                name: "father_mother_marriage_date",
                label: "Date of marriage",
                type: "date"
              }], 'parents')}

                {/* 4th row - Dates: Emigration & Naturalization */}
                {renderFieldGroup([{
                name: "father_date_of_emigration",
                label: "Date of emigration",
                type: "date"
              }, {
                name: "father_date_of_naturalization",
                label: "Date of naturalization",
                type: "date"
              }], 'parents')}
                <FamilyMemberDocumentsSection
                  prefix="father"
                  title="Required Documents"
                  formData={formData}
                  handleInputChange={handleInputChange}
                  personType="parent"
                  sex="M"
                  colorScheme="parents"
                />

                <div className="space-y-2 mt-8">
                  <Label htmlFor="father_notes" className={isLargeFonts ? "text-2xl" : ""}>
                    ADDITIONAL NOTES
                  </Label>
                  <Textarea
                    id="father_notes"
                    value={formData.father_notes || ""}
                    onChange={e => handleInputChange("father_notes", e.target.value.toUpperCase())}
                    placeholder=""
                    colorScheme="parents"
                    className={cn("min-h-[200px] border-2 border-teal-300/10 hover-glow focus:shadow-lg transition-all backdrop-blur uppercase")}
                  />
                </div>
              </div>

              {/* Mother */}
              <div className="flex items-start gap-4">
                <h3 className={cn(
                  "text-3xl font-heading font-bold text-teal-600/80 dark:text-teal-400/80 mt-10",
                  formData.mother_is_polish && "text-red-400"
                )}>
                  Mother
                </h3>
                <Checkbox
                  id="mother_is_polish"
                  checked={formData.mother_is_polish || false}
                  onCheckedChange={(checked) => handleInputChange("mother_is_polish", checked)}
                  className="h-6 w-6 mt-10 border-2 border-teal-600/50 rounded-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>

                {/* 1st row - Name fields */}
                {renderFieldGroup([{
                name: "mother_first_name",
                label: "Given names",
                isNameField: true
              }, {
                name: "mother_last_name",
                label: "Full last name",
                isNameField: true
              }, {
                name: "mother_maiden_name",
                label: "Maiden name",
                isNameField: true
              }], 'parents')}

                {/* 2nd row - Places: Birth & Marriage */}
                {renderFieldGroup([{
                name: "mother_pob",
                label: "Place of birth"
              }, {
                name: "father_mother_marriage_place",
                label: "Place of marriage"
              }], 'parents')}

                {/* 3rd row - Dates: Birth & Marriage */}
                {renderFieldGroup([{
                name: "mother_dob",
                label: "Date of birth",
                type: "date"
              }, {
                name: "father_mother_marriage_date",
                label: "Date of marriage",
                type: "date"
              }], 'parents')}

                {/* 4th row - Dates: Emigration & Naturalization */}
                {renderFieldGroup([{
                name: "mother_date_of_emigration",
                label: "Date of emigration",
                type: "date"
              }, {
                name: "mother_date_of_naturalization",
                label: "Date of naturalization",
                type: "date"
              }], 'parents')}
                <FamilyMemberDocumentsSection
                  prefix="mother"
                  title="Required Documents"
                  formData={formData}
                  handleInputChange={handleInputChange}
                  personType="parent"
                  sex="F"
                  colorScheme="parents"
                />

                <div className="space-y-2 mt-8">
                  <Label htmlFor="mother_notes" className={isLargeFonts ? "text-2xl" : ""}>
                    ADDITIONAL NOTES
                  </Label>
                  <Textarea
                    id="mother_notes"
                    value={formData.mother_notes || ""}
                    onChange={e => handleInputChange("mother_notes", e.target.value.toUpperCase())}
                    placeholder=""
                    colorScheme="parents"
                    className={cn("min-h-[200px] border-2 border-teal-300/10 hover-glow focus:shadow-lg transition-all backdrop-blur uppercase")}
                  />
                </div>
          </motion.div>
          )}
        </TabsContent>

        <TabsContent value="grandparents" className="mt-0" {...(isFullView ? { forceMount: true } : {})}>

          {/* Grandparents Section */}
          {(activeTab === 'grandparents' || isFullView) && (
          <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5,
          delay: 0.4
        }} className="space-y-10">

              {["pgf", "pgm", "mgf", "mgm"].map(prefix => {
                const labels = {
                  pgf: "Paternal Grandfather",
                  pgm: "Paternal Grandmother",
                  mgf: "Maternal Grandfather",
                  mgm: "Maternal Grandmother"
                };
                const sex = prefix.endsWith('f') ? 'M' : 'F';
                return <Fragment key={prefix}>
                  <div className="flex items-start gap-4 mb-6">
                    <h3 className={cn(
                      "text-3xl font-heading font-bold text-red-600/80 dark:text-red-400/80",
                      prefix === "pgf" && "mt-10",
                      formData[`${prefix}_is_polish`] && "text-red-400"
                    )}>
                      {labels[prefix as keyof typeof labels]}
                    </h3>
                    <Checkbox
                      id={`${prefix}_is_polish`}
                      checked={formData[`${prefix}_is_polish`] || false}
                      onCheckedChange={(checked) => handleInputChange(`${prefix}_is_polish`, checked)}
                      className={cn("h-6 w-6 border-2 border-red-600/50 rounded-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary", prefix === "pgf" && "mt-10")}
                    />
                  </div>

                  {/* 1st row - Name fields */}
                  {renderFieldGroup([{
                name: `${prefix}_first_name`,
                label: "Given names",
                isNameField: true
              }, {
                name: `${prefix}_last_name`,
                label: "Full last name",
                isNameField: true
              }, ...(prefix.includes("gm") ? [{
                name: `${prefix}_maiden_name`,
                label: "Maiden name",
                isNameField: true
              }] : [])], 'grandparents')}

                  {/* 2nd row - Places: Birth & Marriage */}
                  {renderFieldGroup([{
                name: `${prefix}_pob`,
                label: "Place of birth"
              }, {
                name: `${prefix === 'pgf' || prefix === 'pgm' ? 'pgf_pgm_marriage_place' : 'mgf_mgm_marriage_place'}`,
                label: "Place of marriage"
              }], 'grandparents')}

                  {/* 3rd row - Dates: Birth & Marriage */}
                  {renderFieldGroup([{
                name: `${prefix}_dob`,
                label: "Date of birth",
                type: "date"
              }, {
                name: `${prefix === 'pgf' || prefix === 'pgm' ? 'pgf_pgm_marriage_date' : 'mgf_mgm_marriage_date'}`,
                label: "Date of marriage",
                type: "date"
              }], 'grandparents')}

                  {/* 4th row - Dates: Emigration & Naturalization */}
                  {renderFieldGroup([{
                name: `${prefix}_date_of_emigration`,
                label: "Date of emigration",
                type: "date"
              }, {
                name: `${prefix}_date_of_naturalization`,
                label: "Date of naturalization",
                type: "date"
              }], 'grandparents')}

                  <FamilyMemberDocumentsSection
                    prefix={prefix}
                    title="Required Documents"
                    formData={formData}
                    handleInputChange={handleInputChange}
                    personType="grandparent"
                    sex={sex}
                    colorScheme="grandparents"
                  />

                  <div className="space-y-2 mt-8">
                    <Label htmlFor={`${prefix}_notes`} className={isLargeFonts ? "text-2xl" : ""}>
                      ADDITIONAL NOTES
                    </Label>
                    <Textarea
                      id={`${prefix}_notes`}
                      colorScheme="grandparents"
                      value={formData[`${prefix}_notes`] || ""}
                      onChange={e => handleInputChange(`${prefix}_notes`, e.target.value.toUpperCase())}
                      placeholder=""
                      className={cn("min-h-[200px] border-2 border-red-300/10 hover-glow focus:shadow-lg transition-all backdrop-blur uppercase")}
                    />
                  </div>
                </Fragment>;
              })}
          </motion.div>
          )}
        </TabsContent>

        <TabsContent value="great-grandparents" className="mt-0" {...(isFullView ? { forceMount: true } : {})}>

          {/* Polish Great-Grandfathers Section - Only the 2 Polish Ancestors */}
          {(activeTab === 'great-grandparents' || isFullView) && (
          <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5,
          delay: 0.5
        }} className="space-y-10">

              {["pggf", "mggf"].map(prefix => {
                const labels = {
                  pggf: "Paternal Great-Grandfather (Father's Line)",
                  mggf: "Maternal Great-Grandfather (Mother's Line)"
                };
                const sex = 'M'; // Great-grandfathers are always male
                return <Fragment key={prefix}>
                  <div className="flex items-start gap-4 mb-6">
                    <h3 className={cn(
                      "text-3xl font-heading font-bold text-gray-600/80 dark:text-gray-400/80",
                      prefix === "pggf" && "mt-10",
                      formData[`${prefix}_is_polish`] && "text-red-400"
                    )}>
                      {labels[prefix as keyof typeof labels]}
                    </h3>
                    <Checkbox
                      id={`${prefix}_is_polish`}
                      checked={formData[`${prefix}_is_polish`] || false}
                      onCheckedChange={(checked) => handleInputChange(`${prefix}_is_polish`, checked)}
                      className={cn("h-6 w-6 border-2 border-gray-600/50 rounded-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary", prefix === "pggf" && "mt-10")}
                    />
                  </div>
                  
                  {/* 1st row - Names */}
                  {renderFieldGroup([{
                name: `${prefix}_first_name`,
                label: "Given names",
                isNameField: true
              }, {
                name: `${prefix}_last_name`,
                label: "Full last name",
                isNameField: true
              }], 'ggp')}

                  {/* 2nd row - Places: Birth & Marriage */}
                  {renderFieldGroup([{
                name: `${prefix}_pob`,
                label: "Place of birth"
              }, {
                name: `${prefix === 'pggf' ? 'pggf_pggm_marriage_place' : 'mggf_mggm_marriage_place'}`,
                label: "Place of marriage"
              }], 'ggp')}

                  {/* 3rd row - Dates: Birth & Marriage */}
                  {renderFieldGroup([{
                name: `${prefix}_dob`,
                label: "Date of birth",
                type: "date"
              }, {
                name: `${prefix === 'pggf' ? 'pggf_pggm_marriage_date' : 'mggf_mggm_marriage_date'}`,
                label: "Date of marriage",
                type: "date"
              }], 'ggp')}

                  {/* 4th row - Dates: Emigration & Naturalization */}
                  {renderFieldGroup([{
                name: `${prefix}_date_of_emigration`,
                label: "Date of emigration",
                type: "date"
              }, {
                name: `${prefix}_date_of_naturalization`,
                label: "Date of naturalization",
                type: "date"
              }], 'ggp')}
                  
                  <FamilyMemberDocumentsSection
                    prefix={prefix}
                    title="Required Documents"
                    formData={formData}
                    handleInputChange={handleInputChange}
                    personType="grandparent"
                    sex={sex}
                    colorScheme="ggp"
                  />

                  <div className="space-y-2 mt-8">
                    <Label htmlFor={`${prefix}_notes`} className={isLargeFonts ? "text-2xl" : ""}>
                      ADDITIONAL NOTES
                    </Label>
                    <Textarea
                      id={`${prefix}_notes`}
                      value={formData[`${prefix}_notes`] || ""}
                      onChange={e => handleInputChange(`${prefix}_notes`, e.target.value.toUpperCase())}
                      placeholder=""
                      colorScheme="ggp"
                      className={cn("min-h-[200px] border-2 border-gray-300/10 hover-glow focus:shadow-lg transition-all backdrop-blur uppercase")}
                    />
                  </div>
                </Fragment>;
              })}
          </motion.div>
          )}
        </TabsContent>

                </>
            </Tabs>
          ) : (
            // Full View Mode - Show all tab sections with Tabs wrapper
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Keep the tabs list visible - matching the original style */}
              <div className="sticky top-0 z-50 border-b border-border/50 pb-2 pt-2 -mx-4 md:-mx-6 bg-background/95 backdrop-blur-sm">
                <TabsList className="w-screen md:w-full flex gap-0.5 overflow-x-auto md:overflow-visible md:justify-between scrollbar-hide bg-transparent p-0 px-4 md:px-6">

                  <TabsTrigger value="select" className="flex-shrink-0 md:flex-1">
                    <span className="text-blue-600 dark:text-blue-400">Select</span>
                  </TabsTrigger>
                  <TabsTrigger value="applicant" className="flex-shrink-0 md:flex-1">
                    <span className="text-blue-600 dark:text-blue-400">Applicant</span>
                  </TabsTrigger>
                  <TabsTrigger value="spouse" className="flex-shrink-0 md:flex-1">
                    <span className="text-blue-600 dark:text-blue-400">Spouse</span>
                  </TabsTrigger>
                  <TabsTrigger value="children" className="flex-shrink-0 md:flex-1">
                    <span className="text-cyan-600 dark:text-cyan-400">Children</span>
                  </TabsTrigger>
                  <TabsTrigger value="parents" className="flex-shrink-0 md:flex-1">
                    <span className="text-teal-600 dark:text-teal-400">Parents</span>
                  </TabsTrigger>
                  <TabsTrigger value="grandparents" className="flex-shrink-0 md:flex-1">
                    <span className="text-red-600 dark:text-red-400">Grandparents</span>
                  </TabsTrigger>
                  <TabsTrigger value="great-grandparents" className="flex-shrink-0 md:flex-1">
                    <span className="text-gray-600 dark:text-gray-400">Great Grandparents</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="w-full space-y-0">
              {/* Select Section */}
              <div ref={(el) => sectionRefs.current.select = el} className="border-b border-border/10">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="space-y-10">
                  <h2 className="text-4xl md:text-5xl font-heading font-bold text-blue-600 dark:text-blue-400 border-b border-border/50 pb-6">
                    Basic Information
                  </h2>
                  {/* Row 1: Gender and Civil Status */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Gender */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
                      <Label className={isLargeFonts ? "text-2xl" : ""}>Gender</Label>
                      <Select value={formData.applicant_sex || ""} onValueChange={(value) => handleInputChange("applicant_sex", value)}>
                        <SelectTrigger className="h-20 text-2xl border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-2 z-50">
                          <SelectItem value="M" className="text-base cursor-pointer">Male / Mężczyzna</SelectItem>
                          <SelectItem value="F" className="text-base cursor-pointer">Female / Kobieta</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {/* Civil Status */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2">
                      <Label className={isLargeFonts ? "text-2xl" : ""}>Civil Status</Label>
                      <Select value={formData.applicant_is_married === true ? "Married" : "Single"} onValueChange={(value) => handleInputChange("applicant_is_married", value === "Married")}>
                        <SelectTrigger className="h-20 text-2xl border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-2 z-50">
                          <SelectItem value="Married" className="text-base cursor-pointer">Married</SelectItem>
                          <SelectItem value="Single" className="text-base cursor-pointer">Single</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </div>

                  {/* Row 2: Children counts */}
                  <div className="grid grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
                      <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>Number of children</Label>
                      <Select value={formData.children_count?.toString() || ""} onValueChange={(value) => { const count = parseInt(value); handleInputChange("children_count", count); }}>
                        <SelectTrigger className="h-20 text-2xl border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur z-50">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-2 z-50">
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (<SelectItem key={num} value={num.toString()} className="text-base cursor-pointer">{num}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {(formData.children_count > 0) && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-2">
                        <Label className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>Number of minor children</Label>
                        <Select value={formData.minor_children_count?.toString() || ""} onValueChange={(value) => handleInputChange("minor_children_count", parseInt(value))}>
                          <SelectTrigger className="h-20 text-2xl border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-2 z-50">
                            {Array.from({ length: (formData.children_count || 0) + 1 }, (_, i) => i).map((num) => (<SelectItem key={num} value={num.toString()} className="text-base cursor-pointer">{num}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Applicant Section */}
              <div ref={(el) => sectionRefs.current.applicant = el} className="border-b border-border/10">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="space-y-10">
                  <h2 className="text-4xl md:text-5xl font-heading font-bold text-blue-600 dark:text-blue-400 border-b border-border/50 pb-6">
                    Applicant
                  </h2>

                  {/* Row 1: Names */}
                  {renderFieldGroup([
                    { name: "applicant_first_name", label: "Given names", isNameField: true },
                    { name: "applicant_last_name", label: "Full last name", isNameField: true }
                  ], 'applicant')}

                  {/* Row 2: Maiden name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-2">
                      <Label className={isLargeFonts ? "text-2xl" : ""}>Maiden name</Label>
                      <Input
                        value={formData.applicant_maiden_name || ""}
                        onChange={(e) => handleInputChange("applicant_maiden_name", e.target.value.toUpperCase())}
                        className="h-16 md:h-20 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                        style={{ fontSize: '1.125rem', fontWeight: '400' }}
                      />
                    </motion.div>
                  </div>

                  {/* Row 3: Places - Birth & Marriage */}
                  {renderFieldGroup([
                    { name: "applicant_pob", label: "Place of birth", isNameField: true },
                    { name: "place_of_marriage", label: "Place of marriage", isNameField: true }
                  ], 'applicant')}

                  {/* Row 4: Dates - Birth & Marriage */}
                  {renderFieldGroup([
                    { name: "applicant_dob", label: "Date of birth", type: "date" },
                    { name: "date_of_marriage", label: "Date of marriage", type: "date" }
                  ], 'applicant')}

                  {/* Row 5: Dates - Emigration & Naturalization */}
                  {renderFieldGroup([
                    { name: "applicant_date_of_emigration", label: "Date of emigration", type: "date" },
                    { name: "applicant_date_of_naturalization", label: "Date of naturalization", type: "date" }
                  ], 'applicant')}

                  {/* Other fields */}
                  {renderFieldGroup([
                    { name: "applicant_passport_number", label: "Passport number" },
                    { name: "applicant_passport_expiry_date", label: "Passport expiry date", type: "date" },
                    { name: "applicant_email", label: "Email", type: "email" },
                    { name: "applicant_phone", label: "Phone" }
                  ], 'applicant')}

                  <FamilyMemberDocumentsSection
                    prefix="applicant"
                    title="Required Documents"
                    formData={formData}
                    handleInputChange={handleInputChange}
                    personType="applicant"
                    sex={formData.applicant_sex}
                    colorScheme="applicant"
                  />

                  <div className="space-y-2 mt-8">
                    <Label htmlFor="applicant_notes" className={isLargeFonts ? "text-2xl" : ""}>ADDITIONAL NOTES</Label>
                    <Textarea
                      id="applicant_notes"
                      value={formData.applicant_notes || ""}
                      onChange={e => handleInputChange("applicant_notes", e.target.value.toUpperCase())}
                      placeholder=""
                      className={cn("min-h-[200px] border-2 border-blue-300/10 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Spouse Section */}
              {formData.applicant_is_married && (
                <div ref={(el) => sectionRefs.current.spouse = el} className="border-b border-border/10">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="space-y-10">
                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-blue-300 dark:text-blue-300 border-b border-border/50 pb-6">
                      Spouse
                    </h2>
                    
                    {renderFieldGroup([
                      { name: "spouse_first_name", label: "Given names", isNameField: true },
                      { name: "spouse_last_name", label: "Full family name", isNameField: true }
                    ], 'spouse')}

                    {renderFieldGroup([
                      { name: "spouse_maiden_name", label: "Maiden name", isNameField: true }
                    ], 'spouse')}
                  </motion.div>
                </div>
              )}

              {/* Children Section */}
              {(formData.minor_children_count > 0) && (
                <div ref={(el) => sectionRefs.current.children = el} className="border-b border-border/10">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-10">
                    <div className="border-b border-border/50 pb-6">
                      <h2 className="text-4xl md:text-5xl font-heading font-bold text-cyan-600 dark:text-cyan-400">
                        Applicant's Minor Children
                      </h2>
                      <p className="text-base mt-2">
                        Enter details for <span className="font-semibold text-primary">{formData.minor_children_count || 0} minor {formData.minor_children_count === 1 ? 'child' : 'children'}</span> (under 18 years old).
                        <span className="block mt-1 text-muted-foreground">
                          Note: Adult children should be processed as separate applicants.
                        </span>
                      </p>
                    </div>

                    {Array.from({ length: formData.minor_children_count || 0 }, (_, i) => i + 1).map(num => (
                      <Fragment key={num}>
                        <h3 className="text-2xl md:text-3xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Minor Child {num}</h3>
                        {renderFieldGroup([
                          { name: `child_${num}_first_name`, label: "Given names", isNameField: true },
                          { name: `child_${num}_last_name`, label: "Full last name", isNameField: true }
                        ], 'children')}

                        {renderFieldGroup([
                          { name: `child_${num}_pob`, label: "Place of birth" }
                        ], 'children')}

                        {renderFieldGroup([
                          { name: `child_${num}_dob`, label: "Date of birth", type: "date" }
                        ], 'children')}

                        <div className="grid grid-cols-1 gap-6">
                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
                            <Label className={isLargeFonts ? "text-2xl" : ""}>Sex</Label>
                            <Select value={formData[`child_${num}_sex`] || ""} onValueChange={(value) => handleInputChange(`child_${num}_sex`, value)}>
                              <SelectTrigger className="h-20 text-2xl border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent className="bg-background border-2 z-50">
                                <SelectItem value="M" className="text-base cursor-pointer">Male / Chłopiec</SelectItem>
                                <SelectItem value="F" className="text-base cursor-pointer">Female / Dziewczynka</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>
                        </div>

                        <FamilyMemberDocumentsSection
                          prefix={`child_${num}`}
                          title={`Child ${num} Required Documents`}
                          formData={formData}
                          handleInputChange={handleInputChange}
                          personType="child"
                          sex={formData[`child_${num}_sex`]}
                          colorScheme="children"
                        />
                      </Fragment>
                    ))}
                  </motion.div>
                </div>
              )}

              {/* Parents Section */}
              <div ref={(el) => sectionRefs.current.father = el} className="border-b border-border/10">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="space-y-10">
                  <h2 className="text-4xl md:text-5xl font-heading font-bold text-teal-600 dark:text-teal-400 border-b border-border/50 pb-6">
                    Parents
                  </h2>

                  {/* Father */}
                  <h3 className="text-3xl font-heading font-bold text-teal-500 dark:text-teal-300">Father</h3>
                  {renderFieldGroup([
                    { name: "father_first_name", label: "Given names", isNameField: true },
                    { name: "father_last_name", label: "Full last name", isNameField: true }
                  ], 'parents')}

                  {renderFieldGroup([
                    { name: "father_pob", label: "Place of birth", isNameField: true }
                  ], 'parents')}

                  {renderFieldGroup([
                    { name: "father_dob", label: "Date of birth", type: "date" },
                    { name: "father_date_of_emigration", label: "Date of emigration", type: "date" }
                  ], 'parents')}

                  {renderFieldGroup([
                    { name: "father_date_of_naturalization", label: "Date of naturalization", type: "date" }
                  ], 'parents')}

                  <FamilyMemberDocumentsSection
                    prefix="father"
                    title="Father Required Documents"
                    formData={formData}
                    handleInputChange={handleInputChange}
                    personType="parent"
                    sex="M"
                    colorScheme="parents"
                  />

                  {/* Mother */}
                  <h3 className="text-3xl font-heading font-bold text-teal-500 dark:text-teal-300 mt-10">Mother</h3>
                  {renderFieldGroup([
                    { name: "mother_first_name", label: "Given names", isNameField: true },
                    { name: "mother_last_name", label: "Full last name", isNameField: true }
                  ], 'parents')}

                  {renderFieldGroup([
                    { name: "mother_maiden_name", label: "Maiden name", isNameField: true }
                  ], 'parents')}

                  {renderFieldGroup([
                    { name: "mother_pob", label: "Place of birth", isNameField: true }
                  ], 'parents')}

                  {renderFieldGroup([
                    { name: "mother_dob", label: "Date of birth", type: "date" },
                    { name: "mother_date_of_emigration", label: "Date of emigration", type: "date" }
                  ], 'parents')}

                  {renderFieldGroup([
                    { name: "mother_date_of_naturalization", label: "Date of naturalization", type: "date" }
                  ], 'parents')}

                  <FamilyMemberDocumentsSection
                    prefix="mother"
                    title="Mother Required Documents"
                    formData={formData}
                    handleInputChange={handleInputChange}
                    personType="parent"
                    sex="F"
                    colorScheme="parents"
                  />
                </motion.div>
              </div>

              {/* Grandparents Section */}
              <div ref={(el) => sectionRefs.current.pgf = el} className="border-b border-border/10">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="space-y-10">
                  <h2 className="text-4xl md:text-5xl font-heading font-bold text-red-600 dark:text-red-400 border-b border-border/50 pb-6">
                    Grandparents
                  </h2>

                  {/* Paternal Grandfather */}
                  <h3 className="text-3xl font-heading font-bold text-red-500 dark:text-red-300">Paternal Grandfather</h3>
                  {renderFieldGroup([
                    { name: "pgf_first_name", label: "Given names", isNameField: true },
                    { name: "pgf_last_name", label: "Full last name", isNameField: true }
                  ], 'grandparents')}

                  {renderFieldGroup([
                    { name: "pgf_pob", label: "Place of birth", isNameField: true }
                  ], 'grandparents')}

                  {renderFieldGroup([
                    { name: "pgf_dob", label: "Date of birth", type: "date" },
                    { name: "pgf_date_of_emigration", label: "Date of emigration", type: "date" }
                  ], 'grandparents')}

                  {renderFieldGroup([
                    { name: "pgf_date_of_naturalization", label: "Date of naturalization", type: "date" }
                  ], 'grandparents')}

                  <FamilyMemberDocumentsSection
                    prefix="pgf"
                    title="Paternal Grandfather Documents"
                    formData={formData}
                    handleInputChange={handleInputChange}
                    personType="grandparent"
                    sex="M"
                    colorScheme="grandparents"
                  />

                  {/* Paternal Grandmother */}
                  <h3 className="text-3xl font-heading font-bold text-red-500 dark:text-red-300 mt-10">Paternal Grandmother</h3>
                  {renderFieldGroup([
                    { name: "pgm_first_name", label: "Given names", isNameField: true },
                    { name: "pgm_last_name", label: "Full last name", isNameField: true }
                  ], 'grandparents')}

                  {renderFieldGroup([
                    { name: "pgm_maiden_name", label: "Maiden name", isNameField: true }
                  ], 'grandparents')}

                  {renderFieldGroup([
                    { name: "pgm_pob", label: "Place of birth", isNameField: true }
                  ], 'grandparents')}

                  {renderFieldGroup([
                    { name: "pgm_dob", label: "Date of birth", type: "date" },
                    { name: "pgm_date_of_emigration", label: "Date of emigration", type: "date" }
                  ], 'grandparents')}

                  {renderFieldGroup([
                    { name: "pgm_date_of_naturalization", label: "Date of naturalization", type: "date" }
                  ], 'grandparents')}

                  <FamilyMemberDocumentsSection
                    prefix="pgm"
                    title="Paternal Grandmother Documents"
                    formData={formData}
                    handleInputChange={handleInputChange}
                    personType="grandparent"
                    sex="F"
                    colorScheme="grandparents"
                  />

                  {/* Maternal Grandfather */}
                  <h3 className="text-3xl font-heading font-bold text-red-500 dark:text-red-300 mt-10">Maternal Grandfather</h3>
                  {renderFieldGroup([
                    { name: "mgf_first_name", label: "Given names", isNameField: true },
                    { name: "mgf_last_name", label: "Full last name", isNameField: true }
                  ], 'grandparents')}

                  {renderFieldGroup([
                    { name: "mgf_pob", label: "Place of birth", isNameField: true }
                  ], 'grandparents')}

                  {renderFieldGroup([
                    { name: "mgf_dob", label: "Date of birth", type: "date" },
                    { name: "mgf_date_of_emigration", label: "Date of emigration", type: "date" }
                  ], 'grandparents')}

                  {renderFieldGroup([
                    { name: "mgf_date_of_naturalization", label: "Date of naturalization", type: "date" }
                  ], 'grandparents')}

                  <FamilyMemberDocumentsSection
                    prefix="mgf"
                    title="Maternal Grandfather Documents"
                    formData={formData}
                    handleInputChange={handleInputChange}
                    personType="grandparent"
                    sex="M"
                    colorScheme="grandparents"
                  />

                  {/* Maternal Grandmother */}
                  <h3 className="text-3xl font-heading font-bold text-red-500 dark:text-red-300 mt-10">Maternal Grandmother</h3>
                  {renderFieldGroup([
                    { name: "mgm_first_name", label: "Given names", isNameField: true },
                    { name: "mgm_last_name", label: "Full last name", isNameField: true }
                  ], 'grandparents')}

                  {renderFieldGroup([
                    { name: "mgm_maiden_name", label: "Maiden name", isNameField: true }
                  ], 'grandparents')}

                  {renderFieldGroup([
                    { name: "mgm_pob", label: "Place of birth", isNameField: true }
                  ], 'grandparents')}

                  {renderFieldGroup([
                    { name: "mgm_dob", label: "Date of birth", type: "date" },
                    { name: "mgm_date_of_emigration", label: "Date of emigration", type: "date" }
                  ], 'grandparents')}

                  {renderFieldGroup([
                    { name: "mgm_date_of_naturalization", label: "Date of naturalization", type: "date" }
                  ], 'grandparents')}

                  <FamilyMemberDocumentsSection
                    prefix="mgm"
                    title="Maternal Grandmother Documents"
                    formData={formData}
                    handleInputChange={handleInputChange}
                    personType="grandparent"
                    sex="F"
                    colorScheme="grandparents"
                  />
                </motion.div>
              </div>

              {/* Great Grandparents Section */}
              <div ref={(el) => sectionRefs.current.additional = el} className="border-b border-border/10">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="space-y-10">
                  <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-600 dark:text-gray-400 border-b border-border/50 pb-6">
                    Great Grandparents
                  </h2>

                  {/* Paternal Great Grandparents (Father's Father) */}
                  <h3 className="text-3xl font-heading font-bold text-gray-500 dark:text-gray-300">Paternal Line (Father's Father)</h3>
                  {renderFieldGroup([
                    { name: "ggpff_first_name", label: "Great Grandfather - Given names", isNameField: true },
                    { name: "ggpff_last_name", label: "Great Grandfather - Last name", isNameField: true }
                  ], 'ggp')}

                  {renderFieldGroup([
                    { name: "ggpmff_first_name", label: "Great Grandmother - Given names", isNameField: true },
                    { name: "ggpmff_last_name", label: "Great Grandmother - Last name", isNameField: true }
                  ], 'ggp')}

                  {/* Paternal Great Grandparents (Father's Mother) */}
                  <h3 className="text-3xl font-heading font-bold text-gray-500 dark:text-gray-300 mt-10">Paternal Line (Father's Mother)</h3>
                  {renderFieldGroup([
                    { name: "ggpfm_first_name", label: "Great Grandfather - Given names", isNameField: true },
                    { name: "ggpfm_last_name", label: "Great Grandfather - Last name", isNameField: true }
                  ], 'ggp')}

                  {renderFieldGroup([
                    { name: "ggpmfm_first_name", label: "Great Grandmother - Given names", isNameField: true },
                    { name: "ggpmfm_last_name", label: "Great Grandmother - Last name", isNameField: true }
                  ], 'ggp')}

                  {/* Maternal Great Grandparents (Mother's Father) */}
                  <h3 className="text-3xl font-heading font-bold text-gray-500 dark:text-gray-300 mt-10">Maternal Line (Mother's Father)</h3>
                  {renderFieldGroup([
                    { name: "ggpmf_first_name", label: "Great Grandfather - Given names", isNameField: true },
                    { name: "ggpmf_last_name", label: "Great Grandfather - Last name", isNameField: true }
                  ], 'ggp')}

                  {renderFieldGroup([
                    { name: "ggpmmf_first_name", label: "Great Grandmother - Given names", isNameField: true },
                    { name: "ggpmmf_last_name", label: "Great Grandmother - Last name", isNameField: true }
                  ], 'ggp')}

                  {/* Maternal Great Grandparents (Mother's Mother) */}
                  <h3 className="text-3xl font-heading font-bold text-gray-500 dark:text-gray-300 mt-10">Maternal Line (Mother's Mother)</h3>
                  {renderFieldGroup([
                    { name: "ggpmm_first_name", label: "Great Grandfather - Given names", isNameField: true },
                    { name: "ggpmm_last_name", label: "Great Grandfather - Last name", isNameField: true }
                  ], 'ggp')}

                  {renderFieldGroup([
                    { name: "ggpmmm_first_name", label: "Great Grandmother - Given names", isNameField: true },
                    { name: "ggpmmm_last_name", label: "Great Grandmother - Last name", isNameField: true }
                  ], 'ggp')}
                </motion.div>
              </div>
            </div>
            </Tabs>
          )}
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
  </div>
  );
}