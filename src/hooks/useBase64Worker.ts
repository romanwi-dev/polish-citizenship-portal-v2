import { useRef, useCallback, useEffect } from 'react';

interface EncodingJob {
  id: string;
  arrayBuffer: ArrayBuffer;
  fileName: string;
  onProgress?: (progress: number) => void;
  onComplete: (base64: string) => void;
  onError: (error: string) => void;
  chunks: string[]; // Accumulate chunks for streaming
}

interface ChunkMessage {
  type: 'chunk';
  id: string;
  chunk: string;
  chunkIndex: number;
  totalChunks: number;
  progress: number;
  fileName: string;
}

interface CompleteMessage {
  type: 'complete';
  id: string;
  fileName: string;
  size: number;
  totalChunks: number;
}

interface ProgressMessage {
  type: 'progress';
  id: string;
  progress: number;
  fileName: string;
}

interface ErrorMessage {
  type: 'error';
  id: string;
  fileName: string;
  error: string;
}

type WorkerMessage = ChunkMessage | CompleteMessage | ProgressMessage | ErrorMessage;

/**
 * Hook to manage Web Worker for base64 encoding
 * PHASE 1 FIX: Handle streaming chunks and support cancellation
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
        case 'chunk':
          // Accumulate chunk
          job.chunks[message.chunkIndex] = message.chunk;
          if (job.onProgress) {
            job.onProgress(message.progress);
          }
          break;

        case 'progress':
          if (message.progress !== undefined && job.onProgress) {
            job.onProgress(message.progress);
          }
          break;

        case 'complete':
          // Concatenate all chunks and return complete base64
          const completeBase64 = job.chunks.join('');
          job.onComplete(completeBase64);
          jobsRef.current.delete(message.id);
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
   * Encode ArrayBuffer to base64 using Web Worker with streaming
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
          chunks: [], // Initialize empty chunks array
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
   * Cancel a specific encoding job
   */
  const cancelJob = useCallback((jobId: string) => {
    if (!workerRef.current) return;
    
    // Send cancellation message to worker
    workerRef.current.postMessage({
      type: 'cancel',
      id: jobId,
    });
    
    const job = jobsRef.current.get(jobId);
    if (job) {
      job.onError('Cancelled by user');
      jobsRef.current.delete(jobId);
    }
  }, []);

  /**
   * Cancel all pending encoding jobs
   */
  const cancelAll = useCallback(() => {
    if (!workerRef.current) return;
    
    jobsRef.current.forEach((job, jobId) => {
      // Send cancellation to worker for each job
      workerRef.current?.postMessage({
        type: 'cancel',
        id: jobId,
      });
      job.onError('Cancelled by user');
    });
    jobsRef.current.clear();
  }, []);

  return {
    encodeToBase64,
    cancelJob,
    cancelAll,
    hasPendingJobs: jobsRef.current.size > 0,
  };
}
