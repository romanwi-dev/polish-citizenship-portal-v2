import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Brain,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  AlertCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIVerificationResultsProps {
  caseId: string;
}

export const AIVerificationResults = ({ caseId }: AIVerificationResultsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hacNotes, setHacNotes] = useState<{ [key: string]: string }>({});

  // Fetch verification results
  const { data: results, isLoading } = useQuery({
    queryKey: ['ai-verification-results', caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_verification_results')
        .select('*')
        .eq('case_id', caseId)
        .order('form_type', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  // HAC approval mutation
  const approvalMutation = useMutation({
    mutationFn: async ({ 
      resultId, 
      approved, 
      notes 
    }: { 
      resultId: string; 
      approved: boolean; 
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('ai_verification_results')
        .update({
          hac_approved: approved,
          hac_reviewed_at: new Date().toISOString(),
          hac_notes: notes || null
        })
        .eq('id', resultId);

      if (error) throw error;

      // Log HAC action
      const formType = results?.find(r => r.id === resultId)?.form_type;
      await supabase.from('hac_logs').insert({
        performed_by: (await supabase.auth.getUser()).data.user?.id || '',
        action_type: 'ai_verification_review',
        case_id: caseId,
        action_details: `${approved ? 'Approved' : 'Rejected'} AI verification for ${formType} form - hac_approved: ${approved}`
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ai-verification-results', caseId] });
      toast({
        title: variables.approved ? "Verification Approved" : "Verification Rejected",
        description: "HAC review recorded successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getFormTypeLabel = (formType: string) => {
    switch (formType) {
      case 'intake':
        return 'Intake Form';
      case 'oby':
        return 'OBY Citizenship Form';
      case 'master':
        return 'Master Data Table';
      default:
        return formType;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">Loading verification results...</div>
      </Card>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">No verification results yet. Run Stage 6 to verify forms.</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((result) => {
        const disagreements = (result.disagreements as any[]) || [];
        const hasDisagreements = disagreements.length > 0;
        const needsHacReview = !result.hac_approved && !result.hac_reviewed_at;

        return (
          <Card key={result.id} className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">{getFormTypeLabel(result.form_type)}</h3>
                  <p className="text-sm text-muted-foreground">
                    Verified on {new Date(result.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {result.hac_approved && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  HAC Approved
                </Badge>
              )}
              {needsHacReview && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Needs HAC Review
                </Badge>
              )}
            </div>

            {/* Consensus Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg border bg-card">
                <div className="text-sm text-muted-foreground mb-1">Consensus</div>
                <div className="flex items-center gap-2">
                  {result.consensus_valid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className="font-semibold">
                    {result.consensus_valid ? 'Valid' : 'Issues Found'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="text-sm text-muted-foreground mb-1">Avg Confidence</div>
                <div className="text-2xl font-bold">{result.consensus_confidence}%</div>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="text-sm text-muted-foreground mb-1">AI Agreement</div>
                <div className="flex items-center gap-2">
                  {hasDisagreements ? (
                    <>
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold text-yellow-700">
                        {disagreements.length} conflicts
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="font-semibold text-green-700">Full agreement</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Disagreements Alert */}
            {hasDisagreements && (
              <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-900 mb-2">AI Disagreements Detected</h4>
                    <div className="space-y-2">
                      {disagreements.map((disagreement: any, idx: number) => (
                        <div key={idx} className="text-sm text-yellow-800">
                          <strong>{disagreement.type}:</strong> {disagreement.description}
                          <div className="mt-1 text-xs">
                            OpenAI: {JSON.stringify(disagreement.openai)} | 
                            Gemini: {JSON.stringify(disagreement.gemini)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Side-by-Side AI Results */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* OpenAI Results */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">OpenAI GPT-5-nano</Badge>
                  <span className="text-sm font-medium">
                    {result.openai_confidence}% confidence
                  </span>
                </div>
                
                {(() => {
                  const openaiIssues = (result.openai_issues as any[]) || [];
                  const openaiSuggestions = (result.openai_suggestions as any[]) || [];
                  
                  return (
                    <>
                      {openaiIssues.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-semibold">Issues ({openaiIssues.length})</h5>
                          {openaiIssues.slice(0, 3).map((issue: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              {getSeverityIcon(issue.severity)}
                              <div>
                                <strong>{issue.field}:</strong> {issue.message}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {openaiSuggestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <h5 className="text-sm font-semibold mb-2">Suggestions</h5>
                          <ul className="text-sm space-y-1 list-disc list-inside">
                            {openaiSuggestions.slice(0, 2).map((suggestion: string, idx: number) => (
                              <li key={idx} className="text-muted-foreground">{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Gemini Results */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">Google Gemini 2.5</Badge>
                  <span className="text-sm font-medium">
                    {result.gemini_confidence}% confidence
                  </span>
                </div>
                
                {(() => {
                  const geminiIssues = (result.gemini_issues as any[]) || [];
                  const geminiSuggestions = (result.gemini_suggestions as any[]) || [];
                  
                  return (
                    <>
                      {geminiIssues.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-semibold">Issues ({geminiIssues.length})</h5>
                          {geminiIssues.slice(0, 3).map((issue: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              {getSeverityIcon(issue.severity)}
                              <div>
                                <strong>{issue.field}:</strong> {issue.message}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {geminiSuggestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <h5 className="text-sm font-semibold mb-2">Suggestions</h5>
                          <ul className="text-sm space-y-1 list-disc list-inside">
                            {geminiSuggestions.slice(0, 2).map((suggestion: string, idx: number) => (
                              <li key={idx} className="text-muted-foreground">{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* HAC Review Section */}
            {needsHacReview && (
              <div className="p-4 rounded-lg bg-muted space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">HAC Review Required</h4>
                </div>
                
                <Textarea
                  placeholder="Add review notes (optional)..."
                  value={hacNotes[result.id] || ''}
                  onChange={(e) => setHacNotes({ ...hacNotes, [result.id]: e.target.value })}
                  className="min-h-[80px]"
                />

                <div className="flex gap-2">
                  <Button
                    onClick={() => approvalMutation.mutate({ 
                      resultId: result.id, 
                      approved: true,
                      notes: hacNotes[result.id]
                    })}
                    disabled={approvalMutation.isPending}
                    className="flex-1"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Approve Verification
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => approvalMutation.mutate({ 
                      resultId: result.id, 
                      approved: false,
                      notes: hacNotes[result.id]
                    })}
                    disabled={approvalMutation.isPending}
                    className="flex-1"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Reject & Flag for Manual Review
                  </Button>
                </div>
              </div>
            )}

            {/* HAC Review History */}
            {result.hac_reviewed_at && (
              <div className="mt-4 p-4 rounded-lg bg-muted">
                <div className="text-sm text-muted-foreground">
                  Reviewed on {new Date(result.hac_reviewed_at).toLocaleString()}
                </div>
                {result.hac_notes && (
                  <p className="mt-2 text-sm">
                    <strong>Notes:</strong> {result.hac_notes}
                  </p>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};