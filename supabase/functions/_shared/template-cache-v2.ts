/**
 * Enhanced Template Cache with Versioning
 * PHASE B - TASK 5: Template Cache Optimization
 */

interface CachedTemplate {
  bytes: Uint8Array;
  version: string;
  lastAccessed: number;
  accessCount: number;
  size: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
}

class TemplateCacheV2 {
  private static instance: TemplateCacheV2;
  private cache: Map<string, CachedTemplate> = new Map();
  private stats: CacheStats = { hits: 0, misses: 0, evictions: 0, totalSize: 0 };
  private readonly MAX_CACHE_SIZE = 10;
  private readonly MAX_MEMORY_MB = 50; // 50MB max cache size

  private constructor() {}

  static getInstance(): TemplateCacheV2 {
    if (!TemplateCacheV2.instance) {
      TemplateCacheV2.instance = new TemplateCacheV2();
    }
    return TemplateCacheV2.instance;
  }

  /**
   * Get template from cache
   */
  get(templatePath: string, version?: string): Uint8Array | null {
    const cached = this.cache.get(templatePath);
    
    if (!cached) {
      this.stats.misses++;
      return null;
    }

    // Version mismatch - cache miss
    if (version && cached.version !== version) {
      console.log(`[TemplateCache] Version mismatch: ${cached.version} !== ${version}`);
      this.stats.misses++;
      return null;
    }

    // Update access stats
    cached.lastAccessed = Date.now();
    cached.accessCount++;
    this.stats.hits++;

    console.log(`[TemplateCache] HIT ${templatePath} (v${cached.version}, accessed ${cached.accessCount}x)`);
    return cached.bytes;
  }

  /**
   * Store template in cache
   */
  set(templatePath: string, bytes: Uint8Array, version: string = '1.0.0'): void {
    const size = bytes.byteLength;

    // Check if we need to evict
    while (this.shouldEvict(size)) {
      this.evictLRU();
    }

    this.cache.set(templatePath, {
      bytes,
      version,
      lastAccessed: Date.now(),
      accessCount: 1,
      size,
    });

    this.stats.totalSize += size;
    console.log(`[TemplateCache] STORED ${templatePath} (v${version}, ${(size / 1024).toFixed(2)}KB)`);
  }

  /**
   * Check if we should evict before adding new item
   */
  private shouldEvict(newItemSize: number): boolean {
    const maxBytes = this.MAX_MEMORY_MB * 1024 * 1024;
    return (
      this.cache.size >= this.MAX_CACHE_SIZE ||
      this.stats.totalSize + newItemSize > maxBytes
    );
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Date.now();
    let lruAccessCount = Infinity;

    // Find LRU using weighted score: accessCount / age
    for (const [key, cached] of this.cache.entries()) {
      const age = Date.now() - cached.lastAccessed;
      const score = cached.accessCount / (age / 1000); // accesses per second

      if (score < (lruAccessCount / ((lruTime - Date.now()) / 1000))) {
        lruKey = key;
        lruTime = cached.lastAccessed;
        lruAccessCount = cached.accessCount;
      }
    }

    if (lruKey) {
      const evicted = this.cache.get(lruKey)!;
      this.stats.totalSize -= evicted.size;
      this.cache.delete(lruKey);
      this.stats.evictions++;
      console.log(`[TemplateCache] EVICTED ${lruKey} (accessed ${evicted.accessCount}x, age ${Math.floor((Date.now() - evicted.lastAccessed) / 1000)}s)`);
    }
  }

  /**
   * Invalidate specific template (force refresh)
   */
  invalidate(templatePath: string): void {
    const cached = this.cache.get(templatePath);
    if (cached) {
      this.stats.totalSize -= cached.size;
      this.cache.delete(templatePath);
      console.log(`[TemplateCache] INVALIDATED ${templatePath}`);
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0, totalSize: 0 };
    console.log('[TemplateCache] CLEARED');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : '0';

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      cacheSize: this.cache.size,
      totalSizeMB: (this.stats.totalSize / (1024 * 1024)).toFixed(2),
      templates: Array.from(this.cache.entries()).map(([path, cached]) => ({
        path,
        version: cached.version,
        accessCount: cached.accessCount,
        sizeMB: (cached.size / (1024 * 1024)).toFixed(2),
        ageSeconds: Math.floor((Date.now() - cached.lastAccessed) / 1000),
      })),
    };
  }
}

// Export singleton
export const templateCache = TemplateCacheV2.getInstance();
