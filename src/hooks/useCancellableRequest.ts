import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook to manage AbortController for fetch operations
 * Prevents memory leaks and orphaned requests
 */

interface RequestOptions {
  onAbort?: () => void;
}

export function useCancellableRequest() {
  const controllersRef = useRef<Map<string, AbortController>>(new Map());

  // Cleanup all controllers on unmount
  useEffect(() => {
    return () => {
      controllersRef.current.forEach((controller) => {
        controller.abort();
      });
      controllersRef.current.clear();
    };
  }, []);

  /**
   * Create a new AbortController for a request
   */
  const createController = useCallback((requestId: string, options?: RequestOptions): AbortSignal => {
    // Cancel existing controller with same ID if it exists
    const existing = controllersRef.current.get(requestId);
    if (existing) {
      existing.abort();
    }

    const controller = new AbortController();
    controllersRef.current.set(requestId, controller);

    // Set up abort listener
    if (options?.onAbort) {
      controller.signal.addEventListener('abort', options.onAbort);
    }

    return controller.signal;
  }, []);

  /**
   * Cancel a specific request
   */
  const cancelRequest = useCallback((requestId: string) => {
    const controller = controllersRef.current.get(requestId);
    if (controller) {
      controller.abort();
      controllersRef.current.delete(requestId);
    }
  }, []);

  /**
   * Cancel all ongoing requests
   */
  const cancelAll = useCallback(() => {
    controllersRef.current.forEach((controller) => {
      controller.abort();
    });
    controllersRef.current.clear();
  }, []);

  /**
   * Remove a controller after request completes
   */
  const removeController = useCallback((requestId: string) => {
    controllersRef.current.delete(requestId);
  }, []);

  /**
   * Check if a request is active
   */
  const isActive = useCallback((requestId: string): boolean => {
    return controllersRef.current.has(requestId);
  }, []);

  return {
    createController,
    cancelRequest,
    cancelAll,
    removeController,
    isActive,
    activeRequests: controllersRef.current.size,
  };
}
