import { useEffect } from 'react';

export const useKeyboardShortcut = (keys: string, callback: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keysCombination = keys.toLowerCase().split('+');
      
      const hasCmd = keysCombination.includes('cmd') && (event.metaKey || event.ctrlKey);
      const hasCtrl = keysCombination.includes('ctrl') && event.ctrlKey;
      const hasShift = keysCombination.includes('shift') && event.shiftKey;
      const hasAlt = keysCombination.includes('alt') && event.altKey;
      
      const key = keysCombination[keysCombination.length - 1];
      const pressedKey = event.key.toLowerCase();
      
      // Check if the key combination matches
      if (
        (hasCmd || hasCtrl) &&
        pressedKey === key &&
        (!keysCombination.includes('shift') || hasShift) &&
        (!keysCombination.includes('alt') || hasAlt)
      ) {
        event.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keys, callback]);
};