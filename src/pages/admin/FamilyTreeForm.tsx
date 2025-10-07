import { useParams } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, Save, Download, Users } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
              <Users className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-bold">Family Tree Form</CardTitle>
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
        
        <CardContent className="p-6 space-y-8">
          {/* Applicant Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2">Applicant Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={`${formData.applicant_first_name || ''} ${formData.applicant_last_name || ''}`.trim()}
                  onChange={(e) => {
                    const names = e.target.value.split(' ');
                    handleInputChange('applicant_first_name', names[0] || '');
                    handleInputChange('applicant_last_name', names.slice(1).join(' ') || '');
                  }}
                  placeholder="Full name"
                />
              </div>
              {renderDateField('applicant_dob', 'Date of Birth')}
              <div className="space-y-2">
                <Label>Place of Birth</Label>
                <Input
                  value={formData.applicant_pob || ''}
                  onChange={(e) => handleInputChange('applicant_pob', e.target.value)}
                />
              </div>
              {renderDateField('date_of_marriage', 'Date of Marriage')}
              <div className="space-y-2">
                <Label>Place of Marriage</Label>
                <Input
                  value={formData.place_of_marriage || ''}
                  onChange={(e) => handleInputChange('place_of_marriage', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Spouse Full Name & Maiden Name</Label>
                <Input
                  value={`${formData.spouse_first_name || ''} ${formData.spouse_last_name || ''} ${formData.spouse_maiden_name ? `(${formData.spouse_maiden_name})` : ''}`.trim()}
                  onChange={(e) => {
                    const parts = e.target.value.split('(');
                    const names = parts[0].trim().split(' ');
                    handleInputChange('spouse_first_name', names[0] || '');
                    handleInputChange('spouse_last_name', names.slice(1).join(' ') || '');
                    if (parts[1]) {
                      handleInputChange('spouse_maiden_name', parts[1].replace(')', '').trim());
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Minor Children Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2">Minor Children (up to 3)</h3>
            {[1, 2, 3].map((num) => (
              <div key={num} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Child {num} Full Name</Label>
                  <Input
                    value={`${formData[`child_${num}_first_name`] || ''} ${formData[`child_${num}_last_name`] || ''}`.trim()}
                    onChange={(e) => {
                      const names = e.target.value.split(' ');
                      handleInputChange(`child_${num}_first_name`, names[0] || '');
                      handleInputChange(`child_${num}_last_name`, names.slice(1).join(' ') || '');
                    }}
                  />
                </div>
                {renderDateField(`child_${num}_dob`, `Date of Birth`)}
                <div className="space-y-2">
                  <Label>Place of Birth</Label>
                  <Input
                    value={formData[`child_${num}_pob`] || ''}
                    onChange={(e) => handleInputChange(`child_${num}_pob`, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Polish Parent Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2">Polish Parent</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.ancestry_line === 'father' 
                    ? `${formData.father_first_name || ''} ${formData.father_last_name || ''}`.trim()
                    : `${formData.mother_first_name || ''} ${formData.mother_last_name || ''}`.trim()
                  }
                  readOnly
                  className="bg-muted"
                />
              </div>
              {renderDateField(formData.ancestry_line === 'father' ? 'father_dob' : 'mother_dob', 'Date of Birth')}
              <div className="space-y-2">
                <Label>Place of Birth</Label>
                <Input
                  value={formData.ancestry_line === 'father' ? formData.father_pob || '' : formData.mother_pob || ''}
                  readOnly
                  className="bg-muted"
                />
              </div>
              {renderDateField('father_mother_marriage_date', 'Date of Marriage')}
              <div className="space-y-2">
                <Label>Place of Marriage</Label>
                <Input
                  value={formData.father_mother_marriage_place || ''}
                  onChange={(e) => handleInputChange('father_mother_marriage_place', e.target.value)}
                />
              </div>
              {renderDateField(formData.ancestry_line === 'father' ? 'father_date_of_emigration' : 'mother_date_of_emigration', 'Date of Emigration')}
              {renderDateField(formData.ancestry_line === 'father' ? 'father_date_of_naturalization' : 'mother_date_of_naturalization', 'Date of Naturalization')}
            </div>
          </div>

          {/* Polish Grandparent Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2">Polish Grandparent</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={
                    formData.ancestry_line === 'pgf' ? `${formData.pgf_first_name || ''} ${formData.pgf_last_name || ''}`.trim() :
                    formData.ancestry_line === 'pgm' ? `${formData.pgm_first_name || ''} ${formData.pgm_last_name || ''}`.trim() :
                    formData.ancestry_line === 'mgf' ? `${formData.mgf_first_name || ''} ${formData.mgf_last_name || ''}`.trim() :
                    formData.ancestry_line === 'mgm' ? `${formData.mgm_first_name || ''} ${formData.mgm_last_name || ''}`.trim() : ''
                  }
                  readOnly
                  className="bg-muted"
                />
              </div>
              {renderDateField(
                formData.ancestry_line === 'pgf' ? 'pgf_dob' :
                formData.ancestry_line === 'pgm' ? 'pgm_dob' :
                formData.ancestry_line === 'mgf' ? 'mgf_dob' :
                formData.ancestry_line === 'mgm' ? 'mgm_dob' : 'pgf_dob',
                'Date of Birth'
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
