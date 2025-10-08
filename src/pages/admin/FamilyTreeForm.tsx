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
import { Loader2, Save, Download, Users, Sparkles, Type, User, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAccessibility } from "@/contexts/AccessibilityContext";

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
  const [activeTab, setActiveTab] = useState("applicant");
  useEffect(() => {
    if (masterData) {
      setFormData(masterData);
    }
  }, [masterData]);
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
  const renderDateField = (name: string, label: string) => {
    const dateValue = formData[name] ? new Date(formData[name]) : undefined;
    return <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="space-y-2">
        <Label htmlFor={name} className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
          {label}
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full h-16 justify-start text-left border-2 hover-glow bg-card/50 backdrop-blur", !dateValue && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue ? format(dateValue, "dd/MM/yyyy") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateValue} onSelect={date => handleInputChange(name, date ? format(date, "yyyy-MM-dd") : "")} disabled={date => date > new Date("2030-12-31") || date < new Date("1900-01-01")} initialFocus className={cn("p-3 pointer-events-auto")} />
          </PopoverContent>
        </Popover>
      </motion.div>;
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
    // Check if this is a name fields group (first/last/maiden names)
    const isNameGroup = fields.every(f => f.isNameField);
    
    return <div className={cn(
      "grid gap-6",
      isNameGroup ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    )}>
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
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text">
                    Polish Family Tree
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
          
          <div className="bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-sm pb-4 pt-4">
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 p-3 md:p-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
            <Button 
              onClick={handleSave} 
              disabled={updateMutation.isPending} 
              size="default" 
              className="text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[160px] md:min-w-[220px] lg:min-w-[260px] whitespace-nowrap"
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
                    Save Data
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
            <Button 
              onClick={() => setActiveTab('applicant')}
              variant={activeTab === 'applicant' ? 'default' : 'outline'}
              className={`text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg ${
                activeTab === 'applicant' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                  : 'bg-white/5 hover:bg-white/10'
              } shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[120px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap`}
            >
              <span className={activeTab === 'applicant' ? 'text-white' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'}>
                Applicant
              </span>
            </Button>
            {(formData.children_count > 0) && (
              <Button 
                onClick={() => setActiveTab('children')}
                variant={activeTab === 'children' ? 'default' : 'outline'}
                className={`text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg ${
                  activeTab === 'children' 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                    : 'bg-white/5 hover:bg-white/10'
                } shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[120px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap`}
              >
                <span className={activeTab === 'children' ? 'text-white' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'}>
                  Children
                </span>
              </Button>
            )}
            <Button 
              onClick={() => setActiveTab('parents')}
              variant={activeTab === 'parents' ? 'default' : 'outline'}
              className={`text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg ${
                activeTab === 'parents' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                  : 'bg-white/5 hover:bg-white/10'
              } shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[120px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap`}
            >
              <span className={activeTab === 'parents' ? 'text-white' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'}>
                Parents
              </span>
            </Button>
            <Button 
              onClick={() => setActiveTab('grandparents')}
              variant={activeTab === 'grandparents' ? 'default' : 'outline'}
              className={`text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg ${
                activeTab === 'grandparents' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                  : 'bg-white/5 hover:bg-white/10'
              } shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[120px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap`}
            >
              <span className={activeTab === 'grandparents' ? 'text-white' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'}>
                Grandparents
              </span>
            </Button>
            <Button 
              onClick={() => setActiveTab('great-grandparents')}
              variant={activeTab === 'great-grandparents' ? 'default' : 'outline'}
              className={`text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg ${
                activeTab === 'great-grandparents' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                  : 'bg-white/5 hover:bg-white/10'
              } shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[180px] md:min-w-[220px] lg:min-w-[260px] whitespace-nowrap`}
            >
              <span className={activeTab === 'great-grandparents' ? 'text-white' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'}>
                Great Grandparents
              </span>
            </Button>
            <Button 
              onClick={() => setActiveTab('additional')}
              variant={activeTab === 'additional' ? 'default' : 'outline'}
              className={`text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg ${
                activeTab === 'additional' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                  : 'bg-white/5 hover:bg-white/10'
              } shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[120px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap`}
            >
              <span className={activeTab === 'additional' ? 'text-white' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'}>
                Additional Info
              </span>
            </Button>
            </div>
          </div>
        </motion.div>

        {/* Form Sections */}
        <div className="space-y-8">
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
                {/* Marital Status & Children - Side by side on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} className="p-6 border-2 border-primary/20 rounded-xl bg-primary/5">
                    {renderCheckboxGroup([{
                    name: "applicant_is_married",
                    label: "Married?"
                  }])}
                  </motion.div>

                  <motion.div initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} className="p-6 border-2 border-primary/20 rounded-xl bg-primary/5">
                    <div className="whitespace-nowrap">
                      {renderCheckboxGroup([{
                      name: "applicant_has_minor_children",
                      label: "Minor Kids?"
                    }])}
                    </div>
                  </motion.div>
                </div>

                {/* Children Count */}
                <motion.div initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  delay: 0.1,
                  duration: 0.4
                }} className="space-y-4">
                  <Label className={cn(
                    "font-light text-foreground/90",
                    isLargeFonts ? "text-xl" : "text-sm"
                  )}>Number of children (including minors)</Label>
                  <Select 
                    value={formData.applicant_children_count?.toString() || "0"} 
                    onValueChange={value => {
                      const count = parseInt(value);
                      handleInputChange("applicant_children_count", count);
                      handleInputChange("applicant_has_children", count > 0);
                      if (count === 0) {
                        handleInputChange("applicant_has_minor_children", false);
                        handleInputChange("applicant_minor_children_count", 0);
                      }
                    }}
                  >
                    <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-2 z-50">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <SelectItem key={num} value={num.toString()} className="text-base cursor-pointer">
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Minor Children if applicable */}
                {formData.applicant_children_count > 0 && (
                  <>
                    <motion.div initial={{
                      opacity: 0,
                      y: 20
                    }} animate={{
                      opacity: 1,
                      y: 0
                    }} transition={{
                      delay: 0.15,
                      duration: 0.4
                    }} className="space-y-4">
                      <Label className={cn(
                        "font-light text-foreground/90",
                        isLargeFonts ? "text-xl" : "text-sm"
                      )}>Do you have minor children (under 18)?</Label>
                      <Select 
                        value={formData.applicant_has_minor_children ? "yes" : "no"} 
                        onValueChange={value => {
                          handleInputChange("applicant_has_minor_children", value === "yes");
                          if (value === "no") {
                            handleInputChange("applicant_minor_children_count", 0);
                          }
                        }}
                      >
                        <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-2 z-50">
                          <SelectItem value="yes" className="text-base cursor-pointer">Yes</SelectItem>
                          <SelectItem value="no" className="text-base cursor-pointer">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {formData.applicant_has_minor_children && (
                      <motion.div initial={{
                        opacity: 0,
                        y: 20
                      }} animate={{
                        opacity: 1,
                        y: 0
                      }} transition={{
                        delay: 0.2,
                        duration: 0.4
                      }} className="space-y-4">
                        <Label className={cn(
                          "font-light text-foreground/90",
                          isLargeFonts ? "text-xl" : "text-sm"
                        )}>How many minor kids?</Label>
                        <Select 
                          value={formData.applicant_minor_children_count?.toString() || "0"} 
                          onValueChange={value => handleInputChange("applicant_minor_children_count", parseInt(value))}
                        >
                          <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-2 z-50">
                            {Array.from({ length: formData.applicant_children_count + 1 }, (_, i) => i).map(num => (
                              <SelectItem key={num} value={num.toString()} className="text-base cursor-pointer">
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    )}
                  </>
                )}

                {/* 1st row - Name fields */}
                {renderFieldGroup([{
                name: "applicant_first_name",
                label: "Given names / Imię/ imiona",
                isNameField: true
              }, {
                name: "applicant_last_name",
                label: "Full last name / Nazwisko",
                isNameField: true
              }, ...(formData.applicant_sex?.toLowerCase() === 'f' || formData.applicant_sex?.toLowerCase() === 'female' ? [{
                name: "applicant_maiden_name",
                label: "Maiden name",
                isNameField: true
              }] : [])])}

                {/* 2nd row - Places and emigration */}
                {formData.applicant_is_married ? (
                  renderFieldGroup([{
                    name: "applicant_pob",
                    label: "Place of birth"
                  }, {
                    name: "place_of_marriage",
                    label: "Place of marriage"
                  }, {
                    name: "applicant_date_of_emigration",
                    label: "Date of emigration",
                    type: "date"
                  }])
                ) : (
                  renderFieldGroup([{
                    name: "applicant_pob",
                    label: "Place of birth"
                  }, {
                    name: "applicant_date_of_emigration",
                    label: "Date of emigration",
                    type: "date"
                  }])
                )}

                {/* 3rd row - Dates */}
                {formData.applicant_is_married ? (
                  renderFieldGroup([{
                    name: "applicant_dob",
                    label: "Date of birth",
                    type: "date"
                  }, {
                    name: "date_of_marriage",
                    label: "Date of marriage",
                    type: "date"
                  }, {
                    name: "applicant_date_of_naturalization",
                    label: "Date of naturalization",
                    type: "date"
                  }])
                ) : (
                  renderFieldGroup([{
                    name: "applicant_dob",
                    label: "Date of birth",
                    type: "date"
                  }, {
                    name: "applicant_date_of_naturalization",
                    label: "Date of naturalization",
                    type: "date"
                  }])
                )}

                {/* Other fields */}
                {renderFieldGroup([{
                name: "applicant_passport_number",
                label: "Passport Number"
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
                    className={cn("min-h-[100px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                  />
                </div>

                <div className="pt-8">
                  <h3 className="text-xl font-semibold mb-6 text-foreground">Documents Required</h3>
                  {renderCheckboxGroup([{
                  name: "applicant_has_birth_cert",
                  label: "Birth certificate"
                }, ...(formData.applicant_is_married ? [{
                  name: "applicant_has_marriage_cert",
                  label: "Marriage certificate"
                }] : []), {
                  name: "applicant_has_passport",
                  label: "Passport"
                }, {
                  name: "applicant_has_naturalization",
                  label: "Naturalization certificate"
                }])}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          )}

          {/* Children Section */}
          {activeTab === 'children' && formData.applicant_has_minor_children && (
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
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-10">
                {[1, 2, 3, 4].map(num => <div key={num} className="p-6 border-2 border-border/50 rounded-xl bg-card/30 backdrop-blur space-y-6">
                    <h3 className="text-xl font-semibold text-foreground">Child {num}</h3>
                    {/* 1st row - Name fields */}
                    {renderFieldGroup([{
                  name: `child_${num}_first_name`,
                  label: "Given names / Imię / imiona",
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
                        className={cn("min-h-[100px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                      />
                    </div>
                    <div className="pt-4">
                      <h4 className="text-lg font-semibold mb-4 text-foreground">Documents Required</h4>
                      {renderCheckboxGroup([{
                    name: `child_${num}_has_passport`,
                    label: "Passport Copy"
                  }, {
                    name: `child_${num}_has_birth_cert`,
                    label: "Birth certificate"
                  }, {
                    name: `child_${num}_has_poa_minor`,
                    label: "POA Minor"
                  }])}
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
                    label: "Given names / Imię / imiona",
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
                        className={cn("min-h-[100px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                      />
                    </div>
                    <div className="pt-4">
                      <h4 className="text-lg font-semibold mb-4 text-foreground">Documents Required</h4>
                      {renderCheckboxGroup([{
                      name: "father_has_polish_documents",
                      label: "Polish documents"
                    }, {
                      name: "father_has_birth_cert",
                      label: "Birth certificate"
                    }, {
                      name: "father_has_marriage_cert",
                      label: "Marriage certificate"
                    }, {
                      name: "father_has_naturalization_papers",
                      label: "Naturalization Papers"
                    }, {
                      name: "father_has_foreign_documents",
                      label: "Foreign Documents"
                    }, {
                      name: "father_has_military_records",
                      label: "Military Records"
                    }])}
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
                    label: "Given names / Imię / imiona",
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
                        className={cn("min-h-[100px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                      />
                    </div>
                    <div className="pt-4">
                      <h4 className="text-lg font-semibold mb-4 text-foreground">Documents Required</h4>
                      {renderCheckboxGroup([{
                      name: "mother_has_polish_documents",
                      label: "Polish documents"
                    }, {
                      name: "mother_has_birth_cert",
                      label: "Birth certificate"
                    }, {
                      name: "mother_has_marriage_cert",
                      label: "Marriage certificate"
                    }, {
                      name: "mother_has_naturalization_papers",
                      label: "Naturalization Papers"
                    }, {
                      name: "mother_has_foreign_documents",
                      label: "Foreign Documents"
                    }])}
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
                      label: "Given names / Imię / imiona",
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
                            className={cn("min-h-[100px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                          />
                        </div>
                        <div className="pt-4">
                          <h4 className="text-lg font-semibold mb-4 text-foreground">Documents Required</h4>
                          {renderCheckboxGroup([{
                        name: `${prefix}_has_polish_documents`,
                        label: "Polish documents"
                      }, {
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
                      }, ...(prefix === "pgf" || prefix === "mgf" ? [{
                        name: `${prefix}_has_military_records`,
                        label: "Military Records"
                      }] : []), ...(prefix === "pgm" || prefix === "mgm" ? [] : [])])}
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
                      label: "Given names / Imię / imiona"
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
                            className={cn("min-h-[100px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase")}
                          />
                        </div>
                        <div className="pt-4">
                          <h4 className="text-lg font-semibold mb-4 text-foreground">Documents Required</h4>
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
        </div>
      </div>

    </div>;
}