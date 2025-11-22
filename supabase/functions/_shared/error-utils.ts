/**
 * TypeScript Error Handling Utilities
 * Provides type-safe error handling for catch blocks
 */

/**
 * Get error message from unknown error type
 * Safely extracts message from Error objects or converts to string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Unknown error occurred';
}

/**
 * Get error name from unknown error type
 */
export function getErrorName(error: unknown): string {
  if (error instanceof Error) {
    return error.name;
  }
  if (error && typeof error === 'object' && 'name' in error) {
    return String(error.name);
  }
  return 'Error';
}

/**
 * Get error stack from unknown error type
 */
export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error && error.stack) {
    return error.stack;
  }
  if (error && typeof error === 'object' && 'stack' in error) {
    return String(error.stack);
  }
  return undefined;
}

/**
 * Check if error is an AbortError
 */
export function isAbortError(error: unknown): boolean {
  return getErrorName(error) === 'AbortError';
}

/**
 * Convert unknown error to Error object
 */
export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(getErrorMessage(error));
}
