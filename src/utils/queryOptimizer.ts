// Simple query optimizer to reduce redundant API calls
class QueryOptimizer {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private pendingQueries = new Map<string, Promise<any>>();

  async getCachedOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 30000 // 30 seconds default TTL
  ): Promise<T> {
    const now = Date.now();
    
    // Check if we have a pending query for this key
    if (this.pendingQueries.has(key)) {
      console.log('🔄 Using pending query for:', key);
      return this.pendingQueries.get(key)!;
    }

    // Check cache
    const cached = this.cache.get(key);
    if (cached && (now - cached.timestamp) < cached.ttl) {
      console.log('💾 Using cached data for:', key);
      return cached.data;
    }

    // Create new query
    console.log('🚀 Making fresh query for:', key);
    const queryPromise = fetcher().then(data => {
      // Cache the result
      this.cache.set(key, {
        data,
        timestamp: now,
        ttl: ttlMs
      });
      
      // Remove from pending queries
      this.pendingQueries.delete(key);
      
      return data;
    }).catch(error => {
      // Remove from pending queries on error
      this.pendingQueries.delete(key);
      throw error;
    });

    // Add to pending queries
    this.pendingQueries.set(key, queryPromise);
    
    return queryPromise;
  }

  invalidate(key?: string) {
    if (key) {
      this.cache.delete(key);
      this.pendingQueries.delete(key);
      console.log('🗑️ Invalidated cache for:', key);
    } else {
      this.cache.clear();
      this.pendingQueries.clear();
      console.log('🗑️ Cleared all cache');
    }
  }

  // Get cache statistics
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingQueries: this.pendingQueries.size,
      cachedKeys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const queryOptimizer = new QueryOptimizer();

// Helper to create cache keys
export const createCacheKey = (base: string, ...params: (string | number | boolean | null | undefined)[]) => {
  return `${base}:${params.filter(p => p !== null && p !== undefined).join(':')}`;
};