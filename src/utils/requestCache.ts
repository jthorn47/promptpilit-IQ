import { PERFORMANCE_CONFIG } from './performanceConfig';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();

  private generateKey(url: string, params?: Record<string, any>): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${url}${paramsStr}`;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    const now = Date.now();
    return (now - entry.timestamp) > PERFORMANCE_CONFIG.caching.dataCache.duration;
  }

  async get<T>(
    key: string, 
    fetcher: () => Promise<T>,
    forceRefresh = false
  ): Promise<T> {
    const cacheKey = key;

    // Check if request is already pending (deduplication)
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    // Check cache first
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey)!;
      if (!this.isExpired(entry)) {
        return entry.data;
      }
    }

    // Create and cache the promise to prevent duplicate requests
    const promise = fetcher().then(data => {
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      this.pendingRequests.delete(cacheKey);
      return data;
    }).catch(error => {
      this.pendingRequests.delete(cacheKey);
      throw error;
    });

    this.pendingRequests.set(cacheKey, promise);
    return promise;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      this.pendingRequests.clear();
      return;
    }

    // Invalidate entries matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }

    for (const key of this.pendingRequests.keys()) {
      if (key.includes(pattern)) {
        this.pendingRequests.delete(key);
      }
    }
  }

  // Clean up expired entries
  cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }
}

export const requestCache = new RequestCache();

// Auto cleanup every 5 minutes
setInterval(() => {
  requestCache.cleanup();
}, 5 * 60 * 1000);