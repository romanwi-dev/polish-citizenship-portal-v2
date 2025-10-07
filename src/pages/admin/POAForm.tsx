import { useParams } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, Save, Download, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { POAFormField } from "@/components/POAFormField";
import { poaFormConfigs } from "@/config/poaFormConfig";

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
    if (!caseId || caseId === ':id') {
      toast.error('Invalid case ID. Please navigate to this page from the cases list.');
      return;
    }

    try {
      setIsGenerating(true);
      toast.loading(`Generating ${label}...`);

      console.log('Generating PDF for case:', caseId, 'Type:', poaType);

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
      console.error('PDF Generation Error:', error);
    } finally {
      setIsGenerating(false);
    }
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

          {Object.entries(poaFormConfigs).map(([key, config]) => (
            <TabsContent key={key} value={key}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="glass-card border-primary/20">
                  <CardHeader className="border-b border-border/50 pb-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        {config.title}
                      </CardTitle>
                      <Button 
                        onClick={() => handleGeneratePDF(config.pdfType, config.title)} 
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
                  <CardContent className="p-6 md:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {config.fields.map((field, idx) => (
                        <POAFormField
                          key={field.name}
                          name={field.name}
                          label={field.label}
                          type={field.type}
                          value={formData[field.name]}
                          onChange={(value) => handleInputChange(field.name, value)}
                          placeholder={field.placeholder}
                          delay={idx * 0.05}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
