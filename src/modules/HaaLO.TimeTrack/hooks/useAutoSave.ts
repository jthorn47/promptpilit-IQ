import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/modules/HaaLO.Shared/hooks/useDebounce';

interface UseAutoSaveProps<T> {
  data: T;
  onSave: (data: T) => void;
  delay?: number;
  enabled?: boolean;
}

export const useAutoSave = <T>({
  data,
  onSave,
  delay = 1000,
  enabled = true
}: UseAutoSaveProps<T>) => {
  const [lastSavedData, setLastSavedData] = useState<T>(data);
  const [isSaving, setIsSaving] = useState(false);
  const debouncedData = useDebounce(data, delay);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      setLastSavedData(data);
      return;
    }

    if (!enabled) return;

    const dataChanged = JSON.stringify(debouncedData) !== JSON.stringify(lastSavedData);
    
    if (dataChanged) {
      setIsSaving(true);
      onSave(debouncedData);
      setLastSavedData(debouncedData);
      
      // Simulate save completion
      setTimeout(() => {
        setIsSaving(false);
      }, 300);
    }
  }, [debouncedData, lastSavedData, onSave, enabled]);

  const hasUnsavedChanges = JSON.stringify(data) !== JSON.stringify(lastSavedData);

  return {
    isSaving,
    hasUnsavedChanges,
    lastSavedData
  };
};