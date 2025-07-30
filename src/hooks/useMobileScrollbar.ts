import { useEffect, useRef } from 'react';

/**
 * Custom hook for mobile scrollbar behavior
 * Hides scrollbars by default on mobile and shows them temporarily during scroll
 */
export const useMobileScrollbar = () => {
  const scrollRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    
    // Check if we're on a mobile/touch device
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isMobile) return;
    
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScrollStart = () => {
      // Show scrollbar when scrolling starts
      element.classList.add('scroll-active');
      element.classList.remove('scroll-container');
      
      // Clear any existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
    
    const handleScrollEnd = () => {
      // Hide scrollbar after scrolling stops (with delay)
      scrollTimeout = setTimeout(() => {
        element.classList.remove('scroll-active');
        element.classList.add('scroll-container');
      }, 1500); // Hide after 1.5 seconds of no scrolling
    };
    
    const handleTouchStart = () => {
      // Show scrollbar when user touches the scroll area
      element.classList.add('scroll-active');
      element.classList.remove('scroll-container');
    };
    
    const handleTouchEnd = () => {
      // Start the timer to hide scrollbar after touch ends
      scrollTimeout = setTimeout(() => {
        element.classList.remove('scroll-active');
        element.classList.add('scroll-container');
      }, 2000); // Hide after 2 seconds of no touch
    };
    
    // Add initial class
    element.classList.add('scroll-container');
    
    // Add event listeners
    element.addEventListener('scroll', handleScrollStart);
    element.addEventListener('scroll', handleScrollEnd);
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    
    // Cleanup
    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      element.removeEventListener('scroll', handleScrollStart);
      element.removeEventListener('scroll', handleScrollEnd);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
  
  return { scrollRef };
};