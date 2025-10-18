import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SignatureField } from './SignatureField';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface POASigningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poaId: string;
  caseId: string;
  applicantName: string;
  poaType: 'adult' | 'minor' | 'spouses';
}

export function POASigningDialog({ 
  open, 
  onOpenChange, 
  poaId,
  caseId,
  applicantName,
  poaType 
}: POASigningDialogProps) {
  const [signature, setSignature] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const signMutation = useMutation({
    mutationFn: async () => {
      if (!signature) {
        throw new Error('Signature is required');
      }

      // 1. Save signature to storage
      const signatureBlob = await fetch(signature).then(r => r.blob());
      const fileName = `${caseId}/signatures/poa_${poaId}_${Date.now()}.png`;
      
      const { error: uploadError } = await supabase.storage
        .from('client-photos')
        .upload(fileName, signatureBlob, {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('client-photos')
        .getPublicUrl(fileName);

      // 2. Update POA with signature and signed status
      const { error: updateError } = await supabase
        .from('poa')
        .update({
          client_signature_url: publicUrl,
          client_signed_at: new Date().toISOString(),
          status: 'signed',
        })
        .eq('id', poaId);

      if (updateError) throw updateError;

      // 3. Create HAC log entry
      const { error: logError } = await supabase
        .from('hac_logs')
        .insert({
          case_id: caseId,
          action_type: 'poa_signed',
          action_details: `POA (${poaType}) signed by client`,
          related_poa_id: poaId,
          performed_by: (await supabase.auth.getUser()).data.user?.id,
          metadata: {
            signature_url: publicUrl,
            poa_type: poaType,
          }
        });

      if (logError) throw logError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poa'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('POA signed successfully! Awaiting HAC approval.');
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error('POA signing error:', error);
      toast.error('Failed to sign POA: ' + error.message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sign Power of Attorney</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              By signing this document, you ({applicantName}) authorize our firm to represent you 
              in Polish citizenship matters.
            </AlertDescription>
          </Alert>

          <SignatureField
            label="Your Signature"
            required
            onSave={(sig) => setSignature(sig)}
          />

          {signature && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Signature saved. Click "Complete Signing" to finalize.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => signMutation.mutate()}
              disabled={!signature || signMutation.isPending}
            >
              {signMutation.isPending ? 'Processing...' : 'Complete Signing'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            After signing, the POA will be sent to HAC for final approval before being filed.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
