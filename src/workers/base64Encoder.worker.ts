/**
 * Web Worker for base64 encoding
 * Moves heavy encoding operations off the main thread to prevent UI blocking
 */

interface EncodingJob {
  id: string;
  arrayBuffer: ArrayBuffer;
  fileName: string;
}

interface EncodingResult {
  id: string;
  base64: string;
  fileName: string;
  size: number;
}

interface ProgressUpdate {
  id: string;
  progress: number;
  fileName: string;
}

self.onmessage = (e: MessageEvent<EncodingJob>) => {
  const { id, arrayBuffer, fileName } = e.data;
  
  try {
    const startTime = performance.now();
    const uint8Array = new Uint8Array(arrayBuffer);
    const totalBytes = uint8Array.length;
    
    // For large files, report progress in chunks
    const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
    let encoded = '';
    let processedBytes = 0;
    
    for (let i = 0; i < uint8Array.length; i += CHUNK_SIZE) {
      const chunk = uint8Array.slice(i, Math.min(i + CHUNK_SIZE, uint8Array.length));
      
      // Convert chunk to base64
      let chunkString = '';
      for (let j = 0; j < chunk.length; j++) {
        chunkString += String.fromCharCode(chunk[j]);
      }
      encoded += btoa(chunkString);
      
      processedBytes += chunk.length;
      
      // Report progress every chunk
      const progress = Math.round((processedBytes / totalBytes) * 100);
      self.postMessage({
        type: 'progress',
        id,
        progress,
        fileName,
      } as ProgressUpdate & { type: string });
    }
    
    const processingTime = performance.now() - startTime;
    
    console.log(`[Worker] Encoded ${fileName}: ${totalBytes} bytes in ${processingTime.toFixed(0)}ms`);
    
    // Send completed result
    const result: EncodingResult & { type: string } = {
      type: 'complete',
      id,
      base64: encoded,
      fileName,
      size: totalBytes,
    };
    
    self.postMessage(result);
    
  } catch (error) {
    console.error(`[Worker] Encoding failed for ${fileName}:`, error);
    self.postMessage({
      type: 'error',
      id,
      fileName,
      error: error instanceof Error ? error.message : 'Encoding failed',
    });
  }
};
