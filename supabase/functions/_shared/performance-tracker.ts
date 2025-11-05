/**
 * Performance Tracking and Monitoring
 * PHASE B - TASK 6: Performance Monitoring
 */

interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  operation: string;
  count: number;
  totalDuration: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  p50: number;
  p95: number;
  p99: number;
}

class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private activeTimers: Map<string, number> = new Map();
  private readonly MAX_METRICS_PER_OP = 1000; // Keep last 1000 for each operation

  private constructor() {}

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  /**
   * Start timing an operation
   */
  start(operation: string, metadata?: Record<string, any>): string {
    const timerId = `${operation}_${Date.now()}_${Math.random()}`;
    this.activeTimers.set(timerId, Date.now());

    const metric: PerformanceMetric = {
      operation,
      startTime: Date.now(),
      metadata,
    };

    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    return timerId;
  }

  /**
   * End timing an operation
   */
  end(timerId: string, operation: string, metadata?: Record<string, any>): number {
    const startTime = this.activeTimers.get(timerId);
    if (!startTime) {
      console.warn(`[Performance] Timer ${timerId} not found`);
      return 0;
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    this.activeTimers.delete(timerId);

    const metrics = this.metrics.get(operation) || [];
    metrics.push({
      operation,
      startTime,
      endTime,
      duration,
      metadata,
    });

    // Limit stored metrics
    if (metrics.length > this.MAX_METRICS_PER_OP) {
      metrics.shift();
    }

    this.metrics.set(operation, metrics);

    console.log(`[Performance] ${operation}: ${duration}ms`, metadata || {});
    return duration;
  }

  /**
   * Track an operation with automatic timing
   */
  async track<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const timerId = this.start(operation, metadata);
    try {
      const result = await fn();
      this.end(timerId, operation, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.end(timerId, operation, { ...metadata, success: false, error: String(error) });
      throw error;
    }
  }

  /**
   * Get statistics for an operation
   */
  getStats(operation: string): PerformanceStats | null {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const durations = metrics
      .filter(m => m.duration !== undefined)
      .map(m => m.duration!);

    if (durations.length === 0) {
      return null;
    }

    durations.sort((a, b) => a - b);

    const sum = durations.reduce((acc, d) => acc + d, 0);
    const avg = sum / durations.length;
    const min = durations[0];
    const max = durations[durations.length - 1];

    const p50Index = Math.floor(durations.length * 0.5);
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);

    return {
      operation,
      count: durations.length,
      totalDuration: sum,
      avgDuration: Math.round(avg),
      minDuration: min,
      maxDuration: max,
      p50: durations[p50Index],
      p95: durations[p95Index],
      p99: durations[p99Index],
    };
  }

  /**
   * Get all statistics
   */
  getAllStats(): PerformanceStats[] {
    const stats: PerformanceStats[] = [];
    
    for (const operation of this.metrics.keys()) {
      const operationStats = this.getStats(operation);
      if (operationStats) {
        stats.push(operationStats);
      }
    }

    return stats.sort((a, b) => b.avgDuration - a.avgDuration);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.activeTimers.clear();
    console.log('[Performance] Metrics cleared');
  }

  /**
   * Get performance report
   */
  getReport(): string {
    const stats = this.getAllStats();
    
    let report = '\n=== PERFORMANCE REPORT ===\n\n';
    
    for (const stat of stats) {
      report += `${stat.operation}:\n`;
      report += `  Count: ${stat.count}\n`;
      report += `  Avg: ${stat.avgDuration}ms\n`;
      report += `  Min/Max: ${stat.minDuration}ms / ${stat.maxDuration}ms\n`;
      report += `  P50/P95/P99: ${stat.p50}ms / ${stat.p95}ms / ${stat.p99}ms\n\n`;
    }
    
    return report;
  }
}

// Export singleton
export const performanceTracker = PerformanceTracker.getInstance();
