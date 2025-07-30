
import { useState, useEffect, useCallback } from 'react';
import { memoryManager, useMemoryMonitor } from '@/utils/memoryManager';
import { routePreloader } from '@/utils/routePreloader';
import { errorReporter } from '@/services/errorReporting';

interface PerformanceMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  routes: {
    preloaded: number;
    queued: number;
  };
  errors: {
    total: number;
    unresolved: number;
    lastHour: number;
  };
  timing: {
    navigationStart: number;
    domContentLoaded: number;
    loadComplete: number;
  };
}

export const usePerformanceMonitor = () => {
  // TEMPORARILY DISABLED - Performance monitoring causing memory issues
  const [metrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring] = useState(false);

  const startMonitoring = useCallback(() => {
    // Disabled
    return () => {};
  }, []);

  const stopMonitoring = useCallback(() => {
    // Disabled
  }, []);

  const getPerformanceReport = useCallback(() => {
    return null;
  }, []);

  // useEffect(() => {
  //   const cleanup = startMonitoring();
  //   return cleanup;
  // }, [startMonitoring]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getPerformanceReport
  };
};

function generateRecommendations(metrics: PerformanceMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.memory.percentage > 80) {
    recommendations.push('High memory usage detected. Consider clearing caches or reducing loaded data.');
  }

  if (metrics.errors.unresolved > 5) {
    recommendations.push('Multiple unresolved errors detected. Check error logs and fix critical issues.');
  }

  if (metrics.routes.queued > 10) {
    recommendations.push('High route preload queue. Consider reducing preload aggressiveness.');
  }

  if (metrics.timing.loadComplete > 5000) {
    recommendations.push('Slow page load detected. Consider optimizing bundle size and lazy loading.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Performance metrics look good!');
  }

  return recommendations;
}
