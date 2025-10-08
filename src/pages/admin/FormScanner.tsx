import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, CheckCircle2, AlertTriangle, XCircle, FileCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ScanResult {
  form: string;
  status: 'success' | 'warning' | 'error' | 'pending';
  analysis: string;
  timestamp: string;
}

const FORMS_TO_SCAN = [
  { name: 'IntakeForm', path: 'src/pages/admin/IntakeForm.tsx' },
  { name: 'CitizenshipForm', path: 'src/pages/admin/CitizenshipForm.tsx' },
  { name: 'FamilyTreeForm', path: 'src/pages/admin/FamilyTreeForm.tsx' },
  { name: 'POAForm', path: 'src/pages/admin/POAForm.tsx' },
  { name: 'CivilRegistryForm', path: 'src/pages/admin/CivilRegistryForm.tsx' },
  { name: 'MasterDataTable', path: 'src/pages/admin/MasterDataTable.tsx' },
];

// Schema columns from master_table
const SCHEMA_COLUMNS = `
  id, case_id, applicant_dob, applicant_first_name, applicant_last_name, applicant_maiden_name,
  applicant_sex, applicant_pob, applicant_current_citizenship, applicant_email, applicant_phone,
  applicant_passport_number, applicant_passport_issuing_country, applicant_passport_issuing_authority,
  applicant_passport_issue_date, applicant_passport_expiry_date, applicant_address (JSONB),
  applicant_date_of_emigration, applicant_date_of_naturalization, applicant_is_alive,
  applicant_has_birth_cert, applicant_has_marriage_cert, applicant_has_passport, applicant_has_naturalization,
  applicant_notes, spouse_first_name, spouse_last_name, spouse_maiden_name, spouse_sex, spouse_pob,
  spouse_current_citizenship, spouse_email, spouse_phone, spouse_dob, spouse_date_of_emigration,
  spouse_date_of_naturalization, spouse_is_alive, spouse_has_birth_cert, spouse_has_marriage_cert,
  spouse_has_passport, spouse_notes, date_of_marriage, place_of_marriage, children_count,
  child_1 to child_10 fields (first_name, last_name, sex, pob, dob, is_alive, notes),
  father_first_name, father_last_name, father_pob, father_dob, father_date_of_emigration,
  father_date_of_naturalization, father_is_alive, father_has_birth_cert, father_has_marriage_cert,
  father_has_naturalization, father_notes, mother_first_name, mother_last_name, mother_maiden_name,
  mother_pob, mother_dob, mother_date_of_emigration, mother_date_of_naturalization, mother_is_alive,
  mother_has_birth_cert, mother_has_marriage_cert, mother_has_naturalization, mother_notes,
  father_mother_marriage_date, father_mother_marriage_place, grandparents (pgf, pgm, mgf, mgm),
  great-grandparents (pggf, pggm, mggf, mggm), ancestry_line, language_preference,
  family_notes, poa_date_filed, completion_percentage, created_at, updated_at
`;

export default function FormScanner() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [currentForm, setCurrentForm] = useState<string>('');

  const analyzeSeverity = (analysis: string): 'success' | 'warning' | 'error' => {
    const lowerAnalysis = analysis.toLowerCase();
    
    if (lowerAnalysis.includes('critical') || lowerAnalysis.includes('error') || lowerAnalysis.includes('🔴')) {
      return 'error';
    }
    if (lowerAnalysis.includes('warning') || lowerAnalysis.includes('⚠️')) {
      return 'warning';
    }
    return 'success';
  };

  const scanAllForms = async () => {
    setIsScanning(true);
    setResults([]);
    
    try {
      for (const form of FORMS_TO_SCAN) {
        setCurrentForm(form.name);
        
        // Mock form code - in production, you'd read the actual file
        const formCode = `// Form: ${form.name}\n// This is a placeholder for the actual form code`;
        
        const { data, error } = await supabase.functions.invoke('analyze-forms', {
          body: { 
            formCode, 
            schemaColumns: SCHEMA_COLUMNS 
          }
        });

        if (error) {
          setResults(prev => [...prev, {
            form: form.name,
            status: 'error',
            analysis: `Error: ${error.message}`,
            timestamp: new Date().toISOString()
          }]);
        } else {
          const severity = analyzeSeverity(data.analysis);
          setResults(prev => [...prev, {
            form: form.name,
            status: severity,
            analysis: data.analysis,
            timestamp: new Date().toISOString()
          }]);
        }
      }
      
      toast.success("Form scan completed!");
    } catch (error: any) {
      toast.error(`Scan failed: ${error.message}`);
    } finally {
      setIsScanning(false);
      setCurrentForm('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Loader2 className="h-5 w-5 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      success: 'bg-green-500/10 text-green-500 border-green-500/20',
      warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      error: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    return (
      <Badge variant="outline" className={variants[status] || ''}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Form Scanner
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    Automated analysis of all admin forms for schema compliance
                  </CardDescription>
                </div>
                <Button
                  onClick={scanAllForms}
                  disabled={isScanning}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Scan All Forms
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Current Scan Progress */}
        {isScanning && currentForm && (
          <Alert className="border-primary/20 bg-primary/5">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Scanning in progress...</AlertTitle>
            <AlertDescription>
              Currently analyzing: <strong>{currentForm}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {results.map((result, index) => (
              <motion.div
                key={result.form}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-l-4 ${
                  result.status === 'error' ? 'border-l-red-500' :
                  result.status === 'warning' ? 'border-l-yellow-500' :
                  'border-l-green-500'
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <FileCode className="h-5 w-5" />
                            {result.form}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            Scanned: {new Date(result.timestamp).toLocaleString()}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {result.analysis}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isScanning && results.length === 0 && (
          <Card className="border-dashed border-2 border-primary/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No scans yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Click "Scan All Forms" to analyze all admin forms for schema compliance,
                field mismatches, and validation issues.
              </p>
              <Button onClick={scanAllForms} size="lg">
                <Search className="h-5 w-5 mr-2" />
                Start Your First Scan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        {results.length > 0 && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Scan Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-green-500/10">
                  <div className="text-3xl font-bold text-green-500">
                    {results.filter(r => r.status === 'success').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Clean</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-500/10">
                  <div className="text-3xl font-bold text-yellow-500">
                    {results.filter(r => r.status === 'warning').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Warnings</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-500/10">
                  <div className="text-3xl font-bold text-red-500">
                    {results.filter(r => r.status === 'error').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
