import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  recoveredState: any | null;
}

// V7 HARDENING: Safe session ID generation with fallback
const getSessionId = (): string => {
  try {
    let sessionId = sessionStorage.getItem('crash_recovery_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('crash_recovery_session_id', sessionId);
    }
    return sessionId;
  } catch (error) {
    // Fallback to memory-only session ID if sessionStorage fails
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    recoveredState: null
  };

  public async componentDidMount() {
    // Server-side recovery (replaces client-side HMAC)
    try {
      const { data, error } = await supabase.functions.invoke('crash-state', {
        body: {
          action: 'recover',
          sessionId: getSessionId(),
        },
      });

      if (!error && data?.crashState) {
        this.setState({ recoveredState: data.crashState });
        console.log('[ErrorBoundary] Recovered state from server:', data.crashState);
      }
    } catch (error) {
      console.error('[ErrorBoundary] Failed to recover state:', error);
    }
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, recoveredState: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Save current state server-side (no client-side HMAC)
    this.captureAppState(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Send crash report to backend
    this.sendCrashReport(error, errorInfo);

    // Log to monitoring service if available
    if (typeof window !== 'undefined' && (window as any).ErrorReporting) {
      (window as any).ErrorReporting.logError(error, errorInfo);
    }
  }

  private async captureAppState(error: Error, errorInfo: ErrorInfo) {
    try {
      const crashData = {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      };

      // Save server-side with proper authentication and session management
      const { error: saveError } = await supabase.functions.invoke('crash-state', {
        body: {
          action: 'save',
          sessionId: getSessionId(),
          crashData,
          errorMessage: error.message,
          componentStack: errorInfo.componentStack,
        },
      });

      if (saveError) {
        console.error('[ErrorBoundary] Failed to save crash state:', saveError);
      } else {
        console.log('[ErrorBoundary] State saved server-side securely');
      }
    } catch (storageError) {
      console.error('[ErrorBoundary] Error saving crash state:', storageError);
    }
  }

  private async sendCrashReport(error: Error, errorInfo: ErrorInfo) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('crash_reports').insert({
        error_message: error.message,
        error_stack: error.stack,
        component_stack: errorInfo.componentStack,
        user_agent: navigator.userAgent,
        user_id: user?.id || null,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
      
      console.log('[ErrorBoundary] Crash report sent to backend');
    } catch (reportError) {
      console.error('[ErrorBoundary] Failed to send crash report:', reportError);
    }
  }

  private handleReset = async () => {
    // Clear recovery state server-side
    try {
      await supabase.functions.invoke('crash-state', {
        body: {
          action: 'clear',
          sessionId: getSessionId(),
        },
      });
    } catch (error) {
      console.error('[ErrorBoundary] Error clearing crash state:', error);
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      recoveredState: null
    });
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-2xl w-full">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="text-xl font-bold">Something went wrong</AlertTitle>
              <AlertDescription className="mt-3 space-y-2">
                <p className="text-base">
                  An unexpected error occurred. This has been logged and we'll investigate the issue.
                </p>
                {this.state.error && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium hover:underline">
                      Technical Details
                    </summary>
                    <div className="mt-2 p-3 bg-background/50 rounded-md text-xs font-mono overflow-auto">
                      <p className="font-bold mb-1">Error:</p>
                      <p className="mb-3 text-destructive">{this.state.error.toString()}</p>
                      {this.state.errorInfo && (
                        <>
                          <p className="font-bold mb-1">Component Stack:</p>
                          <pre className="whitespace-pre-wrap text-muted-foreground">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </>
                      )}
                    </div>
                  </details>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button onClick={this.handleReset} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                Go Home
              </Button>
            </div>

            {this.state.recoveredState && (
              <Alert className="mt-4">
                <AlertTitle className="text-sm">State Recovered</AlertTitle>
                <AlertDescription className="text-xs">
                  Your previous session was recovered. Last crash: {new Date(this.state.recoveredState.createdAt).toLocaleString()}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
