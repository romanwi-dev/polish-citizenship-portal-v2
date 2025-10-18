import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Send, CheckCircle2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface USCRequestCardProps {
  request: any;
}

const PERSON_LABELS: Record<string, string> = {
  AP: 'Applicant',
  SPOUSE: 'Spouse',
  F: 'Father',
  M: 'Mother',
  PGF: 'Paternal Grandfather',
  PGM: 'Paternal Grandmother',
  MGF: 'Maternal Grandfather',
  MGM: 'Maternal Grandmother',
};

export function USCRequestCard({ request }: USCRequestCardProps) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const updates: any = { status: newStatus };
      
      if (newStatus === 'letter_generated') {
        updates.letter_generated_at = new Date().toISOString();
      } else if (newStatus === 'sent') {
        updates.letter_sent_at = new Date().toISOString();
      } else if (newStatus === 'response_received') {
        updates.response_received_at = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('usc_requests')
        .update(updates)
        .eq('id', request.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usc-requests'] });
      toast.success('Status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const getStatusBadge = () => {
    const variants: Record<string, any> = {
      draft: { variant: 'secondary', label: 'Draft' },
      letter_generated: { variant: 'outline', label: 'Letter Generated' },
      sent: { variant: 'default', label: 'Sent' },
      response_received: { variant: 'default', label: 'Response Received' },
      completed: { variant: 'default', label: 'Completed', className: 'bg-green-600' },
      rejected: { variant: 'destructive', label: 'Rejected' },
    };

    const config = variants[request.status] || variants.draft;
    return <Badge {...config}>{config.label}</Badge>;
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {request.request_type === 'umiejscowienie' ? 'Umiejscowienie' : 'Uzupełnienie'} - {request.document_type}
            </span>
            {getStatusBadge()}
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Person: {PERSON_LABELS[request.person_type]}</div>
            {request.registry_office && (
              <div>Registry: {request.registry_office}, {request.registry_city}</div>
            )}
            {request.notes && (
              <div className="mt-2 text-xs italic">{request.notes}</div>
            )}
          </div>

          {request.letter_sent_at && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <Calendar className="h-3 w-3" />
              Sent: {format(new Date(request.letter_sent_at), 'MMM dd, yyyy')}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {request.status === 'draft' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => updateStatusMutation.mutate('letter_generated')}
            >
              <FileText className="h-3 w-3 mr-1" />
              Generate Letter
            </Button>
          )}
          {request.status === 'letter_generated' && (
            <Button 
              size="sm"
              onClick={() => updateStatusMutation.mutate('sent')}
            >
              <Send className="h-3 w-3 mr-1" />
              Mark Sent
            </Button>
          )}
          {request.status === 'sent' && (
            <Button 
              size="sm"
              onClick={() => updateStatusMutation.mutate('response_received')}
            >
              Response Received
            </Button>
          )}
          {request.status === 'response_received' && (
            <Button 
              size="sm"
              onClick={() => updateStatusMutation.mutate('completed')}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Complete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
