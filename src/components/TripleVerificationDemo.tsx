import { runTripleVerification } from "@/utils/tripleVerification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export function TripleVerificationDemo() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const phaseAAnalysis = `
# PHASE A: DEEP ANALYSIS - Forms Field Mapping & Data Population

## FINDINGS:

1. **Architecture Duplication (MAJOR)**:
   - Three separate PDF mapping systems exist
   - Located in: fieldMappings.ts, pdfMappings/poaAdult.ts, edge function mappings
   - Risk: Updates must be made in multiple places, causing drift

2. **Field Naming Confusion (MAJOR)**:
   - Multiple conflicting fields: applicant_has_minor_children, applicant_number_of_children, minor_children_count
   - Database showed NULL values despite minor_children_count being set
   - Causing POA generation failures

3. **Data Flow Breaks (MEDIUM)**:
   - Inconsistent field names across INTAKE → master_table → POA Form → Edge Function → PDF
   - NULL sync issues confirmed at master_table → POA generation

4. **Sanitizer Bug (MEDIUM)**:
   - masterDataSanitizer.ts may still exclude newly-added columns
   - Could cause data loss after save

5. **Edge Function Contract (CRITICAL)**:
   - Frontend expects 'pdfUrl' field
   - Edge function returns 'url' field
   - Causing preview dialog not to open

## PROPOSED SOLUTIONS:

1. Implemented auto-sync logic in useFormManager hook
2. Fixed frontend field name from 'pdfUrl' to 'url'
3. Updated master_table with proper values for test case
`;

  const context = `
This is a Polish citizenship application system with 6 forms:
- IntakeForm, POAForm, CitizenshipForm, FamilyTreeForm, CivilRegistryForm, MasterDataTable
- POA generation uses edge function 'fill-pdf' which fills PDF templates
- Data flows from forms → master_table → edge function → PDF generation
- User reported: "2 POA(s) failed" and "no preview dialog"
`;

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const verificationResult = await runTripleVerification(phaseAAnalysis, context);
      setResult(verificationResult);
    } catch (error: any) {
      console.error('Verification failed:', error);
      alert('Verification failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>A→B→EX Protocol: Triple-Model Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Verify Phase A analysis using GPT-5 and Gemini 2.5 Pro
          </p>
          
          <Button 
            onClick={handleVerify} 
            disabled={isLoading}
            size="lg"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run Triple Verification
          </Button>

          {result && (
            <div className="space-y-6 mt-6">
              {/* Verdict */}
              <Card className={result.verdict === 'PROCEED_TO_EX' ? 'border-green-500' : 'border-yellow-500'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {result.verdict === 'PROCEED_TO_EX' ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    )}
                    Verdict: {result.verdict}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Average Score:</strong> {result.consensus.average_score}/100
                    </div>
                    <div>
                      <strong>Agreement Level:</strong> {result.consensus.agreement_level}
                    </div>
                    <div>
                      <strong>Unanimous Approval:</strong> {result.consensus.unanimous_approval ? '✅ Yes' : '❌ No'}
                    </div>
                    <div>
                      <strong>All Scores {'>'} 80:</strong> {result.consensus.all_scores_above_80 ? '✅ Yes' : '❌ No'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* GPT-5 Results */}
              <Card>
                <CardHeader>
                  <CardTitle>GPT-5 Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <strong>Score:</strong>
                      <span className="text-2xl font-bold">{result.gpt5.overall_score}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Recommendation:</strong>
                      <span className={`font-bold ${
                        result.gpt5.recommendation === 'approve' ? 'text-green-600' :
                        result.gpt5.recommendation === 'revise' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {result.gpt5.recommendation.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <strong>Reasoning:</strong>
                      <p className="text-sm text-muted-foreground mt-2">{result.gpt5.reasoning}</p>
                    </div>
                    {result.gpt5.missed_issues?.length > 0 && (
                      <div>
                        <strong>Missed Issues:</strong>
                        <ul className="list-disc list-inside text-sm mt-2">
                          {result.gpt5.missed_issues.map((issue: string, i: number) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Gemini Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Gemini 2.5 Pro Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <strong>Score:</strong>
                      <span className="text-2xl font-bold">{result.gemini.overall_score}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Recommendation:</strong>
                      <span className={`font-bold ${
                        result.gemini.recommendation === 'approve' ? 'text-green-600' :
                        result.gemini.recommendation === 'revise' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {result.gemini.recommendation.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <strong>Reasoning:</strong>
                      <p className="text-sm text-muted-foreground mt-2">{result.gemini.reasoning}</p>
                    </div>
                    {result.gemini.missed_issues?.length > 0 && (
                      <div>
                        <strong>Missed Issues:</strong>
                        <ul className="list-disc list-inside text-sm mt-2">
                          {result.gemini.missed_issues.map((issue: string, i: number) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
