import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Loader2, CheckCircle } from "lucide-react";

export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [caseId, setCaseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleMagicLinkLogin = async () => {
    if (!email || !caseId) {
      toast.error("Please enter both email and case ID");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("client-magic-link", {
        body: { email, caseId },
      });

      if (error) throw error;

      setShowEmailSent(true);
      toast.success("Magic link sent! Check your email to login securely.");
    } catch (error: any) {
      console.error("Magic link error:", error);
      toast.error(error.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  if (showEmailSent) {
    return (
      <div className="flex items-center justify-center p-4 min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a secure login link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Click the link in the email to securely access your dashboard.
              The link will expire in 24 hours.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowEmailSent(false);
                setEmail("");
                setCaseId("");
              }}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Client Portal Login</CardTitle>
          <CardDescription>
            Enter your email and case ID to receive a secure login link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caseId">Case ID</Label>
            <Input
              id="caseId"
              type="text"
              placeholder="Enter your case ID"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleMagicLinkLogin}
            className="w-full"
            disabled={loading || !email || !caseId}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Secure Link...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Login Link
              </>
            )}
          </Button>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Security Note:</strong> This portal uses passwordless authentication for maximum security.
              Your login link is time-limited and single-use only.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
