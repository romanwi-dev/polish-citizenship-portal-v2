import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CrashState {
  crashData: any;
  errorMessage: string | null;
  componentStack: string | null;
  createdAt: string;
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

export const useCrashStateRecovery = () => {
  const [isRecovering, setIsRecovering] = useState(false);

  const saveCrashState = async (
    crashData: any,
    errorMessage: string,
    componentStack: string
  ): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('crash-state', {
        body: {
          action: 'save',
          sessionId: getSessionId(),
          crashData,
          errorMessage,
          componentStack,
        },
      });

      if (error) {
        console.error('[CrashRecovery] Failed to save crash state:', error);
      }
    } catch (error) {
      console.error('[CrashRecovery] Error saving crash state:', error);
    }
  };

  const recoverCrashState = async (): Promise<CrashState | null> => {
    try {
      setIsRecovering(true);
      const { data, error } = await supabase.functions.invoke('crash-state', {
        body: {
          action: 'recover',
          sessionId: getSessionId(),
        },
      });

      if (error) {
        console.error('[CrashRecovery] Failed to recover crash state:', error);
        return null;
      }

      return data?.crashState || null;
    } catch (error) {
      console.error('[CrashRecovery] Error recovering crash state:', error);
      return null;
    } finally {
      setIsRecovering(false);
    }
  };

  const clearCrashState = async (): Promise<void> => {
    try {
      await supabase.functions.invoke('crash-state', {
        body: {
          action: 'clear',
          sessionId: getSessionId(),
        },
      });
    } catch (error) {
      console.error('[CrashRecovery] Error clearing crash state:', error);
    }
  };

  return {
    saveCrashState,
    recoverCrashState,
    clearCrashState,
    isRecovering,
  };
};
