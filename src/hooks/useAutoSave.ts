import { useEffect, useRef, useState } from 'react';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void> | void;
  interval?: number; // milliseconds
  enabled?: boolean;
}

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutoSave<T>({
  data,
  onSave,
  interval = 30000, // 30 seconds default
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const previousDataRef = useRef<T>(data);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Check if data has changed
    const dataChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
    
    if (!dataChanged) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new auto-save timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        setStatus('saving');
        await onSave(data);
        previousDataRef.current = data;
        setStatus('saved');
        setLastSaved(new Date());
        
        // Reset to idle after 3 seconds
        setTimeout(() => setStatus('idle'), 3000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setStatus('error');
      }
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, interval, enabled]);

  return { status, lastSaved };
}
