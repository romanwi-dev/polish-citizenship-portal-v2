/**
 * Chunked Upload Utility for Mobile
 * Handles large file uploads with progress tracking and retry
 */

export interface ChunkedUploadOptions {
  chunkSize: number; // bytes
  maxRetries: number;
  onProgress?: (loaded: number, total: number, speed: number, eta: number) => void;
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number; // bytes/second
  eta: number; // seconds
}

const DEFAULT_CHUNK_SIZE = 1024 * 1024; // 1MB
const DEFAULT_MAX_RETRIES = 3;

/**
 * Upload file in chunks with progress tracking
 */
export async function uploadFileChunked(
  file: File,
  uploadUrl: string,
  authToken: string,
  metadata: Record<string, any> = {},
  options: Partial<ChunkedUploadOptions> = {}
): Promise<string> {
  const chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
  const maxRetries = options.maxRetries || DEFAULT_MAX_RETRIES;
  
  const totalChunks = Math.ceil(file.size / chunkSize);
  const startTime = Date.now();
  let uploadedBytes = 0;

  console.log(`📦 Starting chunked upload: ${totalChunks} chunks, ${(file.size / 1024 / 1024).toFixed(2)}MB`);

  // Upload file in chunks
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    // Retry logic for each chunk
    let retryCount = 0;
    let chunkUploaded = false;

    while (!chunkUploaded && retryCount < maxRetries) {
      try {
        await uploadChunk(
          chunk,
          chunkIndex,
          totalChunks,
          uploadUrl,
          authToken,
          {
            ...metadata,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          }
        );

        chunkUploaded = true;
        uploadedBytes += chunk.size;

        // Calculate progress
        const elapsedTime = (Date.now() - startTime) / 1000; // seconds
        const speed = uploadedBytes / elapsedTime; // bytes/second
        const remainingBytes = file.size - uploadedBytes;
        const eta = Math.ceil(remainingBytes / speed);
        const percentage = Math.round((uploadedBytes / file.size) * 100);

        // Report progress
        if (options.onProgress) {
          options.onProgress(uploadedBytes, file.size, speed, eta);
        }

        if (options.onChunkComplete) {
          options.onChunkComplete(chunkIndex + 1, totalChunks);
        }

        console.log(`✓ Chunk ${chunkIndex + 1}/${totalChunks} uploaded (${percentage}%, ${(speed / 1024 / 1024).toFixed(2)} MB/s, ETA: ${eta}s)`);

      } catch (error) {
        retryCount++;
        console.warn(`⚠️ Chunk ${chunkIndex + 1} failed (retry ${retryCount}/${maxRetries}):`, error);

        if (retryCount >= maxRetries) {
          throw new Error(`Chunk ${chunkIndex + 1} failed after ${maxRetries} retries`);
        }

        // Exponential backoff
        await sleep(Math.pow(2, retryCount) * 1000);
      }
    }
  }

  console.log('✅ Chunked upload complete');
  
  // Return final file path (would come from server response)
  return `/uploads/${file.name}`;
}

/**
 * Upload single chunk
 */
async function uploadChunk(
  chunk: Blob,
  chunkIndex: number,
  totalChunks: number,
  uploadUrl: string,
  authToken: string,
  metadata: Record<string, any>
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open('POST', uploadUrl);
    xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
    xhr.setRequestHeader('X-Chunk-Index', chunkIndex.toString());
    xhr.setRequestHeader('X-Total-Chunks', totalChunks.toString());

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Upload timeout'));

    xhr.timeout = 60000; // 60 seconds per chunk

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('metadata', JSON.stringify(metadata));

    xhr.send(formData);
  });
}

/**
 * Standard upload with progress tracking (for files <2MB)
 */
export async function uploadFileWithProgress(
  file: File,
  uploadUrl: string,
  authToken: string,
  metadata: Record<string, any> = {},
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const startTime = Date.now();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const elapsedTime = (Date.now() - startTime) / 1000;
        const speed = e.loaded / elapsedTime;
        const eta = Math.ceil((e.total - e.loaded) / speed);
        const percentage = Math.round((e.loaded / e.total) * 100);

        onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage,
          speed,
          eta
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 201) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.path || `/uploads/${file.name}`);
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error')));
    xhr.addEventListener('timeout', () => reject(new Error('Upload timeout')));

    xhr.timeout = 300000; // 5 minutes
    xhr.open('POST', uploadUrl);
    xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    xhr.send(formData);
  });
}

/**
 * Smart upload: chooses chunked or standard based on file size
 */
export async function uploadFile(
  file: File,
  uploadUrl: string,
  authToken: string,
  metadata: Record<string, any> = {},
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const CHUNK_THRESHOLD = 2 * 1024 * 1024; // 2MB

  if (file.size > CHUNK_THRESHOLD) {
    console.log('Using chunked upload (file >2MB)');
    return uploadFileChunked(file, uploadUrl, authToken, metadata, {
      onProgress: onProgress ? (loaded, total, speed, eta) => {
        onProgress({
          loaded,
          total,
          percentage: Math.round((loaded / total) * 100),
          speed,
          eta
        });
      } : undefined
    });
  } else {
    console.log('Using standard upload (file <2MB)');
    return uploadFileWithProgress(file, uploadUrl, authToken, metadata, onProgress);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
