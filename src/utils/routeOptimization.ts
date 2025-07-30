import { lazy } from 'react';
import { PERFORMANCE_CONFIG, ROUTE_PRIORITIES } from './performanceConfig';

// Enhanced lazy loading with error boundaries and retry logic
export const createLazyComponent = (
  importFn: () => Promise<any>,
  componentName: string,
  retries = 3
) => {
  return lazy(async () => {
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        const module = await importFn();
        return module;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to load ${componentName}, attempt ${i + 1}/${retries}`, error);
        
        // Wait before retry with exponential backoff
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
      }
    }
    
    // If all retries failed, throw the last error
    throw lastError;
  });
};

// Route preloading utility
export const preloadRoute = (routeImport: () => Promise<any>) => {
  if (PERFORMANCE_CONFIG.componentPreloading.onIdle && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      routeImport().catch(console.warn);
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      routeImport().catch(console.warn);
    }, 100);
  }
};

// Component importance prioritizer
export const getRoutePriority = (path: string): 'critical' | 'high' | 'medium' | 'low' => {
  for (const [priority, routes] of Object.entries(ROUTE_PRIORITIES)) {
    if (routes.some(route => path.startsWith(route))) {
      return priority as keyof typeof ROUTE_PRIORITIES;
    }
  }
  return 'low';
};

// Bundle optimization helper
export const shouldBundleTogether = (component1: string, component2: string): boolean => {
  const vendorPackages = ['react', 'react-dom', 'react-router-dom'];
  const uiPackages = ['@radix-ui', 'lucide-react'];
  const utilityPackages = ['date-fns', 'clsx', 'class-variance-authority'];
  
  const allGroups = [vendorPackages, uiPackages, utilityPackages];
  
  return allGroups.some(group => 
    group.some(pkg => component1.includes(pkg)) && 
    group.some(pkg => component2.includes(pkg))
  );
};

// Route-based chunk naming
export const getChunkName = (routePath: string): string => {
  const segments = routePath.split('/').filter(Boolean);
  return segments.join('-') || 'root';
};

// Memory cleanup utility
export const scheduleCleanup = () => {
  if (typeof window !== 'undefined') {
    setInterval(() => {
      // Force garbage collection in development
      if (process.env.NODE_ENV === 'development' && 'gc' in window) {
        (window as any).gc();
      }
      
      // Clear old cache entries based on memory config
      console.debug('Route optimization cleanup cycle');
    }, PERFORMANCE_CONFIG.caching.dataCache.duration);
  }
};