import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, CheckCircle2, AlertCircle, Send, Clock, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OBYStatusCardProps {
  caseId: string;
  masterData: any;
  completionPercentage?: number;
  onEditClick?: () => void;
}

export function OBYStatusCard({ 
  caseId, 
  masterData, 
  completionPercentage = 0,
  onEditClick 
}: OBYStatusCardProps) {
  const queryClient = useQueryClient();

  const markForReviewMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('master_table')
        .update({
          oby_status: 'review',
          oby_draft_created_at: masterData?.oby_draft_created_at || new Date().toISOString(),
        })
        .eq('case_id', caseId);

      if (error) throw error;

      // Create HAC log
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('hac_logs').insert({
        case_id: caseId,
        action_type: 'oby_review_requested',
        action_details: 'OBY draft marked for HAC review',
        performed_by: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-table'] });
      toast.success('OBY draft submitted for HAC review');
    },
    onError: () => {
      toast.error('Failed to submit for review');
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (notes?: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('master_table')
        .update({
          oby_status: 'filed',
          oby_filed_at: new Date().toISOString(),
          oby_hac_reviewed_by: user?.id,
          oby_hac_reviewed_at: new Date().toISOString(),
          oby_hac_notes: notes,
        })
        .eq('case_id', caseId);

      if (error) throw error;

      // Update case KPI
      await supabase
        .from('cases')
        .update({ oby_filed: true })
        .eq('id', caseId);

      // Create HAC log
      await supabase.from('hac_logs').insert({
        case_id: caseId,
        action_type: 'oby_approved',
        action_details: 'OBY approved by HAC and marked as filed',
        performed_by: user?.id,
        metadata: { notes },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-table'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success('OBY approved and marked as filed!');
    },
    onError: () => {
      toast.error('Failed to approve OBY');
    }
  });

  const markSubmittedMutation = useMutation({
    mutationFn: async (refNumber?: string) => {
      const { error } = await supabase
        .from('master_table')
        .update({
          oby_status: 'submitted',
          oby_submitted_at: new Date().toISOString(),
          oby_reference_number: refNumber,
        })
        .eq('case_id', caseId);

      if (error) throw error;

      // Create HAC log
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('hac_logs').insert({
        case_id: caseId,
        action_type: 'oby_submitted',
        action_details: `OBY submitted to government${refNumber ? ` (Ref: ${refNumber})` : ''}`,
        performed_by: user?.id,
        metadata: { reference_number: refNumber },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-table'] });
      toast.success('OBY marked as submitted to government');
    },
    onError: () => {
      toast.error('Failed to mark as submitted');
    }
  });

  const getStatusBadge = () => {
    switch (masterData?.oby_status) {
      case 'not_started':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Not Started</Badge>;
      case 'draft':
        return <Badge variant="outline"><Edit className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'review':
        return <Badge variant="default"><AlertCircle className="h-3 w-3 mr-1" />Under Review</Badge>;
      case 'filed':
        return <Badge variant="default" className="bg-blue-600"><CheckCircle2 className="h-3 w-3 mr-1" />Filed</Badge>;
      case 'submitted':
        return <Badge variant="default" className="bg-green-600"><Send className="h-3 w-3 mr-1" />Submitted</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const canSubmitForReview = masterData?.oby_status === 'draft' && completionPercentage >= 80;
  const canApprove = masterData?.oby_status === 'review';
  const canMarkSubmitted = masterData?.oby_status === 'filed';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Citizenship Application (OBY)
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Completion Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Form Completion</span>
            <span className="text-sm font-medium">{completionPercentage}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-2 text-sm">
          {masterData?.oby_draft_created_at && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Draft Created</span>
              <span className="font-medium">
                {format(new Date(masterData.oby_draft_created_at), 'MMM dd, yyyy')}
              </span>
            </div>
          )}
          {masterData?.oby_hac_reviewed_at && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">HAC Reviewed</span>
              <span className="font-medium">
                {format(new Date(masterData.oby_hac_reviewed_at), 'MMM dd, yyyy')}
              </span>
            </div>
          )}
          {masterData?.oby_filed_at && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Filed</span>
              <span className="font-medium">
                {format(new Date(masterData.oby_filed_at), 'MMM dd, yyyy')}
              </span>
            </div>
          )}
          {masterData?.oby_submitted_at && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Submitted</span>
              <span className="font-medium">
                {format(new Date(masterData.oby_submitted_at), 'MMM dd, yyyy')}
              </span>
            </div>
          )}
          {masterData?.oby_reference_number && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Reference #</span>
              <span className="font-mono text-xs">{masterData.oby_reference_number}</span>
            </div>
          )}
        </div>

        {/* HAC Notes */}
        {masterData?.oby_hac_notes && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">HAC Notes:</p>
              <p className="text-sm">{masterData.oby_hac_notes}</p>
            </AlertDescription>
          </Alert>
        )}

        {/* Warnings */}
        {!canSubmitForReview && masterData?.oby_status === 'draft' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Form must be at least 80% complete before submitting for review (currently {completionPercentage}%)
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {onEditClick && masterData?.oby_status !== 'submitted' && (
            <Button variant="outline" onClick={onEditClick} className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit Form
            </Button>
          )}

          {canSubmitForReview && (
            <Button 
              onClick={() => markForReviewMutation.mutate()}
              disabled={markForReviewMutation.isPending}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit for Review
            </Button>
          )}

          {canApprove && (
            <Button 
              onClick={() => {
                const notes = window.prompt('Add notes (optional):');
                approveMutation.mutate(notes || undefined);
              }}
              disabled={approveMutation.isPending}
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve & File
            </Button>
          )}

          {canMarkSubmitted && (
            <Button 
              onClick={() => {
                const refNum = window.prompt('Enter government reference number (optional):');
                markSubmittedMutation.mutate(refNum || undefined);
              }}
              disabled={markSubmittedMutation.isPending}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              Mark Submitted
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
