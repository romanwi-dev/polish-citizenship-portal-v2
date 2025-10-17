import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, Play, Clock, Database, Lock, FileCode, Activity, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SecurityScoreCard from '@/components/SecurityScoreCard';
import SecurityIssuesList from '@/components/SecurityIssuesList';

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
  const [scanResult, setScanResult] = useState<SecurityScanResult | null>(null);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);

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
        
        if (data.summary.critical > 0) {
          toast.error(`Critical issues detected! Score: ${data.score}/100`);
        } else if (data.score >= 95) {
          toast.success(`Excellent! Score: ${data.score}/100`);
        } else {
          toast.warning(`Security audit complete. Score: ${data.score}/100`);
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

  const handleFixAllIssues = () => {
    if (!scanResult) return;
    
    // Group issues by severity for better organization
    const criticalIssues = scanResult.issues.filter(i => i.severity === 'critical');
    const highIssues = scanResult.issues.filter(i => i.severity === 'high');
    const mediumIssues = scanResult.issues.filter(i => i.severity === 'medium');
    const lowIssues = scanResult.issues.filter(i => i.severity === 'low');
    const infoIssues = scanResult.issues.filter(i => i.severity === 'info');
    
    let fixPrompt = `Please fix all the security issues detected by the security scan:\n\n`;
    
    if (criticalIssues.length > 0) {
      fixPrompt += `🚨 CRITICAL ISSUES (${criticalIssues.length}):\n`;
      criticalIssues.forEach((issue, idx) => {
        fixPrompt += `${idx + 1}. [${issue.category}] ${issue.title}\n`;
        fixPrompt += `   Description: ${issue.description}\n`;
        fixPrompt += `   Remediation: ${issue.remediation}\n`;
        if (issue.affected_items?.length) {
          fixPrompt += `   Affected: ${issue.affected_items.join(', ')}\n`;
        }
        fixPrompt += `\n`;
      });
    }
    
    if (highIssues.length > 0) {
      fixPrompt += `⚠️ HIGH PRIORITY ISSUES (${highIssues.length}):\n`;
      highIssues.forEach((issue, idx) => {
        fixPrompt += `${idx + 1}. [${issue.category}] ${issue.title}\n`;
        fixPrompt += `   Description: ${issue.description}\n`;
        fixPrompt += `   Remediation: ${issue.remediation}\n`;
        if (issue.affected_items?.length) {
          fixPrompt += `   Affected: ${issue.affected_items.join(', ')}\n`;
        }
        fixPrompt += `\n`;
      });
    }
    
    if (mediumIssues.length > 0) {
      fixPrompt += `📋 MEDIUM PRIORITY ISSUES (${mediumIssues.length}):\n`;
      mediumIssues.forEach((issue, idx) => {
        fixPrompt += `${idx + 1}. [${issue.category}] ${issue.title}\n`;
        fixPrompt += `   Remediation: ${issue.remediation}\n\n`;
      });
    }
    
    if (lowIssues.length > 0) {
      fixPrompt += `ℹ️ LOW PRIORITY ISSUES (${lowIssues.length}):\n`;
      lowIssues.forEach((issue, idx) => {
        fixPrompt += `${idx + 1}. ${issue.title}\n`;
      });
      fixPrompt += `\n`;
    }
    
    if (infoIssues.length > 0) {
      fixPrompt += `📝 INFORMATIONAL (${infoIssues.length}):\n`;
      infoIssues.forEach((issue, idx) => {
        fixPrompt += `${idx + 1}. ${issue.title}\n`;
      });
      fixPrompt += `\n`;
    }
    
    fixPrompt += `\nSUMMARY:\n`;
    fixPrompt += `Total Issues: ${scanResult.summary.total}\n`;
    fixPrompt += `- Critical: ${scanResult.summary.critical}\n`;
    fixPrompt += `- High: ${scanResult.summary.high}\n`;
    fixPrompt += `- Medium: ${scanResult.summary.medium}\n`;
    fixPrompt += `- Low: ${scanResult.summary.low}\n`;
    fixPrompt += `- Info: ${scanResult.summary.info}\n`;
    fixPrompt += `\nCurrent Security Score: ${scanResult.score}/100\n`;
    fixPrompt += `\nPlease implement the recommended remediations for all issues, prioritizing critical and high severity items first.`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(fixPrompt).then(() => {
      toast.success('Detailed security issues copied to clipboard! Paste in chat to fix all issues.');
    }).catch(() => {
      toast.error('Failed to copy. Please manually ask AI to fix the security issues.');
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
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            onClick={runFullScan} 
            disabled={isLoading}
            size="lg"
            className="gap-2 bg-red-500 hover:bg-red-600 text-white"
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
              size="lg"
              variant="default"
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Wrench className="h-5 w-5" />
              Fix All Issues
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
    </AdminLayout>
  );
}
