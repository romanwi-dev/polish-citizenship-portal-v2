import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Clock,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ReviewHistoryItem {
  id: string;
  created_at: string;
  triggered_by: string;
  results: any[];
  overall_score: number;
  total_blockers: number;
  files_count: number;
  duration_seconds: number;
  status: string;
}

export function ReviewHistory() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewHistoryItem | null>(null);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['workflow-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as ReviewHistoryItem[];
    }
  });

  const getScoreTrend = (currentScore: number, previousScore?: number) => {
    if (!previousScore) return null;
    
    const diff = currentScore - previousScore;
    if (diff > 5) return { icon: TrendingUp, color: 'text-success', text: `+${diff}` };
    if (diff < -5) return { icon: TrendingDown, color: 'text-destructive', text: `${diff}` };
    return { icon: Minus, color: 'text-muted-foreground', text: '0' };
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const openReviewDetails = (review: ReviewHistoryItem) => {
    setSelectedReview(review);
    setIsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto py-8 text-center text-muted-foreground">
        <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No review history yet. Run your first review to see results here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto space-y-4">
        {/* Section Title */}
        <h2 className="text-2xl font-heading font-semibold flex items-center gap-2 text-foreground">
          <History className="h-6 w-6" />
          Review History
        </h2>

        {/* Review Items */}
        <div className="space-y-4">
          {reviews.map((review, index) => {
            const previousReview = reviews[index + 1];
            const trend = getScoreTrend(review.overall_score, previousReview?.overall_score);
            const scoreColor = getScoreColor(review.overall_score);

            return (
              <button
                key={review.id}
                onClick={() => openReviewDetails(review)}
                className="w-full h-auto min-h-[80px] rounded-md border-2 bg-blue-50/45 dark:bg-blue-950/40 border-blue-200/30 dark:border-blue-800/30 hover:border-transparent focus:border-transparent transition-all duration-300 backdrop-blur flex items-center justify-between p-4 text-left"
                style={{
                  boxShadow: '0 0 30px hsla(221, 83%, 53%, 0.15)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 50px hsla(221, 83%, 53%, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
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
                <div className="flex items-center gap-4 flex-1">
                  {/* Score Badge */}
                  <div className={cn("text-3xl font-bold", scoreColor)}>
                    {review.overall_score}
                  </div>

                  {/* Trend Indicator */}
                  {trend && (
                    <div className={cn("flex items-center gap-1", trend.color)}>
                      <trend.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{trend.text}</span>
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-medium text-foreground">
                        {review.files_count} files reviewed
                      </span>
                      {review.total_blockers > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {review.total_blockers} blocker{review.total_blockers > 1 ? 's' : ''}
                        </Badge>
                      )}
                      {review.status === 'completed' && review.total_blockers === 0 && (
                        <Badge variant="default" className="text-xs bg-success">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Clean
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </span>
                      <span>
                        Duration: {Math.round(review.duration_seconds / 60)}m {review.duration_seconds % 60}s
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Review Details Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Review Details
            </DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={cn("text-3xl font-bold", getScoreColor(selectedReview.overall_score))}>
                    {selectedReview.overall_score}/100
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{selectedReview.files_count}</div>
                  <div className="text-sm text-muted-foreground mt-1">Files</div>
                </div>
                <div className="text-center">
                  <div className={cn(
                    "text-3xl font-bold",
                    selectedReview.total_blockers > 0 ? "text-destructive" : "text-success"
                  )}>
                    {selectedReview.total_blockers}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Blockers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {Math.round(selectedReview.duration_seconds / 60)}m
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Duration</div>
                </div>
              </div>

              {/* File Results */}
              <div>
                <h4 className="font-semibold mb-3">File Scores</h4>
                <div className="space-y-2">
                  {selectedReview.results.map((result: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={cn(
                          "px-3 py-1 rounded font-bold",
                          result.overallScore >= 85 ? "bg-success/10 text-success" :
                          result.overallScore >= 70 ? "bg-warning/10 text-warning" :
                          "bg-destructive/10 text-destructive"
                        )}>
                          {result.overallScore}
                        </div>
                        <span className="font-mono text-sm">{result.fileName}</span>
                      </div>
                      {result.blockers?.length > 0 && (
                        <Badge variant="destructive">
                          {result.blockers.length} blocker{result.blockers.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Triggered by: {selectedReview.triggered_by}</p>
                <p>Completed: {new Date(selectedReview.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
