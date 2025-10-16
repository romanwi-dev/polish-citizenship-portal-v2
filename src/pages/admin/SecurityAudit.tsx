import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2 } from 'lucide-react';
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
      <div className="space-y-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Security Audit
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            AI-powered security analysis for your Polish citizenship portal
          </p>
        </div>

        <div className="space-y-6">
          {/* Quick Prompts */}
          <div className="space-y-3">
            <label className="text-lg font-medium">Quick Audits</label>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((qp, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(qp)}
                >
                  {qp}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-3">
            <label className="text-lg font-medium">Custom Security Audit Prompt</label>
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
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Running Security Audit...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
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
        </div>
      </div>
    </AdminLayout>
  );
}
