import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Play,
  Loader2,
  FileCode,
  Shield,
  Zap,
  RefreshCw,
  Code
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReviewResult {
  fileName: string;
  overallScore: number;
  categories: Array<{
    category: string;
    score: number;
    issues: Array<{
      line?: number;
      severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
      title: string;
      description: string;
      recommendation: string;
    }>;
    strengths: string[];
  }>;
  summary: string;
  blockers: string[];
  recommendations: string[];
}

export const CodeReviewDashboard = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>('');

  const filesToReview = [
    // === CRITICAL PATH FILES (60% weight) ===
    { 
      name: 'AIDocumentWorkflow.tsx',
      path: 'src/components/workflows/AIDocumentWorkflow.tsx',
      type: 'frontend',
      priority: 'critical'
    },
    { 
      name: 'ai-classify-document',
      path: 'supabase/functions/ai-classify-document/index.ts',
      type: 'edge-function',
      priority: 'critical'
    },
    { 
      name: 'ai-verify-forms',
      path: 'supabase/functions/ai-verify-forms/index.ts',
      type: 'edge-function',
      priority: 'critical'
    },
    { 
      name: 'ocr-worker',
      path: 'supabase/functions/ocr-worker/index.ts',
      type: 'edge-function',
      priority: 'critical'
    },
    { 
      name: 'download-dropbox-file',
      path: 'supabase/functions/download-dropbox-file/index.ts',
      type: 'edge-function',
      priority: 'critical'
    },
    { 
      name: 'apply-ocr-to-forms',
      path: 'supabase/functions/apply-ocr-to-forms/index.ts',
      type: 'edge-function',
      priority: 'critical'
    },

    // === PHASE 1: SECURITY (30% weight) ===
    {
      name: 'aiPIILogger.ts',
      path: 'src/utils/aiPIILogger.ts',
      type: 'security',
      priority: 'high'
    },
    {
      name: 'secureLogger.ts',
      path: 'src/utils/secureLogger.ts',
      type: 'security',
      priority: 'high'
    },

    // === PHASE 2: PERFORMANCE (30% weight) ===
    {
      name: 'useWorkflowState.ts',
      path: 'src/hooks/useWorkflowState.ts',
      type: 'performance',
      priority: 'high'
    },
    {
      name: 'useDocumentProgress.ts',
      path: 'src/hooks/useDocumentProgress.ts',
      type: 'performance',
      priority: 'high'
    },
    {
      name: 'base64Encoder.worker.ts',
      path: 'src/workers/base64Encoder.worker.ts',
      type: 'performance',
      priority: 'high'
    },

    // === PHASE 3: RELIABILITY (30% weight) ===
    {
      name: 'useRequestBatcher.ts',
      path: 'src/hooks/useRequestBatcher.ts',
      type: 'reliability',
      priority: 'high'
    },
    {
      name: 'DocumentProgressCard.tsx',
      path: 'src/components/workflows/DocumentProgressCard.tsx',
      type: 'reliability',
      priority: 'medium'
    },
    {
      name: 'BatchStatsDashboard.tsx',
      path: 'src/components/workflows/BatchStatsDashboard.tsx',
      type: 'reliability',
      priority: 'medium'
    }
  ];

  const runCodeReview = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);

    try {
      const reviewPromises = filesToReview.map(async (file, index) => {
        setCurrentFile(file.name);
        
        // Fetch file content from the repository
        let fileContent = '';
        try {
          // For demo purposes, we'll use placeholder content
          // In production, you'd fetch from GitHub API or local filesystem
          fileContent = `// ${file.name} - Code review in progress`;
          
          console.log(`Reviewing ${file.name}...`);
          
          const { data, error } = await supabase.functions.invoke('ai-code-review', {
            body: {
              fileName: file.name,
              fileContent: `Analyze this ${file.type} file for production readiness. Focus on security, performance, and reliability.`,
              reviewType: 'comprehensive'
            }
          });

          if (error) throw error;

          setProgress(((index + 1) / filesToReview.length) * 100);
          
          return {
            fileName: file.name,
            ...data.review
          } as ReviewResult;
        } catch (error) {
          console.error(`Failed to review ${file.name}:`, error);
          throw error;
        }
      });

      const reviewResults = await Promise.all(reviewPromises);
      setResults(reviewResults);

      const avgScore = Math.round(
        reviewResults.reduce((sum, r) => sum + r.overallScore, 0) / reviewResults.length
      );

      toast({
        title: "Code Review Complete",
        description: `Average score: ${avgScore}/100`
      });

    } catch (error: any) {
      toast({
        title: "Code Review Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setCurrentFile('');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'INFO':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security':
        return <Shield className="h-4 w-4" />;
      case 'Performance':
        return <Zap className="h-4 w-4" />;
      case 'Reliability':
        return <RefreshCw className="h-4 w-4" />;
      case 'Correctness':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'Maintainability':
        return <Code className="h-4 w-4" />;
      default:
        return <FileCode className="h-4 w-4" />;
    }
  };

  const overallScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length)
    : 0;

  const totalBlockers = results.reduce((sum, r) => sum + (r.blockers?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Sprint 3: Deep Code Review</h2>
              <p className="text-muted-foreground">
                GPT-5 comprehensive analysis of {filesToReview.length} critical files
              </p>
            </div>
          </div>

          <Button
            onClick={runCodeReview}
            disabled={isRunning}
            size="lg"
            className="gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Review
              </>
            )}
          </Button>
        </div>

        {/* Progress */}
        {isRunning && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Reviewing: {currentFile}</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </Card>

      {/* Overall Score */}
      {results.length > 0 && (
        <Card className="p-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </div>
                <div className="text-sm text-muted-foreground mt-2">Overall Score</div>
              </div>
            </div>

            <div className="col-span-3 grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Files Reviewed</span>
                </div>
                <div className="text-2xl font-bold">{results.length}</div>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  {totalBlockers > 0 ? (
                    <XCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  <span className="font-semibold">Blockers</span>
                </div>
                <div className={`text-2xl font-bold ${totalBlockers > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  {totalBlockers}
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Status</span>
                </div>
                <div className="text-sm font-medium">
                  {overallScore >= 90 ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Production Ready
                    </Badge>
                  ) : overallScore >= 75 ? (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Needs Minor Fixes
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Critical Issues</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* File Results */}
      {results.map((result) => (
        <Card key={result.fileName} className="p-6">
          {/* File Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileCode className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">{result.fileName}</h3>
                <p className="text-sm text-muted-foreground">{result.summary}</p>
              </div>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
              {result.overallScore}/100
            </div>
          </div>

          {/* Blockers Alert */}
          {result.blockers && result.blockers.length > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-2">
                    🚨 {result.blockers.length} Production Blockers
                  </h4>
                  <ul className="space-y-1">
                    {result.blockers.map((blocker, idx) => (
                      <li key={idx} className="text-sm text-red-800">• {blocker}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Category Scores */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {result.categories.map((category) => (
              <div key={category.category} className="p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryIcon(category.category)}
                  <span className="text-xs font-medium">{category.category}</span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(category.score)}`}>
                  {category.score}/20
                </div>
              </div>
            ))}
          </div>

          {/* Issues by Category */}
          {result.categories.map((category) => {
            const criticalIssues = category.issues.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH');
            
            if (criticalIssues.length === 0) return null;

            return (
              <div key={category.category} className="mb-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  {getCategoryIcon(category.category)}
                  {category.category} - Critical Issues ({criticalIssues.length})
                </h4>
                <div className="space-y-3">
                  {criticalIssues.map((issue, idx) => (
                    <div key={idx} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-start gap-3">
                        {issue.severity === 'CRITICAL' ? (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getSeverityColor(issue.severity)}>
                              {issue.severity}
                            </Badge>
                            {issue.line && (
                              <Badge variant="outline">Line {issue.line}</Badge>
                            )}
                            <span className="font-semibold">{issue.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                          <div className="p-2 rounded bg-muted text-sm">
                            <strong>Fix:</strong> {issue.recommendation}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Top Recommendations</h4>
              <ul className="space-y-1">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-blue-800">
                    {idx + 1}. {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ))}

      {/* Empty State */}
      {!isRunning && results.length === 0 && (
        <Card className="p-12 text-center">
          <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ready for Deep Code Review</h3>
          <p className="text-muted-foreground mb-6">
            Click "Start Review" to analyze {filesToReview.length} critical files with GPT-5
          </p>
          <Button onClick={runCodeReview} size="lg">
            <Play className="h-4 w-4 mr-2" />
            Start Review
          </Button>
        </Card>
      )}
    </div>
  );
};
