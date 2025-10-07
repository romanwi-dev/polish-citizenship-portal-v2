import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UseLongPressOptions {
  onLongPress: () => void;
  duration?: number;
  feedbackMessage?: string;
}

export const useLongPressWithFeedback = ({ 
  onLongPress, 
  duration = 2000,
  feedbackMessage = "Keep holding..."
}: UseLongPressOptions) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const [isPressed, setIsPressed] = useState(false);
  const toastIdRef = useRef<string | number | null>(null);

  const start = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isLongPress.current = false;
    setIsPressed(true);
    
    // Show feedback after 500ms
    feedbackTimerRef.current = setTimeout(() => {
      toastIdRef.current = toast.loading(feedbackMessage, { duration: duration });
    }, 500);

    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      setIsPressed(false);
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      onLongPress();
    }, duration);
  }, [onLongPress, duration, feedbackMessage]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
  }, []);

  const cancel = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    clear();
    setIsPressed(false);
    isLongPress.current = false;
  }, [clear]);

  return {
    handlers: {
      onMouseDown: start,
      onMouseUp: cancel,
      onMouseLeave: cancel,
      onTouchStart: start,
      onTouchEnd: cancel,
    },
    isPressed,
  };
};
