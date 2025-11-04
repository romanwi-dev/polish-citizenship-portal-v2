import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StaticAnalysisResult } from "@/utils/staticCodeAnalyzer";

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

interface CodeReviewResultsProps {
  results: ReviewResult[];
  staticResults?: StaticAnalysisResult[];
}

type FilterType = 'all' | 'blockers' | 'critical' | 'low-score';
type SortType = 'score' | 'name' | 'priority';

export function CodeReviewResults({ results, staticResults }: CodeReviewResultsProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('score');

  // Calculate overall metrics
  const metrics = useMemo(() => {
    if (results.length === 0) return null;

    const avgScore = Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length);
    const totalBlockers = results.reduce((sum, r) => sum + (r.blockers?.length || 0), 0);
    const criticalIssuesCount = results.reduce((sum, r) => 
      sum + r.criticalIssues.filter(i => i.severity === 'CRITICAL').length, 0
    );
    const highIssuesCount = results.reduce((sum, r) => 
      sum + r.criticalIssues.filter(i => i.severity === 'HIGH').length, 0
    );

    const scoreColor = avgScore >= 85 ? 'text-success' : avgScore >= 70 ? 'text-warning' : 'text-destructive';
    const statusText = totalBlockers === 0 ? 'Production Ready' : 'Action Required';
    const statusVariant = totalBlockers === 0 ? 'default' : 'destructive';

    return {
      avgScore,
      totalBlockers,
      criticalIssuesCount,
      highIssuesCount,
      filesReviewed: results.length,
      scoreColor,
      statusText,
      statusVariant
    };
  }, [results]);

  // Filter and sort results
  const filteredAndSortedResults = useMemo(() => {
    let filtered = [...results];

    // Apply filters
    switch (filter) {
      case 'blockers':
        filtered = filtered.filter(r => r.blockers && r.blockers.length > 0);
        break;
      case 'critical':
        filtered = filtered.filter(r => 
          r.criticalIssues.some(i => i.severity === 'CRITICAL' || i.severity === 'HIGH')
        );
        break;
      case 'low-score':
        filtered = filtered.filter(r => r.overallScore < 70);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return a.overallScore - b.overallScore;
        case 'name':
          return a.fileName.localeCompare(b.fileName);
        case 'priority':
          const aPriority = (a.blockers?.length || 0) * 100 + a.criticalIssues.length;
          const bPriority = (b.blockers?.length || 0) * 100 + b.criticalIssues.length;
          return bPriority - aPriority;
        default:
          return 0;
      }
    });

    return filtered;
  }, [results, filter, sortBy]);

  const toggleExpanded = (fileName: string) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileName)) {
        newSet.delete(fileName);
      } else {
        newSet.add(fileName);
      }
      return newSet;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-success/10';
    if (score >= 70) return 'bg-warning/10';
    return 'bg-destructive/10';
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Overall Metrics Card */}
      {metrics && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Review Summary</span>
              <Badge variant={metrics.statusVariant as any}>
                {metrics.statusText}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className={cn("text-3xl font-bold", metrics.scoreColor)}>
                  {metrics.avgScore}/100
                </div>
                <div className="text-sm text-muted-foreground mt-1">Avg Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">
                  {metrics.filesReviewed}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Files</div>
              </div>
              <div className="text-center">
                <div className={cn("text-3xl font-bold", metrics.totalBlockers > 0 ? "text-destructive" : "text-success")}>
                  {metrics.totalBlockers}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Blockers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-destructive">
                  {metrics.criticalIssuesCount}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning">
                  {metrics.highIssuesCount}
                </div>
                <div className="text-sm text-muted-foreground mt-1">High</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Show All ({results.length})
          </Button>
          <Button
            variant={filter === 'blockers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('blockers')}
          >
            Blockers Only
          </Button>
          <Button
            variant={filter === 'critical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('critical')}
          >
            Critical+
          </Button>
          <Button
            variant={filter === 'low-score' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('low-score')}
          >
            Score &lt;70
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="score">Score (Low to High)</option>
            <option value="name">File Name</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {/* File Results */}
      <div className="space-y-4">
        {filteredAndSortedResults.map((result) => {
          const isExpanded = expandedFiles.has(result.fileName);
          const scoreColor = getScoreColor(result.overallScore);
          const scoreBgColor = getScoreBgColor(result.overallScore);

          return (
            <Card key={result.fileName} className="overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleExpanded(result.fileName)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={cn("px-4 py-2 rounded-lg font-bold text-2xl", scoreBgColor, scoreColor)}>
                    {result.overallScore}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono font-semibold">{result.fileName}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {result.summary}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.blockers && result.blockers.length > 0 && (
                      <Badge variant="destructive">
                        {result.blockers.length} Blocker{result.blockers.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {result.criticalIssues.length > 0 && (
                      <Badge variant="secondary">
                        {result.criticalIssues.length} Issue{result.criticalIssues.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>

              {isExpanded && (
                <div className="border-t bg-muted/20 p-6 space-y-6">
                  {/* Summary */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Summary
                    </h4>
                    <p className="text-sm text-muted-foreground">{result.summary}</p>
                  </div>

                  {/* Blockers */}
                  {result.blockers && result.blockers.length > 0 && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        Production Blockers ({result.blockers.length})
                      </h4>
                      <ul className="space-y-2">
                        {result.blockers.map((blocker, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="font-bold text-destructive">{idx + 1}.</span>
                            <span>{blocker}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Critical Issues */}
                  {result.criticalIssues.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Issues ({result.criticalIssues.length})
                      </h4>
                      <div className="space-y-3">
                        {result.criticalIssues.map((issue, idx) => (
                          <div key={idx} className="bg-background border rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <Badge variant={issue.severity === 'CRITICAL' ? 'destructive' : 'secondary'}>
                                {issue.severity}
                              </Badge>
                              <div className="flex-1">
                                <div className="font-semibold mb-1">{issue.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-semibold">Fix:</span> {issue.fix}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filteredAndSortedResults.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No files match the current filter. Try adjusting your filters.
          </p>
        </Card>
      )}
    </div>
  );
}
