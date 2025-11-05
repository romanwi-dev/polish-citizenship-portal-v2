/**
 * Global Supabase Connection Pool
 * Reuses client instances to reduce overhead and improve performance
 * 
 * PHASE B - TASK 5: Connection Pooling
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface PooledClient {
  client: any;
  lastUsed: number;
  requestCount: number;
}

class SupabaseConnectionPool {
  private static instance: SupabaseConnectionPool;
  private pool: Map<string, PooledClient> = new Map();
  private readonly MAX_IDLE_TIME = 5 * 60 * 1000; // 5 minutes
  private readonly CLEANUP_INTERVAL = 60 * 1000; // 1 minute
  private cleanupTimer: number | null = null;

  private constructor() {
    this.startCleanup();
  }

  static getInstance(): SupabaseConnectionPool {
    if (!SupabaseConnectionPool.instance) {
      SupabaseConnectionPool.instance = new SupabaseConnectionPool();
    }
    return SupabaseConnectionPool.instance;
  }

  /**
   * Get or create a pooled Supabase client
   */
  getClient(type: 'admin' | 'anon' = 'admin'): any {
    const key = type;
    const now = Date.now();

    // Reuse existing client if available and recent
    const pooled = this.pool.get(key);
    if (pooled && (now - pooled.lastUsed) < this.MAX_IDLE_TIME) {
      pooled.lastUsed = now;
      pooled.requestCount++;
      console.log(`[ConnectionPool] Reused ${type} client (requests: ${pooled.requestCount})`);
      return pooled.client;
    }

    // Create new client
    const url = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const client = createClient(url, type === 'admin' ? serviceKey : anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.pool.set(key, {
      client,
      lastUsed: now,
      requestCount: 1,
    });

    console.log(`[ConnectionPool] Created new ${type} client`);
    return client;
  }

  /**
   * Cleanup idle connections
   */
  private cleanup() {
    const now = Date.now();
    let removed = 0;

    for (const [key, pooled] of this.pool.entries()) {
      if (now - pooled.lastUsed > this.MAX_IDLE_TIME) {
        this.pool.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`[ConnectionPool] Cleaned up ${removed} idle connections`);
    }
  }

  private startCleanup() {
    if (this.cleanupTimer) return;
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL) as unknown as number;
  }

  /**
   * Get pool statistics
   */
  getStats() {
    const stats = Array.from(this.pool.entries()).map(([key, pooled]) => ({
      type: key,
      requestCount: pooled.requestCount,
      idleTime: Date.now() - pooled.lastUsed,
    }));

    return {
      totalConnections: this.pool.size,
      connections: stats,
    };
  }
}

// Export singleton instance
export const connectionPool = SupabaseConnectionPool.getInstance();

/**
 * Get a pooled Supabase admin client
 */
export function getPooledAdminClient() {
  return connectionPool.getClient('admin');
}

/**
 * Get a pooled Supabase anon client
 */
export function getPooledAnonClient() {
  return connectionPool.getClient('anon');
}
