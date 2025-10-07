import { useParams } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, Save, Download, FileText, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function POAForm() {
  const { id: caseId } = useParams();
  const { data: masterData, isLoading } = useMasterData(caseId);
  const updateMutation = useUpdateMasterData();
  const [formData, setFormData] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    if (masterData) {
      setFormData({
        ...masterData,
        poa_date_filed: masterData.poa_date_filed || today
      });
    } else {
      setFormData({ poa_date_filed: today });
    }
  }, [masterData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!caseId) return;
    updateMutation.mutate({ caseId, updates: formData });
  };

  const handleGeneratePDF = async (poaType: string, label: string) => {
    try {
      setIsGenerating(true);
      toast.loading(`Generating ${label}...`);

      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType: poaType },
      });

      if (error) throw error;

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${poaType}-${caseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success(`${label} generated successfully!`);
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
        <Label htmlFor={name} className="text-base font-medium text-foreground">
          {label}
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-14 justify-start text-left font-normal border-2 hover-glow bg-card/50 backdrop-blur",
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
                <Label htmlFor={field.name} className="text-base font-medium text-foreground">
                  {field.label}
                </Label>
                <Input
                  id={field.name}
                  type={field.type || "text"}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  placeholder={formData[field.name] ? "" : (field.placeholder || `Enter ${field.label.toLowerCase()}`)}
                  className="h-14 border-2 text-base hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur"
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
                    Power of Attorney Forms
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
                </motion.div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="adult" className="w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <TabsList className="grid w-full grid-cols-3 mb-10 p-2 glass-card h-auto gap-2">
              <TabsTrigger value="adult" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary transition-all duration-300 py-4 text-base font-heading font-bold">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent data-[state=active]:from-white data-[state=active]:to-white">
                  Adult POA
                </span>
              </TabsTrigger>
              <TabsTrigger value="minor" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary transition-all duration-300 py-4 text-base font-heading font-bold">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent data-[state=active]:from-white data-[state=active]:to-white">
                  Minor POA
                </span>
              </TabsTrigger>
              <TabsTrigger value="spouses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary transition-all duration-300 py-4 text-base font-heading font-bold">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent data-[state=active]:from-white data-[state=active]:to-white">
                  Spouses POA
                </span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Adult POA */}
          <TabsContent value="adult">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="glass-card border-primary/20">
                <CardHeader className="border-b border-border/50 pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      Adult Power of Attorney
                    </CardTitle>
                    <Button 
                      onClick={() => handleGeneratePDF('poa-adult', 'Adult POA')} 
                      disabled={isGenerating}
                      size="lg"
                      className="text-xl font-bold px-8 h-14 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    >
                      {isGenerating ? (
                        <><Loader2 className="h-5 w-5 animate-spin mr-2" />Generating...</>
                      ) : (
                        <><Download className="h-5 w-5 mr-2" />Generate PDF</>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 md:p-10 space-y-10">
                  <div>
                    <h3 className="text-2xl font-semibold mb-6 text-foreground">Document Information</h3>
                    {renderFieldGroup([
                      { name: "poa_date_filed", label: "Date Filed / Data złożenia", type: "date" },
                    ])}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-semibold mb-6 text-foreground">Applicant Information</h3>
                    {renderFieldGroup([
                      { name: "applicant_first_name", label: "Applicant First Name(s) / Imię" },
                      { name: "applicant_last_name", label: "Applicant Last Name / Nazwisko" },
                      { name: "applicant_passport_number", label: "ID Document Number / Nr dokumentu tożsamości" },
                    ])}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Minor POA */}
          <TabsContent value="minor">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="glass-card border-primary/20">
                <CardHeader className="border-b border-border/50 pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      Minor Power of Attorney
                    </CardTitle>
                    <Button 
                      onClick={() => handleGeneratePDF('poa-minor', 'Minor POA')} 
                      disabled={isGenerating}
                      size="lg"
                      className="text-xl font-bold px-8 h-14 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    >
                      {isGenerating ? (
                        <><Loader2 className="h-5 w-5 animate-spin mr-2" />Generating...</>
                      ) : (
                        <><Download className="h-5 w-5 mr-2" />Generate PDF</>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 md:p-10 space-y-10">
                  <div>
                    <h3 className="text-2xl font-semibold mb-6 text-foreground">Document Information</h3>
                    {renderFieldGroup([
                      { name: "poa_date_filed", label: "Date Filed / Data złożenia", type: "date" },
                    ])}
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold mb-6 text-foreground">Parent Information / Dane rodzica</h3>
                    {renderFieldGroup([
                      { name: "applicant_first_name", label: "Parent First Name(s) / Imię rodzica" },
                      { name: "applicant_last_name", label: "Parent Last Name / Nazwisko rodzica" },
                      { name: "applicant_passport_number", label: "Parent ID Document Number / Nr dokumentu tożsamości rodzica" },
                    ])}
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold mb-6 text-foreground">Minor Child Information / Dane małoletniego dziecka</h3>
                    {renderFieldGroup([
                      { name: "child_1_first_name", label: "Child First Name(s) / Imię dziecka" },
                      { name: "child_1_last_name", label: "Child Last Name / Nazwisko dziecka" },
                    ])}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Spouses POA */}
          <TabsContent value="spouses">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="glass-card border-primary/20">
                <CardHeader className="border-b border-border/50 pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      Spouses Power of Attorney
                    </CardTitle>
                    <Button 
                      onClick={() => handleGeneratePDF('poa-spouses', 'Spouses POA')} 
                      disabled={isGenerating}
                      size="lg"
                      className="text-xl font-bold px-8 h-14 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    >
                      {isGenerating ? (
                        <><Loader2 className="h-5 w-5 animate-spin mr-2" />Generating...</>
                      ) : (
                        <><Download className="h-5 w-5 mr-2" />Generate PDF</>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 md:p-10 space-y-10">
                  <div>
                    <h3 className="text-2xl font-semibold mb-6 text-foreground">Document Information</h3>
                    {renderFieldGroup([
                      { name: "poa_date_filed", label: "Date Filed / Data złożenia", type: "date" },
                    ])}
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold mb-6 text-foreground">Applicant Information</h3>
                    {renderFieldGroup([
                      { name: "applicant_first_name", label: "Applicant First Name(s)" },
                      { name: "applicant_last_name", label: "Applicant Last Name" },
                      { name: "applicant_sex", label: "Applicant Sex (Male/Female)" },
                      { name: "applicant_passport_number", label: "Applicant ID Document Number" },
                    ])}
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold mb-6 text-foreground">Spouse Information</h3>
                    {renderFieldGroup([
                      { name: "spouse_first_name", label: "Spouse First Name(s)" },
                      { name: "spouse_last_name", label: "Spouse Last Name" },
                    ])}
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold mb-6 text-foreground">Children Surnames</h3>
                    {renderFieldGroup([
                      { name: "child_1_last_name", label: "Child 1 Surname" },
                      { name: "child_2_last_name", label: "Child 2 Surname" },
                      { name: "child_3_last_name", label: "Child 3 Surname" },
                    ])}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}