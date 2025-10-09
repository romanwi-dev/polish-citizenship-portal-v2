import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Loader2, Save, FileText, Users, Baby, Heart, Calendar as CalendarIcon, Sparkles, Download, GitBranch, Type, FilePlus, User, ArrowLeft } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { PDFGenerationButtons } from "@/components/PDFGenerationButtons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useFormSync } from "@/hooks/useFormSync";

export default function MasterDataTable() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();

  console.log('MasterDataTable - caseId from URL:', caseId);
  
  const { formData, setFormData, isLoading, isSaving, saveData } = useFormSync(caseId);
  const [activeTab, setActiveTab] = useState("applicant");
  const { isLargeFonts, toggleFontSize } = useAccessibility();

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
  const renderDateField = (name: string, label: string) => {
    const dateValue = formData[name] ? new Date(formData[name]) : undefined;
    return <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="space-y-4">
        <Label htmlFor={name} className="text-sm font-normal text-foreground/90">
          {label}
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full h-16 justify-start text-left border-2 hover-glow bg-card/50 backdrop-blur", !dateValue && "text-muted-foreground")} style={{
            fontSize: '1.125rem',
            fontWeight: '400'
          }}>
              <CalendarIcon className="mr-2 h-5 w-5" />
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
  }>) => {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field, idx) => <motion.div key={field.name} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: idx * 0.05,
        duration: 0.4
      }} className="space-y-4">
            {field.type === "date" ? renderDateField(field.name, field.label) : <>
                <Label htmlFor={field.name} className="text-sm font-normal text-foreground/90">
                  {field.label}
                </Label>
                <Input id={field.name} type={field.type || "text"} value={formData[field.name] || ""} onChange={e => handleInputChange(field.name, field.type === "email" ? e.target.value : e.target.value.toUpperCase())} placeholder="" className={cn("h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur", field.type === "email" ? "" : "uppercase")} style={{
            fontSize: '1.125rem',
            fontWeight: '400'
          }} />
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
        <Textarea id={name} value={formData[name] || ""} onChange={e => handleInputChange(name, e.target.value)} rows={rows} className="border-2 text-base hover-glow focus:shadow-lg transition-all resize-vertical bg-card/50 backdrop-blur" />
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
          className="sticky top-0 z-20 bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-sm border-b mb-0"
        >
          <Card className="glass-card border-primary/20 overflow-hidden rounded-none border-x-0 border-t-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
            <CardHeader className="relative pb-6 pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text">
                    Master Form
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
              disabled={isSaving} 
              size="default" 
              className="text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[160px] md:min-w-[220px] lg:min-w-[260px] whitespace-nowrap"
            >
              {isSaving ? (
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
            <PDFGenerationButtons caseId={caseId || ''} />
            <Button 
              onClick={() => setActiveTab('applicant')}
              variant={activeTab === 'applicant' ? 'default' : 'outline'}
              className={`text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg ${
                activeTab === 'applicant' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                  : 'bg-white/5 hover:bg-white/10'
              } shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap`}
            >
              <span className={activeTab === 'applicant' ? 'text-white' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'}>
                Applicant
              </span>
            </Button>
            {(formData.spouse_first_name || formData.spouse_last_name || formData.date_of_marriage) && (
              <Button 
                onClick={() => setActiveTab('spouse')}
                variant={activeTab === 'spouse' ? 'default' : 'outline'}
                className={`text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg ${
                  activeTab === 'spouse' 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                    : 'bg-white/5 hover:bg-white/10'
                } shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap`}
              >
                <span className={activeTab === 'spouse' ? 'text-white' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'}>
                  Spouse
                </span>
              </Button>
            )}
            {(formData.children_count > 0) && (
              <Button 
                onClick={() => setActiveTab('children')}
                variant={activeTab === 'children' ? 'default' : 'outline'}
                className={`text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg ${
                  activeTab === 'children' 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                    : 'bg-white/5 hover:bg-white/10'
                } shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap`}
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
              } shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap`}
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
              } shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap`}
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
              onClick={() => navigate(`/admin/cases/${caseId}/additional-data`)}
              size="default" 
              className="text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Additional Data
              </span>
            </Button>
            </div>
          </div>
        </motion.div>

        {/* Form Content */}
        <div className="w-full">
          {/* APPLICANT TAB */}
          {activeTab === "applicant" && (
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
                      <Select value={formData.applicant_is_married === true ? "Married" : formData.applicant_is_married === false ? "Single" : ""} onValueChange={(value) => handleInputChange("applicant_is_married", value === "Married")}>
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

                  {/* Basic Information */}
                  {renderFieldGroup([{
                  name: "applicant_first_name",
                  label: "Given names / Imię / imiona"
                }, {
                  name: "applicant_last_name",
                  label: "Full last name / Nazwisko"
                }, {
                  name: "applicant_maiden_name",
                  label: "Maiden name"
                }, {
                  name: "applicant_dob",
                  label: "Date of birth",
                  type: "date"
                }, {
                  name: "applicant_pob",
                  label: "Place of birth"
                }])}

                  {/* Contact Information */}
                  <div className="pt-8">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Contact Information</h3>
                    {renderFieldGroup([{
                      name: "applicant_email",
                      label: "Email",
                      type: "email"
                    }, {
                      name: "applicant_phone",
                      label: "Phone"
                    }])}
                  </div>

                  {/* Passport Information */}
                  <div className="pt-8">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Passport Information</h3>
                    {renderFieldGroup([{
                      name: "applicant_passport_number",
                      label: "Passport Number"
                    }, {
                      name: "applicant_passport_issuing_country",
                      label: "Passport Issuing Country"
                    }, {
                      name: "applicant_passport_issuing_authority",
                      label: "Passport Issuing Authority"
                    }, {
                      name: "applicant_passport_issue_date",
                      label: "Passport Issue Date",
                      type: "date"
                    }, {
                      name: "applicant_passport_expiry_date",
                      label: "Passport Expiry Date",
                      type: "date"
                    }])}
                  </div>

                  {/* Marriage Information - Only show if married */}
                  {formData.applicant_is_married && (
                    <div className="pt-8">
                      <h3 className="text-xl font-semibold mb-6 text-foreground">Marriage Information</h3>
                      {renderFieldGroup([{
                        name: "place_of_marriage",
                        label: "Place of marriage"
                      }, {
                        name: "date_of_marriage",
                        label: "Date of marriage",
                        type: "date"
                      }])}
                    </div>
                  )}

                  {/* Immigration Information */}
                  <div className="pt-8">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Immigration Information</h3>
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
                    label: "Postal Code"
                  }, {
                    name: "applicant_address_country",
                    label: "Country"
                  }])}
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

                  <div className="pt-8">
                    {renderTextarea("applicant_notes", "Additional Notes")}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

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
                  {renderFieldGroup([{
                  name: "spouse_first_name",
                  label: "Given names / Imię / imiona"
                }, {
                  name: "spouse_last_name",
                  label: "Full last name / Nazwisko"
                }, {
                  name: "spouse_maiden_name",
                  label: "Maiden name"
                }, {
                  name: "spouse_sex",
                  label: "Sex"
                }, {
                  name: "spouse_dob",
                  label: "Date of birth",
                  type: "date"
                }, {
                  name: "spouse_pob",
                  label: "Place of birth"
                }, {
                  name: "date_of_marriage",
                  label: "Date of marriage",
                  type: "date"
                }, {
                  name: "place_of_marriage",
                  label: "Place of marriage"
                }])}

                  <div className="pt-8">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Documents Required</h3>
                    {renderCheckboxGroup([{
                    name: "spouse_has_birth_cert",
                    label: "Birth certificate"
                  }, {
                    name: "spouse_has_marriage_cert",
                    label: "Marriage certificate"
                  }, {
                    name: "spouse_has_passport",
                    label: "Passport"
                  }])}
                  </div>

                  <div className="pt-8">
                    {renderTextarea("spouse_notes", "Additional Notes")}
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
                    {/* Number of children */}
                    <motion.div initial={{
                    opacity: 0,
                    y: 20
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} className="space-y-4 max-w-xs">
                      <Label htmlFor="children_count" className="text-base font-medium">
                        Number of children (including minors)
                      </Label>
                      <Select 
                        value={formData.children_count?.toString() || "0"} 
                        onValueChange={value => {
                          const count = parseInt(value);
                          handleInputChange("children_count", count);
                          if (count === 0) {
                            handleInputChange("applicant_has_minor_children", false);
                          }
                        }}
                      >
                        <SelectTrigger className="h-14 border-2 text-base hover-glow bg-card/50 backdrop-blur">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {/* Minor children if applicable */}
                    {formData.children_count > 0 && (
                      <motion.div initial={{
                        opacity: 0,
                        y: 20
                      }} animate={{
                        opacity: 1,
                        y: 0
                      }} transition={{
                        delay: 0.1
                      }} className="space-y-4 max-w-xs">
                        <Label className="text-base font-medium">
                          Do you have minor children (under 18)?
                        </Label>
                        <Select 
                          value={formData.applicant_has_minor_children ? "yes" : "no"} 
                          onValueChange={value => handleInputChange("applicant_has_minor_children", value === "yes")}
                        >
                          <SelectTrigger className="h-14 border-2 text-base hover-glow bg-card/50 backdrop-blur">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>

                {Array.from({
                length: formData.children_count || 0
              }, (_, i) => i + 1).map(num => <Card key={num} className="glass-card border-primary/20">
                    <CardHeader className="border-b border-border/50">
                      <CardTitle className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Child {num}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-10 space-y-8">
                      {renderFieldGroup([{
                    name: `child_${num}_first_name`,
                    label: "Given names / Imię / imiona"
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
                    <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      Father Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-10 space-y-10">
                    {renderFieldGroup([{
                    name: "father_first_name",
                    label: "Given names / Imię / imiona"
                  }, {
                    name: "father_last_name",
                    label: "Full last name / Nazwisko"
                  }, {
                    name: "father_pob",
                    label: "Place of birth"
                  }, {
                    name: "father_dob",
                    label: "Date of birth",
                    type: "date"
                  }, {
                    name: "father_date_of_emigration",
                    label: "Date of Emigration",
                    type: "date"
                  }, {
                    name: "father_date_of_naturalization",
                    label: "Date of Naturalization",
                    type: "date"
                  }])}
                    <div className="pt-4">
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
                    <div>{renderTextarea("father_notes", "Notes")}</div>
                  </CardContent>
                </Card>

                {/* Mother */}
                <Card className="glass-card border-primary/20">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      Mother Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-10 space-y-10">
                    {renderFieldGroup([{
                    name: "mother_first_name",
                    label: "Given names / Imię / imiona"
                  }, {
                    name: "mother_last_name",
                    label: "Full last name / Nazwisko"
                  }, {
                    name: "mother_maiden_name",
                    label: "Maiden name"
                  }, {
                    name: "mother_pob",
                    label: "Place of birth"
                  }, {
                    name: "mother_dob",
                    label: "Date of birth",
                    type: "date"
                  }, {
                    name: "mother_date_of_emigration",
                    label: "Date of Emigration",
                    type: "date"
                  }])}
                    <div className="pt-4">
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
                    <div>{renderTextarea("mother_notes", "Notes")}</div>
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
                return <Card key={prefix} className="glass-card border-primary/20">
                      <CardHeader className="border-b border-border/50">
                        <CardTitle className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                          {labels[prefix as keyof typeof labels]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 md:p-10 space-y-10">
                        <div className="mb-6 p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                          {renderCheckboxGroup([{
                        name: `${prefix}_is_polish`,
                        label: "Polish Ancestor"
                      }])}
                        </div>
                        {renderFieldGroup([{
                      name: `${prefix}_first_name`,
                      label: "Given names / Imię / imiona"
                    }, {
                      name: `${prefix}_last_name`,
                      label: "Full last name / Nazwisko"
                    }, ...(prefix.includes("gm") ? [{
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
                      }] : []), ...(prefix === "mgm" ? [] : [])])}
                        </div>
                        <div>{renderTextarea(`${prefix}_notes`, "Notes")}</div>
                      </CardContent>
                    </Card>;
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
                    Additional Data
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
        </div>
      </div>

    </div>;
}