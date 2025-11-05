/**
 * Memory Safety Guards for Edge Functions
 * Prevents OOM errors by checking memory before large operations
 */

export interface MemoryCheckResult {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
}

/**
 * Memory limits in bytes
 */
export const MEMORY_LIMITS = {
  MAX_PDF_SIZE: 50 * 1024 * 1024,        // 50 MB per PDF
  MAX_IMAGE_SIZE: 20 * 1024 * 1024,      // 20 MB per image
  MAX_TEXT_SIZE: 5 * 1024 * 1024,        // 5 MB for text content
  HEAP_WARNING_THRESHOLD: 0.8,           // Warn at 80% heap usage
  HEAP_REJECT_THRESHOLD: 0.9,            // Reject at 90% heap usage
};

/**
 * Check if file size is within allowed limits
 */
export function checkFileSize(
  sizeBytes: number,
  fileType: 'pdf' | 'image' | 'text'
): MemoryCheckResult {
  const limits = {
    pdf: MEMORY_LIMITS.MAX_PDF_SIZE,
    image: MEMORY_LIMITS.MAX_IMAGE_SIZE,
    text: MEMORY_LIMITS.MAX_TEXT_SIZE
  };

  const limit = limits[fileType];

  if (sizeBytes > limit) {
    return {
      allowed: false,
      reason: `File size (${formatBytes(sizeBytes)}) exceeds maximum allowed (${formatBytes(limit)})`,
      currentUsage: sizeBytes,
      limit
    };
  }

  return { allowed: true };
}

/**
 * Check heap memory usage
 */
export function checkHeapMemory(): MemoryCheckResult {
  try {
    const memUsage = Deno.memoryUsage();
    const heapUsed = memUsage.heapUsed;
    const heapTotal = memUsage.heapTotal;
    const usageRatio = heapUsed / heapTotal;

    if (usageRatio > MEMORY_LIMITS.HEAP_REJECT_THRESHOLD) {
      return {
        allowed: false,
        reason: `Heap usage (${Math.round(usageRatio * 100)}%) exceeds safety threshold (${MEMORY_LIMITS.HEAP_REJECT_THRESHOLD * 100}%)`,
        currentUsage: heapUsed,
        limit: heapTotal
      };
    }

    if (usageRatio > MEMORY_LIMITS.HEAP_WARNING_THRESHOLD) {
      console.warn(
        `⚠️ High heap usage: ${Math.round(usageRatio * 100)}% (${formatBytes(heapUsed)} / ${formatBytes(heapTotal)})`
      );
    }

    return { allowed: true };
  } catch (error) {
    console.error('Failed to check memory usage:', error);
    // Fail open - allow operation if we can't check memory
    return { allowed: true };
  }
}

/**
 * Log current memory stats
 */
export function logMemoryStats(context: string): void {
  try {
    const mem = Deno.memoryUsage();
    console.log(`[${context}] Memory:`, {
      heapUsed: formatBytes(mem.heapUsed),
      heapTotal: formatBytes(mem.heapTotal),
      external: formatBytes(mem.external),
      rss: formatBytes(mem.rss),
      usagePercent: Math.round((mem.heapUsed / mem.heapTotal) * 100)
    });
  } catch (error) {
    console.error('Failed to log memory stats:', error);
  }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Check if a buffer operation is safe
 */
export async function checkBufferSafety(
  buffer: ArrayBuffer | Uint8Array,
  operation: string
): Promise<MemoryCheckResult> {
  const size = buffer instanceof ArrayBuffer ? buffer.byteLength : buffer.length;

  // Check heap before large buffer operations
  const heapCheck = checkHeapMemory();
  if (!heapCheck.allowed) {
    return heapCheck;
  }

  // Estimate memory needed (buffer size + overhead)
  const estimatedMemory = size * 1.5; // 50% overhead estimate
  
  const mem = Deno.memoryUsage();
  const availableMemory = mem.heapTotal - mem.heapUsed;

  if (estimatedMemory > availableMemory) {
    return {
      allowed: false,
      reason: `Insufficient memory for ${operation}. Need ~${formatBytes(estimatedMemory)}, available ${formatBytes(availableMemory)}`,
      currentUsage: mem.heapUsed,
      limit: mem.heapTotal
    };
  }

  return { allowed: true };
}

/**
 * Hint garbage collector (force cleanup)
 */
export function hintGC(): void {
  try {
    // Clear weak references
    // Note: gc() may not be available in all environments
    const g = globalThis as any;
    if (typeof g.gc === 'function') {
      g.gc();
    }
    
    // Log post-GC stats
    logMemoryStats('post-GC');
  } catch (error) {
    console.warn('GC hint failed:', error);
  }
}

/**
 * Clear large buffers and hint GC
 */
export function clearBuffers(...buffers: Array<{ value: ArrayBuffer | Uint8Array | string | null }>): void {
  buffers.forEach(ref => {
    if (ref.value) {
      ref.value = null as any;
    }
  });
  
  hintGC();
}
