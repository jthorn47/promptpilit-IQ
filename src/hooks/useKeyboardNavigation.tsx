import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  disabled?: boolean;
}

export const useKeyboardNavigation = ({
  onEscape,
  onEnter,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onTab,
  onShiftTab,
  disabled = false
}: UseKeyboardNavigationProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
      case 'Enter':
        if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
          event.preventDefault();
          onEnter?.();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onArrowRight?.();
        break;
      case 'Tab':
        if (event.shiftKey) {
          onShiftTab?.();
        } else {
          onTab?.();
        }
        break;
      default:
        break;
    }
  }, [disabled, onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab, onShiftTab]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return handleKeyDown;
};

// Hook for managing focus trap within modals/dialogs
export const useFocusTrap = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return;

    const focusableElements = document.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusableElement = focusableElements[0] as HTMLElement;
    const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstFocusableElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);
};

// Hook for announcing content to screen readers
export const useAnnouncement = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove the announcement after it's been read
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return announce;
};