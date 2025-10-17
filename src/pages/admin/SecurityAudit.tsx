import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, Play, Clock, Database, Lock, FileCode, Activity, Wrench, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SecurityScoreCard from '@/components/SecurityScoreCard';
import SecurityIssuesList from '@/components/SecurityIssuesList';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SecurityScanResult {
  success: boolean;
  score: number;
  issues: any[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
    duration_ms: number;
  };
  compliance: {
    'OWASP Top 10': boolean;
    'GDPR Ready': boolean;
    'Production Ready': boolean;
  };
}

export default function SecurityAudit() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [scanResult, setScanResult] = useState<SecurityScanResult | null>(null);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [fixPlan, setFixPlan] = useState<string | null>(null);
  const [showFixDialog, setShowFixDialog] = useState(false);

  const runFullScan = async () => {
    setIsLoading(true);
    setScanResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('security-scan', {
        body: { scan_type: 'full' }
      });

      if (error) throw error;

      if (data.success) {
        setScanResult(data);
        setLastScanTime(new Date().toLocaleString());
        
        if (data.issues?.length === 0) {
          toast.success(`🎉 Perfect Security! Score: ${data.score}/100`, {
            description: 'No security issues detected. Your application is well-protected.'
          });
        } else if (data.summary.critical > 0) {
          toast.error(`⚠️ Critical Issues Found! Score: ${data.score}/100`, {
            description: `${data.summary.critical} critical issue(s) require immediate attention.`
          });
        } else if (data.score >= 95) {
          toast.success(`✅ Excellent Security! Score: ${data.score}/100`, {
            description: `${data.summary.total} minor issue(s) found.`
          });
        } else {
          toast.warning(`Security Scan Complete. Score: ${data.score}/100`, {
            description: `Found ${data.summary.total} issue(s) across ${data.summary.critical + data.summary.high} high-priority categories.`
          });
        }
      } else {
        throw new Error(data.error || 'Security scan failed');
      }
    } catch (error: any) {
      console.error('Security scan error:', error);
      toast.error(error.message || "Failed to run security scan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixAllIssues = async () => {
    if (!scanResult || scanResult.issues.length === 0) return;
    
    setIsFixing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('fix-security-issues', {
        body: { issues: scanResult.issues }
      });

      if (error) throw error;

      if (data.success) {
        setFixPlan(data.fixPlan);
        setShowFixDialog(true);
        toast.success(`Generated fix plan for ${data.issuesCount} issues`);
      } else {
        throw new Error(data.error || 'Failed to generate fix plan');
      }
    } catch (error: any) {
      console.error('Fix generation error:', error);
      toast.error(error.message || "Failed to generate fix plan");
    } finally {
      setIsFixing(false);
    }
  };

  const copyFixPlan = () => {
    if (!fixPlan) return;
    
    navigator.clipboard.writeText(fixPlan).then(() => {
      toast.success('Fix plan copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy fix plan');
    });
  };

  const quickScans = [
    { 
      name: 'RLS Policies Only', 
      icon: Lock, 
      description: 'Check Row-Level Security',
      action: () => toast.info('Feature coming soon')
    },
    { 
      name: 'Edge Functions Only', 
      icon: FileCode, 
      description: 'Audit backend functions',
      action: () => toast.info('Feature coming soon')
    },
    { 
      name: 'Database Security', 
      icon: Database, 
      description: 'Check DB configuration',
      action: () => toast.info('Feature coming soon')
    },
    { 
      name: 'Real-time Monitoring', 
      icon: Activity, 
      description: 'View security metrics',
      action: () => toast.info('Feature coming soon')
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center pt-8 md:pt-16">
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Maximum Security Audit
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Fortress-level security scanning with zero-tolerance enforcement
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 w-full">
          <Button 
            onClick={runFullScan} 
            disabled={isLoading}
            size="lg"
            className="flex-1 gap-2 rounded-sm"
            variant="destructive"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Running Comprehensive Scan...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Run Full Security Scan
              </>
            )}
          </Button>

          {lastScanTime && (
            <Button variant="outline" size="lg" className="gap-2" disabled>
              <Clock className="h-5 w-5" />
              Last scan: {lastScanTime}
            </Button>
          )}
          
          {scanResult && scanResult.summary.total > 0 && (
            <Button 
              onClick={handleFixAllIssues}
              disabled={isFixing}
              size="lg"
              variant="default"
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              {isFixing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Fixes...
                </>
              ) : (
                <>
                  <Wrench className="h-5 w-5" />
                  Generate Fix Plan
                </>
              )}
            </Button>
          )}
        </div>

        {/* Quick Scan Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-7xl mx-auto">
          {quickScans.map((scan) => (
            <Button
              key={scan.name}
              variant="outline"
              className="h-auto p-4 sm:p-6 flex items-center justify-center hover:bg-primary/5 transition-all"
              onClick={scan.action}
            >
              <div className="text-center w-full">
                <div className="font-semibold text-sm sm:text-base">{scan.name}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Results */}
        {scanResult && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <SecurityScoreCard
                  score={scanResult.score}
                  criticalIssues={scanResult.summary.critical}
                  highIssues={scanResult.summary.high}
                  mediumIssues={scanResult.summary.medium}
                  lowIssues={scanResult.summary.low}
                  infoIssues={scanResult.summary.info}
                  compliance={scanResult.compliance}
                />
              </div>
              
              <div className="lg:col-span-2">
                <SecurityIssuesList issues={scanResult.issues} />
              </div>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!scanResult && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Click "Run Full Security Scan" to analyze your application's security posture</p>
            <p className="text-sm mt-2">Scans 10 critical categories with maximum hardness rules</p>
          </div>
        )}
      </div>
      
      {/* Fix Plan Dialog */}
      <Dialog open={showFixDialog} onOpenChange={setShowFixDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Security Fix Plan
            </DialogTitle>
            <DialogDescription>
              AI-generated recommendations to fix all detected security issues
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
            <div className="whitespace-pre-wrap font-mono text-sm select-text cursor-text">
              {fixPlan || 'No fix plan available'}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={copyFixPlan}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy to Clipboard
            </Button>
            <Button onClick={() => setShowFixDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
