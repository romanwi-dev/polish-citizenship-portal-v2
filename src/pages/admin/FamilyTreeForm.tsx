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
import { useRealtimeFormSync } from "@/hooks/useRealtimeFormSync";
import { FormButtonsRow } from "@/components/FormButtonsRow";
import { FamilyTreeInteractive } from "@/components/FamilyTreeInteractive";
import { useBidirectionalSync } from "@/hooks/useBidirectionalSync";
import { FamilyMemberDocumentsSection } from "@/components/forms/FamilyMemberDocumentsSection";

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
  // Track the absolute latest form values to avoid race conditions
  const latestFormData = useRef<any>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("select");
  const [isFullView, setIsFullView] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({
    'tree-view': null,
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
  
  // Enable real-time sync with direct state updates
  useRealtimeFormSync(caseId, masterData, isLoading, setFormData);
  
  // Keep ref synchronized with state
  useEffect(() => {
    latestFormData.current = formData;
  }, [formData]);
  
  // Enable bidirectional sync
  const { syncMasterToIntake } = useBidirectionalSync(caseId);
  
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSave = async () => {
    if (!caseId) return;
    // Use the ref to get the absolute latest state
    const dataToSave = latestFormData.current;
    const sanitizedData = sanitizeMasterData(dataToSave);
    
    try {
      await updateMutation.mutateAsync({
        caseId,
        updates: sanitizedData
      });
      
      // Auto-sync to intake after save
      await syncMasterToIntake(sanitizedData);
      return true;
    } catch (error) {
      console.error('Save error:', error);
      return false;
    }
  };
  const handleGeneratePDF = async () => {
    if (!caseId || caseId === ':id') {
      toast.error('Invalid case ID');
      return;
    }

    // Validate critical fields before proceeding
    const data = latestFormData.current;
    if (!data.applicant_first_name || !data.applicant_last_name) {
      toast.error('Please enter applicant name before generating PDF');
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

  const handleClearData = () => {
    setFormData({});
    toast.success('All form data cleared');
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
                <Label htmlFor={field.name} className={isLargeFonts ? "text-2xl" : ""}>
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
                <Label htmlFor={field.name} className={isLargeFonts ? "text-2xl" : ""}>
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
  return <div className="relative min-h-screen">
    {/* Background Effects */}
    <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

    <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text">
                Polish Family Tree
              </h1>
            </motion.div>
            <div className="flex items-center gap-3">
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
                className={`h-16 w-16 rounded-full transition-all hover:bg-primary/10 opacity-60 ${
                  isFullView ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-primary'
                }`}
                title={isFullView ? "Collapse" : "Expand All"}
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
          onSave={handleSave}
          onClear={() => setShowClearDialog(true)}
          onGeneratePDF={handleGeneratePDF}
          isSaving={updateMutation.isPending}
        />

        {/* Form with Tabs */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="sticky top-0 z-20 border-b border-border/50 pb-2 pt-2">
                    <TabsList className="w-full inline-flex justify-start gap-2 bg-transparent p-0 overflow-x-auto scrollbar-hide">
                      <TabsTrigger value="tree-view" className="flex-shrink-0">
                        <span>Tree View</span>
                      </TabsTrigger>
                      <TabsTrigger value="select" className="flex-shrink-0">
                        <span>Select...</span>
                      </TabsTrigger>
                      <TabsTrigger value="applicant" className="flex-shrink-0">
                        <span>Applicant</span>
                      </TabsTrigger>
                      {formData.applicant_is_married && (
                        <TabsTrigger value="spouse" className="flex-shrink-0">
                          <span>Spouse</span>
                        </TabsTrigger>
                      )}
                      {(formData.minor_children_count > 0) && (
                        <TabsTrigger value="children" className="flex-shrink-0">
                          <span>Children</span>
                        </TabsTrigger>
                      )}
                      <TabsTrigger value="parents" className="flex-shrink-0">
                        <span>Parents</span>
                      </TabsTrigger>
                      <TabsTrigger value="grandparents" className="flex-shrink-0">
                        <span>Grandparents</span>
                      </TabsTrigger>
                      <TabsTrigger value="great-grandparents" className="flex-shrink-0">
                        <span>Great Grandparents</span>
                      </TabsTrigger>
                      <TabsTrigger value="additional" className="flex-shrink-0">
                        <span>Additional Info</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                {/* Full View Mode */}
              {isFullView ? (
                <div className="space-y-0 mt-6">
                  {/* Tree View always shown in full view */}
                  <motion.div
                    ref={(el) => sectionRefs.current['tree-view'] = el}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="border-b border-border/10 p-6 md:p-10"
                  >
                    <FamilyTreeInteractive
                          clientData={{
                            ...mapPersonData('applicant'),
                            sex: formData.applicant_sex
                          }}
                          spouse={mapPersonData('spouse')}
                          father={mapPersonData('father')}
                          mother={mapPersonData('mother')}
                          paternalGrandfather={mapPersonData('pgf')}
                          paternalGrandmother={mapPersonData('pgm')}
                          maternalGrandfather={mapPersonData('mgf')}
                          maternalGrandmother={mapPersonData('mgm')}
                          paternalGreatGrandfather={mapPersonData('pggf')}
                          paternalGreatGrandmother={mapPersonData('pggm')}
                          maternalGreatGrandfather={mapPersonData('mggf')}
                          maternalGreatGrandmother={mapPersonData('mggm')}
                          onEdit={handlePersonEdit}
                          onOpenMasterTable={() => navigate(`/admin/master-data/${caseId}`)}
                        />
                  </motion.div>
                </div>
              ) : (
                <>
                  {/* Tree View Tab */}
                  <TabsContent value="tree-view" className="mt-0">
                    {activeTab === 'tree-view' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="p-6 md:p-10"
                      >
                        <FamilyTreeInteractive
                              clientData={{
                                ...mapPersonData('applicant'),
                                sex: formData.applicant_sex
                              }}
                              spouse={mapPersonData('spouse')}
                              father={mapPersonData('father')}
                              mother={mapPersonData('mother')}
                              paternalGrandfather={mapPersonData('pgf')}
                              paternalGrandmother={mapPersonData('pgm')}
                              maternalGrandfather={mapPersonData('mgf')}
                              maternalGrandmother={mapPersonData('mgm')}
                              paternalGreatGrandfather={mapPersonData('pggf')}
                              paternalGreatGrandmother={mapPersonData('pggm')}
                              maternalGreatGrandfather={mapPersonData('mggf')}
                              maternalGreatGrandmother={mapPersonData('mggm')}
                              onEdit={handlePersonEdit}
                              onOpenMasterTable={() => navigate(`/admin/master-data/${caseId}`)}
                            />
                      </motion.div>
                    )}
                  </TabsContent>

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
        }} className="p-6 md:p-10 space-y-10">
            <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent border-b border-border/50 pb-6">
              Basic Information
            </h2>
                {/* Row 1: Gender and Civil Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gender */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
                    <Label className={isLargeFonts ? "text-2xl" : ""}>
                      Gender / Płeć
                    </Label>
                    <Select value={formData.applicant_sex || ""} onValueChange={(value) => handleInputChange("applicant_sex", value)}>
                      <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        <SelectItem value="M" className="text-base cursor-pointer">Male / Mężczyzna</SelectItem>
                        <SelectItem value="F" className="text-base cursor-pointer">Female / Kobieta</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Civil Status */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2">
                    <Label className={isLargeFonts ? "text-2xl" : ""}>
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
        }} className="p-6 md:p-10 space-y-10">
            <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent border-b border-border/50 pb-6">
              Applicant
            </h2>

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
                    <Label className={isLargeFonts ? "text-2xl" : ""}>
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

                {/* Row 3: Places - Birth & Marriage */}
                {renderFieldGroup([{
                  name: "applicant_pob",
                  label: "Place of birth",
                  isNameField: true
                }, {
                  name: "place_of_marriage",
                  label: "Place of marriage",
                  isNameField: true
                }])}

                {/* Row 4: Dates - Birth & Marriage */}
                {renderFieldGroup([{
                  name: "applicant_dob",
                  label: "Date of birth",
                  type: "date"
                }, {
                  name: "date_of_marriage",
                  label: "Date of marriage",
                  type: "date"
                }])}

                {/* Row 5: Dates - Emigration & Naturalization */}
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
                name: "applicant_passport_expiry_date",
                label: "Passport expiry date",
                type: "date"
              }, {
                name: "applicant_email",
                label: "Email",
                type: "email"
              }, {
                name: "applicant_phone",
                label: "Phone"
              }])}

                <FamilyMemberDocumentsSection
                  prefix="applicant"
                  title="Required Documents"
                  formData={formData}
                  handleInputChange={handleInputChange}
                  personType="applicant"
                  sex={formData.applicant_sex}
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
                    className={cn("min-h-[200px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                  />
                </div>
          </motion.div>
          )}
        </TabsContent>

        {/* Spouse Tab */}
        <TabsContent value="spouse" className="mt-0">
          {activeTab === 'spouse' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="p-6 md:p-10 space-y-10">
              <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent border-b border-border/50 pb-6">
                Spouse
              </h2>
              
              {/* Names */}
              {renderFieldGroup([
                { name: "spouse_first_name", label: "Given names / Imię/ imiona", isNameField: true },
                { name: "spouse_last_name", label: "Full last name / Nazwisko", isNameField: true }
              ])}

              {/* Maiden name */}
              {renderFieldGroup([
                { name: "spouse_maiden_name", label: "Maiden name / Nazwisko rodowe", isNameField: true },
                { name: "spouse_sex", label: "Sex", isSelect: true, selectOptions: [
                  { value: "M", label: "Male" },
                  { value: "F", label: "Female" }
                ]}
              ])}

              {/* Places: Birth & Marriage */}
              {renderFieldGroup([
                { name: "spouse_pob", label: "Place of birth", isNameField: true },
                { name: "place_of_marriage", label: "Place of marriage", isNameField: true }
              ])}

              {/* Dates: Birth & Marriage */}
              {renderFieldGroup([
                { name: "spouse_dob", label: "Date of birth", type: "date" },
                { name: "date_of_marriage", label: "Date of marriage", type: "date" }
              ])}

              {/* Dates: Emigration & Naturalization */}
              {renderFieldGroup([
                { name: "spouse_date_of_emigration", label: "Date of emigration", type: "date" },
                { name: "spouse_date_of_naturalization", label: "Date of naturalization", type: "date" }
              ])}

              {/* Contact */}
              {renderFieldGroup([
                { name: "spouse_email", label: "Email", type: "email" },
                { name: "spouse_phone", label: "Phone" }
              ])}

              <FamilyMemberDocumentsSection
                prefix="spouse"
                title="Required Documents"
                formData={formData}
                handleInputChange={handleInputChange}
                personType="spouse"
                sex={formData.spouse_sex}
              />

              <div className="space-y-2 mt-8">
                <Label htmlFor="spouse_notes" className={isLargeFonts ? "text-2xl" : ""}>
                  ADDITIONAL NOTES
                </Label>
                <Textarea
                  id="spouse_notes"
                  value={formData.spouse_notes || ""}
                  onChange={e => handleInputChange("spouse_notes", e.target.value.toUpperCase())}
                  placeholder=""
                  className={cn("min-h-[200px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                />
              </div>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="children" className="mt-0">
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
        }} className="space-y-10">
            <div className="border-b border-border/50 pb-6">
              <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
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
                <FamilyMemberDocumentsSection
                  prefix={`child_${num}`}
                  title="Required Documents"
                  formData={formData}
                  handleInputChange={handleInputChange}
                  personType="child"
                  sex={formData[`child_${num}_sex`]}
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
                    className={cn("min-h-[200px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                  />
                </div>
              </Fragment>)}
          </motion.div>
          )}
        </TabsContent>

        <TabsContent value="parents" className="mt-0">
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
        }} className="space-y-10">
              <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent border-b border-border/50 pb-6 mb-10">
                Parents
              </h2>

              {/* Father */}
              <div className="space-y-8">
                <h3 className={cn(
                  "text-3xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent",
                  formData.father_is_polish && "text-red-400"
                )}>
                  Father
                </h3>

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

                {/* 2nd row - Places: Birth & Marriage */}
                {renderFieldGroup([{
                name: "father_pob",
                label: "Place of birth"
              }, {
                name: "father_mother_marriage_place",
                label: "Place of marriage"
              }])}

                {/* 3rd row - Dates: Birth & Marriage */}
                {renderFieldGroup([{
                name: "father_dob",
                label: "Date of birth",
                type: "date"
              }, {
                name: "father_mother_marriage_date",
                label: "Date of marriage",
                type: "date"
              }])}

                {/* 4th row - Dates: Emigration & Naturalization */}
                {renderFieldGroup([{
                name: "father_date_of_emigration",
                label: "Date of emigration",
                type: "date"
              }, {
                name: "father_date_of_naturalization",
                label: "Date of naturalization",
                type: "date"
              }])}
                <FamilyMemberDocumentsSection
                  prefix="father"
                  title="Required Documents"
                  formData={formData}
                  handleInputChange={handleInputChange}
                  personType="parent"
                  sex="M"
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
                    className={cn("min-h-[200px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                  />
                </div>
              </div>

              {/* Mother */}
              <h3 className={cn(
                "text-3xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mt-10",
                formData.mother_is_polish && "text-red-400"
              )}>
                Mother
              </h3>

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

                {/* 2nd row - Places: Birth & Marriage */}
                {renderFieldGroup([{
                name: "mother_pob",
                label: "Place of birth"
              }, {
                name: "father_mother_marriage_place",
                label: "Place of marriage"
              }])}

                {/* 3rd row - Dates: Birth & Marriage */}
                {renderFieldGroup([{
                name: "mother_dob",
                label: "Date of birth",
                type: "date"
              }, {
                name: "father_mother_marriage_date",
                label: "Date of marriage",
                type: "date"
              }])}

                {/* 4th row - Dates: Emigration & Naturalization */}
                {renderFieldGroup([{
                name: "mother_date_of_emigration",
                label: "Date of emigration",
                type: "date"
              }, {
                name: "mother_date_of_naturalization",
                label: "Date of naturalization",
                type: "date"
              }])}
                <FamilyMemberDocumentsSection
                  prefix="mother"
                  title="Required Documents"
                  formData={formData}
                  handleInputChange={handleInputChange}
                  personType="parent"
                  sex="F"
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
                    className={cn("min-h-[200px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                  />
                </div>
          </motion.div>
          )}
        </TabsContent>

        <TabsContent value="grandparents" className="mt-0">

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
        }} className="space-y-10">
              <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent border-b border-border/50 pb-6 mb-10">
                Polish Grandparents
              </h2>

              {["pgf", "pgm", "mgf", "mgm"].map(prefix => {
                const labels = {
                  pgf: "Paternal Grandfather",
                  pgm: "Paternal Grandmother",
                  mgf: "Maternal Grandfather",
                  mgm: "Maternal Grandmother"
                };
                const sex = prefix.endsWith('f') ? 'M' : 'F';
                return <Fragment key={prefix}>
                  <h3 className={cn(
                    "text-3xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent",
                    formData[`${prefix}_is_polish`] && "text-red-400"
                  )}>
                    {labels[prefix as keyof typeof labels]}
                  </h3>

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

                  {/* 2nd row - Places: Birth & Marriage */}
                  {renderFieldGroup([{
                name: `${prefix}_pob`,
                label: "Place of birth"
              }, {
                name: `${prefix === 'pgf' || prefix === 'pgm' ? 'pgf_pgm_marriage_place' : 'mgf_mgm_marriage_place'}`,
                label: "Place of marriage"
              }])}

                  {/* 3rd row - Dates: Birth & Marriage */}
                  {renderFieldGroup([{
                name: `${prefix}_dob`,
                label: "Date of birth",
                type: "date"
              }, {
                name: `${prefix === 'pgf' || prefix === 'pgm' ? 'pgf_pgm_marriage_date' : 'mgf_mgm_marriage_date'}`,
                label: "Date of marriage",
                type: "date"
              }])}

                  {/* 4th row - Dates: Emigration & Naturalization */}
                  {renderFieldGroup([{
                name: `${prefix}_date_of_emigration`,
                label: "Date of emigration",
                type: "date"
              }, {
                name: `${prefix}_date_of_naturalization`,
                label: "Date of naturalization",
                type: "date"
              }])}

                  <FamilyMemberDocumentsSection
                    prefix={prefix}
                    title="Required Documents"
                    formData={formData}
                    handleInputChange={handleInputChange}
                    personType="grandparent"
                    sex={sex}
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
                      className={cn("min-h-[200px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                    />
                  </div>
                </Fragment>;
              })}
          </motion.div>
          )}
        </TabsContent>

        <TabsContent value="great-grandparents" className="mt-0">

          {/* Polish Great-Grandfathers Section - Only the 2 Polish Ancestors */}
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
        }} className="space-y-10">
              <div className="border-b border-border/50 pb-6 mb-10">
                <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Polish Great-Grandfathers
                </h2>
                <p className="text-base mt-2">
                  Focus on the 2 Polish great-grandfathers only. Great-grandmothers are not relevant for this process.
                </p>
              </div>

              {["pggf", "mggf"].map(prefix => {
                const labels = {
                  pggf: "Paternal Great-Grandfather (Father's Line)",
                  mggf: "Maternal Great-Grandfather (Mother's Line)"
                };
                const sex = 'M'; // Great-grandfathers are always male
                return <Fragment key={prefix}>
                  <h3 className={cn(
                    "text-3xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent",
                    formData[`${prefix}_is_polish`] && "text-red-400"
                  )}>
                    {labels[prefix as keyof typeof labels]}
                  </h3>

                  <div className="mb-6 p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                    {renderCheckboxGroup([{
                      name: `${prefix}_is_polish`,
                      label: "Polish Ancestor"
                    }])}
                  </div>
                  
                  {/* 1st row - Names */}
                  {renderFieldGroup([{
                name: `${prefix}_first_name`,
                label: "Given names / Imię/ imiona",
                isNameField: true
              }, {
                name: `${prefix}_last_name`,
                label: "Full last name / Nazwisko",
                isNameField: true
              }])}

                  {/* 2nd row - Places: Birth & Marriage */}
                  {renderFieldGroup([{
                name: `${prefix}_pob`,
                label: "Place of birth"
              }, {
                name: `${prefix === 'pggf' ? 'pggf_pggm_marriage_place' : 'mggf_mggm_marriage_place'}`,
                label: "Place of marriage"
              }])}

                  {/* 3rd row - Dates: Birth & Marriage */}
                  {renderFieldGroup([{
                name: `${prefix}_dob`,
                label: "Date of birth",
                type: "date"
              }, {
                name: `${prefix === 'pggf' ? 'pggf_pggm_marriage_date' : 'mggf_mggm_marriage_date'}`,
                label: "Date of marriage",
                type: "date"
              }])}

                  {/* 4th row - Dates: Emigration & Naturalization */}
                  {renderFieldGroup([{
                name: `${prefix}_date_of_emigration`,
                label: "Date of emigration",
                type: "date"
              }, {
                name: `${prefix}_date_of_naturalization`,
                label: "Date of naturalization",
                type: "date"
              }])}
                  
                  <FamilyMemberDocumentsSection
                    prefix={prefix}
                    title="Required Documents"
                    formData={formData}
                    handleInputChange={handleInputChange}
                    personType="grandparent"
                    sex={sex}
                  />

                  <div className="space-y-2 mt-8">
                    <Label htmlFor={`${prefix}_notes`} className={isLargeFonts ? "text-2xl" : ""}>
                      ADDITIONAL NOTES
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Family history, immigration journey, Polish heritage details, important life events
                    </p>
                    <Textarea
                      id={`${prefix}_notes`}
                      value={formData[`${prefix}_notes`] || ""}
                      onChange={e => handleInputChange(`${prefix}_notes`, e.target.value.toUpperCase())}
                      placeholder="Enter biographical information and family history details..."
                      className={cn("min-h-[200px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                    />
                  </div>
                </Fragment>;
              })}
          </motion.div>
          )}
        </TabsContent>

        <TabsContent value="additional" className="mt-0">

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
                  <Label htmlFor="additional_info" className={isLargeFonts ? "text-2xl" : ""}>
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
                </>
              )}
          </Tabs>
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