// Performance optimization configuration
export const PERFORMANCE_CONFIG = {
  // Lazy loading configurations
  lazyLoading: {
    enabled: true,
    chunkSize: 'medium', // small, medium, large
    preloadDistance: 2, // Number of routes to preload ahead
  },
  
  // Bundle splitting strategy
  bundleSplitting: {
    vendor: ['react', 'react-dom', 'react-router-dom'],
    ui: ['@radix-ui', 'lucide-react'],
    utilities: ['date-fns', 'clsx', 'class-variance-authority'],
  },
  
  // Route-based code splitting
  routeSplitting: {
    adminRoutes: true,
    moduleRoutes: true, // Dynamic module routes
    payrollRoutes: true,
    publicRoutes: false, // Keep public routes in main bundle
  },
  
  // Component preloading
  componentPreloading: {
    critical: ['ErrorBoundary', 'ProtectedRoute', 'LoadingFallback'],
    onHover: true, // Preload route components on navigation hover
    onIdle: true, // Preload during browser idle time
  },
  
  // Cache strategies
  caching: {
    routeCache: true,
    componentCache: true,
    dataCache: {
      enabled: true,
      duration: 2 * 60 * 1000, // 2 minutes - reduced for more frequent updates
    },
    // Add request deduplication
    requestDeduplication: {
      enabled: true,
      window: 500, // 500ms window to prevent rapid duplicate requests
    },
  },
} as const;

// Route priority configuration
export const ROUTE_PRIORITIES = {
  critical: ['/dashboard', '/admin', '/admin/crm'],
  high: ['/admin/crm/clients', '/admin/crm/deals'],
  medium: ['/payroll', '/admin/assessments'],
  low: ['/testing', '/debug'],
} as const;

// Enhanced memory optimization settings with request throttling
export const MEMORY_CONFIG = {
  maxCachedRoutes: 10,
  maxCachedComponents: 50,
  cleanupInterval: 60 * 1000, // 60 seconds - less frequent cleanup
  memoryThreshold: 100 * 1024 * 1024, // 100MB
  // Add request throttling
  requestThrottling: {
    enabled: true,
    maxConcurrentRequests: 5,
    queueTimeout: 5000, // 5 seconds
  },
  // Add error recovery settings
  errorRecovery: {
    maxRetries: 3,
    retryDelay: 1000,
    autoRecovery: true,
  },
  // Add preloading settings
  preloading: {
    enabled: true,
    maxPreloadJobs: 5,
    preloadTimeout: 10000, // 10 seconds
  }
} as const;

// Add error reporting configuration
export const ERROR_CONFIG = {
  maxReports: 100,
  autoReporting: true,
  severityThresholds: {
    critical: ['OutOfMemoryError', 'SecurityError'],
    high: ['TypeError', 'ReferenceError', 'NetworkError'],
    medium: ['ValidationError', 'ApiError'],
    low: ['WarningError', 'InfoError']
  },
  autoRecovery: {
    enabled: true,
    networkRetryDelay: 2000,
    maxNetworkRetries: 3,
    memoryCleanupThreshold: 0.8 // 80% memory usage
  }
} as const;
