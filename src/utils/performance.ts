import { memo, lazy, ComponentType, createElement } from 'react';

// Preloading utilities for performance
const componentCache = new Map<string, Promise<any>>();

/**
 * Enhanced lazy loading with preloading and error recovery
 */
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<any>,
  componentName: string = 'Component'
) => {
  return lazy(async () => {
    try {
      // Check cache first
      if (componentCache.has(componentName)) {
        return await componentCache.get(componentName);
      }

      // Create promise and cache it
      const promise = importFn().then(module => {
        // Handle both default exports and named exports
        return 'default' in module ? module : { default: module };
      });
      
      componentCache.set(componentName, promise);
      return await promise;
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
      // Return fallback component
      return {
        default: () => createElement('div', 
          { className: 'p-4 text-center' },
          createElement('p', { className: 'text-red-600' }, `Failed to load ${componentName}`),
          createElement('button', {
            onClick: () => window.location.reload(),
            className: 'mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover'
          }, 'Retry')
        )
      };
    }
  });
};

/**
 * Preload components for better UX
 */
export const preloadComponent = async (
  importFn: () => Promise<any>,
  componentName: string
) => {
  if (!componentCache.has(componentName)) {
    try {
      const promise = importFn();
      componentCache.set(componentName, promise);
      await promise;
    } catch (error) {
      console.warn(`Failed to preload ${componentName}:`, error);
    }
  }
};

/**
 * Memory-optimized memoization
 */
export const memoWithShallowCompare = <P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return memo(Component, propsAreEqual || ((prev, next) => {
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    
    if (prevKeys.length !== nextKeys.length) return false;
    
    return prevKeys.every(key => prev[key as keyof P] === next[key as keyof P]);
  }));
};

/**
 * Bundle splitting constants
 */
export const ROUTE_CHUNKS = {
  DASHBOARD: 'dashboard',
  ADMIN: 'admin', 
  CRM: 'crm',
  LMS: 'lms',
  ANALYTICS: 'analytics',
  REPORTS: 'reports'
} as const;

/**
 * Intersection Observer for lazy loading
 */
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = { rootMargin: '50px' }
) => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver(callback, options);
};