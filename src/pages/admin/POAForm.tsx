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

export default function POAForm() {
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
              <CardTitle className="text-3xl font-bold">Power of Attorney (POA) Forms</CardTitle>
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
          <Tabs defaultValue="adult" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="adult">Adult POA</TabsTrigger>
              <TabsTrigger value="minor">Minor POA</TabsTrigger>
              <TabsTrigger value="spouses">Spouses POA</TabsTrigger>
            </TabsList>

            {/* Adult POA */}
            <TabsContent value="adult" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Adult Power of Attorney</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Applicant Name</Label>
                    <Input
                      value={`${formData.applicant_first_name || ''} ${formData.applicant_last_name || ''}`.trim()}
                      onChange={(e) => {
                        const names = e.target.value.split(' ');
                        handleInputChange('applicant_first_name', names[0] || '');
                        handleInputChange('applicant_last_name', names.slice(1).join(' ') || '');
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Passport/ID Number</Label>
                    <Input
                      value={formData.applicant_passport_number || ''}
                      onChange={(e) => handleInputChange('applicant_passport_number', e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => handleGeneratePDF('poa-adult', 'Adult POA')} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating...</>
                  ) : (
                    <><Download className="h-4 w-4 mr-2" />Generate Adult POA</>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Minor POA */}
            <TabsContent value="minor" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Minor Power of Attorney</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Parent Name</Label>
                    <Input
                      value={`${formData.applicant_first_name || ''} ${formData.applicant_last_name || ''}`.trim()}
                      onChange={(e) => {
                        const names = e.target.value.split(' ');
                        handleInputChange('applicant_first_name', names[0] || '');
                        handleInputChange('applicant_last_name', names.slice(1).join(' ') || '');
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parent Passport/ID Number</Label>
                    <Input
                      value={formData.applicant_passport_number || ''}
                      onChange={(e) => handleInputChange('applicant_passport_number', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Minor Child Name</Label>
                    <Input
                      value={`${formData.child_1_first_name || ''} ${formData.child_1_last_name || ''}`.trim()}
                      onChange={(e) => {
                        const names = e.target.value.split(' ');
                        handleInputChange('child_1_first_name', names[0] || '');
                        handleInputChange('child_1_last_name', names.slice(1).join(' ') || '');
                      }}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => handleGeneratePDF('poa-minor', 'Minor POA')} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating...</>
                  ) : (
                    <><Download className="h-4 w-4 mr-2" />Generate Minor POA</>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Spouses POA */}
            <TabsContent value="spouses" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Spouses Power of Attorney</h3>
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
                    <Label>Applicant Passport/ID Number</Label>
                    <Input
                      value={formData.applicant_passport_number || ''}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Spouse Name</Label>
                    <Input
                      value={`${formData.spouse_first_name || ''} ${formData.spouse_last_name || ''}`.trim()}
                      onChange={(e) => {
                        const names = e.target.value.split(' ');
                        handleInputChange('spouse_first_name', names[0] || '');
                        handleInputChange('spouse_last_name', names.slice(1).join(' ') || '');
                      }}
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => handleGeneratePDF('poa-spouses', 'Spouses POA')} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating...</>
                  ) : (
                    <><Download className="h-4 w-4 mr-2" />Generate Spouses POA</>
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
