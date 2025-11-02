/**
 * Production-safe logger that only outputs in development
 * Prevents performance degradation and information leakage in production
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDev = import.meta.env.DEV;

  log(...args: any[]) {
    if (this.isDev) {
      console.log(...args);
    }
  }

  info(...args: any[]) {
    if (this.isDev) {
      console.info(...args);
    }
  }

  warn(...args: any[]) {
    if (this.isDev) {
      console.warn(...args);
    }
  }

  error(...args: any[]) {
    // Always log errors but in production consider using error tracking service
    console.error(...args);
  }

  debug(...args: any[]) {
    if (this.isDev) {
      console.debug(...args);
    }
  }
}

export const logger = new Logger();
