import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Loader2, CheckCircle } from "lucide-react";

export default function ClientLogin() {
  const { t } = useTranslation('portal');
  const [email, setEmail] = useState("");
  const [caseId, setCaseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleMagicLinkLogin = async () => {
    if (!email || !caseId) {
      toast.error(t('login.errorBothFields')); // Please enter both email and case ID
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("client-magic-link", {
        body: { email, caseId },
      });

      if (error) throw error;

      setShowEmailSent(true);
      toast.success(t('login.magicLinkSent')); // Magic link sent! Check your email to login securely.
    } catch (error: any) {
      console.error("Magic link error:", error);
      toast.error(error.message || t('login.errorSendLink')); // Failed to send magic link
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
            <CardTitle className="text-2xl">{t('login.checkEmail')}</CardTitle> {/* Check Your Email */}
            <CardDescription>
              {t('login.emailSentTo')} <strong>{email}</strong> {/* We've sent a secure login link to */}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {t('login.clickLinkInstructions')} {/* Click the link in the email to securely access your dashboard. The link will expire in 24 hours. */}
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
              {t('login.backToLogin')} {/* Back to Login */}
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
          <CardTitle className="text-2xl">{t('login.title')}</CardTitle> {/* Client Portal Login */}
          <CardDescription>
            {t('login.description')} {/* Enter your email and case ID to receive a secure login link */}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('login.emailLabel')}</Label> {/* Email Address */}
            <Input
              id="email"
              type="email"
              placeholder={t('login.emailPlaceholder')} // your.email@example.com
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caseId">{t('login.caseIdLabel')}</Label> {/* Case ID */}
            <Input
              id="caseId"
              type="text"
              placeholder={t('login.caseIdPlaceholder')} // Enter your case ID
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
                {t('login.sendingLink')} {/* Sending Secure Link... */}
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                {t('login.sendLinkButton')} {/* Send Login Link */}
              </>
            )}
          </Button>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{t('login.securityNote')}</strong> {t('login.securityMessage')}
              {/* Security Note: This portal uses passwordless authentication for maximum security. Your login link is time-limited and single-use only. */}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
