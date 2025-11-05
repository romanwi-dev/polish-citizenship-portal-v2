/**
 * Memory management utilities for preventing memory leaks in edge functions
 * Tracks and clears large Base64 strings and other memory-intensive objects
 */

/**
 * Memory manager for tracking and cleaning up references
 * Helps prevent memory leaks from large Base64 strings and buffers
 */
export class MemoryManager {
  private references: Set<string> = new Set();
  private startTime: number;
  private initialMemory: number;

  constructor() {
    this.startTime = Date.now();
    this.initialMemory = this.getCurrentMemoryUsage();
  }

  /**
   * Track a reference (e.g., document ID being processed)
   */
  track(ref: string): void {
    this.references.add(ref);
  }

  /**
   * Clear a specific reference
   */
  clear(ref: string): void {
    this.references.delete(ref);
  }

  /**
   * Clear all tracked references and hint garbage collection
   */
  clearAll(): void {
    this.references.clear();
    
    // Hint to V8 garbage collector (not guaranteed but helps)
    if (typeof (globalThis as any).gc === 'function') {
      (globalThis as any).gc();
    }
  }

  /**
   * Get current memory usage statistics
   */
  private getCurrentMemoryUsage(): number {
    try {
      const memUsage = Deno.memoryUsage();
      return memUsage.heapUsed;
    } catch {
      return 0;
    }
  }

  /**
   * Get memory statistics including growth
   */
  getStats(): {
    trackedReferences: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    memoryGrowth: number;
    durationSeconds: number;
  } {
    const memUsage = Deno.memoryUsage();
    const currentMemory = memUsage.heapUsed;
    const memoryGrowth = currentMemory - this.initialMemory;
    const durationSeconds = (Date.now() - this.startTime) / 1000;

    return {
      trackedReferences: this.references.size,
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
      external: Math.round(memUsage.external / 1024 / 1024 * 100) / 100, // MB
      rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100, // MB
      memoryGrowth: Math.round(memoryGrowth / 1024 / 1024 * 100) / 100, // MB
      durationSeconds: Math.round(durationSeconds * 100) / 100
    };
  }
}

/**
 * Explicitly clear a Base64 string from memory
 * Nullifies the reference and hints garbage collection
 */
export function clearBase64(base64Ref: { value: string | null }): void {
  if (!base64Ref || !base64Ref.value) {
    return;
  }

  // Explicitly nullify the string
  base64Ref.value = null;

  // Hint to garbage collector
  if (typeof (globalThis as any).gc === 'function') {
    (globalThis as any).gc();
  }
}

/**
 * Clear an array buffer from memory
 */
export function clearBuffer(bufferRef: { value: ArrayBuffer | null }): void {
  if (!bufferRef || !bufferRef.value) {
    return;
  }

  bufferRef.value = null;

  if (typeof (globalThis as any).gc === 'function') {
    (globalThis as any).gc();
  }
}

/**
 * Log memory stats with a label
 */
export function logMemoryStats(label: string, memoryManager: MemoryManager): void {
  const stats = memoryManager.getStats();
  console.log(`[${label}] Memory Stats:`, {
    heapUsed: `${stats.heapUsed} MB`,
    heapTotal: `${stats.heapTotal} MB`,
    growth: `${stats.memoryGrowth > 0 ? '+' : ''}${stats.memoryGrowth} MB`,
    tracked: stats.trackedReferences,
    duration: `${stats.durationSeconds}s`
  });
}
