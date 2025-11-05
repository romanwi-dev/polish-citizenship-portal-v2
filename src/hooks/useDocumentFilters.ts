import { useState, useMemo } from 'react';

export interface Document {
  id: string;
  name: string;
  document_type?: string | null;
  person_type?: string | null;
  ocr_status?: string | null;
  ocr_text?: string | null;
  dropbox_path: string;
  created_at: string;
}

export function useDocumentFilters(documents: Document[] | undefined) {
  const [searchQuery, setSearchQuery] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all');
  const [personTypeFilter, setPersonTypeFilter] = useState<string>('all');
  const [ocrStatusFilter, setOcrStatusFilter] = useState<string>('all');

  // Extract unique document types and person types
  const { documentTypes, personTypes } = useMemo(() => {
    if (!documents) return { documentTypes: [], personTypes: [] };
    
    const docTypes = new Set<string>();
    const perTypes = new Set<string>();
    
    documents.forEach(doc => {
      if (doc.document_type) docTypes.add(doc.document_type);
      if (doc.person_type) perTypes.add(doc.person_type);
    });
    
    return {
      documentTypes: Array.from(docTypes).sort(),
      personTypes: Array.from(perTypes).sort()
    };
  }, [documents]);

  // Filter documents
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

      // Document type filter
      if (documentTypeFilter !== 'all' && doc.document_type !== documentTypeFilter) {
        return false;
      }

      // Person type filter
      if (personTypeFilter !== 'all' && doc.person_type !== personTypeFilter) {
        return false;
      }

      // OCR status filter
      if (ocrStatusFilter !== 'all' && doc.ocr_status !== ocrStatusFilter) {
        return false;
      }

      return true;
    });
  }, [documents, searchQuery, documentTypeFilter, personTypeFilter, ocrStatusFilter]);

  return {
    searchQuery,
    setSearchQuery,
    documentTypeFilter,
    setDocumentTypeFilter,
    personTypeFilter,
    setPersonTypeFilter,
    ocrStatusFilter,
    setOcrStatusFilter,
    documentTypes,
    personTypes,
    filteredDocuments,
    totalCount: documents?.length || 0,
    filteredCount: filteredDocuments.length
  };
}
