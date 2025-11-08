import { useState } from "react";
import { Send, Package, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { SignatureField } from "@/components/SignatureField";
import { supabase } from "@/integrations/supabase/client";

interface POASignSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poaId: string;
  pdfUrl: string;
}

export const POASignSendDialog = ({
  open,
  onOpenChange,
  poaId,
  pdfUrl,
}: POASignSendDialogProps) => {
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSignatureSave = async (dataUrl: string) => {
    setSaving(true);
    try {
      // Save signature to POA record
      const { error } = await supabase
        .from('poa')
        .update({
          client_signature_url: dataUrl,
          status: 'client_signed',
        })
        .eq('id', poaId);

      if (error) throw error;

      setSignatureUrl(dataUrl);
      toast.success("Signature saved successfully!");
    } catch (error) {
      console.error('Signature save error:', error);
      toast.error("Failed to save signature");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Sign & Send POA
          </DialogTitle>
          <DialogDescription>
            Sign your Power of Attorney and prepare for shipping
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* E-Signature Section */}
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Sign Document</CardTitle>
              <CardDescription>
                Draw your signature below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignatureField
                value={signatureUrl || ''}
                onSave={handleSignatureSave}
                label=""
              />
              {signatureUrl && (
                <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Signature saved successfully
                </div>
              )}
            </CardContent>
          </Card>

          {/* Download PDF Section */}
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Download PDF</CardTitle>
              <CardDescription>
                Download your signed POA (3 copies ready to print)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="w-full"
                disabled={!signatureUrl}
              >
                Download Signed POA
              </Button>
            </CardContent>
          </Card>

          {/* Shipping Placeholder Section */}
          <Card className="border-2 border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Step 3: Ship to Warsaw Office
              </CardTitle>
              <CardDescription>
                FedEx integration coming soon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Shipping Instructions</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Please print and mail your signed POA to our Warsaw office:
                </p>
                <address className="not-italic text-sm">
                  <strong>HAC Law Office</strong><br />
                  ul. Example Street 123<br />
                  00-001 Warsaw<br />
                  Poland
                </address>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Coming Soon:</strong> Automatic FedEx label generation and tracking will be available in the next update.
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full"
                disabled
              >
                Generate FedEx Label (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          <Button
            onClick={() => {
              toast.success("POA process complete! Please mail your signed documents.");
              onOpenChange(false);
            }}
            disabled={!signatureUrl}
            className="w-full"
            size="lg"
          >
            Complete Process
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};