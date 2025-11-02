import { useState, useCallback, useRef, useEffect } from 'react';

interface HistoryEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Phase 5.2: Undo/Redo for Form Changes
 * Provides undo/redo functionality for form data
 */
export function useFormHistory<T>(
  initialData: T,
  maxHistory: number = 50
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<HistoryEntry<T>[]>([
    { data: initialData, timestamp: Date.now() },
  ]);
  const isUndoRedoRef = useRef(false);

  // Add entry to history
  const pushHistory = useCallback((data: T) => {
    if (isUndoRedoRef.current) return;

    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push({ data, timestamp: Date.now() });
      
      // Limit history size
      if (newHistory.length > maxHistory) {
        return newHistory.slice(newHistory.length - maxHistory);
      }
      
      return newHistory;
    });
    
    setCurrentIndex(prev => Math.min(prev + 1, maxHistory - 1));
  }, [currentIndex, maxHistory]);

  // Undo
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isUndoRedoRef.current = true;
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => { isUndoRedoRef.current = false; }, 0);
      return history[currentIndex - 1].data;
    }
    return null;
  }, [currentIndex, history]);

  // Redo
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => { isUndoRedoRef.current = false; }, 0);
      return history[currentIndex + 1].data;
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    currentData: history[currentIndex].data,
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    historyLength: history.length,
    currentIndex,
  };
}
