import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Loader2, Activity } from "lucide-react";

export default function AIAgentDiagnostics() {
  const [healthCheck, setHealthCheck] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runHealthCheck = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-agent/health');
      
      if (error) {
        setHealthCheck({ 
          status: 'error', 
          message: error.message,
          details: error 
        });
      } else {
        setHealthCheck({ 
          status: 'success', 
          data 
        });
      }
    } catch (e: any) {
      setHealthCheck({ 
        status: 'error', 
        message: e.message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runFullTest = async () => {
    setIsLoading(true);
    const results: any[] = [];
    
    // Test each agent action
    const actions = [
      'comprehensive', 'eligibility_analysis', 'document_check',
      'task_suggest', 'wsc_strategy', 'form_populate',
      'researcher', 'translator', 'writer', 'designer', 'security_audit'
    ];
    
    for (const action of actions) {
      try {
        const { data, error } = await supabase.functions.invoke('ai-agent', {
          body: {
            caseId: action === 'security_audit' ? undefined : 'test-diagnostic',
            prompt: 'Test prompt for diagnostic',
            action
          }
        });
        
        results.push({
          action,
          status: error ? 'error' : 'success',
          error: error?.message,
          responseLength: data?.response?.length || 0
        });
      } catch (e: any) {
        results.push({
          action,
          status: 'error',
          error: e.message
        });
      }
    }
    
    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Agent Diagnostics</h1>
          <p className="text-muted-foreground">Test edge function deployment and functionality</p>
        </div>

        {/* Health Check Card */}
        <Card>
          <CardHeader>
            <CardTitle>Health Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runHealthCheck} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
              Run Health Check
            </Button>
            
            {healthCheck && (
              <div className="p-4 bg-muted rounded-lg">
                {healthCheck.status === 'success' ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-bold">Function is deployed and healthy</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="font-bold">Function is NOT responding</span>
                  </div>
                )}
                <pre className="mt-2 text-sm overflow-auto">{JSON.stringify(healthCheck, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Full Test Card */}
        <Card>
          <CardHeader>
            <CardTitle>Full Agent Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runFullTest} disabled={isLoading} variant="secondary">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
              Test All 11 Agent Actions
            </Button>
            
            {testResults.length > 0 && (
              <div className="space-y-2">
                {testResults.map((result, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-mono">{result.action}</span>
                    <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-bold">Supabase Project ID:</dt>
                <dd className="font-mono text-sm">oogmuakyqadpynnrasnd</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-bold">Function Name:</dt>
                <dd className="font-mono text-sm">ai-agent</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-bold">JWT Verification:</dt>
                <dd className="font-mono text-sm">Enabled (verify_jwt = true)</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-bold">Expected URL:</dt>
                <dd className="font-mono text-sm break-all">
                  https://oogmuakyqadpynnrasnd.supabase.co/functions/v1/ai-agent
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
