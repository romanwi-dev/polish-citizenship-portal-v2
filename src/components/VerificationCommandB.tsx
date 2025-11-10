import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Sparkles } from "lucide-react";
import { runTripleVerification, TripleVerificationResponse } from "@/utils/tripleVerification";
import { useToast } from "@/hooks/use-toast";

interface VerificationCommandBProps {
  defaultAnalysis?: string;
  defaultContext?: string;
}

export function VerificationCommandB({ defaultAnalysis = "", defaultContext = "" }: VerificationCommandBProps) {
  const [analysis, setAnalysis] = useState(defaultAnalysis);
  const [context, setContext] = useState(defaultContext);
  const [result, setResult] = useState<TripleVerificationResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!analysis.trim()) {
      toast({
        title: "Analysis Required",
        description: "Please provide Phase A analysis to verify",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      const verificationResult = await runTripleVerification(analysis, context);
      setResult(verificationResult);
      
      toast({
        title: verificationResult.verdict === 'PROCEED_TO_EX' ? "✅ Verification Passed" : "⚠️ Revisions Needed",
        description: `Average Score: ${verificationResult.consensus.average_score}/100`
      });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Phase B: Triple-Model Verification</CardTitle>
          </div>
          <CardDescription>
            Deep verification using GPT-5, Claude Sonnet 4.5, and Gemini 2.5 Pro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Phase A Analysis</label>
            <Textarea
              placeholder="Paste your Phase A analysis here..."
              value={analysis}
              onChange={(e) => setAnalysis(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Context (Optional)</label>
            <Textarea
              placeholder="Additional context about the project, issue, or domain..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <Button 
            onClick={handleVerify} 
            disabled={isVerifying || !analysis.trim()}
            size="lg"
            className="w-full"
          >
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run Phase B Verification
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          {/* Verdict Card */}
          <Card className={result.verdict === 'PROCEED_TO_EX' ? 'border-green-500' : 'border-yellow-500'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.verdict === 'PROCEED_TO_EX' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                )}
                {result.verdict === 'PROCEED_TO_EX' ? 'APPROVED: Proceed to EX' : 'REVISIONS REQUIRED'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                  <div className="text-2xl font-bold">{result.consensus.average_score}/100</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Agreement Level</div>
                  <Badge variant={
                    result.consensus.agreement_level === 'high' ? 'default' :
                    result.consensus.agreement_level === 'medium' ? 'secondary' : 'destructive'
                  }>
                    {result.consensus.agreement_level.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Unanimous Approval</div>
                  <div>{result.consensus.unanimous_approval ? '✅ Yes' : '❌ No'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">All Scores {'>'} 80</div>
                  <div>{result.consensus.all_scores_above_80 ? '✅ Yes' : '❌ No'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GPT-5 Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>GPT-5 Verification</span>
                <Badge variant={result.gpt5.overall_score >= 80 ? 'default' : 'destructive'}>
                  {result.gpt5.overall_score}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Recommendation</div>
                <Badge variant={
                  result.gpt5.recommendation === 'approve' ? 'default' :
                  result.gpt5.recommendation === 'revise' ? 'secondary' : 'destructive'
                }>
                  {result.gpt5.recommendation.toUpperCase()}
                </Badge>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Reasoning</div>
                <p className="text-sm text-muted-foreground">{result.gpt5.reasoning}</p>
              </div>
              {result.gpt5.missed_issues?.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Missed Issues</div>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {result.gpt5.missed_issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gemini Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Gemini 2.5 Pro Verification</span>
                <Badge variant={result.gemini.overall_score >= 80 ? 'default' : 'destructive'}>
                  {result.gemini.overall_score}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Recommendation</div>
                <Badge variant={
                  result.gemini.recommendation === 'approve' ? 'default' :
                  result.gemini.recommendation === 'revise' ? 'secondary' : 'destructive'
                }>
                  {result.gemini.recommendation.toUpperCase()}
                </Badge>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Reasoning</div>
                <p className="text-sm text-muted-foreground">{result.gemini.reasoning}</p>
              </div>
              {result.gemini.missed_issues?.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Missed Issues</div>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {result.gemini.missed_issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
