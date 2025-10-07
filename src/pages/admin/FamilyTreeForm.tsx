import { useParams } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, Save, Download, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function FamilyTreeForm() {
  const { id: caseId } = useParams();
  const { data: masterData, isLoading } = useMasterData(caseId);
  const updateMutation = useUpdateMasterData();
  const [formData, setFormData] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (masterData) {
      setFormData(masterData);
    }
  }, [masterData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!caseId) return;
    updateMutation.mutate({ caseId, updates: formData });
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      toast.loading("Generating Family Tree PDF...");

      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType: 'family-tree' },
      });

      if (error) throw error;

      const blob = new Blob([data], { type: 'application/pdf' });
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
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <Label htmlFor={name} className="text-base font-medium text-foreground/70">
          {label}
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-16 justify-start text-left font-normal text-lg border-2 hover-glow bg-card/50 backdrop-blur",
                !dateValue && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue ? format(dateValue, "dd/MM/yyyy") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={(date) => handleInputChange(name, date ? format(date, "yyyy-MM-dd") : "")}
              disabled={(date) => date > new Date("2030-12-31") || date < new Date("1900-01-01")}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </motion.div>
    );
  };

  const renderFieldGroup = (fields: Array<{ name: string; label: string; type?: string; placeholder?: string }>) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field, idx) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            className="space-y-3"
          >
            {field.type === "date" ? (
              renderDateField(field.name, field.label)
            ) : (
              <>
                <Label htmlFor={field.name} className="text-base font-medium text-foreground/70">
                  {field.label}
                </Label>
                <Input
                  id={field.name}
                  type={field.type || "text"}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  placeholder={formData[field.name] ? "" : (field.placeholder || `Enter ${field.label.toLowerCase()}`)}
                  className="h-16 border-2 text-lg hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur"
                />
              </>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-16 w-16 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <Card className="glass-card border-primary/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
            <CardHeader className="relative pb-8 pt-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text">
                    Family Tree Form
                  </CardTitle>
                </motion.div>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-3"
                >
                  <Button 
                    onClick={handleSave} 
                    disabled={updateMutation.isPending}
                    size="lg" 
                    className="text-xl font-bold px-12 h-16 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-white/30"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                          Saving...
                        </span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                          Save
                        </span>
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleGeneratePDF} 
                    disabled={isGenerating}
                    size="lg"
                    variant="secondary"
                    className="text-xl font-bold px-12 h-16"
                  >
                    {isGenerating ? (
                      <><Loader2 className="h-5 w-5 animate-spin mr-2" />Generating...</>
                    ) : (
                      <><Download className="h-5 w-5 mr-2" />Generate PDF</>
                    )}
                  </Button>
                </motion.div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Applicant Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-card border-primary/20">
              <CardHeader className="border-b border-border/50 pb-6">
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Applicant Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-10">
                {renderFieldGroup([
                  { name: "applicant_first_name", label: "Full Name / Imię i nazwisko" },
                  { name: "applicant_last_name", label: "Last Name / Nazwisko" },
                  { name: "applicant_dob", label: "Date of Birth / Data urodzenia", type: "date" },
                  { name: "applicant_pob", label: "Place of Birth / Miejsce urodzenia" },
                ])}
              </CardContent>
            </Card>
          </motion.div>

          {/* Spouse Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="glass-card border-primary/20">
              <CardHeader className="border-b border-border/50 pb-6">
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Applicant's Spouse
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-10">
                {renderFieldGroup([
                  { name: "spouse_first_name", label: "Spouse Full Name / Imię i nazwisko małżonka" },
                  { name: "spouse_maiden_name", label: "Spouse Maiden Name / Nazwisko panieńskie" },
                  { name: "date_of_marriage", label: "Date of Marriage / Data zawarcia związku małżeńskiego", type: "date" },
                  { name: "place_of_marriage", label: "Place of Marriage / Miejsce zawarcia związku" },
                ])}
              </CardContent>
            </Card>
          </motion.div>

          {/* Children Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass-card border-primary/20">
              <CardHeader className="border-b border-border/50 pb-6">
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Children (up to 3)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-10">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="p-6 border-2 border-border/50 rounded-xl bg-card/30 backdrop-blur space-y-6">
                    <h3 className="text-xl font-semibold text-foreground">Child {num}</h3>
                    {renderFieldGroup([
                      { name: `child_${num}_first_name`, label: `Full Name / Imię i nazwisko` },
                      { name: `child_${num}_dob`, label: `Date of Birth / Data urodzenia`, type: "date" },
                      { name: `child_${num}_pob`, label: `Place of Birth / Miejsce urodzenia` },
                    ])}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Polish Parent Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="glass-card border-primary/20">
              <CardHeader className="border-b border-border/50 pb-6">
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Polish Parent
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-10">
                {renderFieldGroup([
                  { name: formData.ancestry_line === 'father' ? 'father_first_name' : 'mother_first_name', label: "Full Name / Imię i nazwisko" },
                  { name: formData.ancestry_line === 'father' ? 'father_dob' : 'mother_dob', label: "Date of Birth / Data urodzenia", type: "date" },
                  { name: formData.ancestry_line === 'father' ? 'father_pob' : 'mother_pob', label: "Place of Birth / Miejsce urodzenia" },
                  { name: "father_mother_marriage_date", label: "Date of Marriage / Data małżeństwa", type: "date" },
                  { name: "father_mother_marriage_place", label: "Place of Marriage / Miejsce małżeństwa" },
                  { name: formData.ancestry_line === 'father' ? 'father_date_of_emigration' : 'mother_date_of_emigration', label: "Date of Emigration / Data emigracji", type: "date" },
                  { name: formData.ancestry_line === 'father' ? 'father_date_of_naturalization' : 'mother_date_of_naturalization', label: "Date of Naturalization / Data naturalizacji", type: "date" },
                ])}
              </CardContent>
            </Card>
          </motion.div>

          {/* Polish Grandparent Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="glass-card border-primary/20">
              <CardHeader className="border-b border-border/50 pb-6">
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Polish Grandparent
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-10">
                {renderFieldGroup([
                  { 
                    name: formData.ancestry_line === 'pgf' ? 'pgf_first_name' :
                          formData.ancestry_line === 'pgm' ? 'pgm_first_name' :
                          formData.ancestry_line === 'mgf' ? 'mgf_first_name' :
                          'mgm_first_name', 
                    label: "Full Name / Imię i nazwisko" 
                  },
                  { 
                    name: formData.ancestry_line === 'pgf' ? 'pgf_dob' :
                          formData.ancestry_line === 'pgm' ? 'pgm_dob' :
                          formData.ancestry_line === 'mgf' ? 'mgf_dob' :
                          'mgm_dob', 
                    label: "Date of Birth / Data urodzenia", 
                    type: "date" 
                  },
                  { 
                    name: formData.ancestry_line === 'pgf' ? 'pgf_pob' :
                          formData.ancestry_line === 'pgm' ? 'pgm_pob' :
                          formData.ancestry_line === 'mgf' ? 'mgf_pob' :
                          'mgm_pob', 
                    label: "Place of Birth / Miejsce urodzenia" 
                  },
                ])}
              </CardContent>
            </Card>
          </motion.div>

          {/* Great-Grandparents Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="glass-card border-primary/20">
              <CardHeader className="border-b border-border/50 pb-6">
                <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Great-Grandparents
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10 space-y-10">
                <div className="space-y-8">
                  <div className="p-6 border-2 border-border/50 rounded-xl bg-card/30 backdrop-blur space-y-6">
                    <h3 className="text-xl font-semibold text-foreground">Great-Grandfather / Pradziadek</h3>
                    {renderFieldGroup([
                      { name: "pggf_first_name", label: "Full Name / Imię i nazwisko" },
                      { name: "pggf_dob", label: "Date of Birth / Data urodzenia", type: "date" },
                      { name: "pggf_pob", label: "Place of Birth / Miejsce urodzenia" },
                    ])}
                  </div>

                  <div className="p-6 border-2 border-border/50 rounded-xl bg-card/30 backdrop-blur space-y-6">
                    <h3 className="text-xl font-semibold text-foreground">Great-Grandmother / Prababcia</h3>
                    {renderFieldGroup([
                      { name: "pggm_first_name", label: "Full Name / Imię i nazwisko" },
                      { name: "pggm_maiden_name", label: "Maiden Name / Nazwisko panieńskie" },
                      { name: "pggm_dob", label: "Date of Birth / Data urodzenia", type: "date" },
                      { name: "pggm_pob", label: "Place of Birth / Miejsce urodzenia" },
                    ])}
                  </div>

                  {renderFieldGroup([
                    { name: "pggf_pggm_marriage_date", label: "Date of Marriage / Data małżeństwa", type: "date" },
                    { name: "pggf_pggm_marriage_place", label: "Place of Marriage / Miejsce małżeństwa" },
                  ])}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}