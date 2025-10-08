import { useParams, useNavigate } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Loader2, Save, FileText, Users, Baby, Heart, Calendar as CalendarIcon, Sparkles, Download, GitBranch, Type, FilePlus } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { PDFGenerationButtons } from "@/components/PDFGenerationButtons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
export default function MasterDataTable() {
  const {
    id: caseId
  } = useParams();
  const navigate = useNavigate();

  // Debug logging
  console.log('MasterDataTable - caseId from URL:', caseId);
  const {
    data: masterData,
    isLoading
  } = useMasterData(caseId);
  const updateMutation = useUpdateMasterData();
  const [formData, setFormData] = useState<any>({});
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
  useEffect(() => {
    if (masterData) {
      const address = masterData.applicant_address as {
        street?: string;
        city?: string;
        state?: string;
        postal?: string;
        country?: string;
      } || {};
      setFormData({
        ...masterData,
        applicant_address_street: address.street || '',
        applicant_address_city: address.city || '',
        applicant_address_state: address.state || '',
        applicant_address_postal: address.postal || '',
        applicant_address_country: address.country || ''
      });
    }
  }, [masterData]);
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
      return {
        ...prev,
        [field]: value
      };
    });
  };
  const handleSave = () => {
    if (!caseId) return;
    updateMutation.mutate({
      caseId,
      updates: formData
    });
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
        <Textarea id={name} value={formData[name] || ""} onChange={e => handleInputChange(name, e.target.value)} rows={rows} className="border-2 text-base hover-glow focus:shadow-lg transition-all resize-none bg-card/50 backdrop-blur" />
      </motion.div>;
  };
  return <div className="min-h-screen relative">
      {/* Footer-style Background */}
      <div className="fixed inset-0 bg-gradient-to-t from-background via-primary/5 to-background pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Sticky Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="sticky top-0 z-50 mb-8 bg-background/95 backdrop-blur-lg border-b border-primary/20"
        >
          <Card className="glass-card border-primary/20 overflow-hidden rounded-none border-x-0 border-t-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
            <CardHeader className="relative pb-8 pt-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text">
                    Master Data Form
                  </CardTitle>
                </motion.div>
                <div className="flex items-center gap-3">
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
          className="mb-8"
        >
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 bg-background/95 backdrop-blur-lg p-3 md:p-4 rounded-lg scrollbar-hide">
            <Button 
              onClick={handleSave} 
              disabled={updateMutation.isPending} 
              size="default" 
              className="text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap"
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
            {formData.applicant_is_married && (
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
            {formData.applicant_has_minor_children && (
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
              } shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap`}
            >
              <span className={activeTab === 'great-grandparents' ? 'text-white' : 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'}>
                Great-Grandparents
              </span>
            </Button>
            <Button 
              onClick={() => navigate(`/admin/cases/${caseId}/additional-data`)}
              size="default" 
              className="text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap"
            >
              <FilePlus className="h-3 md:h-4 lg:h-5 w-3 md:w-4 lg:w-5 mr-1 md:mr-2 opacity-50" />
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Additional Data
              </span>
            </Button>
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
                  {/* Ancestry Line Selection */}
                  <motion.div initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} className="space-y-3">
                    <Label htmlFor="ancestry_line" className="text-base font-medium text-foreground flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-primary" />
                      Polish Ancestry Line
                    </Label>
                    <Select value={formData.ancestry_line || ""} onValueChange={value => handleInputChange("ancestry_line", value)}>
                      <SelectTrigger className="h-14 border-2 text-base hover-glow bg-card/50 backdrop-blur">
                        <SelectValue placeholder="Select bloodline path" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">Father's Line (Paternal)</SelectItem>
                        <SelectItem value="mother">Mother's Line (Maternal)</SelectItem>
                        <SelectItem value="pgf">Paternal Grandfather's Line</SelectItem>
                        <SelectItem value="pgm">Paternal Grandmother's Line</SelectItem>
                        <SelectItem value="mgf">Maternal Grandfather's Line</SelectItem>
                        <SelectItem value="mgm">Maternal Grandmother's Line</SelectItem>
                        <SelectItem value="pggf">Paternal Great-Grandfather (Father's Side)</SelectItem>
                        <SelectItem value="pggm">Paternal Great-Grandmother (Father's Side)</SelectItem>
                        <SelectItem value="mggf">Maternal Great-Grandfather (Mother's Side)</SelectItem>
                        <SelectItem value="mggm">Maternal Great-Grandmother (Mother's Side)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Select the ancestral line through which Polish citizenship is claimed
                    </p>
                  </motion.div>

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
                  name: "applicant_sex",
                  label: "Sex"
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

          {/* SPOUSE TAB - Only show if married */}
          {formData.applicant_is_married && activeTab === "spouse" && (
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

          {/* KIDS TAB - Only show if has minor children */}
          {formData.applicant_has_minor_children && activeTab === "children" && (
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
                      Minor Kids
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-10">
                    <motion.div initial={{
                    opacity: 0
                  }} animate={{
                    opacity: 1
                  }} className="space-y-3 max-w-xs">
                      <Label htmlFor="children_count" className="text-base font-medium">
                        Number of Kids
                      </Label>
                      <Input id="children_count" type="number" value={formData.children_count || 0} onChange={e => handleInputChange("children_count", parseInt(e.target.value) || 0)} min={0} max={10} className="h-14 border-2 text-base hover-glow bg-card/50 backdrop-blur" />
                    </motion.div>
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
                    }, {
                      name: `child_${num}_has_poa_minor`,
                      label: "POA Minor"
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
                      }] : [])])}
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