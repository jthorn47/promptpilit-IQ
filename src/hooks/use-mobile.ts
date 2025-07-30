import { useEffect, useState } from 'react';

/**
 * Hook to detect if the current viewport is mobile/tablet or desktop
 * Returns true for mobile/tablet (< 768px), false for desktop (>= 768px)
 */
export const useBreakpoint = () => {
  const [isMobile, setIsMobile] = useState(() => {
    // Initialize with correct value on client-side
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false; // Default to desktop for SSR
  });
  
  const [isTablet, setIsTablet] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      return width >= 768 && width < 1024;
    }
    return false;
  });

  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      console.log('🔍 Breakpoint Check:', { width, willBeMobile: width < 768 });
      
      // Mobile: < 768px
      setIsMobile(width < 768);
      // Tablet: 768px - 1024px
      setIsTablet(width >= 768 && width < 1024);
    };

    // Check immediately on mount
    checkBreakpoints();

    // Listen for resize events
    window.addEventListener('resize', checkBreakpoints);
    
    return () => {
      window.removeEventListener('resize', checkBreakpoints);
    };
  }, []);

  const isMobileOrTablet = isMobile || isTablet;

  return { isMobile, isTablet, isMobileOrTablet };
};

/**
 * Legacy hook for backward compatibility
 */
export const useIsMobile = () => {
  const { isMobile } = useBreakpoint();
  return isMobile;
};