import { useParams, useNavigate } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, Save, Download, FileText, Sparkles, Type, FilePlus, User, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Textarea } from "@/components/ui/textarea";
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
                <Input id={field.name} type={field.type || "text"} value={formData[field.name] || ""} onChange={e => handleInputChange(field.name, field.type === "email" ? e.target.value : e.target.value.toUpperCase())} placeholder="" className={cn("h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur", field.type === "email" ? "" : "uppercase")} />
              </>}
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
          <Card className="glass-card border-primary/20 overflow-hidden rounded-none border-x-0 border-t-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
            <CardHeader className="relative pb-6 pt-6">
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
                  <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text">Civil Registry</CardTitle>
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
                  <Button onClick={toggleFontSize} size="lg" variant="ghost" className={`h-16 w-16 rounded-full transition-all ${isLargeFonts ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`} title="Toggle font size">
                    <Type className="h-8 w-8" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Action Buttons Section */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-sm pb-4 pt-4">
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 p-3 md:p-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <Button onClick={handleSave} disabled={updateMutation.isPending} size="default" className="text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[120px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap">
              {updateMutation.isPending ? <>
                  <Loader2 className="h-3 md:h-4 lg:h-5 w-3 md:w-4 lg:w-5 animate-spin mr-1 md:mr-2 opacity-50" />
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Saving...
                  </span>
                </> : <>
                  <Save className="h-3 md:h-4 lg:h-5 w-3 md:w-4 lg:w-5 mr-1 md:mr-2 opacity-50" />
                  <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Save data
                  </span>
                </>}
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
          </div>
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
                {renderFieldGroup([{
                name: "applicant_first_name",
                label: "Given names / Imię / imiona"
              }, {
                name: "applicant_last_name",
                label: "Full last name / Nazwisko"
              }, {
                name: "applicant_maiden_name",
                label: "Maiden name / Nazwisko panieńskie"
              }, {
                name: "applicant_dob",
                label: "Date of birth / Data urodzenia",
                type: "date"
              }, {
                name: "applicant_pob",
                label: "Place of birth / Miejsce urodzenia"
              }, {
                name: "applicant_sex",
                label: "Sex / Płeć"
              }, {
                name: "applicant_email",
                label: "Email",
                type: "email"
              }, {
                name: "applicant_phone",
                label: "Phone / Telefon"
              }, {
                name: "applicant_passport_number",
                label: "Passport Number / Nr paszportu"
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
                <div className="bg-muted/30 rounded-lg p-6 border-2 border-primary/20">
                  <h3 className={cn("font-semibold mb-6 text-foreground", isLargeFonts ? "text-3xl" : "text-2xl")}>Required Information / Wymagane informacje</h3>
                  <p className={cn("text-muted-foreground mb-6", isLargeFonts ? "text-lg" : "text-base")}>
                    Foreign civil status record was issued in / Zagraniczny akt stanu cywilnego został sporządzony
                  </p>
                  {renderFieldGroup([{
                  name: "applicant_pob",
                  label: "Place Where Document Was Issued / Miejsce sporządzenia aktu"
                }, {
                  name: "applicant_dob",
                  label: "Event Date / Data zdarzenia",
                  type: "date"
                }])}
                </div>

                <div className="bg-muted/30 rounded-lg p-6 border-2 border-primary/20">
                  <h3 className={cn("font-semibold mb-6 text-foreground", isLargeFonts ? "text-3xl" : "text-2xl")}>Required Documents / Wymagane dokumenty</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-card/30 rounded-lg">
                      <div className="h-3 w-3 rounded-full bg-primary mt-1"></div>
                      <div>
                        <p className={cn("font-medium text-foreground", isLargeFonts ? "text-lg" : "text-base")}>1. Original Document with Translation</p>
                        <p className={cn("text-muted-foreground", isLargeFonts ? "text-base" : "text-sm")}>Oryginał aktu z tłumaczeniem przysięgłym na język polski</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-card/30 rounded-lg">
                      <div className="h-3 w-3 rounded-full bg-primary mt-1"></div>
                      <div>
                        <p className={cn("font-medium text-foreground", isLargeFonts ? "text-lg" : "text-base")}>2. Proof of Tax Paymen</p>
                        <p className={cn("text-muted-foreground", isLargeFonts ? "text-base" : "text-sm")}>Dowód uiszczenia opłaty skarbowej</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-card/30 rounded-lg">
                      <div className="h-3 w-3 rounded-full bg-primary mt-1"></div>
                      <div>
                        <p className={cn("font-medium text-foreground", isLargeFonts ? "text-lg" : "text-base")}>3. Power of Attorney</p>
                        <p className={cn("text-muted-foreground", isLargeFonts ? "text-base" : "text-sm")}>Pełnomocnictwo</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-card/30 rounded-lg">
                      <div className="h-3 w-3 rounded-full bg-primary mt-1"></div>
                      <div>
                        <p className={cn("font-medium text-foreground", isLargeFonts ? "text-lg" : "text-base")}>4. Passport Copy</p>
                        <p className={cn("text-muted-foreground", isLargeFonts ? "text-base" : "text-sm")}>Kopia paszportu</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-6 border-2 border-primary/20">
                  <h3 className={cn("font-semibold mb-6 text-foreground", isLargeFonts ? "text-3xl" : "text-2xl")}>Declaration / Oświadczenie</h3>
                  <div className="space-y-4">
                    <p className={cn("text-foreground italic font-medium", isLargeFonts ? "text-lg" : "text-base")}>
                      "Oświadczam, że ten akt nie został zarejestrowany w księgach stanu cywilnego na terenie RP."
                    </p>
                    <p className={cn("text-muted-foreground", isLargeFonts ? "text-base" : "text-sm")}>
                      I declare that this record has not been registered in civil status books in the Republic of Poland.
                    </p>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-6 border-2 border-primary/20">
                  <h3 className={cn("font-semibold mb-6 text-foreground", isLargeFonts ? "text-3xl" : "text-2xl")}>Delivery Method / Sposób odbioru dokumentów</h3>
                  <p className={cn("text-foreground font-medium", isLargeFonts ? "text-lg" : "text-base")}>
                    Wysłać do pełnomocnika / Send to authorized representative
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-6 border-2 border-primary/20">
                  <h3 className={cn("font-semibold mb-6 text-foreground", isLargeFonts ? "text-3xl" : "text-2xl")}>Additional Relevant Info / Dodatkowe informacje</h3>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="additional_info" className={cn("font-light text-foreground/90", isLargeFonts ? "text-xl" : "text-sm")}>
                      Additional Information
                    </Label>
                    <Textarea
                      id="additional_info"
                      value={formData.additional_info || ""}
                      onChange={(e) => handleInputChange("additional_info", e.target.value.toUpperCase())}
                      placeholder=""
                      className={cn(
                        "min-h-32 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase",
                        isLargeFonts ? "text-lg" : "text-base"
                      )}
                    />
                  </motion.div>
                </div>

                <div className="flex justify-center pt-6">
                  <Button
                    onClick={() => navigate(`/admin/cases/${caseId}/additional-data`)}
                    variant="outline"
                    className="text-sm md:text-base lg:text-xl font-bold px-6 md:px-8 h-12 md:h-14 lg:h-16 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[180px] md:min-w-[220px] lg:min-w-[250px] whitespace-nowrap"
                  >
                    <FilePlus className="h-4 md:h-5 lg:h-6 w-4 md:w-5 lg:w-6 mr-2 opacity-50" />
                    <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      Additional Data
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>;
}