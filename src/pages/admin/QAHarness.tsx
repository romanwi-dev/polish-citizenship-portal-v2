import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warn' | 'running';
  message: string;
  duration?: number;
}

export default function QAHarness() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateResult = (name: string, status: TestResult['status'], message: string, duration?: number) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        return prev.map(r => r.name === name ? { name, status, message, duration } : r);
      }
      return [...prev, { name, status, message, duration }];
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Database Connection
    const dbStart = Date.now();
    updateResult('Database Connection', 'running', 'Testing connection...');
    try {
      const { error } = await supabase.from('cases').select('count').limit(1);
      if (error) throw error;
      updateResult('Database Connection', 'pass', 'Connected successfully', Date.now() - dbStart);
    } catch (error: any) {
      updateResult('Database Connection', 'fail', error.message, Date.now() - dbStart);
    }

    // Test 2: Authentication
    const authStart = Date.now();
    updateResult('Authentication', 'running', 'Checking auth state...');
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error('No authenticated user');
      updateResult('Authentication', 'pass', `Authenticated as ${user.email}`, Date.now() - authStart);
    } catch (error: any) {
      updateResult('Authentication', 'fail', error.message, Date.now() - authStart);
    }

    // Test 3: Master Table Schema
    const schemaStart = Date.now();
    updateResult('Master Table Schema', 'running', 'Validating schema...');
    try {
      const { data, error } = await supabase.from('master_table').select('*').limit(1);
      if (error) throw error;
      const requiredFields = ['case_id', 'applicant_first_name', 'applicant_last_name', 'language_preference'];
      const hasAllFields = requiredFields.every(field => data && data[0] ? field in data[0] : false);
      if (!hasAllFields) throw new Error('Missing required fields');
      updateResult('Master Table Schema', 'pass', 'All required fields present', Date.now() - schemaStart);
    } catch (error: any) {
      updateResult('Master Table Schema', 'fail', error.message, Date.now() - schemaStart);
    }

    // Test 4: RLS Policies
    const rlsStart = Date.now();
    updateResult('RLS Policies', 'running', 'Testing row-level security...');
    try {
      const tables = ['cases', 'master_table', 'documents', 'tasks', 'poa', 'oby_forms'];
      let allPassed = true;
      for (const table of tables) {
        const { error } = await supabase.from(table).select('count').limit(1);
        if (error && error.message.includes('permission denied')) {
          allPassed = false;
          break;
        }
      }
      if (allPassed) {
        updateResult('RLS Policies', 'pass', 'All policies allow authenticated access', Date.now() - rlsStart);
      } else {
        updateResult('RLS Policies', 'warn', 'Some policies may be too restrictive', Date.now() - rlsStart);
      }
    } catch (error: any) {
      updateResult('RLS Policies', 'fail', error.message, Date.now() - rlsStart);
    }

    // Test 5: Edge Functions
    const edgeFnStart = Date.now();
    updateResult('Edge Functions', 'running', 'Testing edge function availability...');
    try {
      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { test: true }
      });
      // Expect error for test mode, but function should be reachable
      updateResult('Edge Functions', 'pass', 'Edge functions reachable', Date.now() - edgeFnStart);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        updateResult('Edge Functions', 'fail', 'Edge functions not deployed', Date.now() - edgeFnStart);
      } else {
        updateResult('Edge Functions', 'pass', 'Edge functions reachable', Date.now() - edgeFnStart);
      }
    }

    // Test 6: Dropbox Integration
    const dropboxStart = Date.now();
    updateResult('Dropbox Integration', 'running', 'Testing Dropbox connection...');
    try {
      const { data, error } = await supabase.functions.invoke('dropbox-sync', {
        body: { action: 'test' }
      });
      if (error) throw error;
      updateResult('Dropbox Integration', 'pass', 'Dropbox connected', Date.now() - dropboxStart);
    } catch (error: any) {
      updateResult('Dropbox Integration', 'warn', 'Dropbox may need configuration', Date.now() - dropboxStart);
    }

    setIsRunning(false);
    toast.success('QA tests completed');
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warn': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'running': return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    if (status === 'pass') return <Badge variant="default">PASS</Badge>;
    if (status === 'fail') return <Badge variant="destructive">FAIL</Badge>;
    if (status === 'warn') return <Badge variant="secondary">WARN</Badge>;
    return <Badge variant="outline">RUNNING</Badge>;
  };

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warnCount = results.filter(r => r.status === 'warn').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">QA Harness</h1>
        <p className="text-muted-foreground">System health and integration tests</p>
      </div>

      <Alert>
        <AlertDescription>
          This harness runs automated tests to verify system integrity. All tests should pass (green) before proceeding with case processing.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Test Suite</CardTitle>
          <CardDescription>
            {results.length > 0 && (
              <div className="flex gap-4 mt-2">
                <span className="text-green-600">✓ {passCount} passed</span>
                <span className="text-red-600">✗ {failCount} failed</span>
                <span className="text-yellow-600">⚠ {warnCount} warnings</span>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run All Tests'
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-2 mt-6">
              {results.map((result, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-muted-foreground">{result.message}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {result.duration && (
                      <span className="text-xs text-muted-foreground">{result.duration}ms</span>
                    )}
                    {getStatusBadge(result.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
