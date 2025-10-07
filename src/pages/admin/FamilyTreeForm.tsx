import { useParams } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { Loader2, Save, Download, Users, Sparkles, Type } from "lucide-react";
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
    updateMutation.mutate({
      caseId,
      updates: formData
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
      }} className="space-y-2" onDoubleClick={() => !field.type || field.type === "text" ? handleInputChange(field.name, "") : null}>
            {field.type === "date" ? renderDateField(field.name, field.label) : <>
                <Label htmlFor={field.name} className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                  {field.label}
                </Label>
                <Input id={field.name} type={field.type || "text"} value={formData[field.name] || ""} onChange={e => handleInputChange(field.name, field.type === "email" ? e.target.value : e.target.value.toUpperCase())} placeholder="" className={cn("h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur", field.type !== "email" && "uppercase")} />
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
  return <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

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
      }} className="mb-12">
          <Card className="glass-card border-primary/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
            <CardHeader className="relative pb-8 pt-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <motion.div initial={{
                x: -20,
                opacity: 0
              }} animate={{
                x: 0,
                opacity: 1
              }} transition={{
                delay: 0.2
              }}>
                  <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text">
                    Polish Family Tree
                  </CardTitle>
                </motion.div>
                <motion.div initial={{
                x: 20,
                opacity: 0
              }} animate={{
                x: 0,
                opacity: 1
              }} transition={{
                delay: 0.3
              }} className="flex gap-3">
                  <Button onClick={toggleFontSize} size="lg" variant="ghost" className={`h-16 w-16 rounded-full transition-all ${isLargeFonts ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`} title="Toggle font size">
                    <Type className="h-8 w-8" />
                  </Button>
                </motion.div>
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
          <div className="flex gap-3 overflow-x-auto pb-2 justify-center md:justify-start">
            <Button 
              onClick={handleSave} 
              disabled={updateMutation.isPending} 
              className="text-base md:text-xl font-bold px-6 h-12 md:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[200px]"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 md:h-5 w-4 md:w-5 animate-spin mr-2 opacity-50" />
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Saving...
                  </span>
                </>
              ) : (
                <>
                  <Save className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Save data
                  </span>
                </>
              )}
            </Button>
            <Button 
              onClick={handleGeneratePDF} 
              disabled={isGenerating} 
              className="text-base md:text-xl font-bold px-6 h-12 md:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 md:h-5 w-4 md:w-5 animate-spin mr-2 opacity-50" />
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Generating...
                  </span>
                </>
              ) : (
                <>
                  <Download className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Generate PDF
                  </span>
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              className="text-base md:text-xl font-bold px-6 h-12 md:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[200px]"
            >
              <Users className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                New Button
              </span>
            </Button>
            <Button 
              variant="outline"
              className="text-base md:text-xl font-bold px-6 h-12 md:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[200px]"
            >
              <Users className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                New Button
              </span>
            </Button>
            <Button 
              variant="outline"
              className="text-base md:text-xl font-bold px-6 h-12 md:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[200px]"
            >
              <Users className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                New Button
              </span>
            </Button>
          </div>
        </motion.div>

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Applicant Section */}
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
              }, {
                name: "applicant_email",
                label: "Email",
                type: "email"
              }, {
                name: "applicant_phone",
                label: "Phone"
              }, {
                name: "applicant_passport_number",
                label: "Passport Number"
              }])}

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

          {/* Spouse Section - Only show if married */}
          {formData.applicant_is_married && <motion.div initial={{
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
                  Applicant's Spouse
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
              </CardContent>
            </Card>
          </motion.div>}

          {/* Kids Section - Only show if has minor children */}
          {formData.applicant_has_minor_children && <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }}>
            <Card className="glass-card border-primary/20">
              <CardHeader className="border-b border-border/50 pb-6">
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Minor Kids
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-10">
                {[1, 2, 3, 4].map(num => <div key={num} className="p-6 border-2 border-border/50 rounded-xl bg-card/30 backdrop-blur space-y-6">
                    <h3 className="text-xl font-semibold text-foreground">Child {num}</h3>
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
          </motion.div>}

          {/* Polish Parent Section */}
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
                <Card className="glass-card border-primary/20 mb-6">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Father</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8 space-y-8">
                    <div className="mb-6 p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                      {renderCheckboxGroup([{
                        name: "father_is_polish",
                        label: "Polish Ancestor"
                      }])}
                    </div>
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
                    label: "Date of emigration",
                    type: "date"
                  }, {
                    name: "father_date_of_naturalization",
                    label: "Date of naturalization",
                    type: "date"
                  }, {
                    name: "father_mother_marriage_date",
                    label: "Date of marriage",
                    type: "date"
                  }, {
                    name: "father_mother_marriage_place",
                    label: "Place of marriage"
                  }])}
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

                <Card className="glass-card border-primary/20">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Mother</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8 space-y-8">
                    <div className="mb-6 p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                      {renderCheckboxGroup([{
                        name: "mother_is_polish",
                        label: "Polish Ancestor"
                      }])}
                    </div>
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
                    label: "Date of emigration",
                    type: "date"
                  }, {
                    name: "father_mother_marriage_date",
                    label: "Date of marriage",
                    type: "date"
                  }, {
                    name: "father_mother_marriage_place",
                    label: "Place of marriage"
                  }])}
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

          {/* Grandparents Section */}
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
                return <Card key={prefix} className="glass-card border-primary/20">
                      <CardHeader className="border-b border-border/50">
                        <CardTitle className="text-2xl md:text-3xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
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
                      }] : [])])}
                        </div>
                      </CardContent>
                    </Card>;
              })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Great-Grandparents Section */}
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
                        <div className="pt-4">
                          <h4 className="text-lg font-semibold mb-4 text-foreground">Documents Required</h4>
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
                      </CardContent>
                    </Card>;
              })}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>;
}