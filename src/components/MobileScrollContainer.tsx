import React, { forwardRef } from 'react';
import { useMobileScrollbar } from '@/hooks/useMobileScrollbar';
import { cn } from '@/lib/utils';

interface MobileScrollContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * A container that implements mobile-friendly scrollbar behavior
 * Hides scrollbars by default and shows them during user interaction
 */
export const MobileScrollContainer = forwardRef<HTMLDivElement, MobileScrollContainerProps>(
  ({ children, className, ...props }, ref) => {
    const { scrollRef } = useMobileScrollbar();
    
    // Merge refs if both are provided
    const mergedRef = React.useCallback((node: HTMLDivElement) => {
      (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref, scrollRef]);
    
    return (
      <div
        ref={mergedRef}
        className={cn('overflow-auto', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

MobileScrollContainer.displayName = 'MobileScrollContainer';