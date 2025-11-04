import { useState } from "react";
import { 
  Loader2,
  Play,
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
    // === CRITICAL PATH FILES ===
    { 
      name: 'AIDocumentWorkflow.tsx',
      path: 'src/components/workflows/AIDocumentWorkflow.tsx',
      type: 'frontend',
      priority: 'critical' as const
    },

    // === EDGE FUNCTIONS (Backend) ===
    {
      name: 'ai-code-review',
      path: 'supabase/functions/ai-code-review/index.ts',
      type: 'edge-function',
      priority: 'critical' as const
    },
    {
      name: 'ocr-worker',
      path: 'supabase/functions/ocr-worker/index.ts',
      type: 'edge-function',
      priority: 'critical' as const
    },
    {
      name: 'download-dropbox-file',
      path: 'supabase/functions/download-dropbox-file/index.ts',
      type: 'edge-function',
      priority: 'high' as const
    },

    // === SECURITY ===
    {
      name: 'aiPIILogger.ts',
      path: 'src/utils/aiPIILogger.ts',
      type: 'security',
      priority: 'high' as const
    },
    {
      name: 'secureLogger.ts',
      path: 'src/utils/secureLogger.ts',
      type: 'security',
      priority: 'high' as const
    },

    // === PERFORMANCE ===
    {
      name: 'useWorkflowState.ts',
      path: 'src/hooks/useWorkflowState.ts',
      type: 'performance',
      priority: 'high' as const
    },
    {
      name: 'useDocumentProgress.ts',
      path: 'src/hooks/useDocumentProgress.ts',
      type: 'performance',
      priority: 'high' as const
    },
    {
      name: 'base64Encoder.worker.ts',
      path: 'src/workers/base64Encoder.worker.ts',
      type: 'performance',
      priority: 'high' as const
    },

    // === RELIABILITY ===
    {
      name: 'useRequestBatcher.ts',
      path: 'src/hooks/useRequestBatcher.ts',
      type: 'reliability',
      priority: 'high' as const
    },
    {
      name: 'DocumentProgressCard.tsx',
      path: 'src/components/workflows/DocumentProgressCard.tsx',
      type: 'reliability',
      priority: 'medium' as const
    },
    {
      name: 'BatchStatsDashboard.tsx',
      path: 'src/components/workflows/BatchStatsDashboard.tsx',
      type: 'reliability',
      priority: 'medium' as const
    },
    {
      name: 'staticCodeAnalyzer.ts',
      path: 'src/utils/staticCodeAnalyzer.ts',
      type: 'reliability',
      priority: 'medium' as const
    }
  ];

  const runStaticAnalysis = async () => {
    setCurrentFile('Running local analysis...');
    setProgress(10);

    console.log('🔍 Running static analysis...');
    
    const staticPromises = filesToReview.map(async (file) => {
      try {
        const content = getFileContent(file.path);
        return analyzeFile(file.name, content);
      } catch (error) {
        console.error(`Failed to load ${file.name}:`, error);
        // Return empty analysis for failed files
        return {
          fileName: file.name,
          issues: [],
          stats: {
            totalLines: 0,
            consoleLogsFound: 0,
            todosFound: 0,
            missingErrorHandling: 0,
            longFunctions: 0,
          }
        };
      }
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
        try {
          // Check if this is an edge function
          if (file.path.startsWith('supabase/functions/')) {
            console.log(`🔌 Fetching edge function via analyzer: ${file.name}`);
            const { data, error } = await supabase.functions.invoke('edge-function-analyzer', {
              body: { functionName: file.name }
            });

            if (error) {
              console.error(`Failed to analyze edge function ${file.name}:`, error);
              return null;
            }

            if (!data?.success || !data?.code) {
              console.error(`Edge function analyzer failed for ${file.name}:`, data);
              return null;
            }

            console.log(`✅ Loaded edge function ${file.name}: ${data.lineCount} lines`);
            return { fileName: file.name, fileContent: data.code, priority: file.priority };
          } else {
            // Regular frontend file
            const content = getFileContent(file.path);
            return { fileName: file.name, fileContent: content, priority: file.priority };
          }
        } catch (error) {
          console.error(`Failed to load ${file.name}:`, error);
          return null;
        }
      });

      const loadedFilesWithNulls = await Promise.all(filePromises);
      const loadedFiles = loadedFilesWithNulls.filter((f): f is { fileName: string; fileContent: string; priority: 'critical' | 'high' | 'medium' } => f !== null);
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

  const copyReport = async () => {
    if (results.length === 0) {
      toast({
        title: "No Report to Copy",
        description: "Run a code review first to generate a report.",
        variant: "destructive"
      });
      return;
    }

    const overallScore = results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length)
      : 0;

    const totalBlockers = results.reduce((sum, r) => sum + (r.blockers?.length || 0), 0);

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
    <div className="space-y-8 p-4 md:p-8">
      {/* Title - matching homepage style */}
      <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
        Deep Code Review
      </h1>

      {/* Action Buttons - 3 evenly spread in a row */}
      <div className="flex flex-col md:flex-row items-stretch gap-4 md:gap-6 w-full max-w-7xl mx-auto">
        <button
          onClick={runStaticAnalysisOnly}
          disabled={isRunning}
          className="h-16 md:h-20 flex-1 rounded-md border-2 bg-blue-50/45 dark:bg-blue-950/40 border-blue-200/30 dark:border-blue-800/30 hover:border-transparent focus:border-transparent transition-all duration-300 backdrop-blur font-normal font-input-work text-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-muted-foreground/80 hover:text-foreground"
          style={{
            boxShadow: '0 0 30px hsla(221, 83%, 53%, 0.15)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (!isRunning) {
              e.currentTarget.style.boxShadow = '0 0 50px hsla(221, 83%, 53%, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 30px hsla(221, 83%, 53%, 0.15)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 60px hsla(221, 83%, 53%, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = '0 0 30px hsla(221, 83%, 53%, 0.15)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {isRunning && showStaticOnly ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span>Quick Check</span>
            </>
          )}
        </button>

        <button
          onClick={copyReport}
          disabled={results.length === 0 && staticResults.length === 0}
          className="h-16 md:h-20 flex-1 rounded-md border-2 bg-blue-50/45 dark:bg-blue-950/40 border-blue-200/30 dark:border-blue-800/30 hover:border-transparent focus:border-transparent transition-all duration-300 backdrop-blur font-normal font-input-work text-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-muted-foreground/80 hover:text-foreground"
          style={{
            boxShadow: '0 0 30px hsla(221, 83%, 53%, 0.15)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (results.length > 0 || staticResults.length > 0) {
              e.currentTarget.style.boxShadow = '0 0 50px hsla(221, 83%, 53%, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 30px hsla(221, 83%, 53%, 0.15)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 60px hsla(221, 83%, 53%, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = '0 0 30px hsla(221, 83%, 53%, 0.15)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Copy className="h-5 w-5" />
          <span>Copy Report</span>
        </button>
        
        <button
          onClick={() => runCodeReview()}
          disabled={isRunning}
          className="h-16 md:h-20 flex-1 rounded-md border-2 bg-blue-50/45 dark:bg-blue-950/40 border-blue-200/30 dark:border-blue-800/30 hover:border-transparent focus:border-transparent transition-all duration-300 backdrop-blur font-normal font-input-work text-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-muted-foreground/80 hover:text-foreground"
          style={{
            boxShadow: '0 0 30px hsla(221, 83%, 53%, 0.15)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (!isRunning) {
              e.currentTarget.style.boxShadow = '0 0 50px hsla(221, 83%, 53%, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 30px hsla(221, 83%, 53%, 0.15)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 60px hsla(221, 83%, 53%, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = '0 0 30px hsla(221, 83%, 53%, 0.15)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {isRunning && !showStaticOnly ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              <span>Full Review</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
