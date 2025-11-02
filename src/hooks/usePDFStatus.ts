import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PDFStatus = 'generated' | 'edited' | 'printed' | 'signed' | 'sent' | 'received' | 'archived';

/**
 * Phase 3.1: Document Status Tracking
 * Manages PDF document lifecycle status
 */
export function usePDFStatus(documentId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery({
    queryKey: ['pdf-status', documentId],
    queryFn: async () => {
      if (!documentId) return null;

      const { data, error } = await supabase
        .from('documents')
        .select('pdf_status, status_updated_at, signed_at, sent_at, received_at, tracking_number, fedex_label_url')
        .eq('id', documentId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!documentId,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ status, metadata }: { status: PDFStatus; metadata?: Record<string, any> }) => {
      if (!documentId) throw new Error('No document ID');

      const updates: any = { pdf_status: status };

      // Set timestamps based on status
      if (status === 'signed') updates.signed_at = new Date().toISOString();
      if (status === 'sent') updates.sent_at = new Date().toISOString();
      if (status === 'received') updates.received_at = new Date().toISOString();

      // Add metadata fields
      if (metadata?.trackingNumber) updates.tracking_number = metadata.trackingNumber;
      if (metadata?.fedexLabelUrl) updates.fedex_label_url = metadata.fedexLabelUrl;
      if (metadata?.signatureData) updates.signature_data = metadata.signatureData;

      const { error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pdf-status', documentId] });
      toast.success('Document status updated');
    },
    onError: (error) => {
      console.error('Failed to update PDF status:', error);
      toast.error('Failed to update document status');
    },
  });

  const getHistory = useQuery({
    queryKey: ['pdf-history', documentId],
    queryFn: async () => {
      if (!documentId) return [];

      const { data, error } = await supabase
        .from('pdf_history')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!documentId,
  });

  return {
    status: status?.pdf_status,
    statusUpdatedAt: status?.status_updated_at,
    signedAt: status?.signed_at,
    sentAt: status?.sent_at,
    receivedAt: status?.received_at,
    trackingNumber: status?.tracking_number,
    fedexLabelUrl: status?.fedex_label_url,
    isLoading,
    updateStatus: updateStatus.mutate,
    isUpdating: updateStatus.isPending,
    history: getHistory.data || [],
  };
}
