/**
 * Inline AI Verification Display Component
 * Shows OpenAI verification results directly in chat with approval actions
 */

import { ChangeProposal, VerificationResult } from "@/utils/verificationWorkflow";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  FileEdit,
  Database,
  Zap,
  AlertCircle,
} from "lucide-react";

interface InlineVerificationDisplayProps {
  open: boolean;
  proposal: ChangeProposal;
  review: VerificationResult;
  onApprove: () => void;
  onApproveWithChanges: () => void;
  onReject: () => void;
  isImplementing?: boolean;
}

export function InlineVerificationDisplay({
  open,
  proposal,
  review,
  onApprove,
  onApproveWithChanges,
  onReject,
  isImplementing = false,
}: InlineVerificationDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 5) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 8) return "default";
    if (score >= 5) return "secondary";
    return "destructive";
  };

  const getRecommendationIcon = () => {
    switch (review.recommendation) {
      case "approve":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "approve_with_changes":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "reject":
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getRecommendationText = () => {
    switch (review.recommendation) {
      case "approve":
        return "Approve";
      case "approve_with_changes":
        return "Approve with Changes";
      case "reject":
        return "Reject";
    }
  };

  const hasCriticalIssues = review.criticalIssues.length > 0;
  const hasWarnings = review.warnings.length > 0;
  const hasSuggestions = review.suggestions.length > 0;

  return (
    <Dialog open={open} onOpenChange={() => !isImplementing && onReject()}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🤖 OpenAI Verification Review
          </DialogTitle>
          <DialogDescription>
            AI-powered analysis of proposed changes
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Proposal Summary */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileEdit className="h-4 w-4" />
                Change Proposal
              </h3>
              <div className="p-3 bg-muted/50 rounded-md space-y-2">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="ml-2">{proposal.type}</Badge>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Description:</span>
                  <p className="text-sm mt-1">{proposal.description}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Impact:</span>
                  <p className="text-sm mt-1">{proposal.impact}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Files Affected:</span>
                  <ul className="text-xs mt-1 space-y-1">
                    {proposal.files.map((file, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{file.action}</Badge>
                        <code className="text-xs">{file.path}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            {/* Overall Score */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Overall Assessment
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Score:</span>
                  <span className={`text-2xl font-bold ${getScoreColor(review.overallScore)}`}>
                    {review.overallScore.toFixed(1)}/10
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getRecommendationIcon()}
                  <span className="text-sm font-medium">{getRecommendationText()}</span>
                </div>
              </div>
            </div>

            {/* Dimension Scores */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Detailed Scores</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(review.scores).map(([dimension, scoreDetail]) => (
                  <div key={dimension} className="p-3 bg-muted/30 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium capitalize">
                        {dimension.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <Badge variant={getScoreBadgeVariant(scoreDetail.score)}>
                        {scoreDetail.score}/10
                      </Badge>
                    </div>
                    {scoreDetail.issues.length > 0 && (
                      <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                        {scoreDetail.issues.map((issue, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Issues */}
            {hasCriticalIssues && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-red-500">
                    <XCircle className="h-4 w-4" />
                    Critical Issues
                  </h3>
                  <ul className="space-y-2">
                    {review.criticalIssues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2 bg-red-500/10 rounded-md">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Warnings */}
            {hasWarnings && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-yellow-500">
                    <AlertTriangle className="h-4 w-4" />
                    Warnings
                  </h3>
                  <ul className="space-y-2">
                    {review.warnings.map((warning, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded-md">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Suggestions */}
            {hasSuggestions && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-blue-500">
                    <Info className="h-4 w-4" />
                    Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {review.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2 bg-blue-500/10 rounded-md">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Explanation */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">AI Explanation</h3>
              <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
                {review.explanation}
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {hasCriticalIssues && (
            <div className="w-full sm:w-auto text-xs text-red-500 flex items-center gap-1 mb-2 sm:mb-0">
              <AlertCircle className="h-3 w-3" />
              <span>Critical issues detected - review carefully before approving</span>
            </div>
          )}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onReject}
              disabled={isImplementing}
              className="flex-1 sm:flex-none"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            {review.recommendation === "approve_with_changes" && (
              <Button
                variant="secondary"
                onClick={onApproveWithChanges}
                disabled={isImplementing}
                className="flex-1 sm:flex-none"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Approve with Changes
              </Button>
            )}
            <Button
              onClick={onApprove}
              disabled={isImplementing}
              className="flex-1 sm:flex-none"
            >
              {isImplementing ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Implementing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve & Implement
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
