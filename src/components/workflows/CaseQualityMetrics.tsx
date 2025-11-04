import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Clock,
  FileCheck,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  document_type?: string;
  person_type?: string;
  ocr_confidence?: number;
  is_verified?: boolean;
  verification_status?: string;
}

interface CaseQualityMetricsProps {
  documents: Document[];
  requiredDocTypes?: string[];
  verificationResults?: any[];
}

export function CaseQualityMetrics({ 
  documents, 
  requiredDocTypes = [],
  verificationResults = []
}: CaseQualityMetricsProps) {
  
  const metrics = useMemo(() => {
    // Document Completeness
    const totalRequired = requiredDocTypes.length || 18; // Default to 18 if not specified
    const collectedDocs = documents.filter(d => d.document_type && d.person_type).length;
    const completeness = Math.round((collectedDocs / totalRequired) * 100);

    // Data Quality Score
    const docsWithOCR = documents.filter(d => d.ocr_confidence !== undefined);
    const avgOCRConfidence = docsWithOCR.length > 0
      ? docsWithOCR.reduce((sum, d) => sum + (d.ocr_confidence || 0), 0) / docsWithOCR.length
      : 0;

    const verifiedDocs = documents.filter(d => d.is_verified || d.verification_status === 'verified').length;
    const verificationScore = documents.length > 0 ? (verifiedDocs / documents.length) * 100 : 0;

    const missingFieldsCount = verificationResults.reduce((sum, result) => {
      const issues = result.gemini_issues || result.openai_issues || [];
      return sum + issues.filter((i: any) => i.type === 'missing_field').length;
    }, 0);

    // Calculate overall quality score (weighted average)
    const qualityScore = Math.round(
      (avgOCRConfidence * 0.4) + 
      (verificationScore * 0.3) + 
      (completeness * 0.3)
    );

    // Processing Speed (mock for now - would need actual timestamps)
    const avgProcessingTime = 2.3; // minutes per doc

    // Error Rate
    const failedDocs = documents.filter(d => d.verification_status === 'failed').length;
    const errorRate = documents.length > 0 ? Math.round((failedDocs / documents.length) * 100) : 0;

    // Readiness Indicator
    let readinessStatus: 'red' | 'yellow' | 'green' = 'red';
    let readinessText = 'Not Ready';
    
    if (completeness >= 90 && qualityScore >= 85) {
      readinessStatus = 'green';
      readinessText = 'Ready for PDF Generation';
    } else if (completeness >= 70 && qualityScore >= 70) {
      readinessStatus = 'yellow';
      readinessText = 'Nearly Ready';
    }

    return {
      completeness,
      collectedDocs,
      totalRequired,
      qualityScore,
      avgOCRConfidence: Math.round(avgOCRConfidence),
      verificationScore: Math.round(verificationScore),
      missingFieldsCount,
      avgProcessingTime,
      errorRate,
      failedDocs,
      readinessStatus,
      readinessText,
      verifiedDocs
    };
  }, [documents, requiredDocTypes, verificationResults]);

  const getReadinessColor = (status: 'red' | 'yellow' | 'green') => {
    switch (status) {
      case 'green': return 'text-success';
      case 'yellow': return 'text-warning';
      case 'red': return 'text-destructive';
    }
  };

  const getReadinessIcon = (status: 'red' | 'yellow' | 'green') => {
    switch (status) {
      case 'green': return <CheckCircle2 className="h-8 w-8" />;
      case 'yellow': return <AlertTriangle className="h-8 w-8" />;
      case 'red': return <AlertCircle className="h-8 w-8" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Document Completeness */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Document Completeness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{metrics.completeness}%</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.collectedDocs}/{metrics.totalRequired} docs
                </span>
              </div>
              <Progress value={metrics.completeness} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Data Quality Score */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Data Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className={cn(
                  "text-3xl font-bold",
                  metrics.qualityScore >= 85 ? "text-success" :
                  metrics.qualityScore >= 70 ? "text-warning" : "text-destructive"
                )}>
                  {metrics.qualityScore}/100
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">OCR Avg</div>
                  <div className="font-semibold">{metrics.avgOCRConfidence}%</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Verified</div>
                  <div className="font-semibold">{metrics.verifiedDocs}/{documents.length}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Speed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Processing Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{metrics.avgProcessingTime}</span>
                <span className="text-sm text-muted-foreground">min/doc</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Total: {documents.length} documents processed
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Readiness Indicator - Full Width */}
      <Card className={cn(
        "border-2",
        metrics.readinessStatus === 'green' && "border-success/50",
        metrics.readinessStatus === 'yellow' && "border-warning/50",
        metrics.readinessStatus === 'red' && "border-destructive/50"
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-full",
                metrics.readinessStatus === 'green' && "bg-success/10",
                metrics.readinessStatus === 'yellow' && "bg-warning/10",
                metrics.readinessStatus === 'red' && "bg-destructive/10"
              )}>
                <span className={getReadinessColor(metrics.readinessStatus)}>
                  {getReadinessIcon(metrics.readinessStatus)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold">{metrics.readinessText}</h3>
                <p className="text-sm text-muted-foreground">
                  {metrics.readinessStatus === 'green' && "All checks passed. Ready to generate PDFs."}
                  {metrics.readinessStatus === 'yellow' && "Minor issues detected. Review before proceeding."}
                  {metrics.readinessStatus === 'red' && "Critical items missing. Complete requirements first."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {metrics.errorRate > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">{metrics.errorRate}%</div>
                  <div className="text-xs text-muted-foreground">Error Rate</div>
                  <div className="text-xs text-destructive">{metrics.failedDocs} failed</div>
                </div>
              )}
              {metrics.missingFieldsCount > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">{metrics.missingFieldsCount}</div>
                  <div className="text-xs text-muted-foreground">Missing Fields</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
