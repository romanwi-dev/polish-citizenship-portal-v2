import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle2, Clock, XCircle, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { POASigningDialog } from './POASigningDialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface POACardProps {
  poa: any;
  caseId: string;
  applicantName: string;
  isClient?: boolean;
}

export function POACard({ poa, caseId, applicantName, isClient = false }: POACardProps) {
  const [isSigningOpen, setIsSigningOpen] = useState(false);
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('poa')
        .update({
          status: 'approved',
          hac_approved_by: user?.id,
          hac_approved_at: new Date().toISOString(),
        })
        .eq('id', poa.id);

      if (error) throw error;

      // Create HAC log
      await supabase.from('hac_logs').insert({
        case_id: caseId,
        action_type: 'poa_approved',
        action_details: `POA (${poa.poa_type}) approved by HAC`,
        related_poa_id: poa.id,
        performed_by: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poa'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('POA approved successfully');
    },
    onError: () => {
      toast.error('Failed to approve POA');
    }
  });

  const getStatusBadge = () => {
    switch (poa.status) {
      case 'draft':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'signed':
        return <Badge variant="default"><CheckCircle2 className="h-3 w-3 mr-1" />Signed</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPoaTypeLabel = () => {
    switch (poa.poa_type) {
      case 'adult': return 'Adult Applicant';
      case 'minor': return 'Minor Child';
      case 'spouses': return 'Married Couple';
      default: return poa.poa_type;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle className="text-lg">
                Power of Attorney - {getPoaTypeLabel()}
              </CardTitle>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">
                {poa.created_at ? format(new Date(poa.created_at), 'MMM dd, yyyy') : 'N/A'}
              </p>
            </div>
            {poa.client_signed_at && (
              <div>
                <p className="text-muted-foreground">Signed</p>
                <p className="font-medium">
                  {format(new Date(poa.client_signed_at), 'MMM dd, yyyy')}
                </p>
              </div>
            )}
            {poa.hac_approved_at && (
              <div>
                <p className="text-muted-foreground">Approved</p>
                <p className="font-medium">
                  {format(new Date(poa.hac_approved_at), 'MMM dd, yyyy')}
                </p>
              </div>
            )}
          </div>

          {poa.hac_notes && (
            <div className="p-3 bg-muted rounded">
              <p className="text-sm font-medium mb-1">HAC Notes:</p>
              <p className="text-sm text-muted-foreground">{poa.hac_notes}</p>
            </div>
          )}

          <div className="flex gap-2">
            {isClient && poa.status === 'draft' && (
              <Button onClick={() => setIsSigningOpen(true)} className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Sign POA
              </Button>
            )}
            
            {!isClient && poa.status === 'signed' && (
              <Button 
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="w-full"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve POA
              </Button>
            )}

            {poa.status === 'approved' && (
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isClient && (
        <POASigningDialog
          open={isSigningOpen}
          onOpenChange={setIsSigningOpen}
          poaId={poa.id}
          caseId={caseId}
          applicantName={applicantName}
          poaType={poa.poa_type}
        />
      )}
    </>
  );
}
