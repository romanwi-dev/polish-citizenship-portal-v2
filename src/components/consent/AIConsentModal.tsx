import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIConsentModalProps {
  open: boolean;
  onConsent: () => void;
  onDecline: () => void;
  caseId: string;
}

export function AIConsentModal({ open, onConsent, onDecline, caseId }: AIConsentModalProps) {
  const [understood, setUnderstood] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConsent = async () => {
    if (!understood) {
      toast.error("Please confirm you understand before proceeding");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('cases')
        .update({
          ai_processing_consent: true,
          ai_consent_given_at: new Date().toISOString(),
          ai_consent_given_by: user?.id,
        })
        .eq('id', caseId);

      if (error) throw error;

      toast.success("Consent recorded");
      onConsent();
    } catch (error) {
      console.error('Error recording consent:', error);
      toast.error("Failed to record consent");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onDecline()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">AI Processing Consent Required</DialogTitle>
          </div>
          <DialogDescription className="text-base mt-4">
            This workflow uses AI to process sensitive personal information (PII)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-muted/50 p-4 rounded-lg border border-border space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold">Data Being Processed:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Names, dates of birth, and addresses</li>
                  <li>Passport numbers and identification documents</li>
                  <li>Family member information</li>
                  <li>Scanned document images and OCR text</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-sm">How Your Data is Protected:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>All data is transmitted over encrypted connections (TLS)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>AI providers (OpenAI, Google) do not retain data for training</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>All AI processing is logged and auditable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Data minimization: only required fields are sent to AI</span>
              </li>
            </ul>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <p className="text-sm font-medium mb-2">Your Rights:</p>
            <p className="text-sm text-muted-foreground">
              You can withdraw consent at any time. Withdrawing consent will stop AI processing 
              but will not affect data already processed. You have the right to request a copy 
              of all AI processing logs for your case.
            </p>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="understand"
              checked={understood}
              onCheckedChange={(checked) => setUnderstood(checked as boolean)}
            />
            <Label
              htmlFor="understand"
              className="text-sm font-medium leading-tight cursor-pointer"
            >
              I understand that my personal information will be processed by AI systems 
              and I consent to this processing for the purpose of preparing my citizenship application
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onDecline}
            disabled={isLoading}
          >
            Decline
          </Button>
          <Button
            onClick={handleConsent}
            disabled={!understood || isLoading}
          >
            {isLoading ? "Recording..." : "Give Consent & Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
