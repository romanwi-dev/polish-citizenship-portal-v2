import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Info, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function SecurityAudit() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    "Run full security audit on all tables and RLS policies",
    "Check for data exposure vulnerabilities",
    "Audit edge functions for injection risks",
    "Review authentication and authorization flows",
    "Verify OWASP Top 10 compliance",
  ];

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a security audit prompt");
      return;
    }

    setIsLoading(true);
    setResponse('');

    try {
      const { data, error } = await supabase.functions.invoke('ai-agent', {
        body: {
          caseId: '00000000-0000-0000-0000-000000000000', // System-wide audit
          action: 'security_audit',
          prompt: prompt,
        },
      });

      if (error) throw error;

      setResponse(data.response);
      
      toast.success("Security audit completed");
    } catch (error: any) {
      console.error('Security audit error:', error);
      toast.error(error.message || "Failed to run security audit");
      setResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight">
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Security Audit
          </span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          AI-powered security analysis for your Polish citizenship portal
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Auditor AI Agent
          </CardTitle>
          <CardDescription>
            Comprehensive security analysis covering RLS policies, authentication, data protection, and OWASP compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Prompts */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Audits</label>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((qp, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(qp)}
                  className="text-xs"
                >
                  {qp}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Security Audit Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Check all tables for RLS policy vulnerabilities and data exposure risks..."
              className="min-h-[120px]"
            />
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Security Audit...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Run Security Audit
              </>
            )}
          </Button>

          {/* Response */}
          {response && (
            <Alert>
              <AlertDescription className="whitespace-pre-wrap font-mono text-sm">
                {response}
              </AlertDescription>
            </Alert>
          )}

          {/* Security Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <div className="font-medium text-sm">Critical Issues</div>
                <div className="text-xs text-muted-foreground">Must fix immediately</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Medium Issues</div>
                <div className="text-xs text-muted-foreground">Fix before production</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Best Practices</div>
                <div className="text-xs text-muted-foreground">Recommendations</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Security Audit Checklist</CardTitle>
          <CardDescription>Areas covered by the security auditor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Database Security
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• RLS policies on all tables</li>
                <li>• User-based access control</li>
                <li>• Data masking for sensitive fields</li>
                <li>• Foreign key constraints</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Authentication
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• JWT token validation</li>
                <li>• Role-based access (RBAC)</li>
                <li>• Session management</li>
                <li>• No anonymous access</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Edge Functions
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Input validation (Zod schemas)</li>
                <li>• CORS configuration</li>
                <li>• Error handling</li>
                <li>• No secret exposure</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                OWASP Compliance
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• SQL injection prevention</li>
                <li>• XSS protection</li>
                <li>• CSRF tokens</li>
                <li>• Sensitive data exposure</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
