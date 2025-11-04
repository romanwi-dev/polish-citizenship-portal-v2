import { useCallback, useRef } from 'react';

/**
 * Request batching with rate limiting
 * Prevents overwhelming the backend with concurrent requests
 */

interface BatchConfig {
  batchSize: number;
  delayMs: number;
}

interface BatchRequest<T> {
  id: string;
  request: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

export function useRequestBatcher<T>(config: BatchConfig = { batchSize: 3, delayMs: 500 }) {
  const queueRef = useRef<BatchRequest<T>[]>([]);
  const activeRef = useRef<number>(0);
  const processingRef = useRef<boolean>(false);

  const processQueue = useCallback(async () => {
    if (processingRef.current || queueRef.current.length === 0) {
      return;
    }

    processingRef.current = true;

    while (queueRef.current.length > 0) {
      // Wait if we're at capacity
      while (activeRef.current >= config.batchSize) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const batch = queueRef.current.splice(0, config.batchSize - activeRef.current);
      
      batch.forEach(async (item) => {
        activeRef.current++;
        try {
          const result = await item.request();
          item.resolve(result);
        } catch (error) {
          item.reject(error instanceof Error ? error : new Error(String(error)));
        } finally {
          activeRef.current--;
        }
      });

      // Rate limiting delay between batches
      if (queueRef.current.length > 0) {
        await new Promise(resolve => setTimeout(resolve, config.delayMs));
      }
    }

    processingRef.current = false;
  }, [config.batchSize, config.delayMs]);

  const addRequest = useCallback((id: string, request: () => Promise<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      queueRef.current.push({ id, request, resolve, reject });
      processQueue();
    });
  }, [processQueue]);

  const clearQueue = useCallback(() => {
    queueRef.current.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });
    queueRef.current = [];
  }, []);

  const getQueueSize = useCallback(() => queueRef.current.length, []);
  const getActiveCount = useCallback(() => activeRef.current, []);

  return {
    addRequest,
    clearQueue,
    getQueueSize,
    getActiveCount,
  };
}
