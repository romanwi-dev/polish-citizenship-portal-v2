import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Target,
  Zap,
  Brain,
  Sparkles
} from 'lucide-react';
import { fileContents } from '@/data/reviewFileContents';

interface ModelResult {
  model: string;
  success: boolean;
  verification?: any;
  error?: string;
  duration: number;
}

interface MultiModelResponse {
  success: boolean;
  results: ModelResult[];
  summary: {
    totalModels: number;
    successfulModels: number;
    failedModels: number;
    averageScore: number;
    consensus: 'HIGH' | 'MEDIUM' | 'LOW';
    timestamp: string;
  };
}

export function ZeroFailVerificationPanel() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [response, setResponse] = useState<MultiModelResponse | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedModels, setSelectedModels] = useState<string[]>([
    'openai/gpt-5',
    'google/gemini-2.5-pro',
    'claude-sonnet-4-5'
  ]);
  const { toast } = useToast();

  const runZeroFailVerification = async () => {
    setIsVerifying(true);
    setResponse(null);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 95));
    }, 2000);

    try {
      console.log('🚀 Starting ZERO-FAIL multi-model verification...');

      const { data, error } = await supabase.functions.invoke('verify-workflow-multi-model', {
        body: {
          files: fileContents,
          focusAreas: [
            'Workflow correctness and completeness',
            'Security and GDPR compliance',
            'Architecture and design patterns',
            'Performance and scalability',
            'Reliability and error handling',
            'User experience and accessibility',
            'Code quality and maintainability',
            'Testing coverage and gaps'
          ],
          models: selectedModels,
          useAnthropic: selectedModels.some(m => m.startsWith('claude-'))
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        console.error('Verification error:', error);
        toast({
          variant: 'destructive',
          title: 'Verification Failed',
          description: error.message || 'Failed to complete verification'
        });
        return;
      }

      console.log('✅ Multi-model verification complete:', data);
      setResponse(data);

      toast({
        title: 'Verification Complete',
        description: `${data.summary.successfulModels}/${data.summary.totalModels} models analyzed successfully. Average score: ${data.summary.averageScore}/100`
      });

    } catch (err) {
      clearInterval(progressInterval);
      console.error('Verification exception:', err);
      toast({
        variant: 'destructive',
        title: 'Verification Error',
        description: err instanceof Error ? err.message : 'Unknown error occurred'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getModelIcon = (model: string) => {
    if (model.includes('openai')) return <Sparkles className="h-4 w-4" />;
    if (model.includes('gemini')) return <Brain className="h-4 w-4" />;
    if (model.includes('claude')) return <Shield className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  const getModelDisplayName = (model: string) => {
    if (model === 'openai/gpt-5') return 'OpenAI GPT-5';
    if (model === 'google/gemini-2.5-pro') return 'Gemini 2.5 Pro';
    if (model === 'claude-sonnet-4-5') return 'Claude Sonnet 4.5';
    return model;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-destructive';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              ZERO-FAIL Triple-Consensus Verification
            </CardTitle>
            <CardDescription>
              NO-RUSH Protocol Analysis with GPT-5, Gemini 2.5 Pro & Claude Sonnet 4.5
            </CardDescription>
          </div>
          <Button 
            onClick={runZeroFailVerification}
            disabled={isVerifying}
            size="lg"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Run ZERO-FAIL Verification
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isVerifying && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Running multi-model analysis...</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Analyzing with 3 AI models (GPT-5, Gemini 2.5 Pro, Claude Sonnet 4.5)...
                Triple-consensus verification in progress. This may take 2-3 minutes.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {response && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Alert className={response.summary.averageScore >= 75 ? 'border-green-500' : 'border-yellow-500'}>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold text-lg">
                    Multi-Model Consensus: {response.summary.consensus}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Average Score:</span>
                      <span className={`ml-2 font-bold text-lg ${getScoreColor(response.summary.averageScore)}`}>
                        {response.summary.averageScore}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Models:</span>
                      <span className="ml-2 font-medium">
                        {response.summary.successfulModels}/{response.summary.totalModels} successful
                      </span>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Model Results */}
            <Tabs defaultValue="comparison" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
                <TabsTrigger value="openai">GPT-5</TabsTrigger>
                <TabsTrigger value="gemini">Gemini</TabsTrigger>
                <TabsTrigger value="claude">Claude</TabsTrigger>
              </TabsList>

              <TabsContent value="comparison" className="space-y-4">
                <ScrollArea className="h-[600px] pr-4">
                  {response.results.map((result, idx) => (
                    <Card key={idx} className="mb-4">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-base">
                            {getModelIcon(result.model)}
                            {getModelDisplayName(result.model)}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {result.success ? (
                              <>
                                <Badge variant="default">
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Success
                                </Badge>
                                <Badge variant="outline">
                                  {result.verification?.overallAssessment?.overallScore || 0}/100
                                </Badge>
                              </>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="mr-1 h-3 w-3" />
                                Failed
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CardDescription>
                          Duration: {(result.duration / 1000).toFixed(1)}s
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {result.success && result.verification ? (
                          <div className="space-y-4">
                            <div>
                              <div className="text-sm font-medium mb-2">Executive Summary</div>
                              <p className="text-sm text-muted-foreground">
                                {result.verification.overallAssessment?.executiveSummary}
                              </p>
                            </div>
                            
                            {result.verification.criticalFindings?.mustFixBeforeLaunch?.length > 0 && (
                              <div>
                                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-destructive" />
                                  Critical Findings ({result.verification.criticalFindings.blockersCount})
                                </div>
                                <div className="space-y-2">
                                  {result.verification.criticalFindings.mustFixBeforeLaunch.slice(0, 3).map((issue: any, i: number) => (
                                    <Alert key={i} variant="destructive">
                                      <AlertDescription>
                                        <div className="font-medium">{issue.title}</div>
                                        <div className="text-xs mt-1">{issue.description}</div>
                                      </AlertDescription>
                                    </Alert>
                                  ))}
                                </div>
                              </div>
                            )}

                            {result.verification.dimensionScores && (
                              <div className="grid grid-cols-3 gap-2">
                                {Object.entries(result.verification.dimensionScores).map(([key, value]: [string, any]) => (
                                  <div key={key} className="text-center">
                                    <div className="text-xs text-muted-foreground capitalize">{key}</div>
                                    <div className={`text-lg font-bold ${getScoreColor(value.score)}`}>
                                      {value.score}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                              Error: {result.error}
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </ScrollArea>
              </TabsContent>

              {response.results.map((result, idx) => {
                const tabValue = result.model.includes('openai') 
                  ? 'openai' 
                  : result.model.includes('claude') 
                  ? 'claude' 
                  : 'gemini';
                
                return (
                <TabsContent 
                  key={idx} 
                  value={tabValue}
                  className="space-y-4"
                >
                  {result.success && result.verification ? (
                    <ScrollArea className="h-[600px] pr-4">
                      {/* Full detailed view for this model */}
                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Overall Assessment</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-muted-foreground">Production Ready</div>
                                <div className="flex items-center gap-2 mt-1">
                                  {result.verification.overallAssessment?.productionReady ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-destructive" />
                                  )}
                                  <span className="font-medium">
                                    {result.verification.overallAssessment?.productionReady ? 'Yes' : 'No'}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Overall Score</div>
                                <div className={`text-3xl font-bold mt-1 ${getScoreColor(result.verification.overallAssessment?.overallScore || 0)}`}>
                                  {result.verification.overallAssessment?.overallScore || 0}/100
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground mb-2">Executive Summary</div>
                              <p className="text-sm">{result.verification.overallAssessment?.executiveSummary}</p>
                            </div>
                          </CardContent>
                        </Card>

                        {result.verification.actionPlan && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Action Plan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {result.verification.actionPlan.immediate?.length > 0 && (
                                <div>
                                  <div className="font-medium text-sm mb-2 text-destructive">Immediate Actions</div>
                                  <ul className="space-y-2">
                                    {result.verification.actionPlan.immediate.map((action: any, i: number) => (
                                      <li key={i} className="text-sm">
                                        <div className="font-medium">{action.action}</div>
                                        <div className="text-xs text-muted-foreground">{action.reason}</div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </ScrollArea>
                  ) : (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        Verification failed: {result.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
                );
              })}
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
