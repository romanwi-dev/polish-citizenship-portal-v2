/**
 * V7 Safe Local Storage Wrapper
 * Prevents crashes when browser blocks storage or quota exceeded
 */

/**
 * Safely get item from localStorage
 */
export function safeGetItem(key: string, fallback: string | null = null): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback;
    }
    return localStorage.getItem(key) ?? fallback;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`⚠️ localStorage.getItem('${key}') failed:`, error);
    }
    return fallback;
  }
}

/**
 * Safely set item in localStorage
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`⚠️ localStorage.setItem('${key}') failed:`, error);
    }
    return false;
  }
}

/**
 * Safely remove item from localStorage
 */
export function safeRemoveItem(key: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`⚠️ localStorage.removeItem('${key}') failed:`, error);
    }
    return false;
  }
}

/**
 * Safely get item from sessionStorage
 */
export function safeGetSessionItem(key: string, fallback: string | null = null): string | null {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return fallback;
    }
    return sessionStorage.getItem(key) ?? fallback;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`⚠️ sessionStorage.getItem('${key}') failed:`, error);
    }
    return fallback;
  }
}

/**
 * Safely set item in sessionStorage
 */
export function safeSetSessionItem(key: string, value: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return false;
    }
    sessionStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`⚠️ sessionStorage.setItem('${key}') failed:`, error);
    }
    return false;
  }
}

/**
 * Check if localStorage is available and working
 */
export function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
