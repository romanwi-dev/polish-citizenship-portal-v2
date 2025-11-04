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
  Code,
  Copy,
  Search
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getFileContent } from "@/data/reviewFileContents";
import { analyzeFile, generateSummary, type StaticAnalysisResult } from "@/utils/staticCodeAnalyzer";

interface ReviewResult {
  fileName: string;
  overallScore: number;
  summary: string;
  blockers: string[];
  criticalIssues: Array<{
    severity: 'CRITICAL' | 'HIGH';
    title: string;
    fix: string;
  }>;
}

export const CodeReviewDashboard = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [staticResults, setStaticResults] = useState<StaticAnalysisResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [showStaticOnly, setShowStaticOnly] = useState(false);

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

  const runStaticAnalysis = async () => {
    setCurrentFile('Running local analysis...');
    setProgress(10);

    console.log('🔍 Running static analysis...');
    
    const staticPromises = filesToReview.map(async (file) => {
      let content = '';
      if (file.path.startsWith('supabase/functions/')) {
        const functionName = file.path.split('/')[2];
        const { data, error } = await supabase.functions.invoke('edge-function-analyzer', {
          body: { functionName }
        });
        if (error || !data?.success) throw new Error(`Failed to load ${functionName}`);
        content = data.code;
      } else {
        content = getFileContent(file.path);
      }
      return analyzeFile(file.name, content);
    });

    const staticAnalysisResults = await Promise.all(staticPromises);
    setStaticResults(staticAnalysisResults);
    setProgress(20);

    const summary = generateSummary(staticAnalysisResults);
    
    console.log('✅ Static analysis complete:', summary);
    
    return { staticAnalysisResults, summary };
  };

  const runCodeReview = async (skipStatic = false) => {
    setIsRunning(true);
    setResults([]);
    setStaticResults([]);
    setProgress(0);
    setCurrentFile('Loading files...');

    try {
      // STEP 1: Run static analysis first (0-20% progress)
      let staticSummary;
      if (!skipStatic) {
        const { summary } = await runStaticAnalysis();
        staticSummary = summary;
      }

      // STEP 2: Load all file contents in parallel (20-40% progress)
      console.log('📦 Loading all file contents...');
      const filePromises = filesToReview.map(async (file) => {
        if (file.path.startsWith('supabase/functions/')) {
          const functionName = file.path.split('/')[2];
          const { data, error } = await supabase.functions.invoke('edge-function-analyzer', {
            body: { functionName }
          });
          if (error || !data?.success) throw new Error(`Failed to load ${functionName}`);
          return { fileName: file.name, fileContent: data.code, priority: file.priority };
        } else {
          const content = getFileContent(file.path);
          return { fileName: file.name, fileContent: content, priority: file.priority };
        }
      });

      const loadedFiles = await Promise.all(filePromises);
      setProgress(40);
      setCurrentFile('Analyzing with AI...');
      
      console.log(`✅ Loaded ${loadedFiles.length} files`);

      // STEP 3: Single batch AI call (40-100% progress)
      console.log('🤖 Sending batch to AI...');
      const { data, error } = await supabase.functions.invoke('ai-code-review', {
        body: { files: loadedFiles }
      });

      if (error) {
        console.error('AI review error:', error);
        throw new Error(`AI review failed: ${error.message}`);
      }

      if (!data?.reviews) {
        console.error('No review data:', data);
        throw new Error('No review data returned');
      }

      setProgress(100);
      setResults(data.reviews);

      const avgScore = data.summary.averageScore;
      const totalBlockers = data.summary.totalBlockers;

      const staticIssuesCount = staticSummary ? staticSummary.totalIssues : 0;

      toast({
        title: totalBlockers === 0 ? "✅ Production Ready!" : "⚠️ Review Complete",
        description: `${data.reviews.length} files analyzed. Score: ${avgScore}/100. ${totalBlockers} blockers + ${staticIssuesCount} static issues found.`,
        variant: totalBlockers === 0 ? "default" : "destructive"
      });

    } catch (error: any) {
      console.error('❌ Code review error:', error);
      
      const errorMessage = error.message || "An unexpected error occurred";
      
      if (errorMessage.includes('AI credits exhausted') || errorMessage.includes('402')) {
        toast({
          title: "🪙 Out of AI Credits",
          description: "Add credits in Settings → Workspace → Usage to continue.",
          variant: "destructive"
        });
      } else if (errorMessage.includes('Rate limit') || errorMessage.includes('429')) {
        toast({
          title: "⏱️ Rate Limited",
          description: "Too many requests. Please wait a moment and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Code Review Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsRunning(false);
      setCurrentFile('');
    }
  };

  const runStaticAnalysisOnly = async () => {
    setIsRunning(true);
    setResults([]);
    setStaticResults([]);
    setProgress(0);
    setShowStaticOnly(true);

    try {
      const { summary } = await runStaticAnalysis();
      setProgress(100);

      toast({
        title: "🔍 Static Analysis Complete",
        description: `Found ${summary.totalIssues} issues (${summary.totalWarnings} warnings, ${summary.totalInfo} info) - No AI credits used!`,
      });
    } catch (error: any) {
      console.error('❌ Static analysis error:', error);
      toast({
        title: "Static Analysis Failed",
        description: error.message || "An unexpected error occurred",
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
  const totalStaticIssues = staticResults.reduce((sum, r) => sum + r.issues.length, 0);
  const totalStaticWarnings = staticResults.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'warning').length, 0);

  const copyReport = async () => {
    if (results.length === 0) {
      toast({
        title: "No Report to Copy",
        description: "Run a code review first to generate a report.",
        variant: "destructive"
      });
      return;
    }

    const reportText = `
# Deep Code Review Report - ${new Date().toLocaleDateString()}

## Overall Summary
- Overall Score: ${overallScore}/100
- Files Reviewed: ${results.length}
- Production Blockers: ${totalBlockers}
- Status: ${totalBlockers === 0 ? '✅ Production Ready' : '⚠️ Blockers Found'}

${results.map(result => `
## ${result.fileName}
**Score: ${result.overallScore}/100**
${result.summary}

${result.blockers.length > 0 ? `
### 🚨 Production Blockers (${result.blockers.length})
${result.blockers.map((b, i) => `${i + 1}. ${b}`).join('\n')}
` : ''}

${result.criticalIssues.length > 0 ? `
### Critical Issues (${result.criticalIssues.length})
${result.criticalIssues.map((issue, idx) => `
**[${issue.severity}] ${issue.title}**
Fix: ${issue.fix}
`).join('\n')}` : ''}

---
`).join('\n')}
`.trim();

    try {
      await navigator.clipboard.writeText(reportText);
      toast({
        title: "Report Copied!",
        description: "The full code review report has been copied to your clipboard."
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive"
      });
    }
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Sprint 3: Deep Code Review</h2>
            <p className="text-muted-foreground">
              AI batch analysis of {filesToReview.length} files in 1 call (93% fewer API requests)
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={runStaticAnalysisOnly}
            disabled={isRunning}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            {isRunning && showStaticOnly ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Quick Check (No AI)
              </>
            )}
          </Button>

          <Button
            onClick={copyReport}
            disabled={results.length === 0 && staticResults.length === 0}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Report
          </Button>
          
          <Button
            onClick={() => runCodeReview()}
            disabled={isRunning}
            size="lg"
            className="gap-2"
          >
            {isRunning && !showStaticOnly ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Full Review (AI)
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress */}
      {isRunning && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Reviewing: {currentFile}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {results.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}/100
              </div>
              <div>
                <h3 className="text-lg font-semibold">Overall Score</h3>
                <p className="text-sm text-muted-foreground">
                  {totalBlockers === 0 ? '✅ Production Ready' : `⚠️ ${totalBlockers} Blockers Found`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">{results.length}</div>
                <div className="text-muted-foreground">Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{totalBlockers}</div>
                <div className="text-muted-foreground">Blockers</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* AI Review File Results */}
      {results.map((result, idx) => (
        <Card key={idx} className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <FileCode className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">{result.fileName}</h3>
                  <p className="text-sm text-muted-foreground">{result.summary}</p>
                </div>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(result.overallScore)}`}>
                {result.overallScore}/100
              </div>
            </div>

            {/* Blockers */}
            {result.blockers.length > 0 && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-red-900 dark:text-red-200 flex items-center gap-2 mb-3">
                  <XCircle className="h-5 w-5" />
                  🚨 Production Blockers ({result.blockers.length})
                </h4>
                <ul className="space-y-2">
                  {result.blockers.map((blocker, bidx) => (
                    <li key={bidx} className="text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
                      <span className="font-bold mt-0.5">{bidx + 1}.</span>
                      <span>{blocker}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Critical Issues */}
            {result.criticalIssues.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Critical Issues ({result.criticalIssues.length})
                </h4>
                <div className="space-y-3">
                  {result.criticalIssues.map((issue, iidx) => (
                    <div key={iidx} className="p-3 rounded-lg bg-background/50 backdrop-blur border">
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
                            <span className="font-semibold">{issue.title}</span>
                          </div>
                          <div className="p-2 rounded bg-muted/50 text-sm">
                            <strong>Fix:</strong> {issue.fix}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}

      {/* Empty State */}
      {!isRunning && results.length === 0 && staticResults.length === 0 && (
        <div className="py-20 text-center">
          <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ready for Code Review</h3>
          <p className="text-muted-foreground mb-6">
            Start with a quick local check (free) or run full AI analysis
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={runStaticAnalysisOnly} size="lg" variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Quick Check (Free)
            </Button>
            <Button onClick={() => runCodeReview()} size="lg">
              <Play className="h-4 w-4 mr-2" />
              Full AI Review
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
