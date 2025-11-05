/**
 * Retry Utilities for PDF Generation
 * Implements exponential backoff with jitter
 */

import { PDFErrorCode, createPDFError, logPDFError } from './pdf-errors.ts';

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterMs: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  jitterMs: 500,
};

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  config: RetryConfig
): number {
  const exponentialDelay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);
  const jitter = Math.random() * config.jitterMs;
  return cappedDelay + jitter;
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - Function to retry
 * @param config - Retry configuration
 * @param operationName - Name of operation for logging
 * @returns Result of the function
 * @throws Last error if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  operationName = 'operation'
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Log retry attempt if not first try
      if (attempt > 0) {
        console.log(JSON.stringify({
          event: 'retry_attempt',
          operation: operationName,
          attempt,
          maxRetries: config.maxRetries,
          timestamp: new Date().toISOString(),
        }));
      }
      
      // Execute function
      const result = await fn();
      
      // Log success if we had to retry
      if (attempt > 0) {
        console.log(JSON.stringify({
          event: 'retry_success',
          operation: operationName,
          successfulAttempt: attempt,
          timestamp: new Date().toISOString(),
        }));
      }
      
      return result;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If this was the last attempt, throw the error
      if (attempt === config.maxRetries) {
        console.error(JSON.stringify({
          event: 'retry_exhausted',
          operation: operationName,
          attempts: attempt + 1,
          error: lastError.message,
          timestamp: new Date().toISOString(),
        }));
        throw lastError;
      }
      
      // Calculate delay before next retry
      const delayMs = calculateDelay(attempt, config);
      
      console.warn(JSON.stringify({
        event: 'retry_failed',
        operation: operationName,
        attempt,
        error: lastError.message,
        nextRetryIn: delayMs,
        timestamp: new Date().toISOString(),
      }));
      
      // Wait before retrying
      await sleep(delayMs);
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Retry failed with unknown error');
}

/**
 * Retry configuration for specific operations
 */
export const RETRY_CONFIGS = {
  STORAGE_UPLOAD: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
    jitterMs: 500,
  } as RetryConfig,
  
  TEMPLATE_FETCH: {
    maxRetries: 2,
    initialDelayMs: 500,
    maxDelayMs: 2000,
    backoffMultiplier: 2,
    jitterMs: 200,
  } as RetryConfig,
  
  SIGNED_URL: {
    maxRetries: 2,
    initialDelayMs: 500,
    maxDelayMs: 2000,
    backoffMultiplier: 2,
    jitterMs: 200,
  } as RetryConfig,
  
  DB_UPDATE: {
    maxRetries: 2,
    initialDelayMs: 500,
    maxDelayMs: 3000,
    backoffMultiplier: 2,
    jitterMs: 300,
  } as RetryConfig,
};

/**
 * Retry storage upload with appropriate config
 */
export async function retryStorageUpload<T>(
  fn: () => Promise<T>
): Promise<T> {
  return withRetry(fn, RETRY_CONFIGS.STORAGE_UPLOAD, 'storage_upload');
}

/**
 * Retry template fetch with appropriate config
 */
export async function retryTemplateFetch<T>(
  fn: () => Promise<T>
): Promise<T> {
  return withRetry(fn, RETRY_CONFIGS.TEMPLATE_FETCH, 'template_fetch');
}

/**
 * Retry signed URL generation with appropriate config
 */
export async function retrySignedUrl<T>(
  fn: () => Promise<T>
): Promise<T> {
  return withRetry(fn, RETRY_CONFIGS.SIGNED_URL, 'signed_url_generation');
}

/**
 * Retry database update with appropriate config
 */
export async function retryDbUpdate<T>(
  fn: () => Promise<T>
): Promise<T> {
  return withRetry(fn, RETRY_CONFIGS.DB_UPDATE, 'db_update');
}
