import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SearchFilters {
  personType?: string;
  documentType?: string;
  language?: string;
  ocrStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useDocumentSearch(caseId: string | undefined) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents-search', caseId],
    queryFn: async () => {
      if (!caseId) return [];

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!caseId
  });

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];

    return documents.filter(doc => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = doc.name?.toLowerCase().includes(query);
        const matchesOCR = doc.ocr_text?.toLowerCase().includes(query);
        
        if (!matchesName && !matchesOCR) return false;
      }

      // Person type filter
      if (filters.personType && doc.person_type !== filters.personType) {
        return false;
      }

      // Document type filter
      if (filters.documentType && doc.type !== filters.documentType) {
        return false;
      }

      // Language filter
      if (filters.language && doc.language !== filters.language) {
        return false;
      }

      // OCR status filter
      if (filters.ocrStatus && doc.ocr_status !== filters.ocrStatus) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom && new Date(doc.created_at) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && new Date(doc.created_at) > new Date(filters.dateTo)) {
        return false;
      }

      return true;
    });
  }, [documents, searchQuery, filters]);

  return {
    documents: filteredDocuments,
    allDocuments: documents || [],
    isLoading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    resultsCount: filteredDocuments.length,
    totalCount: documents?.length || 0
  };
}
