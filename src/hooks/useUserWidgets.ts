// Legacy hook - deprecated, use useWidgetService instead
import { useWidgetService } from './useWidgetService';

// Re-export types for backward compatibility
export type { WidgetDefinition, UserWidgetPreference } from '@/services/WidgetService';

/**
 * @deprecated Use useWidgetService instead
 * This hook is kept for backward compatibility and will be removed in a future version
 */
export const useUserWidgets = () => {
  console.warn('useUserWidgets is deprecated. Use useWidgetService instead.');
  return useWidgetService();
};