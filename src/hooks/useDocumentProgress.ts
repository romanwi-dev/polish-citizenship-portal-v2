import { useState, useCallback } from 'react';

/**
 * Per-document progress tracking
 * Provides granular visibility into document processing status
 */

export type DocumentStatus = 'pending' | 'downloading' | 'encoding' | 'classifying' | 'ocr' | 'completed' | 'failed' | 'skipped';

export interface DocumentProgress {
  id: string;
  name: string;
  status: DocumentStatus;
  progress: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export function useDocumentProgress() {
  const [documents, setDocuments] = useState<Map<string, DocumentProgress>>(new Map());

  const initializeDocument = useCallback((id: string, name: string) => {
    setDocuments(prev => {
      const updated = new Map(prev);
      updated.set(id, {
        id,
        name,
        status: 'pending',
        progress: 0,
        startedAt: new Date().toISOString(),
      });
      return updated;
    });
  }, []);

  const updateDocument = useCallback((
    id: string,
    updates: Partial<Omit<DocumentProgress, 'id' | 'name'>>
  ) => {
    setDocuments(prev => {
      const updated = new Map(prev);
      const doc = updated.get(id);
      if (doc) {
        updated.set(id, {
          ...doc,
          ...updates,
          completedAt: updates.status === 'completed' || updates.status === 'failed' || updates.status === 'skipped'
            ? new Date().toISOString()
            : doc.completedAt,
        });
      }
      return updated;
    });
  }, []);

  const markFailed = useCallback((id: string, error: string) => {
    updateDocument(id, {
      status: 'failed',
      error,
      progress: 0,
    });
  }, [updateDocument]);

  const markSkipped = useCallback((id: string, reason: string) => {
    updateDocument(id, {
      status: 'skipped',
      error: reason,
      progress: 0,
    });
  }, [updateDocument]);

  const markCompleted = useCallback((id: string) => {
    updateDocument(id, {
      status: 'completed',
      progress: 100,
    });
  }, [updateDocument]);

  const getDocument = useCallback((id: string) => {
    return documents.get(id);
  }, [documents]);

  const getAllDocuments = useCallback(() => {
    return Array.from(documents.values());
  }, [documents]);

  const getStats = useCallback(() => {
    const docs = Array.from(documents.values());
    return {
      total: docs.length,
      pending: docs.filter(d => d.status === 'pending').length,
      processing: docs.filter(d => ['downloading', 'encoding', 'classifying', 'ocr'].includes(d.status)).length,
      completed: docs.filter(d => d.status === 'completed').length,
      failed: docs.filter(d => d.status === 'failed').length,
      skipped: docs.filter(d => d.status === 'skipped').length,
    };
  }, [documents]);

  const reset = useCallback(() => {
    setDocuments(new Map());
  }, []);

  return {
    documents: getAllDocuments(),
    initializeDocument,
    updateDocument,
    markFailed,
    markSkipped,
    markCompleted,
    getDocument,
    getStats,
    reset,
  };
}
