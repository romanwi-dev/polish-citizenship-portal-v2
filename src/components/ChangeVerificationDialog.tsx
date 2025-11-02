import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, AlertTriangle, Lightbulb, Code2, Database, Shield, Zap, FileCode, Target } from "lucide-react";

interface FileChange {
  path: string;
  action: 'edit' | 'create' | 'delete' | 'verify';
  changes: string;
  linesAffected?: string;
}

interface ChangeProposal {
  type: 'database' | 'edge_function' | 'frontend' | 'mixed' | 'pdf_generation_pre' | 'pdf_generation_post';
  description: string;
  impact: string;
  files: FileChange[];
  sql?: string[];
  edgeFunctions?: Array<{ name: string; changes: string }>;
  pdfGeneration?: any;
  execution?: any;
  comparisonToProposal?: any;
  reasoning: string;
  risks: string[];
  rollbackPlan: string;
}

interface ScoreDetail {
  score: number;
  issues: string[];
}

interface VerificationResult {
  approved: boolean;
  overallScore: number;
  scores: {
    logic: ScoreDetail;
    security: ScoreDetail;
    database: ScoreDetail;
    codeQuality: ScoreDetail;
    performance: ScoreDetail;
    bestPractices: ScoreDetail;
  };
  criticalIssues: string[];
  warnings: string[];
  suggestions: string[];
  recommendation: 'approve' | 'approve_with_changes' | 'reject';
  explanation: string;
}

interface ChangeVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: ChangeProposal | null;
  review: VerificationResult | null;
  onApprove: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

const ScoreIcon = ({ category }: { category: string }) => {
  const icons = {
    logic: Target,
    security: Shield,
    database: Database,
    codeQuality: Code2,
    performance: Zap,
    bestPractices: FileCode,
  };
  const Icon = icons[category as keyof typeof icons] || Code2;
  return <Icon className="h-4 w-4" />;
};

