import { MEMORY_CONFIG } from './performanceConfig';

interface MemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

class MemoryManager {
  private memoryHistory: MemoryStats[] = [];
  private cleanupInterval: NodeJS.Timeout | null = null;
  private observers: ((stats: MemoryStats) => void)[] = [];

  constructor() {
    this.startMonitoring();
  }

  /**
   * Start memory monitoring
   */
  private startMonitoring(): void {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
      this.recordMemoryStats();
    }, MEMORY_CONFIG.cleanupInterval);
  }

  /**
   * Record current memory statistics
   */
  private recordMemoryStats(): void {
    if (!('memory' in performance)) return;

    const memory = (performance as any).memory;
    const stats: MemoryStats = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      timestamp: Date.now()
    };

    this.memoryHistory.push(stats);
    
    // Keep only last 100 entries
    if (this.memoryHistory.length > 100) {
      this.memoryHistory = this.memoryHistory.slice(-100);
    }

    // Notify observers
    this.observers.forEach(observer => observer(stats));

    // Check if memory threshold exceeded
    if (stats.usedJSHeapSize > MEMORY_CONFIG.memoryThreshold) {
      this.performAggressiveCleanup();
    }
  }

  /**
   * Perform routine memory cleanup
   */
  private performCleanup(): void {
    // Clear expired cache entries
    this.clearExpiredCaches();
    
    // Force garbage collection in development
    if (process.env.NODE_ENV === 'development' && 'gc' in window) {
      try {
        (window as any).gc();
      } catch (error) {
        // GC not available
      }
    }
  }

  /**
   * Perform aggressive cleanup when memory threshold exceeded
   */
  private performAggressiveCleanup(): void {
    console.warn('🧹 Memory threshold exceeded, performing aggressive cleanup');
    
    // Clear all possible caches
    this.clearExpiredCaches(true);
    
    // Clear route preloader cache
    if ('routePreloader' in window) {
      (window as any).routePreloader.clearCache();
    }

    // Clear query cache if available
    if ('queryOptimizer' in window) {
      (window as any).queryOptimizer.invalidate();
    }
  }

  /**
   * Clear expired cache entries
   */
  private clearExpiredCaches(aggressive = false): void {
    // Clear sessionStorage items older than 1 hour (or all if aggressive)
    const cutoff = aggressive ? Date.now() : Date.now() - (60 * 60 * 1000);
    
    Object.keys(sessionStorage).forEach(key => {
      try {
        const item = sessionStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed.timestamp && parsed.timestamp < cutoff) {
            sessionStorage.removeItem(key);
          }
        }
      } catch (error) {
        // Invalid JSON, remove anyway
        if (aggressive) {
          sessionStorage.removeItem(key);
        }
      }
    });
  }

  /**
   * Get current memory usage
   */
  getCurrentMemoryUsage(): MemoryStats | null {
    if (!('memory' in performance)) return null;

    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      timestamp: Date.now()
    };
  }

  /**
   * Get memory usage trend
   */
  getMemoryTrend(minutes = 5): MemoryStats[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.memoryHistory.filter(stat => stat.timestamp > cutoff);
  }

  /**
   * Subscribe to memory updates
   */
  subscribe(callback: (stats: MemoryStats) => void): () => void {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  /**
   * Destroy memory manager
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.observers = [];
    this.memoryHistory = [];
  }
}

export const memoryManager = new MemoryManager();

// Export hook for React components
export const useMemoryMonitor = () => {
  const getCurrentUsage = () => memoryManager.getCurrentMemoryUsage();
  const getTrend = (minutes?: number) => memoryManager.getMemoryTrend(minutes);
  const subscribe = (callback: (stats: MemoryStats) => void) => memoryManager.subscribe(callback);
  
  return { getCurrentUsage, getTrend, subscribe };
};
