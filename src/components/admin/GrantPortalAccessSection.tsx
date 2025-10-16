import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Link as LinkIcon, Copy, Loader2 } from "lucide-react";

interface GrantPortalAccessSectionProps {
  caseId: string;
  clientEmail?: string;
}

export function GrantPortalAccessSection({ caseId, clientEmail }: GrantPortalAccessSectionProps) {
  const [generating, setGenerating] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);

  const generateMagicLink = async () => {
    if (!clientEmail) {
      toast.error("Client email not found. Please add it in the Intake form first.");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-welcome-email", {
        body: { caseId, clientEmail, clientName: clientEmail.split("@")[0] },
      });

      if (error) throw error;

      setMagicLink(data.intakeUrl);
      toast.success("Magic link generated! Copy and send to client.");
    } catch (error: any) {
      console.error("Error generating magic link:", error);
      toast.error(error.message || "Failed to generate magic link");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (magicLink) {
      navigator.clipboard.writeText(magicLink);
      toast.success("Magic link copied to clipboard!");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button onClick={generateMagicLink} disabled={generating || !clientEmail}>
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <LinkIcon className="mr-2 h-4 w-4" />
              Generate Portal Access Link
            </>
          )}
        </Button>
        {!clientEmail && (
          <p className="text-sm text-muted-foreground">
            Add client email in Intake form first
          </p>
        )}
      </div>

      {magicLink && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-background rounded text-sm overflow-x-auto">
                {magicLink}
              </code>
              <Button size="sm" variant="outline" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Send this link to your client. It expires in 7 days.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
