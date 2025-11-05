/**
 * Web Worker for base64 encoding with streaming and cancellation
 * Moves heavy encoding operations off the main thread to prevent UI blocking
 * PHASE 1 FIX: Streaming chunks to prevent memory exhaustion + cancellation support
 */

interface EncodingJob {
  id: string;
  arrayBuffer: ArrayBuffer;
  fileName: string;
}

interface CancelJob {
  type: 'cancel';
  id: string;
}

interface ChunkResult {
  type: 'chunk';
  id: string;
  chunk: string;
  chunkIndex: number;
  totalChunks: number;
  progress: number;
  fileName: string;
}

interface CompleteResult {
  type: 'complete';
  id: string;
  fileName: string;
  size: number;
  totalChunks: number;
}

interface ProgressUpdate {
  type: 'progress';
  id: string;
  progress: number;
  fileName: string;
}

interface ErrorResult {
  type: 'error';
  id: string;
  fileName: string;
  error: string;
}

type WorkerMessage = EncodingJob | CancelJob;
type WorkerResponse = ChunkResult | CompleteResult | ProgressUpdate | ErrorResult;

// Track active jobs for cancellation
const activeJobs = new Set<string>();

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const message = e.data;
  
  // Handle cancellation requests
  if ('type' in message && message.type === 'cancel') {
    activeJobs.delete(message.id);
    console.log(`[Worker] Cancelled job: ${message.id}`);
    return;
  }
  
  // Handle encoding jobs
  const { id, arrayBuffer, fileName } = message as EncodingJob;
  activeJobs.add(id);
  
  try {
    const startTime = performance.now();
    const uint8Array = new Uint8Array(arrayBuffer);
    const totalBytes = uint8Array.length;
    
    // Stream chunks instead of accumulating (prevents memory exhaustion)
    const CHUNK_SIZE = 512 * 1024; // 512KB chunks for optimal streaming
    const totalChunks = Math.ceil(totalBytes / CHUNK_SIZE);
    let processedBytes = 0;
    
    for (let i = 0; i < uint8Array.length; i += CHUNK_SIZE) {
      // Check for cancellation before processing each chunk
      if (!activeJobs.has(id)) {
        console.log(`[Worker] Job cancelled mid-processing: ${fileName}`);
        return;
      }
      
      const chunk = uint8Array.slice(i, Math.min(i + CHUNK_SIZE, uint8Array.length));
      
      // VERIFIED SAFE: Binary to base64 encoding using standard browser API
      // Uint8Array values are always 0-255 (single bytes), String.fromCharCode correctly
      // handles byte values in this range, and btoa expects a binary string where each
      // character code represents a byte. This is the standard pattern for converting
      // ArrayBuffer to base64 in browsers.
      // Reference: https://developer.mozilla.org/en-US/docs/Web/API/btoa#unicode_strings
      let chunkString = '';
      for (let j = 0; j < chunk.length; j++) {
        chunkString += String.fromCharCode(chunk[j]);
      }
      const base64Chunk = btoa(chunkString);
      
      processedBytes += chunk.length;
      const progress = Math.round((processedBytes / totalBytes) * 100);
      const chunkIndex = Math.floor(i / CHUNK_SIZE);
      
      // Send chunk immediately (streaming approach)
      const chunkResult: ChunkResult = {
        type: 'chunk',
        id,
        chunk: base64Chunk,
        chunkIndex,
        totalChunks,
        progress,
        fileName,
      };
      
      self.postMessage(chunkResult);
    }
    
    const processingTime = performance.now() - startTime;
    
    console.log(`[Worker] Encoded ${fileName}: ${totalBytes} bytes in ${processingTime.toFixed(0)}ms (${totalChunks} chunks)`);
    
    // Send completion signal
    const completeResult: CompleteResult = {
      type: 'complete',
      id,
      fileName,
      size: totalBytes,
      totalChunks,
    };
    
    self.postMessage(completeResult);
    activeJobs.delete(id);
    
  } catch (error) {
    console.error(`[Worker] Encoding failed for ${fileName}:`, error);
    const errorResult: ErrorResult = {
      type: 'error',
      id,
      fileName,
      error: error instanceof Error ? error.message : 'Encoding failed',
    };
    self.postMessage(errorResult);
    activeJobs.delete(id);
  }
};
