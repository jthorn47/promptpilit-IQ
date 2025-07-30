/**
 * Utility functions for mobile scrollbar behavior
 */

/**
 * Apply mobile scrollbar behavior to any HTML element
 * @param element - The HTML element to apply the behavior to
 * @returns Cleanup function to remove event listeners
 */
export const applyMobileScrollBehavior = (element: HTMLElement): (() => void) => {
  // Check if we're on a mobile/touch device
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isMobile) return () => {};
  
  let scrollTimeout: NodeJS.Timeout;
  
  const handleScrollStart = () => {
    element.classList.add('scroll-active');
    element.classList.remove('scroll-container');
    
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
  };
  
  const handleScrollEnd = () => {
    scrollTimeout = setTimeout(() => {
      element.classList.remove('scroll-active');
      element.classList.add('scroll-container');
    }, 1500);
  };
  
  const handleTouchStart = () => {
    element.classList.add('scroll-active');
    element.classList.remove('scroll-container');
  };
  
  const handleTouchEnd = () => {
    scrollTimeout = setTimeout(() => {
      element.classList.remove('scroll-active');
      element.classList.add('scroll-container');
    }, 2000);
  };
  
  // Add initial class
  element.classList.add('scroll-container');
  
  // Add event listeners
  element.addEventListener('scroll', handleScrollStart);
  element.addEventListener('scroll', handleScrollEnd);
  element.addEventListener('touchstart', handleTouchStart);
  element.addEventListener('touchend', handleTouchEnd);
  
  // Return cleanup function
  return () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    element.removeEventListener('scroll', handleScrollStart);
    element.removeEventListener('scroll', handleScrollEnd);
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
    element.classList.remove('scroll-container', 'scroll-active');
  };
};

/**
 * Add mobile scrollbar behavior using CSS class
 * This is a lighter approach that uses pure CSS
 */
export const addMobileScrollClass = (element: HTMLElement): void => {
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isMobile) {
    element.classList.add('auto-mobile-scroll');
    
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      element.classList.add('scrolling');
      
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      scrollTimeout = setTimeout(() => {
        element.classList.remove('scrolling');
      }, 1500);
    };
    
    element.addEventListener('scroll', handleScroll);
    
    // Store cleanup function on element for potential later use
    (element as any).__mobileScrollCleanup = () => {
      element.removeEventListener('scroll', handleScroll);
      element.classList.remove('auto-mobile-scroll', 'scrolling');
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }
};

/**
 * Remove mobile scrollbar behavior
 */
export const removeMobileScrollClass = (element: HTMLElement): void => {
  if ((element as any).__mobileScrollCleanup) {
    (element as any).__mobileScrollCleanup();
    delete (element as any).__mobileScrollCleanup;
  }
};