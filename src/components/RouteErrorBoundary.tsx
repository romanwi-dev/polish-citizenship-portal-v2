/**
 * V7 Route-Level Error Boundary
 * Catches errors in individual routes without crashing the entire app
 */

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // CRITICAL: Suppress i18next errors to prevent route crash
    const isI18nError = 
      error?.message?.includes('acc[key2]') ||
      error?.message?.includes('currentInstance[key]') ||
      error?.message?.includes('undefined is not an object') ||
      error?.stack?.includes('acc[key2]') ||
      error?.stack?.includes('currentInstance');
    
    // CRITICAL: Suppress Three.js animation mixer errors
    const isMixerError = 
      error?.message?.includes('mixers[i]') ||
      error?.message?.includes('mixers') && error?.message?.includes('is not a function') ||
      error?.stack?.includes('mixers');
    
    if (isI18nError || isMixerError) {
      if (import.meta.env.DEV) {
        console.warn('[RouteErrorBoundary] Suppressed error:', error.message);
      }
      // Don't set hasError for these errors - route continues normally
      return { hasError: false, error: null };
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // CRITICAL: Suppress i18next errors
    const isI18nError = 
      error?.message?.includes('acc[key2]') ||
      error?.message?.includes('currentInstance[key]') ||
      error?.message?.includes('undefined is not an object') ||
      error?.stack?.includes('acc[key2]') ||
      error?.stack?.includes('currentInstance');
    
    // CRITICAL: Suppress Three.js animation mixer errors
    const isMixerError = 
      error?.message?.includes('mixers[i]') ||
      error?.message?.includes('mixers') && error?.message?.includes('is not a function') ||
      error?.stack?.includes('mixers');
    
    if (isI18nError || isMixerError) {
      if (import.meta.env.DEV) {
        console.warn('[RouteErrorBoundary] Suppressed error:', error.message);
      }
      // Don't process these errors - just return
      return;
    }
    
    if (import.meta.env.DEV) {
      console.error('🚨 Route Error Boundary caught:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full space-y-4 text-center">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              This page encountered an error. Please try refreshing or return to the homepage.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-xs bg-muted p-4 rounded overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
              <Button variant="outline" onClick={this.handleReset}>
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
