import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface POADocument {
  id: string;
  poaType: 'adult' | 'minor' | 'spouses';
  generatedAt: string;
  status: 'draft' | 'signed' | 'locked';
  pdfUrl?: string;
  lockedUrl?: string;
  isLocked: boolean;
}

export function usePOADocuments(caseId: string) {
  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ['poa-documents', caseId],
    queryFn: async () => {
      if (!caseId) return [];
      
      // Query the poa table for this case
      const { data, error } = await supabase
        .from('poa')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching POA documents:', error);
        return [];
      }

      // Transform to match POADocument interface
      return (data || []).map(poa => ({
        id: poa.id,
        poaType: (poa.poa_type || 'adult') as 'adult' | 'minor' | 'spouses',
        generatedAt: poa.created_at,
        status: (poa.status || 'draft') as 'draft' | 'signed' | 'locked',
        pdfUrl: poa.pdf_url || undefined,
        lockedUrl: undefined, // Will be populated after locking
        isLocked: false, // Will be updated when locked
      }));
    },
    enabled: !!caseId,
  });

  return {
    documents: documents as POADocument[],
    isLoading,
    refreshDocuments: refetch,
  };
}
