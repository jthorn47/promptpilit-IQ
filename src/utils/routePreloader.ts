
import { PERFORMANCE_CONFIG, ROUTE_PRIORITIES } from './performanceConfig';
import { preloadRoute, getRoutePriority } from './routeOptimization';

interface PreloadJob {
  route: string;
  priority: keyof typeof ROUTE_PRIORITIES;
  timestamp: number;
  status: 'pending' | 'loading' | 'loaded' | 'failed';
}

class RoutePreloader {
  private preloadQueue: PreloadJob[] = [];
  private preloadedRoutes = new Set<string>();
  private isProcessing = false;
  private navigationHistory: string[] = [];

  /**
   * Add route to preload queue with intelligent prioritization
   */
  enqueueRoute(route: string, userTriggered = false): void {
    if (this.preloadedRoutes.has(route)) return;

    const priority = getRoutePriority(route);
    const job: PreloadJob = {
      route,
      priority,
      timestamp: Date.now(),
      status: 'pending'
    };

    // Insert based on priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const insertIndex = this.preloadQueue.findIndex(
      existingJob => priorityOrder[existingJob.priority] > priorityOrder[priority]
    );

    if (insertIndex === -1) {
      this.preloadQueue.push(job);
    } else {
      this.preloadQueue.splice(insertIndex, 0, job);
    }

    if (userTriggered) {
      this.processQueue();
    } else {
      this.scheduleProcessing();
    }
  }

  /**
   * Predict next routes based on navigation patterns
   */
  predictNextRoutes(currentRoute: string): string[] {
    this.navigationHistory.push(currentRoute);
    if (this.navigationHistory.length > 10) {
      this.navigationHistory = this.navigationHistory.slice(-10);
    }

    const predictions: string[] = [];

    // Predict based on common navigation patterns
    if (currentRoute === '/admin') {
      predictions.push('/admin/users', '/admin/settings', '/admin/companies');
    } else if (currentRoute.startsWith('/admin/crm')) {
      predictions.push('/admin/crm/clients', '/admin/crm/deals', '/admin/crm/reports');
    } else if (currentRoute.startsWith('/payroll')) {
      predictions.push('/payroll/processing', '/payroll/benefits', '/payroll/reports');
    }

    return predictions;
  }

  /**
   * Preload routes on hover with debouncing
   */
  onRouteHover(route: string): void {
    if (!PERFORMANCE_CONFIG.componentPreloading.onHover) return;
    
    setTimeout(() => {
      this.enqueueRoute(route);
    }, 100); // Small delay to avoid aggressive preloading
  }

  /**
   * Process preload queue during idle time
   */
  private scheduleProcessing(): void {
    if (!PERFORMANCE_CONFIG.componentPreloading.onIdle) return;

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => this.processQueue(), { timeout: 1000 });
    } else {
      setTimeout(() => this.processQueue(), 0);
    }
  }

  /**
   * Process the preload queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) return;

    this.isProcessing = true;

    while (this.preloadQueue.length > 0) {
      const job = this.preloadQueue.shift()!;
      
      if (this.preloadedRoutes.has(job.route)) continue;

      try {
        job.status = 'loading';
        await this.preloadRouteComponent(job.route);
        job.status = 'loaded';
        this.preloadedRoutes.add(job.route);
        
        console.log(`🚀 Preloaded route: ${job.route} (${job.priority})`);
      } catch (error) {
        job.status = 'failed';
        console.warn(`❌ Failed to preload route: ${job.route}`, error);
      }

      // Add small delay between preloads to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    this.isProcessing = false;
  }

  /**
   * Preload route component based on route pattern
   */
  private async preloadRouteComponent(route: string): Promise<void> {
    try {
      if (route.includes('/admin/analytics')) {
        // Analytics router not available yet
        console.log('Analytics router preload skipped - not implemented yet');
      } else if (route.includes('/admin/crm')) {
        await import('@/components/CRMCommandCenter');
      } else if (route.includes('/payroll')) {
        await import('@/domains/payroll/components/PayrollDashboard');
      } else if (route.includes('/admin/users')) {
        await import('@/components/AdminUsers');
      } else if (route.includes('/admin/settings')) {
        await import('@/components/AdminSettings');
      }
      // Add more route patterns as needed
    } catch (error) {
      throw new Error(`Failed to preload component for route: ${route}`);
    }
  }

  /**
   * Get preloading statistics
   */
  getStats() {
    return {
      queueLength: this.preloadQueue.length,
      preloadedCount: this.preloadedRoutes.size,
      isProcessing: this.isProcessing,
      navigationHistory: this.navigationHistory.slice(-5)
    };
  }

  /**
   * Clear preload cache
   */
  clearCache(): void {
    this.preloadedRoutes.clear();
    this.preloadQueue = [];
    this.navigationHistory = [];
  }
}

export const routePreloader = new RoutePreloader();
