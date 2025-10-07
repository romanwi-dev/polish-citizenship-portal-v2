import { useParams } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, Save, Download, FileCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function CitizenshipForm() {
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

  const handleSave = () => {
    if (!caseId) return;
    updateMutation.mutate({ caseId, updates: formData });
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      toast.loading("Generating Citizenship Application PDF...");

      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType: 'citizenship' },
      });

      if (error) throw error;

      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `citizenship-application-${caseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success("Citizenship Application PDF generated successfully!");
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
              <FileCheck className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-bold">Polish Citizenship Application (OBY)</CardTitle>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />Save</>
                )}
              </Button>
              <Button onClick={handleGeneratePDF} disabled={isGenerating} variant="secondary">
                {isGenerating ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating...</>
                ) : (
                  <><Download className="h-4 w-4 mr-2" />Generate PDF</>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="bg-muted/50 rounded-lg p-8 text-center space-y-4">
            <FileCheck className="h-16 w-16 mx-auto text-primary" />
            <h3 className="text-2xl font-semibold">Comprehensive 156-Field Application</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              This form contains all 156 fields required for the Polish Citizenship Application (OBY).
              All data is pulled from your Master Data table. Please ensure your Master Data is complete
              before generating this document.
            </p>
            <div className="pt-4">
              <h4 className="font-semibold mb-2">Form Sections Include:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 max-w-xl mx-auto">
                <li>✓ Applicant Personal Information (29 fields)</li>
                <li>✓ Father Information (8 fields)</li>
                <li>✓ Mother Information (9 fields)</li>
                <li>✓ All Grandparents Information (24 fields)</li>
                <li>✓ Spouse Information (8 fields)</li>
                <li>✓ Children Information (variable)</li>
                <li>✓ Application Details & Status (16 fields)</li>
                <li>✓ Additional required documentation</li>
              </ul>
            </div>
            <div className="pt-6">
              <p className="text-sm text-muted-foreground">
                Data source: <span className="font-mono text-xs">master_table</span> for case <span className="font-mono text-xs">{caseId}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
