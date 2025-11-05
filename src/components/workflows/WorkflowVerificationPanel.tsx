import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerificationProgressIndicator } from './VerificationProgressIndicator';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  FileText,
  Lock,
  Zap,
  Bug,
  Target,
  TrendingUp,
  Workflow,
  Layers,
  Users,
  Code,
  TestTube,
  ListChecks
} from 'lucide-react';
import { fileContents } from '@/data/reviewFileContents';

interface ComprehensiveVerificationResult {
  overallAssessment: {
    productionReady: boolean;
    overallScore: number;
    confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    executiveSummary: string;
  };
  criticalFindings: {
    blockersCount: number;
    securityIssues: number;
    reliabilityIssues: number;
    dataIntegrityIssues: number;
    mustFixBeforeLaunch: CriticalIssue[];
  };
  fileAnalysis: FileAnalysis[];
  workflowValidation: WorkflowValidation;
  architectureAssessment: DimensionScore;
  performanceAnalysis: PerformanceScore;
  reliabilityAssessment: DimensionScore;
  securityAssessment: SecurityScore;
  complianceGaps: ComplianceGap[];
  crossFileIssues: CrossFileIssue[];
  testingGaps: TestingGaps;
  actionPlan: ActionPlan;
}

interface CriticalIssue {
  title: string;
  category: string;
  severity: string;
  affectedFiles: string[];
  description: string;
  exploitScenario: string;
  businessImpact: string;
  remediation: string;
}

interface FileAnalysis {
  fileName: string;
  overallScore: number;
  category: string;
  strengths: string[];
  weaknesses: string[];
  criticalIssues: Issue[];
  highPriorityIssues: Issue[];
  mediumPriorityIssues: Issue[];
  recommendations: Recommendation[];
}

interface Issue {
  title: string;
  severity: string;
  dimension: string;
  description: string;
  impact: string;
  codePattern: string;
  remediation: string;
}

interface Recommendation {
  priority: string;
  title: string;
  description: string;
  benefit: string;
  effort: string;
}

interface WorkflowValidation {
  workflowCorrectness: {
    score: number;
    stateTransitionsValid: boolean;
    edgeCasesHandled: boolean;
    recoveryMechanisms: boolean;
    dataConsistency: boolean;
    issues: { scenario: string; problem: string; severity: string; fix: string }[];
  };
  userExperience: {
    score: number;
    loadingFeedback: string;
    errorMessaging: string;
    progressVisibility: string;
    accessibility: string;
    issues: string[];
  };
  endToEndFlow: {
    score: number;
    canComplete: boolean;
    interruptionHandling: string;
    errorRecovery: string;
    issues: string[];
  };
}

interface DimensionScore {
  score: number;
  [key: string]: any;
}

interface PerformanceScore extends DimensionScore {
  memoryEfficiency: string;
  algorithmicEfficiency: string;
  networkEfficiency: string;
  bottlenecks: { location: string; issue: string; impact: string; optimization: string }[];
}

interface SecurityScore extends DimensionScore {
  piiHandling: string;
  authentication: string;
  inputValidation: string;
  compliance: string;
  vulnerabilities: Issue[];
}

interface ComplianceGap {
  regulation: string;
  requirement: string;
  currentState: string;
  gap: string;
  remediation: string;
  priority: string;
}

interface CrossFileIssue {
  title: string;
  affectedFiles: string[];
  category: string;
  severity: string;
  description: string;
  impact: string;
  remediation: string;
}

interface TestingGaps {
  missingTests: string[];
  integrationTestNeeds: string[];
  e2eTestScenarios: string[];
}

interface ActionPlan {
  immediate: { action: string; reason: string; effort: string }[];
  shortTerm: { action: string; reason: string; effort: string }[];
  longTerm: { action: string; reason: string; effort: string }[];
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-destructive';
};

const getScoreBadge = (score: number) => {
  if (score >= 90) return { variant: 'default' as const, label: 'Excellent' };
  if (score >= 75) return { variant: 'secondary' as const, label: 'Good' };
  if (score >= 60) return { variant: 'outline' as const, label: 'Fair' };
  if (score >= 40) return { variant: 'destructive' as const, label: 'Poor' };
  return { variant: 'destructive' as const, label: 'Critical' };
};

