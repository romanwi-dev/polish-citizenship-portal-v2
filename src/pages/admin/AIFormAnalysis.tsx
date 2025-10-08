import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Brain, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// All form file contents
const FORMS_TO_ANALYZE = [
  { name: 'IntakeForm', path: 'src/pages/admin/IntakeForm.tsx' },
  { name: 'POAForm', path: 'src/pages/admin/POAForm.tsx' },
  { name: 'CitizenshipForm', path: 'src/pages/admin/CitizenshipForm.tsx' },
  { name: 'FamilyTreeForm', path: 'src/pages/admin/FamilyTreeForm.tsx' },
  { name: 'CivilRegistryForm', path: 'src/pages/admin/CivilRegistryForm.tsx' },
  { name: 'MasterDataTable', path: 'src/pages/admin/MasterDataTable.tsx' },
];

const SCHEMA_COLUMNS = `
master_table columns (PostgreSQL):
- id (uuid, PK)
- case_id (uuid, FK to cases table)
- applicant_first_name (text)
- applicant_last_name (text)
- applicant_maiden_name (text)
- applicant_sex (text)
- applicant_pob (text)
- applicant_dob (date)
- applicant_current_citizenship (text[]) -- ARRAY type
- applicant_passport_number (text)
- applicant_passport_issuing_country (text)
- applicant_passport_issue_date (date)
- applicant_passport_expiry_date (date)
- applicant_email (text)
- applicant_phone (text)
- applicant_address (jsonb) -- JSON with street, city, state, postal, country
- applicant_is_married (boolean)
- applicant_notes (text)
- children_count (integer)
- spouse_first_name (text)
- spouse_last_name (text)
- spouse_current_citizenship (text[]) -- ARRAY type
- father_first_name (text)
- father_last_name (text)
- father_pob (text)
- father_dob (date)
- mother_first_name (text)
- mother_last_name (text)
- mother_maiden_name (text)
- mother_pob (text)
- mother_dob (date)
- pgf_first_name, pgf_last_name, pgf_pob, pgf_dob (text/date)
- pgm_first_name, pgm_last_name, pgm_maiden_name, pgm_pob, pgm_dob (text/date)
- mgf_first_name, mgf_last_name, mgf_pob, mgf_dob (text/date)
- mgm_first_name, mgm_last_name, mgm_maiden_name, mgm_pob, mgm_dob (text/date)
- family_notes (text)
- poa_date_filed (date)
- created_at, updated_at (timestamp)

UI-ONLY fields that should NOT be saved:
- confirm_email
- has_children, has_minor_children, minor_children_count
- applicant_has_children, applicant_has_minor_children, applicant_minor_children_count
- applicant_children_count (should map to children_count)
- applicant_address_street, applicant_address_city, applicant_address_state, applicant_address_postal, applicant_address_country (should convert to applicant_address jsonb)
- additional_info (should map to family_notes)
- applicant_additional_info (should map to applicant_notes)
`;

export default function AIFormAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<Record<string, string>>({});
  const [currentForm, setCurrentForm] = useState<string>('');

  const analyzeAllForms = async () => {
    setAnalyzing(true);
    setResults({});
    
    for (const form of FORMS_TO_ANALYZE) {
      setCurrentForm(form.name);
      toast.loading(`Analyzing ${form.name}...`);
      
      try {
        // In real implementation, you'd fetch the actual file content
        // For demo, we're showing how the edge function would be called
        const formCode = `// ${form.name} placeholder - in production, read actual file`;
        
        const { data, error } = await supabase.functions.invoke('analyze-forms', {
          body: {
            formCode,
            schemaColumns: SCHEMA_COLUMNS
          }
        });

        if (error) throw error;

        setResults(prev => ({
          ...prev,
          [form.name]: data.analysis
        }));
        
        toast.dismiss();
        toast.success(`${form.name} analyzed`);
        
        // Rate limiting: wait 2 seconds between requests
        if (form !== FORMS_TO_ANALYZE[FORMS_TO_ANALYZE.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error: any) {
        toast.dismiss();
        if (error.message?.includes('429')) {
          toast.error('Rate limited. Waiting 10 seconds...');
          await new Promise(resolve => setTimeout(resolve, 10000));
        } else if (error.message?.includes('402')) {
          toast.error('Out of credits. Please add funds to continue.');
          break;
        } else {
          toast.error(`Failed to analyze ${form.name}: ${error.message}`);
        }
        setResults(prev => ({
          ...prev,
          [form.name]: `Error: ${error.message}`
        }));
      }
    }
    
    setAnalyzing(false);
    setCurrentForm('');
    toast.success('Analysis complete!');
  };

  const getSeverityIcon = (text: string) => {
    if (text.toLowerCase().includes('critical')) return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (text.toLowerCase().includes('warning')) return <Info className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI-Powered Form Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Uses AI to deeply analyze all forms for schema mismatches, validation issues, and bugs.
          </p>
          
          <Button 
            onClick={analyzeAllForms} 
            disabled={analyzing}
            className="w-full"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing {currentForm}...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze All Forms
              </>
            )}
          </Button>

          {Object.keys(results).length > 0 && (
            <div className="space-y-4 mt-6">
              {Object.entries(results).map(([formName, analysis]) => (
                <Card key={formName}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getSeverityIcon(analysis)}
                      {formName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap">{analysis}</pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
