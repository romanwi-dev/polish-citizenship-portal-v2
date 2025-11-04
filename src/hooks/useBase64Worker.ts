import { useRef, useCallback, useEffect } from 'react';

interface EncodingJob {
  id: string;
  arrayBuffer: ArrayBuffer;
  fileName: string;
  onProgress?: (progress: number) => void;
  onComplete: (base64: string) => void;
  onError: (error: string) => void;
}

interface WorkerMessage {
  type: 'progress' | 'complete' | 'error';
  id: string;
  base64?: string;
  progress?: number;
  error?: string;
  fileName?: string;
  size?: number;
}

/**
 * Hook to manage Web Worker for base64 encoding
 * Prevents UI blocking during large file encoding
 */
export function useBase64Worker() {
  const workerRef = useRef<Worker | null>(null);
  const jobsRef = useRef<Map<string, EncodingJob>>(new Map());

  // Initialize worker
  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(
      new URL('../workers/base64Encoder.worker.ts', import.meta.url),
      { type: 'module' }
    );

    // Handle messages from worker
    workerRef.current.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const message = e.data;
      const job = jobsRef.current.get(message.id);
      
      if (!job) {
        console.warn(`Received message for unknown job: ${message.id}`);
        return;
      }

      switch (message.type) {
        case 'progress':
          if (message.progress !== undefined && job.onProgress) {
            job.onProgress(message.progress);
          }
          break;

        case 'complete':
          if (message.base64) {
            job.onComplete(message.base64);
            jobsRef.current.delete(message.id);
          }
          break;

        case 'error':
          job.onError(message.error || 'Unknown error');
          jobsRef.current.delete(message.id);
          break;
      }
    };

    workerRef.current.onerror = (error) => {
      console.error('Worker error:', error);
      // Fail all pending jobs
      jobsRef.current.forEach((job) => {
        job.onError('Worker crashed');
      });
      jobsRef.current.clear();
    };

    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      jobsRef.current.clear();
    };
  }, []);

  /**
   * Encode ArrayBuffer to base64 using Web Worker
   */
  const encodeToBase64 = useCallback(
    (
      arrayBuffer: ArrayBuffer,
      fileName: string,
      options?: {
        onProgress?: (progress: number) => void;
      }
    ): Promise<string> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'));
          return;
        }

        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const job: EncodingJob = {
          id,
          arrayBuffer,
          fileName,
          onProgress: options?.onProgress,
          onComplete: resolve,
          onError: reject,
        };

        jobsRef.current.set(id, job);

        // Send job to worker
        workerRef.current.postMessage({
          id,
          arrayBuffer,
          fileName,
        });
      });
    },
    []
  );

  /**
   * Cancel all pending encoding jobs
   */
  const cancelAll = useCallback(() => {
    jobsRef.current.forEach((job) => {
      job.onError('Cancelled by user');
    });
    jobsRef.current.clear();
  }, []);

  return {
    encodeToBase64,
    cancelAll,
    hasPendingJobs: jobsRef.current.size > 0,
  };
}
