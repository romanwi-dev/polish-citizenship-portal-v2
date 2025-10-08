import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface UseFormAutoSaveOptions<T> {
  formData: T;
  onSave: (data: T) => void;
  delay?: number; // milliseconds
  enabled?: boolean;
}

export function useFormAutoSave<T>({ formData, onSave, delay = 3000, enabled = true }: UseFormAutoSaveOptions<T>) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<T>(formData);

  useEffect(() => {
    if (!enabled) return;

    // Check if data has actually changed
    if (JSON.stringify(formData) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onSave(formData);
      previousDataRef.current = formData;
      toast.success("Auto-saved", { duration: 1500 });
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, onSave, delay, enabled]);
}
