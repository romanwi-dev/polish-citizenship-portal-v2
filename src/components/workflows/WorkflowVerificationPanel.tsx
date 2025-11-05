import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  Target
} from 'lucide-react';

// Import file contents
import { fileContents } from '@/data/reviewFileContents';

interface VerificationResult {
  overallRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  productionReady: boolean;
  blockersCount: number;
  summary: string;
  fileAnalysis: FileAnalysis[];
  crossFileIssues: CrossFileIssue[];
  complianceGaps: ComplianceGap[];
}

interface FileAnalysis {
  fileName: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  criticalVulnerabilities: Vulnerability[];
  highRiskIssues: Vulnerability[];
  recommendations: string[];
}

interface Vulnerability {
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  description: string;
  impact: string;
  codePattern: string;
  remediation: string;
}

interface CrossFileIssue {
  title: string;
  affectedFiles: string[];
  severity: 'CRITICAL' | 'HIGH';
  description: string;
  remediation: string;
}

interface ComplianceGap {
  regulation: string;
  violation: string;
  remediation: string;
}

const riskColors = {
  CRITICAL: 'text-destructive',
  HIGH: 'text-orange-600',
  MEDIUM: 'text-yellow-600',
  LOW: 'text-blue-600'
};

const riskBadges = {
  CRITICAL: 'destructive',
  HIGH: 'default',
  MEDIUM: 'secondary',
  LOW: 'outline'
} as const;

const categoryIcons = {
  PII_LEAK: Lock,
  AUTH_BYPASS: Shield,
  INJECTION: Bug,
  RACE_CONDITION: Zap,
  DATA_LOSS: AlertTriangle
};

export function WorkflowVerificationPanel() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();

  const runVerification = async () => {
    setIsVerifying(true);
    setResult(null);

    try {
      // Prepare files for verification
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
        'PII data handling and GDPR compliance',
        'Race conditions in state management',
        'Authentication and authorization',
        'Error handling and recovery',
        'Input validation and sanitization',
        'Production deployment readiness',
        'Performance and scalability',
        'Security vulnerabilities'
      ];

      console.log('🔍 Starting OpenAI verification...');

      const { data, error } = await supabase.functions.invoke('verify-workflow-openai', {
        body: {
          files: filesToVerify,
          focusAreas
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Verification failed');
      }

      console.log('✅ Verification complete:', data.verification);
      setResult(data.verification);

      toast({
        title: 'Verification Complete',
        description: `Risk Level: ${data.verification.overallRisk} - ${data.verification.blockersCount} blockers found`,
        variant: data.verification.blockersCount > 0 ? 'destructive' : 'default'
      });

    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Verification Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Documents Workflow Security Verification
        </CardTitle>
        <CardDescription>
          HARDENED security audit powered by OpenAI GPT-5
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runVerification}
          disabled={isVerifying}
          className="w-full"
          size="lg"
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running OpenAI Verification...
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
            {/* Overall Summary */}
            <Alert variant={result.productionReady ? 'default' : 'destructive'}>
              <div className="flex items-start gap-3">
                {result.productionReady ? (
                  <CheckCircle2 className="h-5 w-5 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={riskBadges[result.overallRisk]}>
                      {result.overallRisk} RISK
                    </Badge>
                    {result.blockersCount > 0 && (
                      <Badge variant="destructive">
                        {result.blockersCount} Blockers
                      </Badge>
                    )}
                  </div>
                  <AlertDescription className="text-sm">
                    {result.summary}
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            {/* File Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">File Analysis</h3>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {result.fileAnalysis.map((file, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {file.fileName}
                          </CardTitle>
                          <Badge variant={riskBadges[file.riskLevel]}>
                            {file.riskLevel}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Critical Vulnerabilities */}
                        {file.criticalVulnerabilities.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-destructive flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Critical Vulnerabilities ({file.criticalVulnerabilities.length})
                            </h4>
                            {file.criticalVulnerabilities.map((vuln, vIdx) => (
                              <Card key={vIdx} className="bg-destructive/5">
                                <CardContent className="pt-4 space-y-2">
                                  <div className="flex items-start gap-2">
                                    {categoryIcons[vuln.category as keyof typeof categoryIcons] && (
                                      <div className="mt-0.5">
                                        {(() => {
                                          const Icon = categoryIcons[vuln.category as keyof typeof categoryIcons];
                                          return <Icon className="h-4 w-4" />;
                                        })()}
                                      </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                      <div className="font-semibold text-sm">{vuln.title}</div>
                                      <Badge variant="outline" className="text-xs">
                                        {vuln.category}
                                      </Badge>
                                      <p className="text-sm text-muted-foreground">
                                        {vuln.description}
                                      </p>
                                      <div className="text-sm">
                                        <span className="font-semibold">Impact:</span> {vuln.impact}
                                      </div>
                                      {vuln.codePattern && (
                                        <div className="bg-muted p-2 rounded text-xs font-mono">
                                          {vuln.codePattern}
                                        </div>
                                      )}
                                      <div className="text-sm bg-primary/10 p-2 rounded">
                                        <span className="font-semibold">Fix:</span> {vuln.remediation}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        {/* High Risk Issues */}
                        {file.highRiskIssues.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-orange-600 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              High Risk Issues ({file.highRiskIssues.length})
                            </h4>
                            {file.highRiskIssues.map((issue, iIdx) => (
                              <Card key={iIdx} className="bg-orange-50 dark:bg-orange-950/20">
                                <CardContent className="pt-4 space-y-2">
                                  <div className="font-semibold text-sm">{issue.title}</div>
                                  <p className="text-sm text-muted-foreground">
                                    {issue.description}
                                  </p>
                                  <div className="text-sm bg-white dark:bg-gray-900 p-2 rounded">
                                    <span className="font-semibold">Fix:</span> {issue.remediation}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        {/* Recommendations */}
                        {file.recommendations.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Recommendations</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {file.recommendations.map((rec, rIdx) => (
                                <li key={rIdx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Cross-File Issues */}
            {result.crossFileIssues.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <h3 className="text-lg font-semibold">Cross-File Issues</h3>
                <div className="space-y-2">
                  {result.crossFileIssues.map((issue, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={issue.severity === 'CRITICAL' ? 'destructive' : 'default'}>
                            {issue.severity}
                          </Badge>
                          <span className="font-semibold text-sm">{issue.title}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Affects: {issue.affectedFiles.join(', ')}
                        </div>
                        <p className="text-sm">{issue.description}</p>
                        <div className="text-sm bg-primary/10 p-2 rounded">
                          <span className="font-semibold">Fix:</span> {issue.remediation}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Compliance Gaps */}
            {result.complianceGaps.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <h3 className="text-lg font-semibold">Compliance Gaps</h3>
                <div className="space-y-2">
                  {result.complianceGaps.map((gap, idx) => (
                    <Card key={idx}>
                      <CardContent className="pt-4 space-y-2">
                        <Badge variant="outline">{gap.regulation}</Badge>
                        <p className="text-sm font-semibold">{gap.violation}</p>
                        <div className="text-sm bg-primary/10 p-2 rounded">
                          <span className="font-semibold">Required:</span> {gap.remediation}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