const getScoreColor = (score: number): string => {
  if (score >= 9) return 'text-green-600 dark:text-green-400';
  if (score >= 7) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const getRecommendationBadge = (recommendation: string) => {
  const config = {
    approve: { variant: 'default' as const, label: 'Approved', className: 'bg-green-600' },
    approve_with_changes: { variant: 'secondary' as const, label: 'Approve with Changes', className: 'bg-yellow-600' },
    reject: { variant: 'destructive' as const, label: 'Rejected', className: 'bg-red-600' },
  };
  
  const rec = config[recommendation as keyof typeof config] || config.reject;
  return <Badge variant={rec.variant} className={rec.className}>{rec.label}</Badge>;
};

export function ChangeVerificationDialog({
  open,
  onOpenChange,
  proposal,
  review,
  onApprove,
  onReject,
  isLoading = false,
}: ChangeVerificationDialogProps) {
  if (!proposal) return null;

  const isPDFProposal = proposal.type === 'pdf_generation_pre' || proposal.type === 'pdf_generation_post';
  const isPreGeneration = proposal.type === 'pdf_generation_pre';
  const isPostGeneration = proposal.type === 'pdf_generation_post';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPDFProposal ? '📄 AI PDF Verification' : '🤖 AI Code Review'}
            <Badge variant="outline">{proposal.type}</Badge>
          </DialogTitle>
          <DialogDescription>
            {isPDFProposal
              ? isPreGeneration
                ? 'Analyzing data completeness and PDF generation readiness'
                : 'Verifying generated PDF quality and accuracy'
              : 'OpenAI GPT-5 verification of proposed changes'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            
            {/* PDF Pre-Generation Details */}
            {isPDFProposal && isPreGeneration && proposal.pdfGeneration && (
              <Alert className="border-blue-500/30 bg-blue-500/10">
                <Target className="h-4 w-4" />
                <AlertTitle className="text-lg font-bold">PDF Generation Plan</AlertTitle>
                <AlertDescription>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Template</p>
                      <p className="font-mono text-sm font-bold">{proposal.pdfGeneration.templateName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Data Coverage</p>
                      <div className="flex items-center gap-2">
                        <Progress value={proposal.pdfGeneration.dataCoverage} className="h-2 flex-1" />
                        <span className="font-bold text-sm">{proposal.pdfGeneration.dataCoverage}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fields to Fill</p>
                      <p className="font-bold text-sm">
                        {proposal.pdfGeneration.mappedFields} / {proposal.pdfGeneration.totalPDFFields}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Missing Required</p>
                      <p className={`font-bold text-sm ${proposal.pdfGeneration.missingRequired.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {proposal.pdfGeneration.missingRequired.length === 0 
                          ? '✓ All Present' 
                          : `✗ ${proposal.pdfGeneration.missingRequired.length} Missing`}
                      </p>
                    </div>
                  </div>
                  
                  {proposal.pdfGeneration.missingRequired.length > 0 && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded">
                      <p className="text-xs font-semibold text-red-600 mb-2">⚠️ Missing Required Fields:</p>
                      <p className="text-xs font-mono text-red-700">
                        {proposal.pdfGeneration.missingRequired.join(', ')}
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* PDF Post-Generation Results */}
            {isPDFProposal && isPostGeneration && proposal.execution && (
              <Alert className="border-green-500/30 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle className="text-lg font-bold">PDF Generation Results</AlertTitle>
                <AlertDescription>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Execution Status</p>
                      <p className={`font-bold text-sm ${proposal.execution.success ? 'text-green-600' : 'text-red-600'}`}>
                        {proposal.execution.success ? '✓ SUCCESSFUL' : '✗ FAILED'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fields Populated</p>
                      <p className="font-bold text-sm">
                        {proposal.execution.fieldsFilledCount} / {proposal.execution.totalFieldsInPDF}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Empty Fields</p>
                      <p className={`font-bold text-sm ${proposal.execution.emptyFields.length === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {proposal.execution.emptyFields.length || 'None'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Issues Detected</p>
                      <p className={`font-bold text-sm ${proposal.execution.issues.length === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {proposal.execution.issues.length || 'None'}
                      </p>
                    </div>
                  </div>
                  
                  {proposal.comparisonToProposal && (
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                      <p className="text-xs font-semibold text-blue-700 mb-1">
                        📊 Proposal Match Rate: <span className="text-lg">{proposal.comparisonToProposal.matchRate}%</span>
                      </p>
                      {proposal.comparisonToProposal.discrepancies.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-blue-600 mb-1">Discrepancies:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {proposal.comparisonToProposal.discrepancies.map((disc, idx) => (
                              <li key={idx}>• {disc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {isPDFProposal && <Separator />}
            
            
            {/* Proposal Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">📋 Proposed Changes</h3>
              <p className="text-sm text-muted-foreground">{proposal.description}</p>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm"><strong>Impact:</strong> {proposal.impact}</p>
              </div>
            </div>

            <Separator />

            {/* Files Affected */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                Files to Change ({proposal.files.length})
              </h4>
              <div className="space-y-2">
                {proposal.files.map((file, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={file.action === 'create' ? 'default' : file.action === 'delete' ? 'destructive' : 'secondary'}>
                        {file.action}
                      </Badge>
                      <code className="text-sm font-mono">{file.path}</code>
                      {file.linesAffected && (
                        <span className="text-xs text-muted-foreground">Lines {file.linesAffected}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{file.changes}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SQL Changes */}
            {proposal.sql && proposal.sql.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    SQL Changes
                  </h4>
                  <div className="bg-muted rounded-lg p-4 space-y-1">
                    {proposal.sql.map((sql, idx) => (
                      <code key={idx} className="block text-sm font-mono">{sql}</code>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Reasoning & Risks */}
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">💭 Reasoning</h4>
                <p className="text-sm text-muted-foreground">{proposal.reasoning}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">⚠️ Identified Risks</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {proposal.risks.map((risk, idx) => (
                    <li key={idx}>• {risk}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <Alert>
                <AlertTitle>⏳ Waiting for OpenAI review...</AlertTitle>
                <AlertDescription>This may take 10-30 seconds</AlertDescription>
              </Alert>
            )}

            {/* OpenAI Review Results */}
            {review && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      🤖 OpenAI Review
                      {getRecommendationBadge(review.recommendation)}
                    </h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{review.overallScore.toFixed(1)}/10</div>
                      <div className="text-xs text-muted-foreground">Overall Score</div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground italic">{review.explanation}</p>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(review.scores).map(([category, detail]) => (
                      <div key={category} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ScoreIcon category={category} />
                            <span className="text-sm font-medium capitalize">
                              {category.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                          <span className={`font-bold ${getScoreColor(detail.score)}`}>
                            {detail.score}/10
                          </span>
                        </div>
                        <Progress value={detail.score * 10} className="h-2" />
                        {detail.issues.length > 0 && (
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {detail.issues.map((issue, idx) => (
                              <li key={idx}>• {issue}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Critical Issues */}
                  {review.criticalIssues.length > 0 && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Critical Issues - Must Fix!</AlertTitle>
                      <AlertDescription>
                        <ul className="mt-2 space-y-1">
                          {review.criticalIssues.map((issue, idx) => (
                            <li key={idx}>• {issue}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Warnings */}
                  {review.warnings.length > 0 && (
                    <Alert className="border-yellow-500/50 dark:border-yellow-400/50">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <AlertTitle>Warnings - Should Fix</AlertTitle>
                      <AlertDescription>
                        <ul className="mt-2 space-y-1">
                          {review.warnings.map((warning, idx) => (
                            <li key={idx}>• {warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Suggestions */}
                  {review.suggestions.length > 0 && (
                    <Alert className="border-blue-500/50 dark:border-blue-400/50">
                      <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <AlertTitle>Suggestions - Nice to Have</AlertTitle>
                      <AlertDescription>
                        <ul className="mt-2 space-y-1">
                          {review.suggestions.map((suggestion, idx) => (
                            <li key={idx}>• {suggestion}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </>
            )}

            {/* Rollback Plan */}
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">🔄 Rollback Plan</h4>
              <p className="text-sm text-muted-foreground">{proposal.rollbackPlan}</p>
            </div>

          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onReject}>
            Reject
          </Button>
          <div className="flex gap-3">
            {review && (
              <>
                {review.recommendation === 'reject' ? (
                  <Button variant="destructive" disabled>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cannot Approve - Critical Issues
                  </Button>
                ) : (
                  <Button onClick={onApprove}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {review.recommendation === 'approve_with_changes' 
                      ? 'Approve with Changes' 
                      : 'Approve & Implement'}
                  </Button>
                )}
              </>
            )}
            {!review && !isLoading && (
              <Button disabled>Waiting for review...</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
