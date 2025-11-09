import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, AlertTriangle, CheckCircle2, Scan, Zap } from "lucide-react";
import { 
  MobileFirstScanResult, 
  getComplianceColor, 
  getSeverityColor,
  MOBILE_FIRST_RULES 
} from "@/utils/mobileFirstChecks";

export function MobileFirstGuardian() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<MobileFirstScanResult | null>(null);

  const runScan = async () => {
    setScanning(true);
    toast.info("🔍 Mobile-First Guardian scanning...");

    try {
      // Scan critical mobile-first files
      const filesToScan = [
        { path: "index.html", type: "viewport" },
        { path: "src/pages/admin/POAForm.tsx", type: "forms" },
        { path: "src/components/poa/POAOCRScanner.tsx", type: "upload" },
        { path: "src/components/poa/PDFPreviewDialog.tsx", type: "preview" },
        { path: "src/components/POAFormField.tsx", type: "inputs" },
        { path: "src/index.css", type: "styles" }
      ];

      const { data, error } = await supabase.functions.invoke('mobile-first-guardian', {
        body: { 
          action: 'scan',
          files: filesToScan
        }
      });

      if (error) throw error;

      if (data.success && data.result) {
        setResult(data.result);
        
        const score = data.result.overallScore;
        if (score >= 90) {
          toast.success(`✅ Excellent! Score: ${score}/100`);
        } else if (score >= 70) {
          toast.warning(`⚠️ Good but needs work: ${score}/100`);
        } else {
          toast.error(`🚨 Critical issues found: ${score}/100`);
        }
      } else {
        throw new Error(data.error || "Scan failed");
      }
    } catch (err) {
      console.error("Guardian scan error:", err);
      toast.error("Scan failed. Check console for details.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Mobile-First Guardian</CardTitle>
                <CardDescription>
                  Continuous compliance monitoring for mobile-first development
                </CardDescription>
              </div>
            </div>
            <Button onClick={runScan} disabled={scanning} size="lg">
              <Scan className="mr-2 h-5 w-5" />
              {scanning ? "Scanning..." : "Run Full Scan"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Mobile-First Rules Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mobile-First Rules</CardTitle>
          <CardDescription>Core principles enforced by the Guardian</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(MOBILE_FIRST_RULES).map(([key, rule]) => (
              <div key={key} className="flex items-start gap-2 p-3 border rounded-lg">
                <Badge className={getSeverityColor(rule.severity)}>
                  {rule.severity}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">{rule.check}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scan Results */}
      {result && (
        <>
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle>Scan Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold">{result.overallScore}/100</p>
                  <p className={`text-lg font-medium ${getComplianceColor(result.compliance)}`}>
                    {result.compliance.toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Violations Found</p>
                  <p className="text-3xl font-bold">{result.violations.length}</p>
                </div>
              </div>
              
              {result.summary && (
                <>
                  <Separator className="my-4" />
                  <p className="text-sm text-muted-foreground">{result.summary}</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Violations */}
          {result.violations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Violations ({result.violations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {result.violations.map((violation, idx) => (
                      <Alert key={idx} variant={violation.severity === 'critical' ? 'destructive' : 'default'}>
                        <div className="flex items-start gap-3">
                          <Badge className={getSeverityColor(violation.severity)}>
                            {violation.severity}
                          </Badge>
                          <div className="flex-1 space-y-2">
                            <AlertTitle className="text-sm font-medium">
                              {violation.rule}
                              {violation.file && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {violation.file}
                                  {violation.line && `:${violation.line}`}
                                </span>
                              )}
                            </AlertTitle>
                            <AlertDescription className="space-y-2">
                              <p className="text-sm">
                                <strong>Issue:</strong> {violation.issue}
                              </p>
                              <p className="text-sm">
                                <strong>Impact:</strong> {violation.impact}
                              </p>
                              <div className="bg-muted p-2 rounded text-xs font-mono">
                                <strong>Fix:</strong> {violation.fix}
                              </div>
                            </AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!result && !scanning && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No scan results yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click "Run Full Scan" to analyze your project for mobile-first compliance
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
