import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  duration?: number;
}

export const useLongPress = ({ onLongPress, duration = 2000 }: UseLongPressOptions) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const start = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
    }, duration);
  }, [onLongPress, duration]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const cancel = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    clear();
    isLongPress.current = false;
  }, [clear]);

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
  };
};
