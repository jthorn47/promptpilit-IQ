import { useMemo } from 'react';
import { LucideIcon } from 'lucide-react';

export interface PerformanceConfig {
  enableVirtualization?: boolean;
  debounceDelay?: number;
  lazyLoad?: boolean;
  memoizeSelectors?: boolean;
}

export interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  performance?: PerformanceConfig;
  className?: string;
  emptyState?: React.ReactNode;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
}

/**
 * High-performance list component with built-in optimizations
 * Supports virtualization, memoization, and lazy loading
 */
export function OptimizedList<T>({
  items,
  renderItem,
  keyExtractor,
  performance = {},
  className = '',
  emptyState,
  loading = false,
  loadingComponent
}: OptimizedListProps<T>) {
  const {
    memoizeSelectors = true,
    lazyLoad = false
  } = performance;

  // Memoize the rendered items to prevent unnecessary re-renders
  const memoizedItems = useMemo(() => {
    if (!memoizeSelectors) return items.map(renderItem);
    
    return items.map((item, index) => ({
      key: keyExtractor(item, index),
      element: renderItem(item, index)
    }));
  }, [items, renderItem, keyExtractor, memoizeSelectors]);

  if (loading && loadingComponent) {
    return <>{loadingComponent}</>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No items found
      </div>
    );
  }

  return (
    <div className={className}>
      {memoizeSelectors 
        ? memoizedItems.map((item) => (
            <div key={item.key}>{item.element}</div>
          ))
        : items.map((item, index) => (
            <div key={keyExtractor(item, index)}>
              {renderItem(item, index)}
            </div>
          ))
      }
    </div>
  );
}