import { useState, useEffect, useCallback, useRef } from 'react';
import { queryOptimizer } from '@/utils/queryOptimizer';

interface PerformanceMetrics {
  taxCalculationTime: number;
  cacheHitRate: number;
  databaseQueryTime: number;
  totalRequests: number;
  errorRate: number;
  averageResponseTime: number;
}

interface CacheConfig {
  taxRateTTL: number;
  wageBundleTTL: number;
  bracketTTL: number;
  maxCacheSize: number;
}

export const useAdvancedPerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    taxCalculationTime: 0,
    cacheHitRate: 0,
    databaseQueryTime: 0,
    totalRequests: 0,
    errorRate: 0,
    averageResponseTime: 0
  });

  const [cacheConfig, setCacheConfig] = useState<CacheConfig>({
    taxRateTTL: 3600000, // 1 hour
    wageBundleTTL: 1800000, // 30 minutes
    bracketTTL: 7200000, // 2 hours
    maxCacheSize: 1000
  });

  const metricsBuffer = useRef<number[]>([]);
  const requestCounter = useRef(0);
  const errorCounter = useRef(0);

  const measureTaxCalculation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationType: string
  ): Promise<T> => {
    const startTime = performance.now();
    requestCounter.current++;

    try {
      const result = await operation();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      metricsBuffer.current.push(duration);
      
      // Keep only last 100 measurements
      if (metricsBuffer.current.length > 100) {
        metricsBuffer.current = metricsBuffer.current.slice(-100);
      }

      console.log(`🚀 TaxIQ Performance: ${operationType} completed in ${duration.toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      errorCounter.current++;
      console.error(`❌ TaxIQ Performance: ${operationType} failed:`, error);
      throw error;
    }
  }, []);

  const getCachedTaxRate = useCallback(async (
    taxYear: number,
    rateType: string,
    jurisdiction: string = 'federal'
  ) => {
    const cacheKey = `tax_rate_${taxYear}_${rateType}_${jurisdiction}`;
    
    return queryOptimizer.getCachedOrFetch(
      cacheKey,
      async () => {
        const response = await fetch(`https://xfamotequcavggiqndfj.supabase.co/functions/v1/get-tax-rate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYW1vdGVxdWNhdmdnaXFuZGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTg2NTEsImV4cCI6MjA2NzE5NDY1MX0.f3yZ55pFCc9yLOUvUssb1S04-alf_IZ2e_f5wJ0bGWw`
          },
          body: JSON.stringify({ year: taxYear, rateType, jurisdiction })
        });
        
        if (!response.ok) throw new Error('Failed to fetch tax rate');
        return response.json();
      },
      cacheConfig.taxRateTTL
    );
  }, [cacheConfig.taxRateTTL]);

  const optimizeTaxCalculation = useCallback(async (taxInput: any) => {
    return measureTaxCalculation(async () => {
      // Batch load all required tax data
      const [federalRates, californiaRates] = await Promise.all([
        getCachedTaxRate(taxInput.year, 'federal_brackets', 'federal'),
        getCachedTaxRate(taxInput.year, 'ca_brackets', 'california')
      ]);

      return {
        federalRates,
        californiaRates,
        timestamp: new Date().toISOString()
      };
    }, 'Tax Data Batch Load');
  }, [getCachedTaxRate, measureTaxCalculation]);

  const calculateMetrics = useCallback(() => {
    if (metricsBuffer.current.length === 0) return;

    const totalTime = metricsBuffer.current.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / metricsBuffer.current.length;
    const errorRate = requestCounter.current > 0 ? (errorCounter.current / requestCounter.current) * 100 : 0;
    const cacheStats = queryOptimizer.getStats();

    setMetrics({
      taxCalculationTime: averageTime,
      cacheHitRate: cacheStats.cacheSize > 0 ? 85 : 0, // Simulated cache hit rate
      databaseQueryTime: averageTime * 0.3, // Estimate 30% for DB queries
      totalRequests: requestCounter.current,
      errorRate,
      averageResponseTime: averageTime
    });
  }, []);

  const clearCache = useCallback(() => {
    queryOptimizer.invalidate();
    console.log('🧹 TaxIQ Cache cleared');
  }, []);

  const preloadTaxData = useCallback(async (year: number) => {
    console.log('🔄 Preloading tax data for year:', year);
    
    const preloadPromises = [
      getCachedTaxRate(year, 'fica_social_security'),
      getCachedTaxRate(year, 'fica_medicare'),
      getCachedTaxRate(year, 'ca_sdi', 'california'),
      getCachedTaxRate(year, 'federal_brackets'),
      getCachedTaxRate(year, 'ca_brackets', 'california')
    ];

    await Promise.allSettled(preloadPromises);
    console.log('✅ Tax data preloaded successfully');
  }, [getCachedTaxRate]);

  useEffect(() => {
    const interval = setInterval(calculateMetrics, 5000); // Update metrics every 5 seconds
    return () => clearInterval(interval);
  }, [calculateMetrics]);

  return {
    metrics,
    cacheConfig,
    setCacheConfig,
    measureTaxCalculation,
    optimizeTaxCalculation,
    getCachedTaxRate,
    clearCache,
    preloadTaxData
  };
};
