// Application-wide configuration
export const APP_CONFIG = {
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 30000,
    retries: 3,
  },
  
  // Supabase Configuration  
  supabase: {
    url: 'https://xfamotequcavggiqndfj.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYW1vdGVxdWNhdmdnaXFuZGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTg2NTEsImV4cCI6MjA2NzE5NDY1MX0.f3yZ55pFCc9yLOUvUssb1S04-alf_IZ2e_f5wJ0bGWw',
  },
  
  // Query Configuration
  query: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  },
  
  // Performance
  performance: {
    enableReactQuery: true,
    enableVirtualization: true,
    batchSize: 50,
    lazyLoadDistance: 200,
  },
  
  // Features
  features: {
    analytics: true,
    tours: true,
    notifications: true,
    realtime: true,
  },
  
  // UI Configuration
  ui: {
    pageSize: 25,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedFormats: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png'],
    toastDuration: 2000,
  },
  
  // Routes
  routes: {
    home: '/',
    auth: '/auth',
    dashboard: '/dashboard',
    admin: '/admin',
    unauthorized: '/unauthorized',
    notFound: '/404',
  },
} as const;

// Type for app config
export type AppConfig = typeof APP_CONFIG;

// Environment helpers
export const isProduction = APP_CONFIG.isProduction;
export const isDevelopment = APP_CONFIG.isDevelopment;

// Logging configuration based on environment
export const logger = {
  log: isDevelopment ? console.log : () => {},
  warn: isDevelopment ? console.warn : () => {},
  error: console.error, // Always log errors
  debug: isDevelopment ? console.debug : () => {},
  info: isDevelopment ? console.info : () => {},
};