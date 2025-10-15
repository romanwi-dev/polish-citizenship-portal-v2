import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"email" | "token">("email");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if client has portal access
      const { data: access } = await supabase
        .from("client_portal_access")
        .select("id, case_id")
        .eq("user_id", email)
        .maybeSingle();

      if (!access) {
        toast.error("No portal access found for this email");
        setLoading(false);
        return;
      }

      // Generate magic link token
      const magicToken = Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await supabase
        .from("client_portal_access")
        .update({
          magic_link_token: magicToken,
          magic_link_expires_at: expiresAt.toISOString(),
        })
        .eq("id", access.id);

      toast.success("Magic link code sent! Check your email.");
      setStep("token");
    } catch (error) {
      console.error("Error sending magic link:", error);
      toast.error("Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: access } = await supabase
        .from("client_portal_access")
        .select("*, cases(id, client_name)")
        .eq("magic_link_token", token)
        .gt("magic_link_expires_at", new Date().toISOString())
        .maybeSingle();

      if (!access) {
        toast.error("Invalid or expired token");
        setLoading(false);
        return;
      }

      // Update last login
      await supabase
        .from("client_portal_access")
        .update({
          last_login: new Date().toISOString(),
          login_count: (access.login_count || 0) + 1,
        })
        .eq("id", access.id);

      // Store session in localStorage
      localStorage.setItem("client_session", JSON.stringify({
        caseId: access.case_id,
        userId: access.user_id,
        loginTime: new Date().toISOString(),
      }));

      toast.success("Welcome to your portal!");
      navigate(`/client/dashboard/${access.case_id}`);
    } catch (error) {
      console.error("Error verifying token:", error);
      toast.error("Failed to verify token");
    } finally {
      setLoading(false);
    }
  };

  const handleDevAccess = async () => {
    setLoading(true);
    try {
      // Fetch first available case for testing
      const { data: cases } = await supabase
        .from("cases")
        .select("id, client_name")
        .limit(1)
        .single();

      if (!cases) {
        toast.error("No test cases available. Create a case first.");
        setLoading(false);
        return;
      }

      // Create dev session
      localStorage.setItem("client_session", JSON.stringify({
        caseId: cases.id,
        userId: "dev-user",
        loginTime: new Date().toISOString(),
      }));

      toast.success(`Dev Mode: Accessing ${cases.client_name}'s portal`);
      navigate(`/client/dashboard/${cases.id}`);
    } catch (error) {
      console.error("Error accessing dev mode:", error);
      toast.error("Failed to access dev mode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Client Portal Login</CardTitle>
          <CardDescription>
            {step === "email" 
              ? "Enter your email to receive a login code"
              : "Enter the code sent to your email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Login Code
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyToken} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Login Code</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Enter code from email"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("email")}
              >
                Back to Email
              </Button>
            </form>
          )}

          {/* Dev Mode Access - Only in Development */}
          {import.meta.env.DEV && (
            <div className="mt-6 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDevAccess}
                disabled={loading}
              >
                🔧 Dev Mode: Quick Access (Test Only)
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Development only - bypasses authentication
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
