import { useParams } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, Save, Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function CivilRegistryForm() {
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

  const handleGeneratePDF = async (formType: string, label: string) => {
    try {
      setIsGenerating(true);
      toast.loading(`Generating ${label}...`);

      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType: formType },
      });

      if (error) throw error;

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formType}-${caseId}.pdf`;
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
      <div className="space-y-3">
        <Label className="text-base font-medium">{label}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateValue && "text-muted-foreground"
              )}
            >
              {dateValue ? format(dateValue, "dd/MM/yyyy") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={(date) => handleInputChange(name, date ? format(date, "yyyy-MM-dd") : "")}
              disabled={(date) => date > new Date("2030-12-31") || date < new Date("1900-01-01")}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-bold">Civil Registry Applications</CardTitle>
            </div>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />Save</>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs defaultValue="registration" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="registration">Foreign Act Registration</TabsTrigger>
              <TabsTrigger value="supplementation">Birth Certificate Supplementation</TabsTrigger>
            </TabsList>

            {/* Registration Form */}
            <TabsContent value="registration" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Foreign Act Registration Application</h3>
                <p className="text-sm text-muted-foreground">
                  Application for registering a foreign civil status document (birth, marriage, etc.) in Polish civil registry
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Applicant Name</Label>
                    <Input
                      value={`${formData.applicant_first_name || ''} ${formData.applicant_last_name || ''}`.trim()}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  {renderDateField('applicant_dob', 'Event Date')}
                  <div className="space-y-2">
                    <Label>Event Location</Label>
                    <Input
                      value={formData.applicant_pob || ''}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => handleGeneratePDF('registration', 'Registration Application')} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating...</>
                  ) : (
                    <><Download className="h-4 w-4 mr-2" />Generate Registration Form</>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Supplementation Form */}
            <TabsContent value="supplementation" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Birth Certificate Supplementation</h3>
                <p className="text-sm text-muted-foreground">
                  Application to supplement/complete Polish birth certificate with missing parental information
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Applicant Name</Label>
                    <Input
                      value={`${formData.applicant_first_name || ''} ${formData.applicant_last_name || ''}`.trim()}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Father's Surname</Label>
                    <Input
                      value={formData.father_last_name || ''}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mother's Maiden Name</Label>
                    <Input
                      value={formData.mother_maiden_name || ''}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => handleGeneratePDF('uzupelnienie', 'Supplementation Form')} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating...</>
                  ) : (
                    <><Download className="h-4 w-4 mr-2" />Generate Supplementation Form</>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