const getRatingColor = (rating: string) => {
  if (rating === 'GOOD' || rating === 'SECURE' || rating === 'COMPLIANT' || rating === 'LOW') return 'text-green-600';
  if (rating === 'NEEDS_IMPROVEMENT' || rating === 'GAPS' || rating === 'MEDIUM') return 'text-yellow-600';
  return 'text-destructive';
};

export function WorkflowVerificationPanel() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<ComprehensiveVerificationResult | null>(null);
  const [progressStages, setProgressStages] = useState<Array<{
    stage: string;
    progress: number;
    message: string;
    timestamp: string;
  }>>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const { toast } = useToast();

  const runVerification = async () => {
    setIsVerifying(true);
    setResult(null);
    setProgressStages([]);
    setStartTime(Date.now());
    
    // Simulate progress stages for better UX
    const progressInterval = setInterval(() => {
      setProgressStages(prev => {
        const elapsed = (Date.now() - startTime) / 1000;
        const newStages = [...prev];
        
        if (elapsed < 30 && newStages.length === 0) {
          newStages.push({
            stage: "Preparing Files",
            progress: 10,
            message: "Reading and organizing code files for analysis...",
            timestamp: new Date().toISOString()
          });
        } else if (elapsed < 60 && newStages.length === 1) {
          newStages.push({
            stage: "Sending to OpenAI GPT-5 Mini",
            progress: 20,
            message: "Uploading files to AI for comprehensive analysis...",
            timestamp: new Date().toISOString()
          });
        } else if (elapsed < 120 && newStages.length === 2) {
          newStages.push({
            stage: "Security Analysis",
            progress: 35,
            message: "Analyzing security vulnerabilities, PII handling, and GDPR compliance...",
            timestamp: new Date().toISOString()
          });
        } else if (elapsed < 180 && newStages.length === 3) {
          newStages.push({
            stage: "Architecture Review",
            progress: 50,
            message: "Evaluating design patterns, component structure, and scalability...",
            timestamp: new Date().toISOString()
          });
        } else if (elapsed < 240 && newStages.length === 4) {
          newStages.push({
            stage: "Performance Analysis",
            progress: 65,
            message: "Checking for memory leaks, inefficient algorithms, and optimization opportunities...",
            timestamp: new Date().toISOString()
          });
        } else if (elapsed < 300 && newStages.length === 5) {
          newStages.push({
            stage: "Reliability Assessment",
            progress: 75,
            message: "Testing error handling, race conditions, and recovery mechanisms...",
            timestamp: new Date().toISOString()
          });
        } else if (elapsed < 360 && newStages.length === 6) {
          newStages.push({
            stage: "Workflow Validation",
            progress: 85,
            message: "Validating state machine transitions and end-to-end workflow correctness...",
            timestamp: new Date().toISOString()
          });
        } else if (elapsed < 420 && newStages.length === 7) {
          newStages.push({
            stage: "Final Analysis",
            progress: 95,
            message: "Generating comprehensive report with actionable recommendations...",
            timestamp: new Date().toISOString()
          });
        }
        
        return newStages;
      });
    }, 5000); // Update every 5 seconds

    try {
      const filesToVerify = [
        {
          fileName: 'AIDocumentWorkflow.tsx',
          fileContent: fileContents['src/components/workflows/AIDocumentWorkflow.tsx'],
          category: 'core' as const
        },
        {
          fileName: 'useWorkflowState.ts',
          fileContent: fileContents['src/hooks/useWorkflowState.ts'],
          category: 'state' as const
        },
        {
          fileName: 'useDocumentProgress.ts',
          fileContent: fileContents['src/hooks/useDocumentProgress.ts'],
          category: 'state' as const
        },
        {
          fileName: 'useRequestBatcher.ts',
          fileContent: fileContents['src/hooks/useRequestBatcher.ts'],
          category: 'state' as const
        },
        {
          fileName: 'aiPIILogger.ts',
          fileContent: fileContents['src/utils/aiPIILogger.ts'],
          category: 'security' as const
        },
        {
          fileName: 'secureLogger.ts',
          fileContent: fileContents['src/utils/secureLogger.ts'],
          category: 'security' as const
        },
        {
          fileName: 'staticCodeAnalyzer.ts',
          fileContent: fileContents['src/utils/staticCodeAnalyzer.ts'],
          category: 'security' as const
        },
        {
          fileName: 'base64Encoder.worker.ts',
          fileContent: fileContents['src/workers/base64Encoder.worker.ts'],
          category: 'worker' as const
        },
        {
          fileName: 'DocumentProgressCard.tsx',
          fileContent: fileContents['src/components/workflows/DocumentProgressCard.tsx'],
          category: 'ui' as const
        },
        {
          fileName: 'BatchStatsDashboard.tsx',
          fileContent: fileContents['src/components/workflows/BatchStatsDashboard.tsx'],
          category: 'ui' as const
        }
      ];

      const focusAreas = [
        'Workflow correctness and completeness',
        'Security and GDPR compliance',
        'Architecture and design patterns',
        'Performance and scalability',
        'Reliability and error handling',
        'User experience and accessibility',
        'Code quality and maintainability',
        'Testing coverage and gaps'
      ];

      console.log('🔍 Starting comprehensive OpenAI verification...');

      // Create a timeout promise (3.5 minutes - slightly longer than edge function)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Verification timeout - analysis took too long. Try again or contact support if this persists.'));
        }, 210000); // 3.5 minutes in ms
      });

      // Race between the verification and the timeout
      const verificationPromise = supabase.functions.invoke('verify-workflow-openai', {
        body: {
          files: filesToVerify,
          focusAreas
        }
      });

      const { data, error } = await Promise.race([
        verificationPromise,
        timeoutPromise
      ]) as { data: any; error: any };

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No response from verification service');
      }

      if (!data.success) {
        // Handle specific error types from edge function
        const errorMsg = data.error || 'Verification failed';
        if (errorMsg.includes('timeout')) {
          throw new Error('⏱️ Analysis timeout - The comprehensive verification exceeded the time limit. Try reducing the number of files or focus areas.');
        }
        if (errorMsg.includes('rate limit')) {
          throw new Error('🚦 OpenAI rate limit reached. Please wait a moment and try again.');
        }
        if (errorMsg.includes('API key') || errorMsg.includes('authentication')) {
          throw new Error('🔑 OpenAI API authentication failed. Please check your API key configuration.');
        }
        throw new Error(errorMsg);
      }

      console.log('✅ Comprehensive verification complete');
      setResult(data.verification);

      const assessment = data.verification.overallAssessment;
      toast({
        title: 'Verification Complete',
        description: `Overall Score: ${assessment.overallScore}/100 - ${assessment.productionReady ? 'Production Ready' : 'Needs Work'}`,
        variant: assessment.productionReady ? 'default' : 'destructive'
      });

      clearInterval(progressInterval);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Verification error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown verification error';
      
      toast({
        title: 'Verification Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      clearInterval(progressInterval);
      setIsVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Comprehensive Workflow Verification
        </CardTitle>
        <CardDescription>
          HARDENED analysis by OpenAI GPT-5: Security, Architecture, Performance, Reliability & UX
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Progress Indicator */}
        {isVerifying && (
          <VerificationProgressIndicator
            isVerifying={isVerifying}
            stages={progressStages}
            elapsedSeconds={Math.floor((Date.now() - startTime) / 1000)}
            filesCount={10}
          />
        )}
        
        <Button
          onClick={runVerification}
          disabled={isVerifying}
          className="w-full"
          size="lg"
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Comprehensive Verification...
            </>
          ) : (
            <>
              <Target className="mr-2 h-4 w-4" />
              Run HARDENED Verification
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-6 mt-6">
            {/* Overall Assessment */}
            <Alert variant={result.overallAssessment.productionReady ? 'default' : 'destructive'}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {result.overallAssessment.productionReady ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <XCircle className="h-6 w-6" />
                    )}
                    <div>
                      <div className="font-semibold text-lg">
                        Overall Score: {result.overallAssessment.overallScore}/100
                      </div>
                      <Badge variant={getScoreBadge(result.overallAssessment.overallScore).variant} className="mt-1">
                        {getScoreBadge(result.overallAssessment.overallScore).label}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant={result.overallAssessment.productionReady ? 'default' : 'destructive'}>
                    {result.overallAssessment.productionReady ? '✓ Production Ready' : '✗ Not Ready'}
                  </Badge>
                </div>
                <AlertDescription>
                  {result.overallAssessment.executiveSummary}
                </AlertDescription>
                <div className="flex gap-2 flex-wrap">
                  {result.criticalFindings.blockersCount > 0 && (
                    <Badge variant="destructive">
                      {result.criticalFindings.blockersCount} Blockers
                    </Badge>
                  )}
                  {result.criticalFindings.securityIssues > 0 && (
                    <Badge variant="destructive">
                      <Lock className="h-3 w-3 mr-1" />
                      {result.criticalFindings.securityIssues} Security
                    </Badge>
                  )}
                  {result.criticalFindings.reliabilityIssues > 0 && (
                    <Badge variant="destructive">
                      <Shield className="h-3 w-3 mr-1" />
                      {result.criticalFindings.reliabilityIssues} Reliability
                    </Badge>
                  )}
                  {result.criticalFindings.dataIntegrityIssues > 0 && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {result.criticalFindings.dataIntegrityIssues} Data Integrity
                    </Badge>
                  )}
                </div>
              </div>
            </Alert>

            {/* Dimension Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center space-y-2">
                    <Workflow className="h-6 w-6 mx-auto text-muted-foreground" />
                    <div className={`text-2xl font-bold ${getScoreColor(result.workflowValidation.workflowCorrectness.score)}`}>
                      {result.workflowValidation.workflowCorrectness.score}
                    </div>
                    <div className="text-sm text-muted-foreground">Workflow</div>
                    <Progress value={result.workflowValidation.workflowCorrectness.score} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center space-y-2">
                    <Lock className="h-6 w-6 mx-auto text-muted-foreground" />
                    <div className={`text-2xl font-bold ${getScoreColor(result.securityAssessment.score)}`}>
                      {result.securityAssessment.score}
                    </div>
                    <div className="text-sm text-muted-foreground">Security</div>
                    <Progress value={result.securityAssessment.score} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center space-y-2">
                    <TrendingUp className="h-6 w-6 mx-auto text-muted-foreground" />
                    <div className={`text-2xl font-bold ${getScoreColor(result.performanceAnalysis.score)}`}>
                      {result.performanceAnalysis.score}
                    </div>
                    <div className="text-sm text-muted-foreground">Performance</div>
                    <Progress value={result.performanceAnalysis.score} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center space-y-2">
                    <Layers className="h-6 w-6 mx-auto text-muted-foreground" />
                    <div className={`text-2xl font-bold ${getScoreColor(result.architectureAssessment.score)}`}>
                      {result.architectureAssessment.score}
                    </div>
                    <div className="text-sm text-muted-foreground">Architecture</div>
                    <Progress value={result.architectureAssessment.score} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabbed Analysis */}
            <Tabs defaultValue="critical" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="critical">
                  Critical
                  {result.criticalFindings.blockersCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {result.criticalFindings.blockersCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
                <TabsTrigger value="testing">Testing</TabsTrigger>
                <TabsTrigger value="action">Action Plan</TabsTrigger>
              </TabsList>

              <TabsContent value="critical" className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold">Critical Findings - Must Fix Before Launch</h3>
                <ScrollArea className="h-[600px] pr-4">
                  {result.criticalFindings.mustFixBeforeLaunch.length === 0 ? (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        No critical blockers found! System is ready for production deployment.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {result.criticalFindings.mustFixBeforeLaunch.map((issue, idx) => (
                        <Card key={idx} className="border-destructive">
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <Badge variant="destructive">{issue.category}</Badge>
                                <h4 className="font-semibold text-lg">{issue.title}</h4>
                                <div className="text-sm text-muted-foreground">
                                  Affects: {issue.affectedFiles.join(', ')}
                                </div>
                              </div>
                              <AlertTriangle className="h-6 w-6 text-destructive" />
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="font-semibold">Description:</span> {issue.description}
                              </div>
                              <div className="bg-destructive/10 p-3 rounded">
                                <span className="font-semibold">Exploit Scenario:</span> {issue.exploitScenario}
                              </div>
                              <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded">
                                <span className="font-semibold">Business Impact:</span> {issue.businessImpact}
                              </div>
                              <div className="bg-primary/10 p-3 rounded">
                                <span className="font-semibold">Remediation:</span> {issue.remediation}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* ... rest of tabs would be similar comprehensive displays ... */}

            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
