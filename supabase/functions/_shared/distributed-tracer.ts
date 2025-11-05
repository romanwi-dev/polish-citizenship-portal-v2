/**
 * Correlation ID Middleware for Distributed Tracing
 * PHASE C - TASK 9: Cross-function request tracking
 */

interface TraceContext {
  correlationId: string;
  parentId?: string;
  startTime: number;
  functionName: string;
  metadata?: Record<string, any>;
}

class DistributedTracer {
  private static instance: DistributedTracer;
  private traces: Map<string, TraceContext[]> = new Map();
  private readonly MAX_TRACE_AGE = 60 * 60 * 1000; // 1 hour

  private constructor() {
    this.startCleanup();
  }

  static getInstance(): DistributedTracer {
    if (!DistributedTracer.instance) {
      DistributedTracer.instance = new DistributedTracer();
    }
    return DistributedTracer.instance;
  }

  /**
   * Generate or extract correlation ID from request
   */
  getCorrelationId(req: Request): string {
    const existing = req.headers.get('x-correlation-id');
    if (existing) return existing;
    
    return `trace_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Start a new trace span
   */
  startSpan(
    correlationId: string,
    functionName: string,
    parentId?: string,
    metadata?: Record<string, any>
  ): string {
    const spanId = `span_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    
    const context: TraceContext = {
      correlationId,
      parentId,
      startTime: Date.now(),
      functionName,
      metadata,
    };

    if (!this.traces.has(correlationId)) {
      this.traces.set(correlationId, []);
    }

    this.traces.get(correlationId)!.push(context);

    console.log(`[Trace] START ${functionName}`, {
      correlationId,
      spanId,
      parentId,
      metadata,
    });

    return spanId;
  }

  /**
   * End a trace span
   */
  endSpan(
    correlationId: string,
    functionName: string,
    metadata?: Record<string, any>
  ): void {
    const spans = this.traces.get(correlationId) || [];
    const span = spans.find(s => s.functionName === functionName);

    if (!span) {
      console.warn(`[Trace] No span found for ${functionName}`);
      return;
    }

    const duration = Date.now() - span.startTime;

    console.log(`[Trace] END ${functionName}`, {
      correlationId,
      duration,
      metadata,
    });
  }

  /**
   * Get full trace for a correlation ID
   */
  getTrace(correlationId: string): TraceContext[] {
    return this.traces.get(correlationId) || [];
  }

  /**
   * Get trace visualization
   */
  visualizeTrace(correlationId: string): string {
    const spans = this.getTrace(correlationId);
    if (spans.length === 0) {
      return `No trace found for ${correlationId}`;
    }

    let output = `\n=== TRACE: ${correlationId} ===\n\n`;
    
    // Sort by start time
    const sorted = [...spans].sort((a, b) => a.startTime - b.startTime);
    const firstStart = sorted[0].startTime;

    for (const span of sorted) {
      const offset = span.startTime - firstStart;
      const indent = '  '.repeat(this.getDepth(span, sorted));
      
      output += `${indent}[+${offset}ms] ${span.functionName}\n`;
      
      if (span.metadata) {
        output += `${indent}  metadata: ${JSON.stringify(span.metadata)}\n`;
      }
    }

    const totalDuration = Date.now() - firstStart;
    output += `\nTotal Duration: ${totalDuration}ms\n`;

    return output;
  }

  /**
   * Calculate span depth for visualization
   */
  private getDepth(span: TraceContext, all: TraceContext[]): number {
    if (!span.parentId) return 0;
    
    const parent = all.find(s => s.functionName === span.parentId);
    return parent ? 1 + this.getDepth(parent, all) : 0;
  }

  /**
   * Cleanup old traces
   */
  private cleanup(): void {
    const now = Date.now();
    
    for (const [correlationId, spans] of this.traces.entries()) {
      const oldestSpan = spans[0];
      if (now - oldestSpan.startTime > this.MAX_TRACE_AGE) {
        this.traces.delete(correlationId);
      }
    }
  }

  private startCleanup(): void {
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Cleanup every 5 minutes
  }

  /**
   * Add correlation headers to response
   */
  addTraceHeaders(correlationId: string): Record<string, string> {
    return {
      'X-Correlation-ID': correlationId,
      'X-Trace-Available': 'true',
    };
  }
}

// Export singleton
export const tracer = DistributedTracer.getInstance();

/**
 * Wrapper for edge functions with automatic tracing
 */
export function withTracing<T>(
  functionName: string,
  handler: (req: Request, correlationId: string) => Promise<T>
) {
  return async (req: Request): Promise<T> => {
    const correlationId = tracer.getCorrelationId(req);
    const parentId = req.headers.get('x-parent-span-id') || undefined;
    
    tracer.startSpan(correlationId, functionName, parentId);
    
    try {
      const result = await handler(req, correlationId);
      tracer.endSpan(correlationId, functionName, { success: true });
      return result;
    } catch (error) {
      tracer.endSpan(correlationId, functionName, { 
        success: false, 
        error: String(error) 
      });
      throw error;
    }
  };
}
