/**
 * Module Preloader - Intelligently preloads modules based on user behavior
 */

interface PreloadConfig {
  priority: 'high' | 'medium' | 'low';
  delay: number;
  enabled: boolean;
}

class ModulePreloader {
  private preloadQueue: Map<string, PreloadConfig> = new Map();
  private preloadedModules: Set<string> = new Set();
  private isPreloading = false;

  /**
   * Add module to preload queue
   */
  addToQueue(modulePath: string, config: PreloadConfig) {
    if (this.preloadedModules.has(modulePath)) return;
    
    this.preloadQueue.set(modulePath, config);
    this.processQueue();
  }

  /**
   * Preload modules based on current route
   */
  preloadByRoute(currentRoute: string) {
    const routeBasedPreloads = new Map([
      ['/launchpad', [
        { path: '/halo/iq', config: { priority: 'medium' as const, delay: 2000, enabled: true } },
        { path: '/halo/finance', config: { priority: 'low' as const, delay: 5000, enabled: true } }
      ]],
      ['/admin', [
        { path: '/pulse', config: { priority: 'medium' as const, delay: 1000, enabled: true } },
        { path: '/halo/vault', config: { priority: 'low' as const, delay: 3000, enabled: true } }
      ]]
    ]);

    const preloads = routeBasedPreloads.get(currentRoute);
    if (preloads) {
      preloads.forEach(({ path, config }) => {
        this.addToQueue(path, config);
      });
    }
  }

  /**
   * Process preload queue
   */
  private async processQueue() {
    if (this.isPreloading || this.preloadQueue.size === 0) return;
    
    this.isPreloading = true;
    
    // Sort by priority
    const sortedEntries = Array.from(this.preloadQueue.entries()).sort(([, a], [, b]) => {
      const priorities = { high: 0, medium: 1, low: 2 };
      return priorities[a.priority] - priorities[b.priority];
    });

    for (const [modulePath, config] of sortedEntries) {
      if (!config.enabled) continue;
      
      try {
        await new Promise(resolve => setTimeout(resolve, config.delay));
        await this.preloadModule(modulePath);
        this.preloadedModules.add(modulePath);
        this.preloadQueue.delete(modulePath);
        
        // Add small delay between preloads to avoid blocking
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Failed to preload module ${modulePath}:`, error);
        this.preloadQueue.delete(modulePath);
      }
    }
    
    this.isPreloading = false;
  }

  /**
   * Preload a specific module
   */
  private async preloadModule(modulePath: string) {
    // Only preload in production or when specifically enabled
    if (process.env.NODE_ENV === 'development') return;
    
    // Check if user is on mobile or has slow connection
    if (this.shouldSkipPreload()) return;

    try {
      // Dynamic import to preload the module
      switch (modulePath) {
        case '/halo/iq':
          await import('@/modules/HaaLO.HaloIQ/components/HaloIQDashboard');
          break;
        case '/halo/finance':
          await import('@/modules/HaaLO.HaloIQ/components/FinanceIQ');
          break;
        case '/pulse':
          await import('@/pages/PulseDashboardPage');
          break;
        case '/halo/vault':
          await import('@/modules/vault/VaultModule');
          break;
        default:
          console.log(`No preload strategy for ${modulePath}`);
      }
      
      console.log(`✅ Preloaded module: ${modulePath}`);
    } catch (error) {
      console.warn(`⚠️ Failed to preload ${modulePath}:`, error);
    }
  }

  /**
   * Check if preloading should be skipped
   */
  private shouldSkipPreload(): boolean {
    // Skip on slow connections
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
        return true;
      }
    }

    // Skip on mobile devices with limited resources
    if ('deviceMemory' in navigator && (navigator as any).deviceMemory < 4) {
      return true;
    }

    return false;
  }

  /**
   * Clear preload queue
   */
  clear() {
    this.preloadQueue.clear();
    this.isPreloading = false;
  }

  /**
   * Get preload stats
   */
  getStats() {
    return {
      queueSize: this.preloadQueue.size,
      preloadedCount: this.preloadedModules.size,
      isPreloading: this.isPreloading
    };
  }
}

export const modulePreloader = new ModulePreloader();